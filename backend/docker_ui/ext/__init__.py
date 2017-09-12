import docker

base_url = 'unix:///var/run/docker.sock'


class DockerExtension(object):

    def __new__(self):
        obj = object.__new__(self)
        if not hasattr(self, '__client'):
            print(dir(docker.client))
            obj.__client = docker.from_env(version='auto')
        return obj

    def __getattribute__(self, attr_name):
        if attr_name.startswith('_DockerExtension__'):
            return object.__getattribute__(self, attr_name)
        else:
            print(attr_name, self.__client)
            return getattr(self.__client, attr_name)
