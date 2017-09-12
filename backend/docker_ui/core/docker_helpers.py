import re
import os

PWD_COMMAND = 'pwd'
CAT_COMMAND = 'cat '

LS_COMMAND = 'ls -al '

LS_ROW_REGEX = re.compile(r'^([\S]+)\s+([\S]+)\s+([\S]+)\s+([\S]+)\s+([\S]+)\s+([\S]+\s+[\S]+\s+[\S]+)\s+(.+)$')

FILE = 'file'
DIR = 'directory'
LINK = 'link'


def get_files(container, path=None):
    if not path:
        path = os.path.abspath(str(container.exec_run(PWD_COMMAND).decode('utf-8'))[:-1])
    fs = FileStructure.from_container(container, path=path)
    return fs


def _get_file_type(perm_str):
    f_type = perm_str[0]
    return {
        '-': FILE,
        'd': DIR,
        'l': LINK,
    }.get(f_type, 'undefined')


def _parse_ls_rows(rows):
    for row in rows:
        columns = LS_ROW_REGEX.match(row).groups()
        yield FileInfo(file_type=_get_file_type(columns[0]),
                       file_size=columns[4],
                       file_name=columns[6])


def read_file_data(container, path):
    return container.exec_run(CAT_COMMAND + path, stream=True)


def stream_logs(container):
    return container.logs(stream=True, follow=True, stdout=True)


def run_command(container, command):
    print(command, "to run")
    return container.exec_run(command, stream=True)


def calculate_cpu_usage(data):
    print(data['cpu_stats'])
    print(data['precpu_stats'])
    cpu_stats = data['cpu_stats']['cpu_usage']['percpu_usage']
    precpu_stats = data['precpu_stats']['cpu_usage']['percpu_usage']
    pretotal = data['precpu_stats']['system_cpu_usage']
    total = data['cpu_stats']['system_cpu_usage']
    system_delta = total - pretotal
    return list(map(lambda x: (x[0] - x[1]) / system_delta, zip(cpu_stats, precpu_stats)))


class FileStructure(object):

    def __init__(self, pwd, files):
        self.pwd = pwd
        self.files = files

    @classmethod
    def from_container(cls, container, path=''):
        pwd = path
        print(LS_COMMAND + path)
        output = str(container.exec_run(LS_COMMAND + path).decode('utf-8'))
        rows = output.split('\n')
        files = _parse_ls_rows(rows[1:-1])
        return cls(pwd, files)


class FileInfo(object):
    """docstring for FileInfo"""

    def __init__(self, file_type=FILE, file_name='', file_size=-1):
        self.file_type = file_type
        self.file_size = file_size
        self.file_name = file_name
