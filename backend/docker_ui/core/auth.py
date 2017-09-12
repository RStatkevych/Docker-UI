import ldap
import jwt
import datetime

from flask import request
from flask.views import MethodView
from .exceptions import AuthException, IncorrectCredsException
from .serialization_helpers import expect_exception
from .common import message_marshall


class BaseAuthProvider(object):
    def authenticate(self, login, password):
        pass


class LDAPAuthProvider(object):
    """docstring for LDAPAuthProvider"""

    LDAP_UID_FORMAT = 'uid={},dc=roman'
    LDAP_SERVER = 'ldap://localhost:389'
    LDAP_USER_NAME_KEY = 'cn'

    def authenticate(self, login, password):
        base_dn = self.LDAP_UID_FORMAT.format(login)
        try:
            # build a client
            ldap_client = ldap.initialize(self.LDAP_SERVER)
            # perform a synchronous bind
            ldap_client.set_option(ldap.OPT_REFERRALS, 0)
            print(login, password)
            ldap_client.simple_bind_s(base_dn, password)
        except ldap.INVALID_CREDENTIALS:
            ldap_client.unbind()
            raise IncorrectCredsException
        except ldap.SERVER_DOWN:
            return 'AD server not awailable'

        print(list(ldap_client.search_s(base_dn, ldap.SCOPE_SUBTREE, 'uid=*'))[0])
        username = (ldap_client.search_s(base_dn, ldap.SCOPE_SUBTREE, 'uid=*'))[0][1][self.LDAP_USER_NAME_KEY]
        user_data = dict(username=username)
        ldap_client.unbind()

        return user_data


class JWTToken(object):
    """docstring for JWTToken"""

    JWT_SECRET = 'secret'

    def __init__(self, username, created=None):
        self.created = str(datetime.datetime.now())
        self.username = str(username)

    @classmethod
    def from_token(cls, token):
        decoded = jwt.decode(token, cls.JWT_SECRET)
        return cls(**decoded)

    @classmethod
    def validate(cls):
        pass

    def to_token(self):
        jwt_token = jwt.encode(
            dict(username=self.username, created=self.created),
            self.JWT_SECRET
        )
        return str(jwt_token.decode('utf-8'))


def login(func):
    LOGIN_PROVIDER = LDAPAuthProvider

    @message_marshall
    @expect_exception(IncorrectCredsException,
                      error_body=lambda x: dict(message="Invalid login data"),
                      error_code=401)
    def wrapper(*args, **kwargs):
        login_provider = LOGIN_PROVIDER()
        auth = request.authorization
        user_data = login_provider.authenticate(auth.username, auth.password)
        token = JWTToken(**user_data).to_token()

        return dict(message='OK'), 200, {'Authorization': 'Bearer ' + token}
    return wrapper


class AuthorizedMethodView(MethodView):

    @expect_exception(AuthException,
                      error_body=lambda x: dict(message="Unauthorized"),
                      error_code=403)
    def dispatch_request(self, *args, **kwargs):
        self.check_auth()
        return MethodView.dispatch_request(self, *args, **kwargs)

    def check_auth(self, *args, **kwargs):
        header = request.headers.get('Authorization')
        if not header:
            raise AuthException
        token = header.split(' ')[1]
        try:
            user_data = JWTToken.from_token(token)

            setattr(self, 'user', user_data)
        except Exception as e:
            print(e, 'occured')
            raise AuthException
