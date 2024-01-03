#!/bin/bash
# Declare variables
filename=$CI_PROJECT_NAME-$PACKAGE_VERSION.tar.gz
url=$ARTIFACTORY_URL/$CI_PROJECT_NAME/$filename

# Declare functions
existsOnRepo () {
  local status_code=$(curl -s -I -o /dev/null -w "%{http_code}" $1)
  if [[ "$status_code" -eq 200 ]] ; then
    return
  fi
  false
}

# Check if file has already been uploaded
if existsOnRepo "$url"; then
  echo "File already uploaded, please make a new commit to upload again"
  exit 0;
fi

# Start uploading archieve
echo "Uploading tar archive to repository..."
echo " - Filename: $filename"
echo " - Url: $url"

status_code=$(curl -w "%{http_code}" "$url" --user "$CI_PROJECT_NAME:$ARTIFACTORY_PASSWORD" --upload-file "$filename")

# Validate upload
if [ -n "$status_code" ] && ([ "$status_code" -eq 200 ] || [ "$status_code" -eq 201 ]); then
  # Check if file exists on repository
  if existsOnRepo "$url"; then
    echo "Upload was successful!"
    echo " - Response HTTP Code: $status_code"
    exit 0
  fi
  # File does not exist, notify
  echo "Upload was completed but file does not exist on repository!"
fi

# Upload failed, notify
echo "Upload to repository failed!"
echo " - Response HTTP Code: $status_code"
exit 1


