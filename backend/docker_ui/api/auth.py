from flask.views import MethodView
from ..core import login


class LoginView(MethodView):

    @login
    def get(self):
        pass

urls = [
    ('/login', 'login', LoginView.as_view('login')),
]
