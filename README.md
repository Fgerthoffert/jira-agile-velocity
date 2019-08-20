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
jira-agile-velocity/0.2.0 darwin-x64 node-v12.7.0
$ jav --help [COMMAND]
USAGE
  $ jav COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`jav fetch [FILE]`](#jav-fetch-file)
* [`jav hello [FILE]`](#jav-hello-file)
* [`jav help [COMMAND]`](#jav-help-command)
* [`jav setup [FILE]`](#jav-setup-file)

## `jav fetch [FILE]`

describe the command here

```
USAGE
  $ jav fetch [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/fetch.ts](https://github.com/fgerthoffert/jira-agile-velocity/blob/v0.2.0/src/commands/fetch.ts)_

## `jav hello [FILE]`

describe the command here

```
USAGE
  $ jav hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ jav hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/fgerthoffert/jira-agile-velocity/blob/v0.2.0/src/commands/hello.ts)_

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

## `jav setup [FILE]`

Setup

```
USAGE
  $ jav setup [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/setup.ts](https://github.com/fgerthoffert/jira-agile-velocity/blob/v0.2.0/src/commands/setup.ts)_
<!-- commandsstop -->
