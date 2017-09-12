from setuptools import setup

setup(name='dockerui',
      version='0.1',
      py_modules=['docker_ui'],
      packages=['docker_ui', 'docker_ui.api', 'docker_ui.core', 'docker_ui.setup'],
      package_data={'docker_ui': ['.*html', '.*js']},
      include_package_data=True,
      install_requires=[
          'docker-py==1.10.6',
          'flask==0.11.1',
          'click>=2.0'
      ],
      entry_points={'console_scripts': ['dockerui-server = docker_ui.app:main']})
