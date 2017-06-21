from setuptools import setup, find_packages

setup(name='jav',
    version='0.1.2',
    description="Connect to Jira REST API to collect completed story points, calculate weekly velocity, and estimate completion date",
    long_description="Connect to Jira REST API to collect completed story points, calculate weekly velocity, and estimate completion date",
    classifiers=[],
    keywords='',
    author='fgerthoffert',
    author_email='contact@mail.gerthoffert.net',
    url='https://github.com/Fgerthoffert/jira-agile-velocity',
    license='GNU General Public License v3.0',
    packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
    include_package_data=True,
    zip_safe=False,
    test_suite='nose.collector',
    install_requires=[
        ### Required to build documentation
        # "Sphinx >= 1.0",
        ### Required for testing
        "nose",
        # "coverage",
        ### Required to function
        'cement',
        ],
    setup_requires=[],
    entry_points="""
        [console_scripts]
        jav = jav.cli.main:main
    """,
    namespace_packages=[],
    )
