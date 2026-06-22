pipeline {
    agent any

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['kubernetes', 'docker-compose'],
            description: 'Cible : kubernetes (Terraform + K8s) | docker-compose (local)'
        )
        string(
            name: 'K8S_NAMESPACE',
            defaultValue: 'portfolio',
            description: 'Namespace Kubernetes cible'
        )
        password(
            name: 'MONGO_PASSWORD',
            defaultValue: '',
            description: 'Mot de passe MongoDB (requis pour kubernetes)'
        )
    }

    triggers { githubPush() }

    environment {
        DOCKERHUB_NAMESPACE     = 'anoor9s6'
        BACKEND_IMAGE           = "${DOCKERHUB_NAMESPACE}/portfolio-backend:v1.0.${BUILD_NUMBER}"
        FRONTEND_IMAGE          = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:v1.0.${BUILD_NUMBER}"
        BACKEND_LATEST          = "${DOCKERHUB_NAMESPACE}/portfolio-backend:latest"
        FRONTEND_LATEST         = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:latest"
        DOCKERHUB_CREDENTIAL_ID = 'dockerhub-creds'
        TF_VERSION              = '1.6.6'
        TF_DIR                  = 'terraform/scenario1-free-tier'
    }

    stages {

        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test -- --coverage --watchAll=false'
            }
        }

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

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        sh '''
                            docker build -t $BACKEND_IMAGE ./backend
                            docker tag  $BACKEND_IMAGE $BACKEND_LATEST
                        '''
                    }
                }
                stage('Build Frontend') {
                    steps {
                        sh '''
                            docker build -t $FRONTEND_IMAGE .
                            docker tag  $FRONTEND_IMAGE $FRONTEND_LATEST
                        '''
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIAL_ID}",
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_PASS'
                )]) {
                    sh '''
                        echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
                        docker push $BACKEND_IMAGE
                        docker push $FRONTEND_IMAGE
                        docker push $BACKEND_LATEST
                        docker push $FRONTEND_LATEST
                    '''
                }
            }
        }

        // ── Terraform : installé directement sur l'agent Jenkins ──
        // On évite docker run pour Terraform afin d'éliminer tous
        // les problèmes d'interprétation de shell et de volumes.

        stage('Terraform Init & Validate') {
            when { expression { params.DEPLOY_TARGET == 'kubernetes' } }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh """
                        # Installer Terraform si absent sur l'agent
                        if ! command -v terraform > /dev/null 2>&1; then
                            echo "Installation de Terraform \${TF_VERSION}..."
                            curl -fsSL https://releases.hashicorp.com/terraform/\${TF_VERSION}/terraform_\${TF_VERSION}_linux_amd64.zip \
                              -o /tmp/terraform.zip
                            unzip -o /tmp/terraform.zip -d /usr/local/bin/
                            chmod +x /usr/local/bin/terraform
                            rm /tmp/terraform.zip
                        fi
                        terraform version

                        cd \${WORKSPACE}/\${TF_DIR}
                        terraform init -backend=false
                        terraform validate
                        echo '✅ Init + Validate OK'
                    """
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
                    sh """
                        # Générer terraform.tfvars depuis le template
                        cp \${WORKSPACE}/\${TF_DIR}/terraform.tfvars.example \
                           \${WORKSPACE}/\${TF_DIR}/terraform.tfvars

                        sed -i 's|mongo_root_password = .*|mongo_root_password = "${params.MONGO_PASSWORD}"|' \
                          \${WORKSPACE}/\${TF_DIR}/terraform.tfvars
                        sed -i "s|backend_image_tag  = .*|backend_image_tag  = \\\"v1.0.\${BUILD_NUMBER}\\\"|" \
                          \${WORKSPACE}/\${TF_DIR}/terraform.tfvars
                        sed -i "s|frontend_image_tag = .*|frontend_image_tag = \\\"v1.0.\${BUILD_NUMBER}\\\"|" \
                          \${WORKSPACE}/\${TF_DIR}/terraform.tfvars

                        echo '=== terraform.tfvars (secrets masqués) ==='
                        grep -v 'password' \${WORKSPACE}/\${TF_DIR}/terraform.tfvars

                        cd \${WORKSPACE}/\${TF_DIR}
                        terraform plan -var-file=terraform.tfvars -out=tfplan.bin
                        echo '✅ Plan OK'
                    """
                }
            }
        }

        stage('Terraform Apply') {
            when { expression { params.DEPLOY_TARGET == 'kubernetes' } }
            steps {
                input message: '⚠️ Approuver le déploiement AWS ?', ok: 'Appliquer'
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh """
                        cd \${WORKSPACE}/\${TF_DIR}
                        terraform apply -input=false tfplan.bin
                        echo '✅ Apply OK'
                        terraform output
                    """
                }
            }
        }

        // ── Déploiement Kubernetes ────────────────────────────────

        stage('Deploy to Kubernetes') {
            when { expression { params.DEPLOY_TARGET == 'kubernetes' } }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        KUBE_FILE=$(find "$KUBECONFIG_FILE" -type f 2>/dev/null | head -1)
                        [ -z "$KUBE_FILE" ] && KUBE_FILE="$KUBECONFIG_FILE"

                        KUBECONFIG_B64=$(base64 -w 0 "$KUBE_FILE")

                        docker run --rm \
                          --add-host=host.docker.internal:host-gateway \
                          -e KUBECONFIG_B64="$KUBECONFIG_B64" \
                          -v "$(pwd)":/work \
                          -w /work \
                          alpine/k8s:1.31.4 sh -c '
                            echo "$KUBECONFIG_B64" | base64 -d > /tmp/kubeconfig
                            sed -i "s|https://127.0.0.1|https://host.docker.internal|g" /tmp/kubeconfig
                            sed -i "s|server: https://host.docker.internal|server: https://host.docker.internal\n    tls-server-name: localhost|g" /tmp/kubeconfig
                            export KUBECONFIG=/tmp/kubeconfig

                            echo "=== Contexte ===" && kubectl config current-context
                            echo "=== Cluster ===" && kubectl cluster-info

                            kubectl apply -f k8s/namespace.yaml
                            kubectl apply -f k8s/backend-deployment.yaml
                            kubectl apply -f k8s/backend-service.yaml
                            kubectl apply -f k8s/frontend-deployment.yaml
                            kubectl apply -f k8s/frontend-service.yaml
                            kubectl apply -f k8s/ingress.yaml

                            kubectl rollout restart deployment/portfolio-backend  -n portfolio
                            kubectl rollout restart deployment/portfolio-frontend -n portfolio
                            kubectl rollout status  deployment/portfolio-backend  -n portfolio --timeout=120s
                            kubectl rollout status  deployment/portfolio-frontend -n portfolio --timeout=120s

                            kubectl get pods -n portfolio
                            kubectl get svc  -n portfolio
                            rm -f /tmp/kubeconfig
                          '
                    '''
                }
            }
        }

        // ── Docker Compose (déploiement local) ────────────────────

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
Job   : ${env.JOB_NAME}
Build : #${env.BUILD_NUMBER}
URL   : ${env.BUILD_URL}
                """
        }
        failure {
            mail to: 'kernelshell7@gmail.com',
                subject: "❌ Pipeline échoué — ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Pipeline échoué !
Job   : ${env.JOB_NAME}
Build : #${env.BUILD_NUMBER}
Logs  : ${env.BUILD_URL}console
                """
        }
        always { cleanWs() }
    }
}
