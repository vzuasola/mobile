"""
Artifatory module
"""

from __future__ import print_function
from __future__ import absolute_import
import os
from mimetypes import MimeTypes
try:
    from urlparse import urlparse
except ImportError:
    # python 3
    from urllib.parse import urlparse
import requests
from .utils import SUCCESS, FAILED, md5, sha1, INFO
from .error import PipelineError
from .logger import logger


def upload(url, username, password, file_to_upload):
    """
    Uploads a given file to url.

    Args:
        url (str): destination url

        username (str): upload user

        password (str): upload password

        file_to_upload (str): path to the file to upload
    """
    md5_ = md5(file_to_upload)
    sha1_ = sha1(file_to_upload)
    short_url = urlparse(url).netloc
    mimetype = MimeTypes()
    file_len = str(os.path.getsize(file_to_upload))
    headers = {"Content-Type": mimetype.guess_type(file_to_upload)[0],
               "Content-Length": file_len,
               "X-Checksum-Md5": md5_,
               "X-Checksum-Sha1": sha1_}

    # Check if the package has already been uploaded.
    check_file = requests.head(url)
    if(check_file.status_code == 200):
        logger.info('{0} {1} already exists. It will not be updated. If you need to update the package, push a new commit.'.format(INFO, url))
        return

    with open(file_to_upload, 'rb') as upload_me:
        try:
            response = requests.put(url, auth=(username, password),
                                    headers=headers, data=upload_me)
            if response.status_code != 201:
                logger.error('{0} {1}'.format(FAILED, url))
            else:
                logger.info('{0} {1}'.format(SUCCESS, url))
        except requests.ConnectionError as error:
            logger.error('{0} to upload {1} to {2}'.format(FAILED, file_to_upload, short_url))
            logger.error('      url: {0}'.format(url))
            logger.error('      username: {0}'.format(username))
            logger.error('      password: {0}'.format('**************'))
            logger.error('      please check: {0}'.format(url))
            logger.error('      error: {0}'.format(error))
            logger.error('      reason: {0}'.format(error.args[0][0]))
            raise PipelineError('upload step failed')
