#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Κέρβερος is the guardian of deployments

Κέρβερος decides if your deployment can be applied to the next environment
based on the prerequisite variable in .gitlab-ci.yml and authorizations set in
the pipeline.json file

Κέρβερος it's a strange name but it also ensures we're using utf-8 encoding

Κέρβερος, has a weird tendency of speaking about iteslf in 3rd person.
"""
from __future__ import absolute_import
from __future__ import print_function

import os

from lib.error import PipelineError
from lib.logger import logger
from lib.utils import SUCCESS, FAILED, INFO


# we need to iterate through the deployment pages following this order:
# 1. page 0
# 2. last page
# 3. last page - 1
# and so on until we get to page 1
class Pages(object):
    """
    Manage API pagination
    """
    def __init__(self):
        self.last = 0

    def __iter__(self):
        return self

    def next(self):
        """
        next page
        """
        self.last = self.last - 1
        if self.last < 1:
            raise StopIteration
        return self.last


def api_url():
    """
    gitlab API url

    Returns:
        (str): gitlab API url
    """
    return "https://gitlab.ph.esl-asia.com/api/v3/"


def deployments_url():
    """
    API deployments endpoint for current project

    Returns:
        (str): API deployments endpoint
    """
    return "{0}/projects/{1}/deployments".format(api_url(), project_id())


def pipeline_url():
    """
    current pipeline data from API

    Returns:
        (str): current pipeline data from API
    """
    return "{0}/projects/{1}/pipelines/{2}".format(api_url(), project_id(),
                                                   pipeline_id())


def project_id():
    """
    returns current project ID as set in the environment variables

    Returns:
        (int): project ID

    Raises:
        KeyError
    """
    return int(os.environ['CI_PROJECT_ID'])


def pipeline_id():
    """
    returns current pipeline ID as set in the environment variables

    Returns:
        (int): pipline ID

    Raises:
        KeyError
    """
    return int(os.environ['CI_PIPELINE_ID'])


def api_token():
    """
    returns current api token as set in the environment variables

    Returns:
        (str): api token

    Raises:
        KeyError
    """
    return os.environ['PRIVATE_TOKEN']


def prerequisite(config):
    """
    returns the name of the prerequistite for this step
    (must be defined as variable in .gitlab-ci.yml)

    Returns:
        (str): api token

    Raises:
        KeyError
    """
    return config['prerequisite']


def check_dependencies(config):
    """
    Checks if current deployment statisfies requirements

    Returns:
        (bool) checks if requested deployment can be performed
    """
    try:
        depends_on = config['depends_on']
        with open(depends_on, 'r') as dependency:
            msg = ("{0} Κέρβερος says: all the requirements are met: {1},"
                   "let's start".format(SUCCESS, dependency.read()))
            logger.info(msg)
            return True
    except KeyError:
        msg = ("{0} Κέρβερος this step do not depend on any previous "
               "stage".format(SUCCESS))
        logger.error(msg)
        return True
    except (OSError, IOError):
        msg = ("{0} Κέρβερος won't let you pass, requirements are not met:"
               " {1} does not exist".format(FAILED, depends_on))
        logger.error(msg)
        return False


def current_user_email():
    """
    Returns the current user email (lower case)
    """
    return os.environ['GITLAB_USER_EMAIL'].lower()


def authorized_users(config):
    """
    Returns a tuple of the authorized users for this step
    (as defined in pipeline.json)
    """
    return (user.lower() for user in config['authorized_users'])


def authorized(config):
    valid_users = authorized_users(config)
    if "any" in valid_users:
        msg = ("{0} Κέρβερος says: this steps can be performed by "
               "anyone, be ready for the next quest".format(SUCCESS))
        logger.info(msg)
        return True

    user = current_user_email()
    if user not in authorized_users(config):
        msg = ("{0} Κέρβερος says: you're not authorized to trigger "
               "this step".format(FAILED, user))
        raise PipelineError(msg)

    msg = ("{0} Κέρβερος says: you're authorized to trigger "
           "this step, be ready for the next quest".format(SUCCESS, user))
    logger.info(msg)


def check(config):
    # no blockers for this environment
    logger.info('{0} Κέρβερος sniffs'.format(INFO))
    authorized(config)
    if not check_dependencies(config):
        raise PipelineError('Requirements are not met. Giving up.')
