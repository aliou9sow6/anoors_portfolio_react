FROM jenkins/jenkins:lts

# Installer Docker CLI
USER root
RUN apt-get update \
  && apt-get install -y docker.io ca-certificates curl gnupg2 lsb-release \
  && rm -rf /var/lib/apt/lists/*

# Installer les plugins pour les pipelines declaratifs
RUN jenkins-plugin-cli --plugins \
  workflow-aggregator \
  git \
  credentials-binding \
  docker-workflow \
  github

USER jenkins
