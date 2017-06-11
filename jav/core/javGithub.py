import subprocess


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
                    , self.config.get_config_value('git_localpath')
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_clone(): The directory you to be used for webpage publishing must be empty')
            exit()

    def git_init(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'init'
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_init(): The directory you to be used for webpage publishing must be empty')
            exit()

    def git_commit(self, message):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , '--work-tree'
                    , self.config.get_config_value('git_localpath')
                    , 'commit'
                    , '-m'
                    , message
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_commit(): Unable to commit: ' + message)
            exit()

    def git_remote_add_origin(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'remote'
                    , 'add'
                    , 'origin'
                    , self.config.git_repo
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_remote_add_origin(): Unable to remote add branch')
            exit()

    def git_push_branch(self, branch):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'push'
                    , '-u'
                    , 'origin'
                    , branch
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_push_branch(): Unable to push to remote repository: ' + branch)
            exit()

    def git_push(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'push'
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_push(): Unable to push to remote repository')
            exit()

    def git_pull(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'pull'
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.warning(e.output.decode('utf-8'))
            self.log.warning('Github.git_pull(): Unable to pull from remote repository due to local changes')
            return False

    def git_stash(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'stash'
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_stash(): Unable to stash')
            exit()

    def git_add(self, filename):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , '--work-tree'
                    , self.config.get_config_value('git_localpath')
                    , 'add'
                    , filename
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_add(): Unable to add file: ' + filename)
            exit()

    def git_checkout_create(self, branch_name):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'checkout'
                    , '-b'
                    , branch_name
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_checkout_create(): Unable to create branch: ' + branch_name)
            exit()

    def git_checkout(self, branch_name):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'checkout'
                    , branch_name
                ]
                , stderr=subprocess.STDOUT
            )
            self.log.info(output.decode('utf-8'))
            return True
        except subprocess.CalledProcessError as e:
            self.log.error(e.output.decode('utf-8'))
            self.log.error('Github.git_checkout(): Unable to switch to branch branch: ' + branch_name)
            exit()

    def get_branches(self):
        try:
            output = subprocess.check_output(
                [
                    'git'
                    , '--git-dir'
                    , self.config.get_config_value('git_localpath') + '.git'
                    , 'branch'
                ]
                , stderr=subprocess.STDOUT
            )
            branches = []
            for line in output.decode('utf-8').split('\n'):
                if len(line) > 3:
                    self.log.info('Github.get_branches() - Branch: ' + line + ' found')
                    branches.append(line)
            return branches
        except subprocess.CalledProcessError as e:
            self.log.info('Github.get_branches(): ' + e.output.decode('utf-8'))
            self.log.error('Github.get_branches(): The directory you to be used for webpage publishing must be empty')
            exit()

    def is_folder_git_repo(self):
        self.log.info('Github.is_folder_git_repo(): ' + self.config.get_config_value('git_localpath'))
        try:
            subprocess.check_output(
                [
                    'git'
                    , '--git-dir=' + self.config.get_config_value('git_localpath') + '.git'
                    , 'status'
                ]
            )
            return True
        except subprocess.CalledProcessError as e:
            self.log.info(e.output.decode('utf-8'))
            self.log.info(
                'Github.is_folder_git_repo(): Directory is not a GIT Repo, remote repo will be cloned locally')
            return False
