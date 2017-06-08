from jav.core.javFiles import Files
from jav.core.javGithub import Github

class PublishGithubPage(object):
    """
    This class publish the chart to github pages
    """
    def __init__(self, log, config):
        self.log = log
        self.config = config

        self.config.git_localpath = '/Users/francois/Desktop/test-agile-page'
        self.config.git_repo = 'https://github.com/Fgerthoffert/test-agile-page.git'

        self.github = Github(self.log, self.config)

    def main(self):
        """This hacky function publish chart to github pages"""
        self.log.info('Publishing Website')
        self.config.git_localpath = Files.prep_path(self.config.git_localpath)

        if not self.github.is_folder_git_repo():
            self.github.init_repo()

        self.github.load_repo()

        print (self.github.repo)
        print (self.github.repo.push())

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

