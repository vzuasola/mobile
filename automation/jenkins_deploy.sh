#!/bin/bash
set +e
# Trigger Deployment
echo "Starting Deployment . . . . ."
curl -s -S --user $DEPLOY_TOKEN -X POST "$DEPLOY_URL/buildWithParameters?project=$CI_PROJECT_NAME&version=$PACKAGE_VERSION&gitlab_user_email=$GITLAB_EMAIL"


# Wait for 20 seconds before polling the job
sleep 20

GREP_RETURN_CODE=0

# Poll every five seconds until the build is finished
while [ $GREP_RETURN_CODE -eq 0 ]
do
    sleep 5
    # Grep will return 0 while the build is running:
    curl -s -S --user $DEPLOY_TOKEN "$DEPLOY_STATUS_URL" | grep result\":null > /dev/null
    GREP_RETURN_CODE=$?
done

echo "Build finished"
curl -s -S --user $DEPLOY_TOKEN "$DEPLOY_RESULT_URL"
