from jav.core.javFiles import Files
from jav.core.javGithub import Github

class PublishGithubPage(object):
    """
    This class publish the chart to github pages
    """
    def __init__(self, log, config):
        self.log = log
        self.config = config

        self.config.git_localpath = '/Users/fgerthoffert/Desktop/test-agile-page'
        self.config.git_directory = '/Users/fgerthoffert/Desktop/test-agile-page'
        self.config.git_repo = 'https://github.com/Fgerthoffert/test-agile-page.git'

        self.github = Github(self.log, self.config)

    def init_repo(self):
        self.log.info('The git repo didn\'t contain any branches, initializing')
        # Repo was not initialized
        with open(self.config.git_localpath + 'README.md', 'w') as readme_file:
            readme_file.write('# Repository for Jira Agile Velocity content')
        self.github.git_init()
        self.github.git_add(self.config.git_localpath + 'README.md')
        self.github.git_commit('First repo commit')
        self.github.git_remote_add_origin()
        self.github.git_push('origin master ')

    def main(self):
        """This hacky function publish chart to github pages"""
        self.log.info('Publishing Website')
        self.log.info('Git local path: ' + self.config.git_localpath)
        self.config.git_localpath = Files.prep_path(self.config.git_localpath)

        if not self.github.is_folder_git_repo():
            self.github.git_clone()
        else:
            self.log.info('Git repo exists')
            self.github.git_init()

        # pull from git

        git_branches = self.github.get_branches()
        self.log.info('Number of git branches found: ' + str(len(git_branches)))
        if len(git_branches) == 0:
            self.init_repo()



        #self.github.load_repo()

        #print (self.github.repo)
        #print (self.github.repo.push())

        #test = self.github.repo.create_head('sometest')
        #print (test)

        """
            http://gitpython.readthedocs.io/en/stable/tutorial.html
            echo "# test-agile-page" >> README.md
            git init
            git add README.md
            git commit -m "first commit"
            git remote add origin https://github.com/Fgerthoffert/test-agile-page.git
            git push -u origin master        
        :return: 
        """

