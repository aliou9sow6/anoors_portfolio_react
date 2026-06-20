pipeline {
    agent any

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['kubernetes', 'docker-compose'],
            description: 'Cible de déploiement : kubernetes (Terraform + K8s) | docker-compose (local)'
        )
        string(
            name: 'K8S_NAMESPACE',
            defaultValue: 'portfolio',
            description: 'Namespace Kubernetes cible'
        )
        password(
            name: 'MONGO_PASSWORD',
            defaultValue: '',
            description: 'Mot de passe MongoDB (obligatoire pour le déploiement Terraform)'
        )
    }

    triggers {
        githubPush()
    }

    environment {
        DOCKERHUB_NAMESPACE     = 'anoor9s6'
        BACKEND_IMAGE           = "${DOCKERHUB_NAMESPACE}/portfolio-backend:v1.0.${BUILD_NUMBER}"
        FRONTEND_IMAGE          = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:v1.0.${BUILD_NUMBER}"
        BACKEND_LATEST          = "${DOCKERHUB_NAMESPACE}/portfolio-backend:latest"
        FRONTEND_LATEST         = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:latest"
        DOCKERHUB_CREDENTIAL_ID = 'dockerhub-creds'
        TF_IMAGE                = 'hashicorp/terraform:1.6.6'   // image réelle sur Docker Hub
        TF_DIR                  = 'terraform/scenario1-free-tier'
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────────
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        // ── 2. SonarQube ─────────────────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube-server') {
                    withEnv(["SONAR_HOST_URL=http://sonarqube:9000"]) {
                        sh '/var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/sonar-scanner/bin/sonar-scanner -Dsonar.host.url=http://sonarqube:9000'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ── 3. Build & Push Docker ───────────────────────────────
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        sh '''
                            docker build -t $BACKEND_IMAGE ./backend
                            docker tag $BACKEND_IMAGE $BACKEND_LATEST
                        '''
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        sh '''
                            docker build -t $FRONTEND_IMAGE .
                            docker tag $FRONTEND_IMAGE $FRONTEND_LATEST
                        '''
                    }
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIAL_ID}",
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_PASS'
                )]) {
                    sh 'echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                    docker push $BACKEND_IMAGE
                    docker push $FRONTEND_IMAGE
                    docker push $BACKEND_LATEST
                    docker push $FRONTEND_LATEST
                '''
            }
        }

        // ── 4. Terraform (uniquement pour le scénario kubernetes) ─
        stage('Terraform Init') {
            when { expression { params.DEPLOY_TARGET == 'kubernetes' } }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh '''
                        docker run --rm \
                          -e AWS_ACCESS_KEY_ID \
                          -e AWS_SECRET_ACCESS_KEY \
                          -v "$WORKSPACE:/workspace" \
                          -w /workspace/$TF_DIR \
                          $TF_IMAGE \
                          init -backend=false
                    '''
                }
            }
        }

        stage('Terraform Validate') {
            when { expression { params.DEPLOY_TARGET == 'kubernetes' } }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh '''
                        docker run --rm \
                          -e AWS_ACCESS_KEY_ID \
                          -e AWS_SECRET_ACCESS_KEY \
                          -v "$WORKSPACE:/workspace" \
                          -w /workspace/$TF_DIR \
                          $TF_IMAGE \
                          validate
                    '''
                }
            }
        }

        stage('Terraform Plan') {
            when { expression { params.DEPLOY_TARGET == 'kubernetes' } }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh '''
                        # Générer terraform.tfvars depuis le template
                        cp $WORKSPACE/$TF_DIR/terraform.tfvars.example \
                           $WORKSPACE/$TF_DIR/terraform.tfvars

                        # Injecter le mot de passe depuis le paramètre pipeline
                        sed -i "s|mongo_root_password = .*|mongo_root_password = \\"''' + params.MONGO_PASSWORD + '''\\"|" \
                          $WORKSPACE/$TF_DIR/terraform.tfvars

                        # Mettre à jour les tags d'images
                        sed -i "s|backend_image_tag  = .*|backend_image_tag  = \\"v1.0.$BUILD_NUMBER\\"|" \
                          $WORKSPACE/$TF_DIR/terraform.tfvars
                        sed -i "s|frontend_image_tag = .*|frontend_image_tag = \\"v1.0.$BUILD_NUMBER\\"|" \
                          $WORKSPACE/$TF_DIR/terraform.tfvars

                        echo "=== terraform.tfvars prêt ==="
                        grep -v "password" $WORKSPACE/$TF_DIR/terraform.tfvars
                        echo "=== Fichiers présents ==="
                        ls -la $WORKSPACE/$TF_DIR/

                        # hashicorp/terraform est distroless (pas de shell)
                        # --entrypoint /bin/sh permet d'exécuter plusieurs commandes en séquence
                        # init ET plan dans le même container pour partager le .terraform/
                        docker run --rm \
                          --entrypoint /bin/sh \
                          -e AWS_ACCESS_KEY_ID \
                          -e AWS_SECRET_ACCESS_KEY \
                          -v "$WORKSPACE:/workspace" \
                          -w /workspace/$TF_DIR \
                          $TF_IMAGE \
                          -c "terraform init -backend=false && \
                              terraform plan \
                                -var-file=/workspace/$TF_DIR/terraform.tfvars \
                                -out=/workspace/$TF_DIR/tfplan.bin"
                    '''
                }
            }
        }

        stage('Terraform Apply') {
            when { expression { params.DEPLOY_TARGET == 'kubernetes' } }
            steps {
                input message: '⚠️ Approuver le déploiement AWS (terraform apply) ?', ok: 'Appliquer'
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh '''
                        docker run --rm \
                          --entrypoint /bin/sh \
                          -e AWS_ACCESS_KEY_ID \
                          -e AWS_SECRET_ACCESS_KEY \
                          -v "$WORKSPACE:/workspace" \
                          -w /workspace/$TF_DIR \
                          $TF_IMAGE \
                          -c "terraform init -backend=false && \
                              terraform apply -input=false /workspace/$TF_DIR/tfplan.bin"
                    '''
                }
            }
        }

        // ── 5. Déploiement Kubernetes ────────────────────────────
        stage('Deploy to Kubernetes') {
            when { expression { params.DEPLOY_TARGET == 'kubernetes' } }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        # Jenkins monte le Secret file dans un dossier temporaire
                        # → trouver le vrai fichier, l'encoder en base64, le passer au container
                        KUBE_FILE=$(find "$KUBECONFIG_FILE" -type f 2>/dev/null | head -1)
                        [ -z "$KUBE_FILE" ] && KUBE_FILE="$KUBECONFIG_FILE"
                        echo "Kubeconfig : $KUBE_FILE"

                        KUBECONFIG_B64=$(base64 -w 0 "$KUBE_FILE")

                        docker run --rm \
                          --add-host=host.docker.internal:host-gateway \
                          -e KUBECONFIG_B64="$KUBECONFIG_B64" \
                          -v "$(pwd)":/work \
                          -w /work \
                          alpine/k8s:1.31.4 sh -c '
                            echo "$KUBECONFIG_B64" | base64 -d > /tmp/kubeconfig

                            # Remplacer 127.0.0.1 par host.docker.internal
                            sed -i "s|https://127.0.0.1|https://host.docker.internal|g" /tmp/kubeconfig

                            # Ajouter tls-server-name: localhost
                            # (le cert Docker Desktop est signé pour localhost, pas host.docker.internal)
                            sed -i "s|server: https://host.docker.internal|server: https://host.docker.internal\n    tls-server-name: localhost|g" /tmp/kubeconfig

                            export KUBECONFIG=/tmp/kubeconfig

                            echo "=== Contexte ===" && kubectl config current-context
                            echo "=== Cluster info ===" && kubectl cluster-info

                            echo "=== Namespace ===" && kubectl apply -f k8s/namespace.yaml

                            echo "=== Manifests ===" &&
                            kubectl apply -f k8s/backend-deployment.yaml &&
                            kubectl apply -f k8s/backend-service.yaml &&
                            kubectl apply -f k8s/frontend-deployment.yaml &&
                            kubectl apply -f k8s/frontend-service.yaml &&
                            kubectl apply -f k8s/ingress.yaml

                            echo "=== Rollout ===" &&
                            kubectl rollout restart deployment/portfolio-backend  -n portfolio &&
                            kubectl rollout restart deployment/portfolio-frontend -n portfolio &&
                            kubectl rollout status  deployment/portfolio-backend  -n portfolio --timeout=120s &&
                            kubectl rollout status  deployment/portfolio-frontend -n portfolio --timeout=120s

                            echo "=== Etat final ===" &&
                            kubectl get pods -n portfolio &&
                            kubectl get svc  -n portfolio

                            rm -f /tmp/kubeconfig
                          '
                    '''
                }
            }
        }

        // ── 6. Docker Compose (déploiement local) ────────────────
        stage('Deploy with Docker Compose') {
            when { expression { params.DEPLOY_TARGET == 'docker-compose' } }
            steps {
                sh '''
                    docker rm -f portfolio_backend portfolio_frontend portfolio_mongodb || true
                    docker-compose up -d --remove-orphans backend frontend
                '''
            }
        }
    }

    post {
        success {
            mail to: 'kernelshell7@gmail.com',
                subject: "✅ Pipeline réussi — ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Pipeline exécuté avec succès !

Job    : ${env.JOB_NAME}
Build  : #${env.BUILD_NUMBER}
Durée  : ${currentBuild.durationString}
URL    : ${env.BUILD_URL}
                """
        }
        failure {
            mail to: 'kernelshell7@gmail.com',
                subject: "❌ Pipeline échoué — ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Pipeline échoué !

Job    : ${env.JOB_NAME}
Build  : #${env.BUILD_NUMBER}
Durée  : ${currentBuild.durationString}
Logs   : ${env.BUILD_URL}console
                """
        }
        always {
            cleanWs()
        }
    }
}
