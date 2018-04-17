#!/usr/bin/env python
"""
marks a step as complete
"""

import os
import sys
import json
import datetime
from lib.logger import logger


def main():
    create_dependency_file()
    logger.info('stage complete')


def create_dependency_file():
    """
    Creates dependency file for a given stage
    """
    dependency_file = '/app/automation/deployed/' + os.environ['PIPELINE_STAGE'] + '.jsonl'
    data = {'date': str(datetime.date.today())}
    with open(dependency_file, 'a') as data_out:
        data_out.write(json.dumps(data))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        logger.error('failed to mark this stage as complete')
        sys.exit(1)
