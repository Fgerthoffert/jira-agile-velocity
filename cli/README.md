# jira-agile-velocity

Build various sets of Agile metrics and dashboards by fetching data from Jira REST API

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jira-agile-velocity.svg)](https://npmjs.org/package/jira-agile-velocity)
[![Downloads/week](https://img.shields.io/npm/dw/jira-agile-velocity.svg)](https://npmjs.org/package/jira-agile-velocity)
[![License](https://img.shields.io/npm/l/jira-agile-velocity.svg)](https://github.com/fgerthoffert/jira-agile-velocity/blob/master/package.json)

<!-- toc -->
* [jira-agile-velocity](#jira-agile-velocity)
* [Introduction](#introduction)
* [Configuration](#configuration)
* [Quick start with Docker](#quick-start-with-docker)
* [Local installation](#local-installation)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Introduction

<!-- introduction -->

Jira's many, many features is a strength, but can also sometime make it difficult to consume/visualize metrics. This (opinionated) tool was created to provide different, though simple, views into the data currently hosted within your Jira instance. It borrows concepts from [ZenCrepes](https://zencrepes.io) and applies it to Jira specificities and aims at being executed regularly (through cron).

The tool focus on two main areas:

- Provide Agile teams with short-term velocity metrics (what did we just did, when will we be done with our backlog)
- Provide program management with a long-term vision over engineering activities (initiatives being worked on, the progress/state, forecasting completion)

Jira-agile-velocity aims at being simple and data centric, leaving complex interpretation to the user. The tool is, on purpose, simple in its core assumptions, an activity has only two steps, it needs to be done, or it has been done (Open or Closed), this is at the core of the tool's configuration detailed below.

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

# Local installation

<!-- installation -->

You can choose to install jira-agile-velocity locally, although running docker is probably easier if you're just looking at using the tool.

```sh-session
npm install -g jira-agile-velocity
```

<!-- installationstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g jira-agile-velocity
$ jav COMMAND
running command...
$ jav (-v|--version|version)
jira-agile-velocity/0.3.3 darwin-x64 node-v12.8.1
$ jav --help [COMMAND]
USAGE
  $ jav COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`jav help [COMMAND]`](#jav-help-command)
* [`jav init`](#jav-init)
* [`jav roadmap`](#jav-roadmap)
* [`jav velocity`](#jav-velocity)

## `jav help [COMMAND]`

display help for jav

```
USAGE
  $ jav help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

## `jav init`

Initialize the configuration file

```
USAGE
  $ jav init

OPTIONS
  --env_user_config=env_user_config  User Configuration passed as an environment variable, takes precedence over config
                                     file

EXAMPLE
  $ jav init
```

_See code: [src/commands/init.ts](https://github.com/fgerthoffert/jira-agile-velocity/blob/v0.3.3/src/commands/init.ts)_

## `jav roadmap`

Builds a roadmap from a set of issues

```
USAGE
  $ jav roadmap

OPTIONS
  -c, --cache                        Use cached version of the child issues (mostly useful for dev)
  -h, --help                         show CLI help
  -t, --type=issues|points           [default: points] Use issues of points for metrics

  --env_user_config=env_user_config  User Configuration passed as an environment variable, takes precedence over config
                                     file
```

_See code: [src/commands/roadmap.ts](https://github.com/fgerthoffert/jira-agile-velocity/blob/v0.3.3/src/commands/roadmap.ts)_

## `jav velocity`

Builds velocity stats by day and week

```
USAGE
  $ jav velocity

OPTIONS
  -d, --dryrun                       Dry-Run, do not send slack message
  -h, --help                         show CLI help
  -t, --type=issues|points           [default: points] Send slack update using issues or points

  --env_user_config=env_user_config  User Configuration passed as an environment variable, takes precedence over config
                                     file
```

_See code: [src/commands/velocity.ts](https://github.com/fgerthoffert/jira-agile-velocity/blob/v0.3.3/src/commands/velocity.ts)_
<!-- commandsstop -->
