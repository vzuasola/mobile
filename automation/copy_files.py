#!/usr/bin/env python
"""
Needs to be run inside automation/ directory.
"""

import os
import sys
import shutil

cur_dir = os.curdir
script_path = os.path.abspath(os.path.dirname(sys.argv[0]))
par_dir = os.path.dirname(script_path)
exclude_list = ['docker', '.git']
data_to_copy = [x for x in os.listdir(par_dir) if x not in exclude_list]
docker_dir = os.path.join(par_dir, 'docker/services/app')


for d in data_to_copy:
    data = os.path.join(par_dir, d)
    if os.path.isfile(data):
        shutil.copy(data, docker_dir)
    elif os.path.isdir(data):
        dest = os.path.join(docker_dir, os.path.basename(data))
        shutil.copytree(data, dest)
