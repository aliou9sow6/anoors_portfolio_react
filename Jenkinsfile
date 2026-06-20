pipeline {
    agent any

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['kubernetes', 'docker-compose'],
            description: 'Cible de déploiement : Kubernetes (kubectl) ou Docker Compose (local)'
        )
        string(
            name: 'K8S_NAMESPACE',
            defaultValue: 'portfolio',
            description: 'Namespace Kubernetes cible'
        )
    }

    triggers {
        githubPush()
    }

    environment {
        DOCKERHUB_NAMESPACE = 'anoor9s6'

        BACKEND_IMAGE = "${DOCKERHUB_NAMESPACE}/portfolio-backend:v1.0.${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:v1.0.${BUILD_NUMBER}"

        BACKEND_LATEST = "${DOCKERHUB_NAMESPACE}/portfolio-backend:latest"
        FRONTEND_LATEST = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:latest"

        DOCKERHUB_CREDENTIAL_ID = 'dockerhub-creds'
        SONAR_SERVER    = 'sonarqube-server'
        KUBECONFIG_ID   = 'kubeconfig'   // ID du credential Jenkins de type "Secret file" contenant le kubeconfig
    }

        stages {

            stage('Checkout Source Code') {
                steps {
                    checkout scm
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
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKERHUB_CREDENTIAL_ID}",
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_PASS'
                    )
                ]) {

                    sh '''
                        echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
                    '''
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

        stage('Validate Terraform Plan') {
            when {
                expression { params.DEPLOY_TARGET == 'docker-compose' }
            }

            steps {
                withCredentials([
                    aws(credentialsId: 'aws-credentials', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        cd terraform/scenario1-free-tier
                        docker run --rm \
                            -e AWS_ACCESS_KEY_ID \
                            -e AWS_SECRET_ACCESS_KEY \
                            -v "$PWD:/workspace" \
                            -w /workspace \
                            hashicorp/terraform:1.15.6 \
                            terraform init -backend=false

                        docker run --rm \
                            -e AWS_ACCESS_KEY_ID \
                            -e AWS_SECRET_ACCESS_KEY \
                            -v "$PWD:/workspace" \
                            -w /workspace \
                            hashicorp/terraform:1.15.6 \
                            terraform plan -var-file="terraform.tfvars" -out=tfplan.txt

                        echo "✓ Terraform plan validated successfully"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { params.DEPLOY_TARGET == 'kubernetes' }
            }

            steps {
                withCredentials([
                    file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')
                ]) {
                    sh '''
                        export KUBECONFIG="$KUBECONFIG_FILE"
                        
                        # Added --insecure-skip-tls-verify because the certificate is valid for 'localhost' 
                        # but we are connecting via 'host.docker.internal' from the Jenkins container.
                        # Added --validate=false to skip OpenAPI validation which requires a direct connection to the API server.
                        kubectl apply --insecure-skip-tls-verify --validate=false -f k8s/namespace.yaml
                        kubectl wait --for=condition=established namespace/portfolio --timeout=30s --insecure-skip-tls-verify
                        kubectl apply --insecure-skip-tls-verify --validate=false -f k8s/ -n "$K8S_NAMESPACE"
                        
                        kubectl get all --insecure-skip-tls-verify -n "$K8S_NAMESPACE"
                    '''
                }
            }
        }

        stage('Deploy with Docker Compose') {
            when {
                expression { params.DEPLOY_TARGET == 'docker-compose' }
            }
            steps {
                sh '''
                    # Supprimer les anciens containers applicatifs
                    docker rm -f portfolio_backend portfolio_frontend portfolio_mongodb || true

                    # Redémarrer les services applicatifs uniquement
                    docker-compose up -d --remove-orphans backend frontend
                '''
            }
        }

    }

    post {
      success {
          mail to: 'kernelshell7@gmail.com',
              subject: "✅ Pipeline reussi - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
              body: """
              Le pipeline s'est execute avec succes !

              Job       : ${env.JOB_NAME}
              Build     : #${env.BUILD_NUMBER}
              Durée     : ${currentBuild.durationString}
              URL       : ${env.BUILD_URL}
                          """
                  }

                  failure {
                      mail to: 'kernelshell7@gmail.com',
                          subject: "❌ Pipeline echoue - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                          body: """
              Le pipeline a echoue !

              Job       : ${env.JOB_NAME}
              Build     : #${env.BUILD_NUMBER}
              Durée     : ${currentBuild.durationString}
              URL       : ${env.BUILD_URL}

              Consultez les logs : ${env.BUILD_URL}console 
                          """
      }

      always {
          cleanWs() // Nettoie l'espace de travail après chaque build
      }
    }
}