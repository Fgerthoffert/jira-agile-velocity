import requests

class Jira(object):
    ''' 
        tbc
    '''

    def __init__(self, log, config):
        self.log = log
        self.config = config

    def getCompletedTickets(self, date_current):
        self.log.info('Jira.getCompletedTickets(): Getting completed tickets from Jira for date: ' + date_current.strftime("%Y-%m-%d"))
        return self.call(self.config.getConfig('jira_jql_velocity') + ' during(\"' + date_current.strftime("%Y-%m-%d") + '\", \"' + date_current.strftime("%Y-%m-%d") + '\")')

    def getRemainingTickets(self):
        self.log.info('Jira.getTickets(): Getting remaining tickets from Jira')
        return self.call(self.config.getConfig('jira_jql_remaining'))

    def call(self, jql_query):
        headers = {
            "Content-Type": "application/json",
        }
        params = (
            ("jql", jql_query),
        )

        try:
            tickets = requests.get(self.config.getConfig('jira_host') + "/rest/api/2/search", headers=headers, params=params, auth=(self.config.getConfig('jira_username'), self.config.getConfig('jira_password')))
        except:
            self.log.error('Jira.call(): Unable to communicate with remote JIRA server, exiting... ')
            exit()

        return tickets


