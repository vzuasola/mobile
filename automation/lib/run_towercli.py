#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
 Copyright (c) 2017 ESL Automation team

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
 KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
"""

from __future__ import print_function
import click
import os
import subprocess
import sys

__author__ = "IT Ops Linux ESL"
__contact__ = "eric.vansteenbergen@esl-asia.com"
__version__ = ": 1.0 $"
__date__ = ": 2017/09/12 $"
__copyright__ = "Copyright (c) 2017 ESL Automation team"
__license__ = "Python"


@click.command()
@click.option('--job-template', help='Job template name', required=True)
@click.option('--extra-vars', help='Extra variables', type=str, default='', multiple=True)
def tower_authenticate(job_template, extra_vars):
    host = os.environ['TC_HOST']
    username = os.environ['TC_USERNAME']
    password = os.environ['TC_PASSWORD']
    subprocess.call(['tower-cli', 'config', 'host', host])
    subprocess.call(['tower-cli', 'config', 'username', username])
    subprocess.call(['tower-cli', 'config', 'password', password])
    subprocess.call(['tower-cli', 'config', 'verify_ssl', 'no'])

    print(extra_vars)

    launch_command = ['tower-cli', 'job', 'launch', '--monitor', '-f', 'human', '--job-template', job_template]
    for extra_var in extra_vars:
        launch_command.append('--extra-vars')
        launch_command.append(extra_var)

    print(" ".join(launch_command))
    ret = subprocess.call(launch_command)
    if(ret != 0):
        raise Exception('Command failed!')


def main():
    try:
        tower_authenticate()
    except Exception as error:
        print(error)
        sys.exit(1)


if __name__ == '__main__':
    main()
