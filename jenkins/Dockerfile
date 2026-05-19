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
      github \
  && curl -sSLo /tmp/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.7.0.2747-linux-x86.zip \
  && unzip /tmp/sonar-scanner.zip -d /usr/local/bin/ \
  && rm /tmp/sonar-scanner.zip

USER jenkins
