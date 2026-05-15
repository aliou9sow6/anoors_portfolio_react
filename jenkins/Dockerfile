FROM jenkins/jenkins:lts

# Installer Docker CLI et plugins nécessaires au Pipeline
USER root
RUN apt-get update \
  && apt-get install -y docker.io ca-certificates curl gnupg2 lsb-release \
  && jenkins-plugin-cli --plugins \
    workflow-aggregator \
    git \
    pipeline-stage-view \
    credentials-binding \
    docker-workflow \
    github-branch-source \
    workflow-multibranch \
    pipeline-model-definition \
  && rm -rf /var/lib/apt/lists/*

USER jenkins
