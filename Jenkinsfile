pipeline {
    agent any

    environment {
        DOCKERHUB_NAMESPACE = 'anoor9s6'

        BACKEND_IMAGE = "${DOCKERHUB_NAMESPACE}/portfolio-backend:v1.0.${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:v1.0.${BUILD_NUMBER}"

        BACKEND_LATEST = "${DOCKERHUB_NAMESPACE}/portfolio-backend:latest"
        FRONTEND_LATEST = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:latest"

        DOCKERHUB_CREDENTIAL_ID = 'dockerhub-creds'
        SONAR_SERVER = 'sonarqube-server'
    }

        stages {

            stage('Checkout Source Code') {
                steps {
                    checkout scm
                }
            }

            stage('SonarQube Analysis') {
                steps {
                    withSonarQubeEnv("${SONAR_SERVER}") {
                        sh '''
                            docker run --rm --network host \
                                -v "$WORKSPACE":/usr/src \
                                -w /usr/src \
                                sonarsource/sonar-scanner-cli \
                                -Dsonar.host.url="$SONAR_HOST_URL" \
                                -Dsonar.token="$SONAR_AUTH_TOKEN"
                        '''
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

        stage('Deploy Application') {
            steps {
                sh '''         
                    docker rm -f portfolio_mongodb portfolio_backend portfolio_frontend portfolio_sonarqube_db portfolio_sonarqube || true
                '''
            }
        }

        stage('Remove Unused Docker Resources') {
            steps {
                sh '''
                    docker image prune -f
                    docker container prune -f
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