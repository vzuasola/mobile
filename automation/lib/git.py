#!/usr/bin/env python

"""
This module abstracts the use of git without using git python module
"""

from __future__ import print_function
from __future__ import absolute_import
import os
import subprocess
from .logger import logger
from .progressbar import ProgressBar
from .error import PipelineError
from .utils import gitlab_var, project_dir
from .utils import read_json_configuration
from .docker import run_command
from distutils.version import LooseVersion


def git_executable():
    """
    Returns the full path to the git executable.
    """
    for path in os.environ['PATH'].split(':'):
        git_path = os.path.join(path, 'git')
        if os.path.exists(git_path):
            return git_path


def git_log(options=None):
    """
    Retrieves the git commit log
    """
    return git_command('log', options)


def git_branch(options=None):
    """
    Retrieves the git branches
    """
    return git_command('branch', options)


def git_command(command, options=None):
    """
    Prepare git command.
    """
    cmd = [git_executable()]

    cmd.append(command)
    if options is not None:
        for option in options:
            cmd.append(option)
    
    return run_git_command(cmd, None)


def run_git_command(cmd, output_file):
    """
    Execute and return the output
    """
    logger.debug(" ".join(cmd));
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    buff = ""
    result = ""
    progressbar = ProgressBar()
    
    if output_file:
        logger.info('redirecting output to: {0} (it may take a while)'.format(output_file))
        output_file = open(output_file, 'w')
    
    while True:
        out = process.stdout.read(1)
        if out == '' and process.poll() != None:
            break
        if out != '':
            buff = "{0}{1}".format(buff, out)
            result = "{0}{1}".format(result, out)
            if buff.endswith('\n'):
                msg = buff.strip()
                if output_file:
                    output_file.write(msg)
                else:
                    logger.debug(msg)
                buff = ""

    if output_file:
        output_file.close()
        progressbar.complete()
        logger.info('done!')

    # clean up
    if process.poll() != 0 :
        raise PipelineError('{0} failed'.format(' '.join(cmd)))
    return result


def get_sonar_sha():
    """
    Retrieves the commit sha that is needed by SonarQube for the Gitlab plugin. This also sets it as an environment variable $SONAR_COMMIT_SHA
    """

    if 'CI_COMMIT_SHA' not in os.environ:
        msg = '{0} is not defined in your environment'.format('CI_COMMIT_SHA')
        raise PipelineError(msg)

    if 'CI_COMMIT_REF_NAME' not in os.environ:
        msg = '{0} is not defined in your environment'.format('CI_COMMIT_REF_NAME')
        raise PipelineError(msg)


    get_latest_release_branch()

    if 'BASELINE_BRANCH' not in os.environ:
        baseline_branch = os.environ['CI_COMMIT_REF_NAME']
    else:
        baseline_branch = os.environ['BASELINE_BRANCH']

    addtl_options = [
        "--pretty=format:%H",
        "origin/" + baseline_branch + ".." + os.environ['CI_COMMIT_SHA']
    ]
    logger.debug(addtl_options);

    commit_sha = git_log(addtl_options)
    final_commit_sha = commit_sha.replace('\n', ',')
    
    logger.debug('Commit SHA for SonarQube: {0}'.format(final_commit_sha))
    os.environ['SONAR_COMMIT_SHA'] = final_commit_sha


def get_latest_release_branch():
    """
    Retrieves the latest release branch and assign it to $BASELINE_BRANCH environment variable
    """

    addtl_options = ["-a"]

    git_branches = git_branch(addtl_options)
    arr_git_branches = git_branches.split('\n')
    stripped_arr = map(str.strip, arr_git_branches)
    release_branches_arr = filter(lambda x: x.startswith('remotes/origin/release-v'), stripped_arr)
    set_sonar_version()
    os.environ['LEAK_PERIOD'] = 'previous_version'
    return True

    if len(release_branches_arr) > 0:
        version_branches_arr = map(lambda x: x.replace('remotes/origin/release-v', ''), release_branches_arr)
        version_branches_arr.sort(key=LooseVersion)
        latest_version = version_branches_arr.pop()
        os.environ['BASELINE_BRANCH'] = 'release-v' + latest_version
        if (version_branches_arr) and (os.environ['CI_COMMIT_REF_NAME'] == 'release-v' + latest_version):
            older_version = version_branches_arr.pop()
            os.environ['BASELINE_BRANCH'] = 'release-v' + older_version
        logger.debug('Baseline branch: {0} and Sonar version: {1}'.format(os.environ['BASELINE_BRANCH'], os.environ['SONAR_VERSION']))


def set_sonar_version():
    """
    Sets sonar version if in working, develop or release branch
    """

    os.environ['SONAR_VERSION'] = ''
    
    if os.environ['CI_COMMIT_REF_NAME'].startswith('release-v'):
        os.environ['SONAR_VERSION'] = os.environ['VERSION']

    if (os.environ['CI_COMMIT_REF_NAME'] == 'working') or (os.environ['CI_COMMIT_REF_NAME'] == 'develop') or (os.environ['CI_COMMIT_REF_NAME'] == 'master'):
        os.environ['SONAR_VERSION'] = os.environ['CI_COMMIT_REF_NAME']
