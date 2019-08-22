jira-agile-velocity
===================

Connect to Jira REST API to collect completed story points, calculate weekly velocity, and estimate completion date

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jira-agile-velocity.svg)](https://npmjs.org/package/jira-agile-velocity)
[![Downloads/week](https://img.shields.io/npm/dw/jira-agile-velocity.svg)](https://npmjs.org/package/jira-agile-velocity)
[![License](https://img.shields.io/npm/l/jira-agile-velocity.svg)](https://github.com/fgerthoffert/jira-agile-velocity/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g jira-agile-velocity
$ jav COMMAND
running command...
$ jav (-v|--version|version)
jira-agile-velocity/0.2.1 darwin-x64 node-v12.7.0
$ jav --help [COMMAND]
USAGE
  $ jav COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`jav fetch [FILE]`](#jav-fetch-file)
* [`jav help [COMMAND]`](#jav-help-command)
* [`jav init`](#jav-init)

## `jav fetch [FILE]`

Build velocity stats by day and week

```
USAGE
  $ jav fetch [FILE]

OPTIONS
  -f, --force
  -h, --help                                       show CLI help
  -t, --type=issues|points                         [default: points] Send slack update using issues or points
  --env_jira_host=env_jira_host                    Jira Server Host (https://jira.myhost.com)
  --env_jira_jqlcompletion=env_jira_jqlcompletion  JQL Query used to measure completion
  --env_jira_jqlhistory=env_jira_jqlhistory        Date to start fetching data from (format: 2019-01-01)
  --env_jira_jqlremaining=env_jira_jqlremaining    JQL Query used to fetch remaining issues
  --env_jira_password=env_jira_password            Jira Password used to connect to the REST API
  --env_jira_points=env_jira_points                Jira Points field
  --env_jira_username=env_jira_username            Jira Username used to connect to the REST API
  --env_slack_channel=env_slack_channel            Slack channel to post content to
  --env_slack_webhook=env_slack_webhook            Slack Webhook URL
```

_See code: [src/commands/fetch.ts](https://github.com/fgerthoffert/jira-agile-velocity/blob/v0.2.1/src/commands/fetch.ts)_

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
  --env_jira_host=env_jira_host                    Jira Server Host (https://jira.myhost.com)
  --env_jira_jqlcompletion=env_jira_jqlcompletion  JQL Query used to measure completion
  --env_jira_jqlhistory=env_jira_jqlhistory        Date to start fetching data from (format: 2019-01-01)
  --env_jira_jqlremaining=env_jira_jqlremaining    JQL Query used to fetch remaining issues
  --env_jira_password=env_jira_password            Jira Password used to connect to the REST API
  --env_jira_points=env_jira_points                Jira Points field
  --env_jira_username=env_jira_username            Jira Username used to connect to the REST API
  --env_slack_channel=env_slack_channel            Slack channel to post content to
  --env_slack_webhook=env_slack_webhook            Slack Webhook URL

EXAMPLE
  $ jav init
```

_See code: [src/commands/init.ts](https://github.com/fgerthoffert/jira-agile-velocity/blob/v0.2.1/src/commands/init.ts)_
<!-- commandsstop -->
