import docker
from . import expect_exception, marshall, Marshaller


def common_exception(func):
    @expect_exception(docker.errors.APIError,
                      filter=lambda x: x.status_code == 404,
                      error_body=lambda x: dict(message=str(x)),
                      error_code=404)
    @expect_exception(docker.errors.APIError,
                      filter=lambda x: x.status_code == 500,
                      error_body=lambda x: dict(message=str(x)),
                      error_code=406)
    def wrapper(self, *args, **kwargs):
        return func(self, *args, **kwargs)
    return wrapper


def message_marshall(func):
    @marshall(
        Marshaller({
            'message': str
        })
    )
    def wrapper(self, *args, **kwargs):
        return func(self, *args, **kwargs)
    return wrapper
