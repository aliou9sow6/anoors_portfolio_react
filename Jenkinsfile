pipeline {
  agent any

  environment {
    DOCKERHUB_NAMESPACE = 'anoor9s6'
    BACKEND_IMAGE = "${DOCKERHUB_NAMESPACE}/portfolio-backend:v1.0.${env.BUILD_NUMBER}"
    FRONTEND_IMAGE = "${DOCKERHUB_NAMESPACE}/portfolio-frontend:v1.0.${env.BUILD_NUMBER}"
    DOCKERHUB_CREDENTIAL_ID = 'dockerhub-creds'
    DEPLOY_WITH_COMPOSE = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build backend image') {
      steps {
        sh 'docker build -t "$BACKEND_IMAGE" ./backend'
      }
    }

    stage('Build frontend image') {
      steps {
        sh 'docker build -t "$FRONTEND_IMAGE" .'
      }
    }

    stage('Push images to Docker Hub') {
      when {
        expression { return env.DOCKERHUB_CREDENTIAL_ID != null && env.DOCKERHUB_CREDENTIAL_ID.trim() != '' }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIAL_ID, usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
          sh '''
            echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
            docker push "$BACKEND_IMAGE"
            docker push "$FRONTEND_IMAGE"
          '''
        }
      }
    }

    stage('Deploy with Docker Compose') {
      when {
        expression { return env.DEPLOY_WITH_COMPOSE == 'true' }
      }
      steps {
        sh '''
          docker-compose pull || true
          docker-compose up -d --build
        '''
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
