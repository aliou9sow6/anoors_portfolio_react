FROM jenkins/jenkins:lts

# Installer Docker CLI et docker-compose
USER root
RUN apt-get update \
  && apt-get install -y docker.io docker-compose ca-certificates curl gnupg2 lsb-release \
  && rm -rf /var/lib/apt/lists/*

# Installer les plugins pour les pipelines declaratifs
RUN jenkins-plugin-cli --plugins \
  workflow-aggregator \
  git \
  credentials-binding \
  docker-workflow \
  github
  
# Installer SonarQube Scanner
RUN curl -sSLo /usr/local/bin/sonar-scanner https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.7.0.2747-linux-x86.zip \
  && unzip /usr/local/bin/sonar-scanner -d /usr/local/bin/ \
  && rm /usr/local/bin/sonar-scanner


USER jenkins
