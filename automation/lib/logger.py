"""
Logging all the things!
"""

import logging
import os

logger_level = logging.INFO
# enable debug mode, when DEBUG_MODE is set
if os.environ.get('DEBUG_MODE', None):
    logger_level = logging.DEBUG

# add file handler for logging
LOGFILE = 'pipeline.log'
file_formatter = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
if os.path.isdir('/var/log/pipeline/'):
    LOGFILE = '/var/log/pipeline/pipeline.log'
    file_formatter = '%(asctime)s - %(name)s - %(levelname)s - id: {0} - %(message)s'.format(os.environ['CI_PIPELINE_ID'])

file_handler = logging.FileHandler(LOGFILE)
file_handler.setFormatter(logging.Formatter(file_formatter))
file_handler.setLevel(logging.DEBUG)

# capture SSL warnings
logging.captureWarnings(True)
# console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logger_level)
console_handler.setFormatter(logging.Formatter('%(message)s'))
# warning logger from external libraries
py_warnings_logger = logging.getLogger('py.warnings')
py_warnings_logger.setLevel(logging.ERROR)
py_warnings_logger.addHandler(console_handler)

# finally our logger
logger = logging.getLogger('')
logger.setLevel(logger_level)
logger.addHandler(console_handler)
logger.addHandler(file_handler)

logger.debug('debug mode active')
