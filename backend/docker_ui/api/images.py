import docker
from flask import current_app
from ..core import (marshall, ListMarshaller, Marshaller, FieldResolver, json_params, JsonParam, Enum, expect_exception)
from ..core import AuthorizedMethodView as MethodView

from ..core.common import common_exception


class ImagesView(MethodView):

    @marshall(
        ListMarshaller({
            "id": str,
            "tags": str,
            "created": FieldResolver(str, ['attrs', 'Created']),
            "short_id": str,
        }, refs=dict(details=('/images', 'id')),)
    )
    def get(self):
        images_list = current_app.docker.images.list(all=True)
        return images_list

    @marshall(
        Marshaller({
            'message': str
        })
    )
    @json_params(
        JsonParam('action', required=True, is_nullable=False, type=Enum(['rm'])),
        JsonParam('images', required=True, is_nullable=False, type=list)
    )
    @expect_exception(docker.errors.APIError,
                      filter=lambda x: x.status_code == 409,
                      error_body=lambda x: dict(message=str(x)),
                      error_code=409)
    @common_exception
    def put(self):
        format_ = {
            'rm': '{} images were successfully removed',
        }
        images_id = self.args.get('images')
        action = self.args.get('action')
        for image in images_id:
            if action == 'rm':
                current_app.docker.images.remove(image=image)

        return dict(message=format_[action].format(len(images_id)))


class SingleImageView(MethodView):
    """docstring for SingleContainerView"""

    @marshall(
        Marshaller({
            "attrs": dict,
            'children': ListMarshaller({
                'id': str
            })
        }),
    )
    @common_exception
    def get(self, image_id):
        image = current_app.docker.images.get(image_id)
        children = self._get_images_chain(image_id)
        return dict(attrs=image.attrs, children=children)

    def _get_images_chain(self, image_id):
        current_id = image_id
        children = []
        while current_id:
            current = current_app.docker.images.get(current_id)
            current_id = current.attrs.get('Parent')
            children.append(current)

        parents = []
        current_id = image_id

        while True:
            images = list(current_app.docker.images.list(all=True))
            for image in images:
                print(current_id, image.id, image.attrs.get('ParentId'))

                if image.attrs.get('ParentId') == current_id:
                    print(image.attrs.get('ParentId'))
                    current_id = image.id
                    parents.append(image)
                    break
            else:
                break

        return parents + children

urls = [
    ('/images', 'images', ImagesView.as_view('images')),
    ('/images/<image_id>', 'image_single', SingleImageView.as_view('image_single')),
]
