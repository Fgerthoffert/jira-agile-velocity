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

Please refer to the readme available at the root of this repository or directly on GitHub: https://github.com/Fgerthoffert/jira-agile-velocity

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

- [`jav help [COMMAND]`](#jav-help-command)
- [`jav init`](#jav-init)
- [`jav roadmap`](#jav-roadmap)
- [`jav velocity`](#jav-velocity)

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
