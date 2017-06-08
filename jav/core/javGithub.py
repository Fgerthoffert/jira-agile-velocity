from git import Repo
import os

class Github(object):
    """
    This class publish the chart to github pages
    """
    def __init__(self, log, config):
        self.log = log
        self.config = config
        self.__repo = None

    @property
    def repo(self):
        return self.__repo

    @repo.setter
    def repo(self, value):
        self.__repo = value

    def init_repo(self):
        self.log.info('Github.init_repo() - Local Filepath' + self.config.git_localpath)
        self.log.info('Github.init_repo() - Remote Git' + self.config.git_localpath)
        self.repo = Repo.clone_from(self.config.git_repo, self.config.git_localpath)

        # If the repo has never been initialized, create empty README file
        if not os.path.isfile(self.config.git_localpath + 'README'):
            open(self.config.git_localpath + 'README', 'wb').close()
            self.repo.index.add([self.config.git_localpath + 'README'])
            self.repo.index.commit("Adding " + self.config.git_localpath + 'README' + "to repo")

    def load_repo(self):
        self.log.info('Github.load_repo() - Local Filepath' + self.config.git_localpath)
        self.log.info('Github.load_repo() - Remote Git' + self.config.git_localpath)
        self.repo = Repo(self.config.git_localpath)

    def is_folder_git_repo(self):
        self.log.info('Github.is_folder_git_repo(): ' + self.config.git_localpath)
        try:
            Repo(self.config.git_localpath)
            return True
        except Exception as ex:
            # ValidationError
            self.log.error('Requestesd repo path does not appear to be a Git repository')
            template = 'An exception of type {0} occurred. Arguments:\n{1!r}'
            message = template.format(type(ex).__name__, ex.args)
            self.log.error(message)
            return False

