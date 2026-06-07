FROM jenkins/jenkins:lts

# Installer Docker CLI et docker-compose
USER root
RUN set -eux \
  && apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl docker-compose docker.io gnupg2 lsb-release unzip \
  && rm -rf /var/lib/apt/lists/* \
    && jenkins-plugin-cli --plugins \
      workflow-aggregator \
      git \
      credentials-binding \
      docker-workflow \
      github

USER jenkins
