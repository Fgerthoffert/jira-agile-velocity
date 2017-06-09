import collections
import dateutil.parser
import json
import os

class Files(object):
    """
        The main purpose of this function is to write/read from JSON and JSONL files
    """
    def __init__(self, log):
        self.log = log

    def json_load(self, filepath):
        self.log.info('Files.json_load(): Loading from file: ' + filepath)
        if os.path.isfile(filepath):
            with open(filepath) as file_to_open:
                data = json.load(file_to_open)
        else:
            data = None
        return data

    def json_write(self, filepath, content):
        self.log.info('Files.json_write(): Writing to file: ' + filepath)
        with open(filepath, "w") as json_file:
            json_file.write(json.dumps(content))
        return True

    def jsonl_load(self, filepath):
        self.log.info('Files.jsonl_load(): Loading from file: ' + filepath)
        # We consider here that any jsonl line does contain a datatime value
        data = collections.OrderedDict()
        if os.path.isfile(filepath):
            for line in open(filepath).readlines():
                current_line = json.loads(line)
                current_line['datetime'] = dateutil.parser.parse(current_line['datetime'])
                dict_idx = current_line['datetime'].strftime('%Y%m%d')
                data[dict_idx] = current_line

        return data

    def jsonl_write(self, filepath, content):
        self.log.info('Files.json_write(): Writing to file: ' + filepath)
        self.log.info(content)

    def jsonl_append(self, filepath, content):
        self.log.debug('Files.jsonl_append(): Append to file: ' + filepath)
        with open(filepath, 'a+') as file_to_write:
            file_to_write.write(json.dumps(content) + '\n')

    @staticmethod
    def prep_path(path):
        if path[-1] != '/':
            path = path + '/'
        if not os.path.isdir(path):
            os.makedirs(path)
        return path