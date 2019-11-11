# Imported from: https://github.com/oclif/docker/blob/master/Dockerfile
FROM node:alpine

MAINTAINER Francois Gerthoffert

# Add bash
RUN apk add --no-cache bash

COPY ./startup.sh /usr/share/jav/
COPY ./refresh.sh /usr/share/jav/

WORKDIR /usr/share/jav/
RUN chmod +x ./startup.sh

RUN npm install -g jira-agile-velocity@latest

CMD ["/bin/bash", "-c", "/usr/share/jav/startup.sh"]
