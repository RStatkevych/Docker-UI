from .containers import urls as containers_urls
from .images import urls as images_urls
from .auth import urls as auth_urls

urls = containers_urls + images_urls + auth_urls
