from flask import Flask, render_template, jsonify
from .ext import DockerExtension
from .api import urls
from .core.serialization_helpers import ExpectedError


class Application(object):
    pass


def factory():
    app = Flask(__name__)

    for data in urls:
        url, endpoint, func = data
        print(data)
        app.add_url_rule(url, endpoint, func)

    app.docker = DockerExtension()

    app.config['PROPAGATE_EXCEPTIONS'] = True

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.errorhandler(ExpectedError)
    def handle_expected_error(error):
        format_ = dict(Response={}, Error=error.error_body)
        print(format_)
        response = jsonify(format_)
        response.status_code = error.error_code
        return response
    return app


def main():
    factory().run(host='0.0.0.0')

if __name__ == '__main__':
    main()
