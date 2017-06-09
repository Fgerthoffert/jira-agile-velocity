import os
import subprocess
import json

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

    def git_clone(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , 'clone'
                    , self.config.git_repo
                    , self.config.git_localpath
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output)
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output)
            self.log.error('Github.git_clone(): The directory you to be used for webpage publishing must be empty')
            exit()

    def git_init(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.git_localpath + '.git'
                    , 'init'
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output)
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output)
            self.log.error('Github.git_init(): The directory you to be used for webpage publishing must be empty')
            exit()

    def git_commit(self, message):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.git_localpath + '.git'
                    , 'commit'
                    , '-m'
                    , message
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output)
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output)
            self.log.error('Github.git_add(): Unable to add file: ' + filename)
            exit()

    def git_remote_add_origin(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.git_localpath + '.git'
                    , 'remote'
                    , 'add'
                    , 'origin'
                    , self.config.git_repo
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output)
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output)
            self.log.error('Github.git_add(): Unable to remote add branch')
            exit()

    def git_push(self, opt):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.git_localpath + '.git'
                    , 'push'
                    , '-u'
                    , opt
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output)
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output)
            self.log.error('Github.git_add(): Unable to push to remote repository')
            exit()


    def git_add(self, filename):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.git_localpath + '.git'
                    , 'add'
                    , 'README.md'
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output)
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output)
            self.log.error('Github.git_add(): Unable to add file: ' + filename)
            exit()

    def get_branches(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.git_localpath + '.git'
                    , 'ls-remote'
                    , '--heads'
                    , self.config.git_repo
                    , 'branch'
                ]
                , stderr=subprocess.STDOUT
            )
            branches = []
            for line in output.split('\n'):
                if len(line) > 3:
                    self.log.info('Github.get_branches() - Branch: ' + line + ' found')
                    branches.append(line)
            return output
        except subprocess.CalledProcessError as e:
            self.log.info('Github.init_repo(): ' + e.output)
            self.log.error('Github.init_repo(): The directory you to be used for webpage publishing must be empty')
            exit()


        # self.repo = Repo.clone_from(self.config.git_repo, self.config.git_localpath)
        #
        # # If the repo has never been initialized, create empty README file
        # if not os.path.isfile(self.config.git_localpath + 'README'):
        #     open(self.config.git_localpath + 'README', 'wb').close()
        #     self.repo.index.add([self.config.git_localpath + 'README'])
        #     self.repo.index.commit("Adding " + self.config.git_localpath + 'README' + "to repo")

    def load_repo(self):
        self.log.info('Github.load_repo() - Local Filepath' + self.config.git_localpath)
        self.log.info('Github.load_repo() - Remote Git' + self.config.git_repo)
        # self.repo = Repo(self.config.git_localpath)

    def is_folder_git_repo(self):
        self.log.info('Github.is_folder_git_repo(): ' + self.config.git_localpath)
        try:
            subprocess.check_output(['git', '--git-dir=' + self.config.git_localpath + '.git', 'status'])
            return True
        except subprocess.CalledProcessError as e:
            self.log.info(e.output)
            self.log.info('Github.is_folder_git_repo(): Directory is not a GIT Repo, cloning is necessary')
            return False

        # git --git-dir=/Users/fgerthoffert/Desktop/test-agile-page/.git --work-tree=/Users/fgerthoffert/Desktop/test-agile-page/ status

        # try:
        #     Repo(self.config.git_localpath)
        #     return True
        # except Exception as ex:
        #     # ValidationError
        #     self.log.error('Requestesd repo path does not appear to be a Git repository')
        #     template = 'An exception of type {0} occurred. Arguments:\n{1!r}'
        #     message = template.format(type(ex).__name__, ex.args)
        #     self.log.error(message)
        #     return False

