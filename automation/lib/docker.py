#!/usr/bin/env python

"""
This module binds GitLab deployments and Ansible Tower jobs
"""

from __future__ import print_function
from __future__ import absolute_import
import os
import subprocess
import json
from .logger import logger
from .progressbar import ProgressBar
from .error import PipelineError
from .utils import gitlab_var, project_dir
from .utils import read_json_configuration


def deployment_conf_dir():
    """
    Returns the deployment configuration directory: deploy/
    """
    return os.path.join(project_dir(), 'deploy')


def deployment_conf_file():
    """
    Returns the deployment configuration file: deploy/tc.config
    """
    return os.path.join(deployment_conf_dir(), 'tc.config')


def context():
    """
    Returns the directory that contains the Dockerfile for deployments
    """
    return os.path.join(os.path.dirname(__file__))


def create_docker_configuration(config):
    """
    Creates the docker configuration file, we will use it to point to the right
    ansible tower instance.

    Args:
        config (dict): environment configuraiton

    Raises:
        PipelineError
    """
    # create the deployment configuration directory
    if not os.path.exists(deployment_conf_dir()):
        os.makedirs(deployment_conf_dir())

    try:
        host = config['ansible_tower_instance']
        username = os.environ[config['username']]
        password = os.environ[config['password']]
    except KeyError as error:
        msg = 'Please check your configuration/GitLab keys: {0}'.format(error)
        raise PipelineError(msg)

    # now generate the configuration file
    conf = ["[general]",
            "host: {0}".format(host),
            "username: {0}".format(username),
            "password: {0}".format(password),
            "verify_ssl: false",
            "reckless_mode: true"]

    # write the file...
    with open(deployment_conf_file(), 'w') as conf_file:
        conf_file.write("\n".join(conf))


def docker_executable():
    """
    returns the full path to the docker executable.
    Sorry windows users, this is the only reason you cannot exeucte this job:
    getting the full path of the docker executable will make this function way
    uglier than it looks now.
    """
    for path in os.environ['PATH'].split(':'):
        docker_path = os.path.join(path, 'docker')
        if os.path.exists(docker_path):
            return docker_path


def default_image_name(environment=None):
    """
    Returns the docker image name to use, it creates different names if the
    deployment runs from Gitlab or localy (for testing)

    Args:
        envionment (str): name of the environment (can be None)

    Returns:
        str
    """
    project = 'local'
    stage = 'local-test'
    if 'CI_PROJECT_NAME' in os.environ:
        project = os.environ['CI_PROJECT_NAME']
    if 'CI_BUILD_STAGE' in os.environ:
        stage = os.environ['CI_BUILD_STAGE']
    if environment:
        return "experimental-{0}-{1}-{2}".format(project, stage, environment)
    else:
        return "experimental-{0}-{1}".format(project, stage)


def default_docker_file():
    """
    Returns the default Dockerfile name (<project_dir>/Dockerfile.<stage>)
    """
    docker_file = gitlab_var('DOCKERFILE', default=None)
    if docker_file is None:
        raise PipelineError('DOCKERFILE is not defined in your environment')
    return os.path.join(project_dir(), docker_file)


def create_image(image_name=None, docker_file=None):
    """
    Create a docker image (docker build).

    Args:
        image_name (str): image needed by the deployment process

    Raisese:
        PipelineError
    """
    if not image_name:
        image_name = default_image_name(environment=None)
    if not docker_file:
        docker_file = default_docker_file()
    cmd = (docker_executable(),
           'build',
           '-f', docker_file,
           '-t', image_name,
           '.')

    docker_build = subprocess.Popen(cmd, cwd=project_dir(),
                                    stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE)

    logger.info('building docker image: {0}'.format(image_name))
    # suppress full log of the image build step unless we're in debug mode.
    while docker_build.poll() is None:
        out = docker_build.stdout.read()
        err = docker_build.stderr.read()
    if docker_build.returncode != 0:
        msg = 'Failed to build required docker image: {0}'.format(" ".join(cmd))
        raise PipelineError(msg)


def _base_test_cmd():
    """
    Basic phpcs test command
    """
    cmd = [docker_executable(),
           'run', '--rm', '-t', '--security-opt', 'label:type:unconfined_t',
           '-v', '{0}:/opt/tests/project'.format(project_dir()),
           default_image_name(),
           'phpcs',
           '--report=summary',
           '--report-width=160']

    test_configuration = read_json_configuration(TEST_CONFIGURATION)
    for item in test_configuration['directories_to_test']:
        cmd.append(item)

    return cmd


