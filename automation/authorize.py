#!/usr/bin/env python
"""
Very basic authorization mechanism.

It checks if the current user is part of the list of authorized users.
Later this module will be extended to use LDAP/AD authentication
"""

import os
import sys
from lib.logger import logger
from lib.utils import read_configuration
from lib.utils import DEPENDENCY_CONFIG


def is_user_authorized():
    authorized_users = os.environ['AUTHORIZED_USERS'].split(',')
    user = os.environ['USER']
    if 'any' in authorized_users:
        logger.info('authorization: any user can execute this step')
        return True
    if user in authorized_users:
        logger.info('user: %s is part of the authorized users', user)
        return True
    logger.error('%s is not authorized to execute this stage', user)
    return False


def are_requirements_met():
    if check_requirements():
        return True
    return False


def check_requirements():
    """
    Checks dependency per stage based on configured pipeline-dependency.json on the root of your project.
    """
    dependency_config = read_configuration(DEPENDENCY_CONFIG)
    pipeline_stage = os.environ['PIPELINE_STAGE']
    
    if pipeline_stage not in dependency_config:
        return True
    pipeline_stage_file = '/app/automation/deployed/' + dependency_config[pipeline_stage] + '.jsonl'
    if not os.path.exists(pipeline_stage_file):
        msg = ('dependencies are not met: this stage depends on {0}'
                   ' but {0} does not exist.'.format(pipeline_stage_file))
        logger.error(msg)
        return False
    return True


def main():
    if not is_user_authorized():
        logger.error('you cannot execute this stage.')
        sys.exit(1)
    if not are_requirements_met():
        logger.error('dependencies are not met.')
        sys.exit(1)
    logger.info('this stage can be executed')


if __name__ == '__main__':
    try:
        main()
    except KeyError as error:
        logger.error('missing key in your environment: %s', error)
        logger.error('your journey ends here, my friend')
        sys.exit(1)
