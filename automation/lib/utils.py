"""
This module provides basic utilities
"""

from __future__ import print_function
from __future__ import absolute_import
from collections import OrderedDict
import hashlib
import json
import os
import tarfile
import shutil
from .error import PipelineError
from .logger import logger

# some constants...
CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))
# colors
INFO = '\033[94m[INFO]  \033[0m'
SUCCESS = '\033[92m[OK]    \033[0m'
FAILED = '\033[91m[FAILED]\033[0m'

# default configuration file
BUILD_DIR = os.path.abspath(os.path.join(CURRENT_DIR, os.pardir))
PROJECT_DIR = os.path.abspath(os.path.join(BUILD_DIR, os.pardir))
DEFAULT_CONFIG_FILE = os.path.join(BUILD_DIR, 'pipeline.json')
PACKAGE_CONFIG = os.path.join(PROJECT_DIR, 'pipeline-package.json')
DEPENDENCY_CONFIG = os.path.join(PROJECT_DIR, 'pipeline-dependency.json')


def artifactory_urls():
    """
    Reads the configuration from pipeline.json and return the artifactory
    instances urls
    for more information about the package names, please refer to the
    README.md file in this project.
    """
    config = read_configuration(DEFAULT_CONFIG_FILE)
    for artifactory in config['artifactory']['instances']:
        yield "{0}/{1}".format(artifactory, _archive_name())


def _version():
    return "{0}.{1}".format(gitlab_var('VERSION', default='999'),
                            gitlab_var('CI_PIPELINE_ID', default='999'))


def _package_name():
    return "{0}-{1}".format(os.environ['CI_PROJECT_NAME'], _version())


def _archive_name():
    return os.path.join('{0}.tar.gz'.format(_package_name()))


def _archive_path():
    return os.path.join(project_dir(), _archive_name())


def _archive_exclude(filename):
    config = read_configuration(PACKAGE_CONFIG)
    archive_exclude_directories = config['exclude_directories']
    archive_exclude_extensions = tuple(config['exclude_extensions'])
    if filename.name.endswith('robots.txt'):
        return filename
    if os.path.split(filename.name)[1] in archive_exclude_directories:
        return None
    if filename.name.endswith(archive_exclude_extensions):
        return None
    return filename


def read_configuration(config_file):
    """
    reads the deployment configuration for a given environment

    Args:
        environment (str): environment about to be deployed

    Returns:
        (dict): deployment configuration for a given environment

    Raises:
        PipelineError
    """
    try:
        with open(config_file, 'r') as json_in:
            deploy_config = json.load(json_in, object_pairs_hook=OrderedDict)
        return deploy_config
    except IOError as error:
        msg = 'cannot read configuration file: {0}. Make sure file exists and has correct permissions.'.format(error)
        raise PipelineError(msg)
    except KeyError:
        msg = ('{0} provided environment name, {1}, does in the specified '
               'configuation file: {2}' .format(FAILED,
                                                environment, config_file))
        raise PipelineError(msg)


def read_json_configuration(json_file):
    """
    Reads a json file and returns a dictionary of its content

    Args:
        json_file (str): path to the json file

    Returns:
        dict: content of json file

    Raises:
        PipelineError
    """
    try:
        with open(json_file, 'r') as json_in:
            return json.load(json_in)
    except IOError as error:
        msg = 'cannot read configuration file: {0}'.format(error)
        raise PipelineError(msg)


def project_dir():
    """
    Returns the location of the project main directory, it is set by gitlab but
    in case we are running this locally we need to define it in other ways
    (hint is two directories up from this file)
    """
    if 'CI_PROJECT_DIR' in os.environ:
        return os.environ['CI_PROJECT_DIR']
    else:
        # trying to make it readable...
        build_dir = os.path.abspath(os.path.join(CURRENT_DIR, os.pardir))
        return os.path.abspath(os.path.join(build_dir, os.pardir))


def deployment_conf_dir():
    """
    Returns the deployment configuration directory: deploy/
    """
    return os.path.join(project_dir(), 'deploy')


def gitlab_var(var_name, default):
    """

    Args:
        var_name (str): name of the variable

    Returns:
        (str): value of the variable
    """
    if var_name in os.environ:
        return os.environ[var_name]
    return default


def md5(filename, blocksize=65536):
    """
    calculate md5 hash on filename

    Args:
            filename (str):

    Returns:
            (str) md5 hash of the file
    """
    hash_ = hashlib.md5()
    with open(filename, 'rb') as f:
        for block in iter(lambda: f.read(blocksize), b''):
            hash_.update(block)
    return hash_.hexdigest()


