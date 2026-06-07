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

# Ensure a `docker` group exists and add the `jenkins` user to it so the
# containerized agent can access the host Docker socket when mounted.
RUN groupadd docker || true \
  && usermod -aG docker jenkins || true

USER jenkins
