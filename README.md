[![Codacy Badge](https://api.codacy.com/project/badge/Grade/65cf614a1b374a41a6ae09996c59701c)](https://www.codacy.com/app/Gerthoffert/jira-agile-velocity?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Fgerthoffert/jira-agile-velocity&amp;utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.org/Fgerthoffert/jira-agile-velocity.svg?branch=master)](https://travis-ci.org/Fgerthoffert/jira-agile-velocity)

Jira Agile Velocity (JAV)
==============================================================================

Built around [Cement](http://builtoncement.com/) This script has been created to look at historical data from Atlassian [JIRA REST API](https://developer.atlassian.com/jiradev/jira-apis/jira-rest-apis), calculate velocity, extract trends and estimate remaining work.

Velocity can be calculated using either story points (best) or ticket count (far from ideal). 

Charts, generated with [Bokeh](http://bokeh.pydata.org/en/latest/), can assist teams in identifying possible challenges, difficulties and the impact of various events. The resulting HTML page can then be automatically published to [github pages](https://pages.github.com/)

Daily statistics can be posted to slack to inform the team about progress.

![Bokeh Report](docs/jav-stats.png "Bokeh Report")

![Slack Message](docs/jav-slack.png "Slack Message")

Jav tries to be as friendly as possible with your Jira instance, it will progressively build a cache and only loads new or modified content from the REST API.

__Note__: This script is useful at identifying trends, how realistic a timeline is, but is by no means an accurate nor perfect way of planning.


# Installation

```bash
$ git clone git@github.com:Fgerthoffert/jira-agile-velocity.git
$ pip install -r requirements.txt
$ python setup.py install
```

# Contribute (dev)
```bash
$ virtualenv /path/to/myapp/env
$ source /path/to/myapp/env/bin/activate
$ pip install -r requirements.txt
$ python setup.py develop
```

# Usage

To help in getting the system running, jav has been broken down in multiple independant sections

```bash
jav --help
```

# License

You can check out the full license [here](https://github.com/Fgerthoffert/jira-agile-velocity/blob/master/LICENSE).

This project is licensed under the terms of the GPLv3 license.