def sha1(filename, blocksize=65536):
    """
    calculate sha1 hash on filename

    Args:
            filename (str):

    Returns:
            (str) sha1 hash of the file
    """
    hash_ = hashlib.sha1()
    with open(filename, 'rb') as f:
        for block in iter(lambda: f.read(blocksize), b''):
            hash_.update(block)
    return hash_.hexdigest()


def base_directory():
    """
    returns the base directory name from pipeline.json
    """
    if os.path.exists(os.path.join(PROJECT_DIR, 'base')):
        return os.path.join(PROJECT_DIR, 'base')
    return os.path.join(PROJECT_DIR, 'final_package')


def create_archive(package_config, archive_name=None):
    """
    create a tar.gz archive from base_dir excluding items
    provided in exclude

    Args:
        package_config (dict): a dictionary with your package configuration
    Raises:
        PipelineError
    """
    # execute the pre archive steps
    _pre_archive(package_config)

    if archive_name is None:
        archive_name = _archive_name()

    base_dir = base_directory()

    if os.path.exists(archive_name):
        os.remove(archive_name)

    tar = tarfile.open(archive_name, "w:gz")
    tar.add(base_dir, arcname='.', filter=_archive_exclude)
    tar.close()
    return archive_name


def mkdir_p(directory):
    """
    mkdir -p implementation in python
    """
    os.system('mkdir -p {0}'.format(os.path.abspath(directory)))


def _drupal7_pre_archive():
    """
    copies site directory into -> base/sites/all/default
    """
    logger.info('drupal7 pre-archive steps')
    site_dest = os.path.join(PROJECT_DIR, 'base', 'sites', 'default')
    vendor_dest = os.path.join(PROJECT_DIR, 'base', 'sites', 'all', 'vendor')
    for directory in (site_dest, vendor_dest):
        if os.path.exists(directory):
            try:
                shutil.rmtree(directory)
                # at this point, there's no base/sites/all/default
                intermediate_dirs = os.path.join(*(directory.split(os.sep)[0:-1]))
                mkdir_p(intermediate_dirs)
            except OSError as error:
                try:
                    os.remove(directory)
                except OSError as error:
                    raise PipelineError(error)
            except shutil.Error as error:
                raise PipelineError(error)

    shutil.copytree(os.path.join(PROJECT_DIR, 'site'), site_dest)
    shutil.copytree(os.path.join(PROJECT_DIR, 'vendor'), vendor_dest)


def _drupal8_pre_archive(package_config):
    """
    copies site directory into -> base/sites/all/default
    """
    logger.info('pre-archive steps')
    site_dest = os.path.abspath(base_directory())
    logger.info('site dest: -> %s', site_dest)
    if os.path.exists(site_dest):
        try:
            shutil.rmtree(site_dest)
            mkdir_p(site_dest)
        except OSError as error:
            try:
                os.remove(site_dest)
            except OSError as error:
                raise PipelineError(error)
        except shutil.Error as error:
            raise PipelineError(error)
    for item in package_config['include_directories']:
        path = os.path.abspath(os.path.join(PROJECT_DIR, item))
        logger.info('copy %s -> %s', path, os.path.join(site_dest, item))
        shutil.copytree(path, os.path.join(site_dest, item))
    logger.info('pre package complete')


def _pre_archive(package_config):
    """
    Don't call this function directly, create_archive will do it for you
    In drupal7, "composer" do not create files into the right directory
    we need do copy some files.
    Drupal8 instead creates files into the right place, so this function
    will have on drupal8 projects
    """
    if os.path.exists(os.path.join(PROJECT_DIR, 'base')):
        logger.info('detected drupal7 project style')
        _drupal7_pre_archive()
    else:
        logger.info('detected non-drupal7 project style')
        _drupal8_pre_archive(package_config)


def get_version():
    """
    Retrieves the version based on the branch name and add it on the env variable VERSION.
    """
    if 'CI_COMMIT_REF_NAME' not in os.environ:
        msg = '{0} is not defined in your environment'.format('CI_COMMIT_REF_NAME')
        raise PipelineError(msg)
    branch_name = os.environ['CI_COMMIT_REF_NAME'].replace('release-v', '')
    logger.debug(branch_name)
    os.environ['VERSION'] = branch_name


def skip_step(stage, step):
    """
    Skips a step in a stage if defined in the environment variable (or in the Gitlab CI Pipelines secret variables).
    """
    if 'SKIP_STEPS' not in os.environ:
        return False

    steps_to_skip = os.environ['SKIP_STEPS'].split(',')
    concat_stage_step = stage + '|' + step
    if concat_stage_step in steps_to_skip:
        return True
