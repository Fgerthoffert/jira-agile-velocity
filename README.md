[![CircleCI](https://circleci.com/gh/Fgerthoffert/jira-agile-velocity/tree/master.svg?style=svg)](https://circleci.com/gh/Fgerthoffert/jira-agile-velocity/tree/master)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/fgerthoffert/jira-agile-velocity)
[![License](https://img.shields.io/npm/l/jira-agile-velocity.svg)](https://github.com/fgerthoffert/jira-agile-velocity/blob/master/package.json)

| API                                                                           | UI                                                                          | CLI                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![Docker Pulls API](https://img.shields.io/docker/pulls/fgerthoffert/jav-api) | ![Docker Pulls UI](https://img.shields.io/docker/pulls/fgerthoffert/jav-ui) | ![Docker Pulls CLI](https://img.shields.io/docker/pulls/fgerthoffert/jav-cli) [![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io) [![NPM Downloads/week](https://img.shields.io/npm/dw/jira-agile-velocity.svg)](https://npmjs.org/package/jira-agile-velocity) |

<h1 align="center"> Jira Agile Velocity </h1><br>

<p align="center">
Builds various sets of Agile metrics and dashboards by fetching data from Jira REST API
</p>

<p align="center">
  <a href="https://github.com/fgerthoffert/jira-agile-velocity" target="_blank"><img alt="Issues View" title="Issues view" src="./docs/jav-ui-velocity.png" width="640" /></a>
</p>

## Table of Contents

- [Introduction](#introduction)
- [Configuration](#configuration)
- [Quick start with Docker](#quick-start-with-docker)
- [Local installation](#local-installation)
- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Introduction

Jira's many, many features is a strength, but can also sometimes make it difficult to consume/visualize metrics. This (opinionated) tool was created to provide different (though simple) views into the data currently hosted within your Jira instance. It borrows concepts and code from [ZenCrepes](https://zencrepes.io) and applies it to Jira specificities.

The tool focuses on two main areas:

- Provide Agile teams with short-term velocity metrics (what did we just do, when will we be done with our backlog)
- Provide program management with a long-term vision over engineering activities (initiatives being worked on, progress & state, forecasting completion)

Jira-agile-velocity aims at being simple and data-centric, leaving interpretation to the user. The core concept used to derive metrics is simple: An activity has only two states, it either has to be done, or it has been done. By specifing the appropriate JQL queries in the configuration, you can define what is considered done and what is considered pending.

The tool is broken down in 3 codebases in a monorepo configuration, a UI, an API and a CLI (also called jira-agile-velocity on npm). The CLI's role is to fetch and compute metrics, while the UI & API are only there to ease consumption of these metrics in a user-friendly manner.

In its current state, the tool is storing its data in json or ndjson files directly on the filesystem. It is sufficient for the current use case and there is no plan to use a database (i.e. MongoDB) on the short term. Instead, future evolutions will likely move closer to ZenCrepes' implementation, with a common (Github, Jira) indexer and all data served by a search oriented datastore (i.e. Elasticsearch).

# Install

## Docker and docker-compose

All three components have been dockerized and can be easily spun-up using docker-compose. This is actually the recommended setup to get everything running quickly.

During first startup, the system will initialize a configuration file (`config.yml`), this will need to be updated with the desired settings before re-starting the container. Once updated, you can either re-start the environment `docker-compose down; docker-compose up` or manually trigger a data refresh in the cli container.

### docker-compose.yml

You can use the docker-compose file below to spin-up the environment, the only required action is to create a directory on the docker host's filesystem to host the configuration file and the application cache.

```yaml
version: '3.7'

volumes:
  data-volume:
    driver: local
    driver_opts:
      type: none
      device: /tmp/jav-data # UPDATE TO DESIRED PATH ON HOST
      o: bind

services:
  jav-cli:
    image: fgerthoffert/jav-cli:latest
    environment:
      - 'CONFIG_DIR=/root/jav-data'
    volumes:
      - data-volume:/root/jav-data

  jav-api:
    image: fgerthoffert/jav-api:latest
    ports:
      - '5001:3001'
    environment:
      - 'CONFIG_DIR=/root/jav-data'
    volumes:
      - data-volume:/root/jav-data

  jav-ui:
    image: fgerthoffert/jav-ui:latest
    ports:
      - '5000:80'
    environment:
      - 'API_URL=http://127.0.0.1:5001'
```

Once the directory is created, you can start the environment:

```bash
> mkdir /tmp/jav-data # Replace with the desired directory to store cache and config on host
> docker-compose pull -f docker-compose.yml # Fetches the latest version of the containers
> docker-compose up -d -f docker-compose.yml # Run the containers
```

Note: For now, the cli container is not configured with a cron to refresh data.

### Configuration update

From time-to-time you'll want to update the configuration and see the outcome of those updates within a short period of time (without having to wait for the next script execution). You can manually trigger a data refresh on the cli container using the following command:

```bash
> docker exec -it jira-agile-velocity_jav-cli_1 /usr/share/jav/startup.sh
```

Replace the container name (jira-agile-velocity_jav-cli_1) with the actual name for the CLI container obtained by executing `docker ps`.

### Access the UI

In its current configuration, the UI is accessible through `http://127.0.0.1:5000` (or the port configured for jav-ui). It is strongly recommend to configure a reverse proxy (with nginx for example) serving those resources (UI and API) over HTTPS. But this is considered out of scope of this tool.

## Development environment setup

If you are familiar with npm, running the application in development mode should be very straight forward.

```bash
> git clone https://github.com/Fgerthoffert/jira-agile-velocity.git
> cd jira-agile-velocity
> cd api
> npm install
> cd ..
> cd ui
> npm install
> cd cli
> npm install
> cd ..
```

You can now run each application in their own terminal.

### CLI

```bash
> cd cli
> ./bin/run velocity # Update the velocity metrics
> ./bin/run roadmap # Update the velocity roadmap
```

### API

```bash
> cd api
> npm run start:dev
```

### UI

```bash
> cd api
> npm run dev
```

## Build workflow

The project's repository is linked to circle-ci for ci/cd.

### On Commit

A set of basic checks are executed on every commit, these include linting and, for the CLI app, running a set of minimal commands (used to verify that the app is actually executable). At a later stage, unit tests might be added (the frameworks are configured to support tests, it's just a matter of spending the time to write them).

### On Tag creation

A set of more interesting actions happen when a new tag is created:

- A new version of the CLI component is pushed to the NPM registry (npmjs.org) using GitHub's release version. Once pushed, another job install that package in a containing and run a series of simple checks (the same than for commits), to verify the app, once installed globally, is actually usable.
- New docker containers, for all 3 components, are created and pushed to docker hub

# Configuration

_Note_: When running the tool for the first time, a configuration file will automatically be created if you're not using the corresponding environment variable.

The configuration is broken down in 3 sections: Jira, Teams and Roadmap

## Jira configuration

Most of the configuration settings should be fairly straight forward (username, host, ...), what might be slightly more challenging though is to identify the various ID for some of Jira fields, which will be different from one installation to the next.

There are many resources online providing instructions to do so, and I'd recommend to [check some of them](https://confluence.atlassian.com/jirakb/how-to-find-id-for-custom-field-s-744522503.html)

## Teams configuration

In the tool, a "team" is composed of a set of completed activities used to extract velocity metrics, and a set of activities to be completed used to forecast completion. Both are based on JQL queries (and you should try those out first in Jira before applying the configuration).

**jqlCompletion** is the query used to fetch, day by day, a set of activities captured via a transition event. One note of caution here is that the tool will append a date to the query using _ON (YYYY-DD-MM)_, therefore your query must end with a compatible statement. Example of queries:

- assignee in membersOf("agile-team") AND status changed to Done
- project = "My-tool" AND status changed to Closed
- type = "Story" and status changed to Reviewed

**jqlRemaining** is the query used to fetch a set of activities remaining to be completed. Example of queries:

- assignee in membersOf("agile-team") AND sprint in openSprints()
- project = "My-tool" AND status != Closed
- type = "Story" and status != Reviewed

The field **jqlHistory**, using the format YYYY-MM-DD defines how far back in history to fetch data from Jira. This might make the first execution slow, but subsequent will only fetch new days, which will be much faster.

## Roadmap configuration

The roadmap section aims at specifying which teams (from the teams section) should be taken in consideration while constructing the roadmap view, as well as defining the JQL query used to fetch initiatives.
