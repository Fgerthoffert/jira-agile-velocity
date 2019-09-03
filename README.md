# jira-agile-velocity

Build various sets of Agile metrics and dashboards by fetching data from Jira REST API

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jira-agile-velocity.svg)](https://npmjs.org/package/jira-agile-velocity)
[![Downloads/week](https://img.shields.io/npm/dw/jira-agile-velocity.svg)](https://npmjs.org/package/jira-agile-velocity)
[![License](https://img.shields.io/npm/l/jira-agile-velocity.svg)](https://github.com/fgerthoffert/jira-agile-velocity/blob/master/package.json)

<!-- toc -->

- [jira-agile-velocity](#jira-agile-velocity)
- [Introduction](#introduction)
- [Configuration](#configuration)
- [Quick start with Docker](#quick-start-with-docker)
- [Local installation](#local-installation)
- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Introduction

<!-- introduction -->

Jira's many, many features is a strength, but can also sometime make it difficult to consume/visualize metrics. This (opinionated) tool was created to provide different, though simple, views into the data currently hosted within your Jira instance. It borrows concepts from [ZenCrepes](https://zencrepes.io) and applies it to Jira specificities and aims at being executed regularly (through cron).

The tool focus on two main areas:

- Provide Agile teams with short-term velocity metrics (what did we just did, when will we be done with our backlog)
- Provide program management with a long-term vision over engineering activities (initiatives being worked on, the progress/state, forecasting completion)

Jira-agile-velocity aims at being simple and data centric, leaving complex interpretation to the user. The tool is, on purpose, simple in its core assumptions, an activity has only two steps, it needs to be done, or it has been done (Open or Closed), this is at the core of the tool's configuration detailed below.

Jira-agile-velocity (or jav) is composed of three different tools, a UI, an API and a CLI. The CLI's role is to fecth and compute metrics, while the UI & API are only there to ease consumption of these metrics in a user-friendly manner. All three components are configured to be used either via Docker (and docker-compose) or directly through node/npm. Environment variables are available to customize the apps behavior.

# Configuration

_Note_: When running the tool for the first time, a configuration file will automatically be created if you're not using the corresponding environment variable.

The configuration is broken down in 3 sections: Jira, Teams and Roadmap

## Jira configuration

Most of the configuration settings should be fairly straight forward (username, host, ...), what might be slightly more challenging though is to identify the various ID for some of Jira fields, which will be different from one installation to the next.

There are may resources online providing instructions to do so, and I'd recommend to [check some of them](https://confluence.atlassian.com/jirakb/how-to-find-id-for-custom-field-s-744522503.html)

## Teams configuration

In the tool, a "team" is composed of a set of completed activities used to extract velocity metrics, and a set of activities to be completed used to forecast completion. Both are based on JQL queries (and you should try those out first in Jira before applying the configuration).

**jqlCompletion** is the query used to fetch, day by day, a set of activities captured via a transition event. One note of caution here is that the tool with append a date to the query using _ON (YYYY-DD-MM)_, therefore your query must ends with a compatible statement. Example of queries:

- assignee in membersOf("agile-team") AND status changed to Done
- project = "My-tool" AND status changed to Closed
- type = "Story" and status changed to Reviewed

**jqlRemaining** is the query used to fetch a set of activities remaining to be completed. Example of queries:

- assignee in membersOf("agile-team") AND sprint in openSprints()
- project = "My-tool" AND status != Closed
- type = "Story" and status != Reviewed

The field **jqlHistory**, using the format YYYY-MM-DD defines how far back in history to fetch data from Jira. This might make the first execution slow, but subsequent will only fetch new days, which will be much faster.

## Roadmap configuration

The roadmap section aims at specifying which teams (from the teams section) should be taken in consideration while constructing the roadmap, as well as defining the JQL query used to fetch initiatives.

# Quick start with Docker

You can use jira-agile-velocity docker image to get started quickly.

Fetch the latest image

```sh-session
docker pull fgerthoffert/jira-agile-velocity:latest
```

Run

```sh-session
docker run -it --rm \
-e USER_CONFIG='SERIALIZED-JSON' \
fgerthoffert/jira-agile-velocity:latest jav velocity
```

Or in a shell (you can then configure and run it via the shell)

```sh-session
docker run -it --rm \
-e USER_CONFIG='SERIALIZED-JSON' \
fgerthoffert/jira-agile-velocity:latest /bin/ash
```
