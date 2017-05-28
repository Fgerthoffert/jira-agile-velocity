class LogConfig(object):
    """
        Classe used to clear previously processed data
    """

    def __init__(self, log, app_config, log_filepath):
        self.log = log

        # This section is used to set-up log files
        self.app_config = app_config
        self.app_config.set(self.log._meta.config_section, 'file', log_filepath)
        self.app_config.set(self.log._meta.config_section, 'rotate', True)
        self.app_config.set(self.log._meta.config_section, 'max_bytes', 512000)
        self.app_config.set(self.log._meta.config_section, 'max_files', 10)
        self.log._setup_file_log()



