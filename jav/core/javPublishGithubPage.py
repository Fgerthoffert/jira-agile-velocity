from jav.core.javFiles import Files
from jav.core.javGithub import Github
from jav.core.javTime import Time
import os
import shutil


class PublishGithubPage(object):
    """
    This class publish the chart to github pages
    """

    def __init__(self, log, config):
        self.log = log
        self.config = config

        self.github = Github(self.log, self.config)
        self.time = Time(self.log, self.config)

    def main(self):
        """This hacky function publishes chart to github pages"""
        self.log.info('Publishing Website')
        self.log.info('Git local path: ' + self.config.get_config_value('git_localpath'))
        self.config.set_config_value('git_localpath', Files.prep_path(self.config.get_config_value('git_localpath')))

        if not self.github.is_folder_git_repo():
            self.log.info('Cloning Git Repository: ' + self.config.get_config_value('git_repo'))
            self.github.git_clone()
        else:
            self.log.info('Repository already available on local filesystem: ' + self.config.get_config_value('git_repo'))
            if self.github.git_pull() is not True:
                self.log.info('Git Stash')
                self.github.git_stash()

        # Test if requested branch exists, if not, create
        # Then switch to that branch
        remote_branches = self.github.get_branches()
        if not any(self.config.get_config_value('git_branch') in s for s in remote_branches):
            # Init branch
            self.log.warning(
                'The remote repository does not contain branch: ' + self.config.get_config_value('git_branch'))
            self.github.git_checkout_create(self.config.get_config_value('git_branch'))
            self.github.git_pull_branch(self.config.get_config_value('git_branch'), True)
            self.github.git_push_branch(self.config.get_config_value('git_branch'))
        elif any('* ' + self.config.get_config_value('git_branch') in s for s in remote_branches):
            self.log.info('Local repository already selected branch: ' + self.config.get_config_value('git_branch'))
        else:
            self.log.info('Switching to branch: ' + self.config.get_config_value('git_branch'))
            self.github.git_checkout_f(self.config.get_config_value('git_branch'))

        # Next do one last pull and copy content
        self.github.git_stash()

        # Then copy chart to requested directory
        if not os.path.isfile(self.config.filepath_charts + 'index.html'):
            self.log.error('Unable to locate source chart file at: ' + self.config.filepath_charts + 'index.html')
            exit()

        dst_path = Files.prep_path(
            self.config.get_config_value('git_localpath') + self.config.get_config_value('git_pathdirectory'))
        self.log.info('Preparing to copy chart file to: ' + dst_path)
        shutil.copyfile(self.config.filepath_charts + 'index.html', dst_path + 'index.html')
        self.log.info('Chart file copied')
        self.github.git_add('--all')
        self.github.git_commit('Copied chart file - ' + self.time.get_current_date().isoformat())
        self.github.git_push()
        self.log.info('Chart pushed to: ' + self.config.get_config_value('git_pageurl'))



