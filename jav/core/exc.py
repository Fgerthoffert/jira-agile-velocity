"""Jira Agile Velocity exception classes."""

class javError(Exception):
    """Generic errors."""
    def __init__(self, msg):
        Exception.__init__(self)
        self.msg = msg

    def __str__(self):
        return self.msg

class javConfigError(javError):
    """Config related errors."""
    pass

class javRuntimeError(javError):
    """Generic runtime errors."""
    pass

class javArgumentError(javError):
    """Argument related errors."""
    pass
