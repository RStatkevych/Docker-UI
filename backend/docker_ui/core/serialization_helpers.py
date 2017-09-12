from flask import jsonify, request
import traceback


class Marshaller(object):
    """docstring for Validator"""

    def __init__(self, form, refs=dict(), ignore_none_fields=True):
        self.form = form
        self.refs = dict(refs)
        self.ignore_none_fields = ignore_none_fields

    def apply(self, data):
        after = dict()
        for key, marshaller in self.form.items():
            if isinstance(marshaller, MarshallingField):
                after[key] = marshaller(data)

            elif isinstance(data, dict):
                after[key] = marshaller(data[key])
            else:
                after[key] = marshaller(getattr(data, key))
        after.update({ref: endpoint + '/' + getattr(data, val) for ref, (endpoint, val) in self.refs.items()})
        return after

    def __call__(self, *args):
        return self.apply(*args)


class ListMarshaller(Marshaller):

    def apply(self, data):
        return [Marshaller.apply(self, item) for item in data]


class MarshallingField(object):

    def __init__(self, func, default=None):
        self.marshaller = func
        self.default = default

    def apply(self, data):
        if self.default is not None and data is None:
            type_ = type(self.default)
            return type_(self.default)
        else:
            return self.marshaller(data)

    def __call__(self, *args):
        return self.apply(*args)


class FieldResolver(MarshallingField):
    """docstring for FieldResolver"""

    def __init__(self, formatter, path_to_resolve, default=None):
        super().__init__(formatter, default=default)
        self.path_to_resolve = path_to_resolve

    def __call__(self, data, *args):
        current = getattr(data, self.path_to_resolve[0])
        for current_key in self.path_to_resolve[1:]:
            if isinstance(current, dict) and current_key in current:
                current = current[current_key]
            elif hasattr(current, current_key):
                current = getattr(current, current_key)
            else:
                current = None
                break
        return MarshallingField.apply(self, current)


class marshall(object):

    def __init__(self, marshaller, condition=None):
        self.marshaller = marshaller
        self.condition = condition

    def __call__(self, func):
        format_ = {'Response': {}, 'Error': {}}

        def _(this, *args, **kwargs):
            status, headers = 200, {}
            response = func(this, *args, **kwargs)

            if isinstance(response, tuple) and len(response) == 2:
                response, status = response
            elif isinstance(response, tuple) and len(response) == 3:
                response, status, headers = response

            if not self.condition or (self.condition and self.condition(request) is True):
                result = self.marshaller.apply(response)
                data = dict(format_)
                data['Response'] = result

                return jsonify(data), status, headers
            else:
                return response, status, headers
        return _


class Enum(object):
    def __init__(self, strs):
        self.strs = strs

    def __call__(self, arg):
        if arg not in self.strs:
            raise Exception
        else:
            return str(arg)


class BaseParam(object):

    def __init__(self, name, required=False, default=None, is_nullable=True, accessor=None, type=str):
        self.name = name
        self.required = required
        self.default = default
        self.is_nullable = is_nullable
        self.type = type
        if accessor:
            self.accessor = accessor

    def accessor(self, data):
        data = self._accessor(data)
        return self.type(data)


class QueryParam(BaseParam):

    _accessor = lambda self, x: x[0]


class JsonParam(BaseParam):

    _accessor = lambda self, x: x


class base_param_resolver(object):
    source = None

    def __init__(self, *params):
        self.params = params

    def __call__(self, func):
        def _(this, *args, **kwargs):
            params = dict(self.source())
            for param in self.params:
                if param.name not in params:
                    if param.default is not None:
                        params[param.name] = param.default
                    elif param.is_nullable:
                        params[param.name] = None
                    elif param.required:
                        raise KeyError
                else:
                    params[param.name] = param.accessor(params[param.name])
            this.args = params
            return func(this, *args, **kwargs)
        return _


class query_params(base_param_resolver):
    """docstring for query_params"""

    source = lambda self: request.args


class json_params(base_param_resolver):

    source = lambda self,: request.json


class ExpectedError(Exception):
    def __init__(self, error_body, error_code):
        self.error_code = error_code
        self.error_body = error_body


class expect_exception(object):
    """docstring for expect_exception"""
    def __init__(self, exception_class, filter=lambda x: True, error_body=lambda x: dict(message=str(x)),
                 error_code=404):
        self.exception_class = exception_class
        self.filter = filter
        self.error_body = error_body
        self.error_code = error_code

    def __call__(self, func):

        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except self.exception_class as exception:
                if self.filter(exception):
                    error_body = self.error_body(exception)
                    raise ExpectedError(error_body, self.error_code)
                else:
                    print("In unexpected ", exception)
                    raise exception
            except Exception as e:
                print("IN exc handler", e)
                raise e
        return wrapper
