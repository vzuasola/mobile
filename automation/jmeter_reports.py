#!/usr/bin/env python

from __future__ import absolute_import
from __future__ import print_function

import argparse
import sys
import json
import os
import time

import lib.artifactory as artifactory
import lib.docker as docker
from lib.error import PipelineError
from lib.logger import logger
from lib.utils import artifactory_urls, DEFAULT_CONFIG_FILE
from lib.utils import create_archive, read_configuration


def main():
    """
    generate a package and upload it to artifactory
    """

    logger.info('creating archive of the results')

    str_config = '{"include_directories":["load_tests_results", "load_tests_results_logs"]}'
    package_config = json.loads(str_config)
    package_name = '{0}-{1}.{2}-load-test-results.{3}.tar.gz'.format(os.environ['CI_PROJECT_NAME'], os.environ['VERSION'], os.environ['CI_PIPELINE_ID'],int(time.time()))
    archive = create_archive(package_config, package_name)
    archive = os.path.basename(archive)
    logger.info('uploading report {0} to artifactory'.format(archive))
    config = read_configuration(DEFAULT_CONFIG_FILE)
    config_url = config['artifactory']['instances'][0]
    config_url = config_url.replace('$CI_PROJECT_NAME', os.environ['CI_PROJECT_NAME'])
    url = '{0}/{1}'.format(config_url,package_name)
    
    artifactory_config = config['artifactory']
    username = artifactory_config['username']
    username = username.replace('$CI_PROJECT_NAME', os.environ['CI_PROJECT_NAME'])
    # pipeline.json contains the NAME of the variable
    # the actual password is stored within gitlab variables
    password = artifactory_config['password']
    password = password.replace('$ARTIFACTORY_PASSWORD', os.environ['ARTIFACTORY_PASSWORD'])

    if password == 'Not defined':
        logger.warning('no password defined for artifactory')

    artifactory.upload(url=url,
                       username=username,
                       password=password,
                       file_to_upload=archive)



if __name__ == '__main__':
    try:
        main()
    except PipelineError as error:
        logger.error(error)
        docker.cleanup_volumes('/app')
        sys.exit(-1)
