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

    def sys_call(self, command):
        try:
            self.log.info('Github.sys_call(): Calling: ' + json.dumps(command))
            output = subprocess.check_output(command, stderr=subprocess.STDOUT)
            self.log.info(output.decode('utf-8'))
            return output
        except subprocess.CalledProcessError as e:
            self.log.error('Github.sys_call(): ' + e.output.decode('utf-8'))
            return False

    def git_clone(self):
        git_command = [
            'git'
            , 'clone'
            , self.config.get_config_value('git_repo')
            , self.config.get_config_value('git_localpath')
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_init(self):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'init'
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_commit(self, message):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , '--work-tree'
            , self.config.get_config_value('git_localpath')
            , 'commit'
            , '-m'
            , message
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_remote_add_origin(self):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'remote'
            , 'add'
            , 'origin'
            , self.config.git_repo
        ]
        if self.sys_call(git_command) is False:
            exit()


    def git_push_branch(self, branch):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'push'
            , '-u'
            , 'origin'
            , branch
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_push(self):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'push'
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_branch_upstream(self, branch):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , '--work-tree'
            , self.config.get_config_value('git_localpath')
            , 'branch'
            , '--set-upstream-to=origin/' + branch + ' ' + branch
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_pull_branch(self, branch, origin=False):
        if origin is True:
            branch = 'origin ' + branch
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , '--work-tree'
            , self.config.get_config_value('git_localpath')
            , 'pull'
            , branch
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_pull(self):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , '--work-tree'
            , self.config.get_config_value('git_localpath')
            , 'pull'
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_stash(self):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'stash'
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_add(self, filename):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , '--work-tree'
            , self.config.get_config_value('git_localpath')
            , 'add'
            , filename
        ]
        if self.sys_call(git_command) is False:
            exit()

    def git_checkout_create(self, branch_name):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'checkout'
            , '-b'
            , branch_name
        ]
        if self.sys_call(git_command) is False:
            exit()


    def git_checkout(self, branch_name):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'checkout'
            , branch_name
        ]
        return self.sys_call(git_command)

    def git_checkout_f(self, branch_name):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'checkout'
            , '-f'
            , branch_name
        ]
        return self.sys_call(git_command)

    def git_rm_cached(self):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'rm'
            , '--cached'
        ]
        if self.sys_call(git_command) is False:
            exit()


    def get_branches(self):
        git_command = [
            'git'
            , '--git-dir'
            , self.config.get_config_value('git_localpath') + '.git'
            , 'branch'
            , '-a'
        ]
        output = self.sys_call(git_command)
        if output is False:
            exit()

        branches = []
        for line in output.decode('utf-8').split('\n'):
            if len(line) > 3:
                self.log.info('Github.get_branches() - Branch: ' + line + ' found')
                branches.append(line)
        return branches


    def is_folder_git_repo(self):
        git_command = [
            'git'
            , '--git-dir=' + self.config.get_config_value('git_localpath') + '.git'
            , 'status'
        ]
        return self.sys_call(git_command)
