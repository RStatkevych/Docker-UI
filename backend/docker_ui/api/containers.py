import os

from flask import current_app, Response
from ..core import (marshall, ListMarshaller, Marshaller, FieldResolver, get_files, json_params,
                    JsonParam, read_file_data, run_command, stream_logs, query_params, QueryParam, Enum,
                    MarshallingField, calculate_cpu_usage)

from ..core import AuthorizedMethodView as MethodView
from ..core.common import common_exception


class ContainersView(MethodView):

    @marshall(
        ListMarshaller({
            "id": str,
            "name": str,
            "status": str,
            "created": FieldResolver(str, ['attrs', 'Created']),
            "image_name": FieldResolver(str, ['attrs', 'Config', 'Image']),
        }, refs=dict(details=('/api/containers', 'id')),)
    )
    def get(self):
        containers_list = current_app.docker.containers.list(all=True)
        return containers_list

    @marshall(
        Marshaller({
            'message': str
        })
    )
    @json_params(
        JsonParam('action', required=True, type=Enum(['rm', 'stop', 'kill', 'restart'])),
        JsonParam('containers', required=True, type=list)
    )
    @common_exception
    def put(self):
        format_ = {
            'rm': '{} containers were successfully removed',
            'stop': '{} containers were successfully stopped',
            'restart': '{} containers were successfully restarted',
            'kill': '{} containers were successfully killed',
        }
        containers_id = self.args.get('containers')
        action = self.args.get('action')
        containers = [current_app.docker.containers.get(id_) for id_ in containers_id]

        for container in containers:
            if action == 'restart':
                container.restart()
            elif action == 'stop':
                container.stop()
            elif action == 'rm':
                container.remove()
            elif action == 'kill':
                container.kill()

        return dict(message=format_[action].format(len(containers_id)))


class SingleContainerView(MethodView):
    """docstring for SingleContainerView"""

    @marshall(
        Marshaller({
            "id": str,
            "name": str,
            'attrs': dict
        }),
        condition=lambda request: 'details' in request.args and int(request.args['details']) == 1
    )
    @marshall(
        Marshaller({
            "id": str,
            "name": str,
            "cmd": FieldResolver(list, ['attrs', 'Config', 'Cmd'], default=[]),
            "created": FieldResolver(str, ['attrs', 'Created']),
            "ports": FieldResolver(list, ['attrs', 'Config', 'ExposedPorts'], default=[]),
            "binds": FieldResolver(list, ['attrs', 'HostConfig', 'Binds'], default=[]),
            "port_binds": FieldResolver(dict, ['attrs', 'HostConfig', 'PortBindings'], default=[]),
            "image_name": FieldResolver(str, ['attrs', 'Config', 'Image']),
            "envs": FieldResolver(list, ['attrs', 'Config', 'Env'], default=[]),
            "image_hash": FieldResolver(str, ['attrs', 'Image']),
            "work_dir": FieldResolver(str, ['attrs', 'Config', "WorkingDir"])
        }),
        condition=lambda request: 'details' not in request.args or int(request.args['details']) == 0
    )
    @common_exception
    def get(self, container_id):
        container_info = current_app.docker.containers.get(container_id)
        return container_info

    @json_params(
        JsonParam('action', required=True, type=Enum(['rm', 'stop', 'kill', 'restart']))
    )
    @common_exception
    def put(self, container_id):
        format_ = {
            'rm': 'container {} was successfully removed',
            'stop': 'container {} was successfully stopped',
            'restart': 'container {} was successfully restarted',
            'kill': 'container {} was successfully killed',
        }

        container = current_app.docker.containers.get(container_id)
        action = self.args.get('action')
        if action == 'restart':
            container.restart()
        elif action == 'stop':
            container.stop()
        elif action == 'rm':
            container.remove()
        elif action == 'kill':
            container.kill()

        return dict(message=format_[action].format(container_id))


class ContainerStats(MethodView):
    @marshall(
        Marshaller({
            "cpu": MarshallingField(calculate_cpu_usage, default=[]),
        }),
    )
    @common_exception
    def get(self, container_id):

        container = current_app.docker.containers.get(container_id)
        stats = container.stats(decode=True, stream=False)
        return stats


class ReadFileFromContainer(MethodView):

    @query_params(
        QueryParam('path', required=True)
    )
    @common_exception
    def get(self, container_id):
        container = current_app.docker.containers.get(container_id)
        return Response(read_file_data(container, self.args.get('path')), mimetype='text/plain')


class ExecCommandInContainer(MethodView):

    @json_params(
        JsonParam('command', required=True)
    )
    @common_exception
    def post(self, container_id):
        container = current_app.docker.containers.get(container_id)
        return Response(run_command(container, self.args.get('command')), mimetype='application/json')


class ContainerFiles(MethodView):

    @query_params(
        QueryParam('path', default=None)
    )
    @marshall(
        Marshaller({
            "files": ListMarshaller({
                'file_type': str,
                'file_size': str,
                'file_name': str,
            }),
            'pwd': os.path.abspath
        }),
    )
    @common_exception
    def get(self, container_id, *args, **kwargs):
        path = self.args.get('path')
        container = (current_app.docker.containers.get(container_id))
        return get_files(container, path)


class ContainerLogs(MethodView):

    def get(self, container_id, *args, **kwargs):
        container = (current_app.docker.containers.get(container_id))
        return Response(stream_logs(container), mimetype='text/plain')


urls = [
    ('/containers/<container_id>/fs/read', 'containers_single_file_reader',
     ReadFileFromContainer.as_view('containers_single_file_reader')),
    ('/containers/<container_id>/command', 'container_run_command', ExecCommandInContainer.as_view('container_run_command')),
    ('/containers/<container_id>/stats', 'container_stats', ContainerStats.as_view('container_stats')),
    ('/containers/<container_id>/logs', 'container_logs', ContainerLogs.as_view('container_logs')),
    ('/containers/<container_id>/fs', 'containers_single_files', ContainerFiles.as_view('containers_single_files')),
    ('/containers/<container_id>', 'containers_single', SingleContainerView.as_view('containers_single')),
    ('/containers', 'containers', ContainersView.as_view('containers')),
]