def cleanup_volumes(volume):
    logger.info('\nreset permissions on local files')
    cmd = [docker_executable(),
           'run', '--rm', '-t', '--security-opt', 'label:type:unconfined_t',
           '-v', '{0}:{1}'.format(project_dir(), volume),
           'alpine:latest',
           'chown', '-R', '{0}:{1}'.format(os.getuid(), os.getuid()),
           '{0}'.format(volume)]
    if run_command(cmd, output_file=None) != 0:
        msg = "Volume clean up has failed: {0}".format(' '.join(cmd))
        raise PipelineError(msg)


def ssh_dir():
    """
    get the ssh configuration directory from known location or from local user
    fail ssh directory is not present
    """
    known_ssh_dirs = ('~/ssh-docker/', '~/.ssh/')
    for path in known_ssh_dirs:
        path = os.path.expanduser(path)
        if os.path.exists(path):
            logger.info('using ssh dir: {0}'.format(path))
            return path

    msg = 'could not find ssh configuration on canonical paths: {0}'.format(
        ','.join(known_ssh_dirs))
    raise PipelineError(msg)


def run_command(cmd, output_file):
    """
    execute and logs command
    """

    # Show command when in DEBUG_MODE
    logger.debug('\nCommand to be executed: {0}'.format(' '.join(cmd)))
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    buff = ""
    progressbar = ProgressBar()
    if output_file:
        logger.info('redirecting output to: {0} (it may take a while)'.format(output_file))
        output_file = open(output_file, 'w')
    logger.info('')
    while process.poll() is None:
        # read 1 char
        if output_file:
            progressbar.update()
        std_ = process.stdout.read(1)
        if std_:
            buff = "{0}{1}".format(buff, std_)
            if buff.endswith('\n'):
                msg = buff.strip()
                if output_file:
                    output_file.write(msg)
                else:
                    logger.info(msg)
                buff = ""
    if output_file:
        output_file.close()
        progressbar.complete()
        logger.info('done!')
    # clean up
    return process.poll()


def expand_variables(string, return_error=False):
    """
    takes a string and expands $XXXXXXX into an environment variable
    if the variable is not available, it will throw a gigantic exception
    """
    if '$' not in string:
        return string
    pre, _, post = string.partition('$')
    # take the first element of the string followed by ::space:: or all the
    # string
    env_variable = post.split(':')[0]
    env_variable = env_variable.split('/')[0]
    env_variable = env_variable.split(' ')[0]
    env_variable = env_variable.split('.')[0]
    # remove any '
    env_variable = env_variable.replace("'", '')
    # remove any "
    env_variable = env_variable.replace('"', '')
    # remove any space from the string
    if env_variable not in os.environ:
        msg = "{0} is not defined in your environment".format(env_variable)
        if return_error:
            return False
        raise PipelineError(msg)
    string = string.replace('${0}'.format(env_variable), os.environ[env_variable])
    if "$" in string:
        return expand_variables(string)
    return string


def execute(image_name, dockerfile, options, command, volumes, output, pipeline_stage, other_vars=None):

    create_image(image_name=image_name, docker_file=dockerfile)

    cmd = [docker_executable(),
           'run',
           '--rm', '-t', '--security-opt', 'label:type:unconfined_t',
           '-v', '{0}:/root/.ssh/:ro'.format(ssh_dir()),
           '--env', 'PIPELINE_STAGE={0}'.format(pipeline_stage)]

    for volume in volumes:
        cmd.append('-v')
        cmd.append(expand_variables(volume))

    # now add options, if any
    for option in options:
        opt = expand_variables(option)
        cmd.append(opt)

    # tell docker which machine you want to use
    cmd.append(image_name)

    # now, append the final command, if any
    if command:
        for cmmd in command:
            cmd.append(expand_variables(cmmd))

    # append variablized --extra-vars
    if other_vars:
        other_vars_list = convert_to_extra_vars(expand_variables(other_vars, True))
        logger.debug('Value of other_vars: {0}'.format(other_vars_list));
        for other_var in other_vars_list:
            cmd.append(expand_variables(other_var))

    if run_command(cmd, output) != 0:
        raise PipelineError('{0} failed'.format(' '.join(cmd)))


def convert_to_extra_vars(other_vars):
    """
    Converts one-liner JSON string to dict.
    """
    logger.debug('other vars= {0}'.format(other_vars))
    other_vars_list = []
    if not other_vars:
        return other_vars_list

    try:
        from json.decoder import JSONDecodeError
    except ImportError:
        JSONDecodeError = ValueError

    try:
        other_vars_dict = json.loads(other_vars)
        for other_var_key, other_var_value in other_vars_dict.items():
            other_vars_list.append('--extra-vars')
            other_vars_list.append(other_var_key + ': ' + other_var_value)

    except JSONDecodeError as error:
        msg = 'Your other_vars is not a proper JSON: {0}'.format(error)
        raise PipelineError(msg)

    return other_vars_list