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

        stage('Deploy to Kubernetes') {
            when {
                expression { params.DEPLOY_TARGET == 'kubernetes' }
            }
            steps {
                withCredentials([file(credentialsId: "${KUBECONFIG_ID}", variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        # Copier le kubeconfig et remplacer 127.0.0.1 par host-gateway
                        # (nécessaire car Jenkins tourne dans un container Docker)
                        cp $KUBECONFIG_FILE /tmp/kubeconfig-patched
                        sed -i 's|https://127.0.0.1|https://host.docker.internal|g' /tmp/kubeconfig-patched
                        export KUBECONFIG=/tmp/kubeconfig-patched

                        # Créer le namespace s'il n'existe pas encore
                        kubectl apply -f k8s/namespace.yaml

                        # Appliquer tous les manifests
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/backend-service.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl apply -f k8s/frontend-service.yaml
                        kubectl apply -f k8s/ingress.yaml

                        # Forcer le rollout pour récupérer les nouvelles images :latest
                        kubectl rollout restart deployment/portfolio-backend  -n $K8S_NAMESPACE
                        kubectl rollout restart deployment/portfolio-frontend -n $K8S_NAMESPACE

                        # Attendre que les déploiements soient stables
                        kubectl rollout status deployment/portfolio-backend  -n $K8S_NAMESPACE --timeout=120s
                        kubectl rollout status deployment/portfolio-frontend -n $K8S_NAMESPACE --timeout=120s

                        # Nettoyage
                        rm -f /tmp/kubeconfig-patched
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