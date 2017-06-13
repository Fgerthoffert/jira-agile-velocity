import requests

class Jira(object):
    """
        Handle connection to JIRA
    """

    def __init__(self, log, config):
        self.log = log
        self.config = config

    def test_jira_result(self, jira_query, jira_result):
        if 'issues' not in jira_result:
            self.log.error('JIRA did not return an array of issues, your JQL query appears to be incorrect')
            self.log.error(jira_query)
            self.log.error(jira_result['errorMessages'])
            exit()
        else:
            return True

    def get_completed_tickets(self, date_current):
        self.log.info(
            'Jira.get_completed_tickets(): Getting completed tickets from Jira for date: ' + date_current.strftime(
                "%Y-%m-%d"))
        jira_query = self.config.get_config_value('jira_jql_velocity') + ' ON(\"' + date_current.strftime(
            "%Y-%m-%d") + '\")'
        result = self.call(jira_query).json()
        if self.test_jira_result(jira_query, result):
            return result

    def get_remaining_tickets(self):
        self.log.info('Jira.get_remaining_tickets(): Getting remaining work tickets from Jira')
        result = self.call(self.config.get_config_value('jira_jql_remaining')).json()
        if self.test_jira_result(self.config.get_config_value('jira_jql_remaining'), result):
            return result

    def call(self, jql_query):
        headers = {
            "Content-Type": "application/json",
        }

        fields = [
            'assignee'
            , 'issuetype'
        ]
        if self.config.get_config_value('jira_field_points') is not None:
            fields.append(self.config.get_config_value('jira_field_points'))

        params = (
            ("jql", jql_query),
            ("startAt", 0),
            ("maxResults", 1500),
            ("fields", fields),
        )
        try:
            tickets = requests.get(self.config.get_config_value('jira_host') + "/rest/api/2/search", headers=headers,
                                   params=params,
                                   auth=(
                                       self.config.get_config_value('jira_username'),
                                       self.config.get_config_value('jira_password')))
            return tickets
        except Exception as ex:
            # ConnectionError
            template = "An exception of type {0} occurred. Arguments:\n{1!r}"
            message = template.format(type(ex).__name__, ex.args)
            self.log.error('Jira.call(): Unable to communicate with remote JIRA server, exiting... ')
            self.log.error(message)
            exit()
