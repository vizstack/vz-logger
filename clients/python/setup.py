from setuptools import setup

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name='vz-logger',
    version='0.1.1',
    license='MIT',
    packages=['vzlogger'],
    zip_safe=False,
    author='Ryan Holmdahl & Nikhil Bhattasali',
    author_email='vizstack@gmail.com',
    install_requires=['vizstack-py', 'python-socketio'],
    description="Send beautiful messages to the Vizstack Logger.",
    url='https://github.com/vizstack/vz-logger',
    long_description=long_description,
    long_description_content_type='text/markdown',
)
