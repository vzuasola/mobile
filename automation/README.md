## automation-pipelines

Welcome to automation pipelines. This repository aims to provide the base
layout for the GitLab pipeline framework.

### Description
Within this repository we provide the initial layout for a fully functional
and working pipeline. Whatever you do after implementing it is your choice.
However, take into account that modifications to the actual framework
void support as provided by IT Delivery team.
Any and all modifications that you would like to include / implement in
the pipeline framework should be presented in the form of a merge request
in our repository.

If you would like to contribute to this project, please request access
to the repository, read the [contributing](./CONTRIBUTING.md) documentation.

### Presentation
We have a presentation that you can clone from [GitLab](https://gitlab.ph.esl-asia.com/Automation-team/pipelines-introduction)
That should give you a pretty good idea on how to use our pipelines
framework. Should you see anything wrong in the presentation please don't
hesitate to bring it to my attention (eric.vansteenbergen@esl-asia.com)

## Requirements
* Artifactory repository setup and configured with user/password
* environment variables as defined in GitLab project settings for pipelines.
* access to external tools in place before usage, Sonar, Selenium, HP
Fortify, Artifactory, ...

## Usage
The preferred way to incorporate pipelines into a new project is to use
`git subtree`. The advantage of using `git subtree` is that the files
pulled in are stored in your repository. `git subtree` does not require
any changes to your workflow nor introduces new commands.

Follow the below steps to use the pipelines repository using subtree to
the letter, otherwise you'll need to configure a lot more than described.
### Add remote for automation
```
cd into your repository directory
git remote add pipelines git@gitlab.ph.esl-asia.com:Automation-team/automation-pipelines.git
```
### Setup subtree
```
git subtree add --prefix=automation pipelines master
```

### Configure your pipeline
Three files need to be correctly configured for the pipelines to work.

* `.gitlab-ci.yml`: this file defines your actual pipeline as you see it in
your browser when you go to the pipelines in your project. *Comments inside
the file*
* `pipeline-package.json`: this file contains an include/exclude list to take into
consideration when building your package. *Comments inside
the file*
* `pipeline-dependency.json`: this file contains the list of dependency `steps` listed in `pipeline-package.json`. It's a JSON key-value pair wherein the key is the current step and the value is it's dependency. *Comments inside
the file*
* `pipeline.json`: this one contains the actual tasks that get executed
in each and every configured stage, defined in `.gitlab-ci.yml` *Comments inside
the file*

### Activate your pipeline
From the root directory of your repository:  
* For php:

```
cp automation/.gitlab-ci.yml.dist ./.gitlab-ci.yml
cp automation/pipeline-package.json.dist  ./pipeline-package.json
cp automation/pipeline-dependency.json.dist  ./pipeline-dependency.json
```

* For Java:

```
cp automation/.gitlab-ci.yml.java-dist ./.gitlab-ci.yml
cp automation/pipeline-package.json.dist  ./pipeline-package.json
cp automation/pipeline-dependency.json.dist  ./pipeline-dependency.json
```  

* For Kubernetes (via kubectl):

```
Kubernetes pipeline works by building the docker image files using docker-on-docker
approach and pushing it to DEV nexus docker registry with the other instances proxying it.

Kubernetes nodes on each environment will then pull image on its corresponding Nexus
instance.

It also makes use of ansible-playbook command to generate the manifests for each environment.

1. Copy gitlab-ci for k8.
# cp automation/.gitlab-ci.yml.kubernetes ./.gitlab-ci.yml

2. Copy kubernetes directory.
# cp -R automation/kubernetes .

3. Populate kubernetes files
  - kubernetes/config --> kubeconfig files per environment
  - kubernetes/templates --> ansible templates
  - kubernetes/vars --> ansible vars per environment

  Notes on formats in template manifests:
  - namespaces: name: {{ (project_name | lower) + '-' + environment_name }
  - docker image path: "{{ docker_registry }}/sample-template/app:{{ branch_name }}-{{ pipeline_id }}"

4. Create location for docker file.
# mkdir -p docker/services/app

5. Drop your dockerfile under docker/services/app and add .dockerignore also to exclude uneeded items from image.

6. To start, populate required git variables on early stages. You may refer to the table below for the descriptions.
  - CI_PROJECT_NAME
  - DEV_DOCKER_REGISTRY_PASSWORD
  - DEV_DOCKER_REGISTRY_PUSH
  - DEV_DOCKER_REGISTRY_USER
  - DEV_DOCKER_USER_EMAIL

7. You can see sample kubernetes templates/vars and git variables at https://gitlab.ph.esl-asia.com/CMS/dafabet-ghana.
```

* For Kubernetes (via helm):

```
1. Copy gitlab-ci for helm.
# cp automation/.gitlab-ci.yml.helm ./.gitlab-ci.yml

2. Copy kubernetes directory.
# cp -R automation/kubernetes .

3. Populate kubernetes files
  - kubernetes/config --> kubeconfig files per environment
  - kubernetes/templates --> ansible templates
  - kubernetes/vars --> ansible vars per environment

  Notes on formats in template manifests:
  - namespaces: name: {{ (project_name | lower) + '-' + environment_name }
  - docker image path: "{{ docker_registry }}/sample-template/app:{{ branch_name }}-{{ pipeline_id }}"

4. Populate environment specific variables. Here is an example for DEV. See description below for more info.
  - CHART_NAME_DEV
  - CHART_RELEASE_BASE_NAME_DEV
  - HELM_REPO_DEV
  - NAMESPACE_DEV

  Notes:
  - If you are using a chart located under your git repository, HELM_REPO_* should be set to "."

```

Now you only need to commit and push to your repository in order to have
pipelines working.

Please note that this will overwrite any existing file (`pipeline-package.json`, and `.gitlab-ci.yml`).

Once you are done copying, you can make changes to your project's `pipeline-package.json` and `.gitlab-ci.yml` to suit your application needs. If you think your changes can be used by other projects, please update the distribution files (`*.dist`) and push them to the main repo (`git@gitlab.ph.esl-asia.com:Automation-team/automation-pipelines.git`)


### Configuring environment variables
`pipeline.json` contains a lot of environment variables that are either provided by Gitlab CI or you manually need to configure for your project. 

To configure/add manually, go to your projects `Settings` -> `Pipeline`. On the `Secret variables` section, add/update the following:

| Variable                         | Possible value                                                                               | Description                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **ARTIFACTORY_PASSWORD**         | _Can be any string_                                                                          | Password that will be used by your project to upload to artifactory                                        |
| **SONARQUBE_URL**                | `http://iic-co-sonar01.ph.esl-asia.com:8080`                                                              | URL of the SonarQube instance.                                                                             |
| **BASELINE_BRANCH**              | `working`, `develop`                                                                         | Baseline branch of your app to be used by SonarQube, if not specified, default value is `$CI_COMMIT_REF_NAME`.         |
| **PHPUNIT_COVERAGE_REPORT_PATH**              | `coverage/clover.xml`                                                                         | Path of the code coverage report (clover format).         |
| **PHPUNIT_TESTS_REPORT_PATH**              | `coverage/junit.xml`                                                                         | Path of the test execution report.         |
| **SKIP_STEPS**                   | `phpunit-sonarqube`&#124;`composer,phpunit-sonarqube`&#124;`unit test,package`&#124;`yarn-install,package`&#124;`yarn-dist`    | Skip a specific step in a stage. Comma-separated value of `stage`&#124;`step` that needs to be skipped.    |
| **PHPMD_SRC**                   | `src/,templates/,app/,devtool/`    | Comma-separated values of all paths that will be analyzed by PHPMD.    |
| **PHPMD_RULES**                   | `codesize,cleancode,unusedcode,naming,design,controversial`    | Comma-separated values of rules that will be used by PHPMD.    |
| **ESLINT_SRC**                   | `assets/js/`    | Path to run the eslint scanner.    |
| **DEPLOY_DEVELOPMENT**           | `CMS: deploy - development environment`                                                      | Ansible tower job name to execute deployment to dev environment.                                           |
| **DEPLOY_DEVELOPMENT_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **DEPLOY_DEVELOPMENT_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **DEPLOY_DEVELOPMENT_TOWER_HOST**           | `mic-tst-itass01.msgreen.dom` , `mdc-co-awx01.msgreen.dom`                                              | Ansible tower host.                                           |
| **DEPLOY_DEVELOPMENT_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **DEPLOY_DEVELOPMENT_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_DEVELOPMENT**      | `Execute selenium integration tests`                                                         | Ansible tower job name to execute selenium tests.                                                          |
| **INTEGRATION_DEVELOPMENT_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **INTEGRATION_DEVELOPMENT_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **INTEGRATION_DEVELOPMENT_TOWER_HOST**           | `msc-co-itass01.msorange.dom`                                             | Ansible tower host.                                           |
| **INTEGRATION_DEVELOPMENT_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_DEVELOPMENT_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **JMETER_SCRIPT_DEV**                   | `account.jmx`                                                              | Path of the JMeter script. Needs path under `https://gitlab.ph.esl-asia.com/Automation/droidle-jmeter/tree/master/jmx`                                       |
| **JMETER_USERNAME_DEV**                   | `leandrew`                                                              | Username to be used by JMeter. Default value is `AutoQaVip17RMB`                                       |
| **JMETER_LOAD_DEV**                   | `5`                                                              | No. of users that will be simulated by JMeter.                                       |
| **JMETER_DEV_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **JMETER_ENTRY_PAGE_DEV** | qa1/tct/stg/stg3-www.elysium-dfbt.com | Site to be feed into Jmeter script |
| **JMETER_LOOP_COUNT_DEV** | 10 | Loop count for Jmeter script |
| **JMETER_UNAME_START_COUNT_DEV** | 1 | Start count for Jmeter |
| **DEPLOY_QA**                    | `CMS: deploy - testing environment (QA)`                                                     | Ansible tower job name to execute deployment to QA1 environment.                                           |
| **DEPLOY_QA_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **DEPLOY_QA_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **DEPLOY_QA_TOWER_HOST**           | `mic-tst-itass01.msgreen.dom`                                             | Ansible tower host.                                           |
| **DEPLOY_QA_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **DEPLOY_QA_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_QA**               | `Execute selenium integration tests`                                                         | Ansible tower job name to execute selenium tests.                                                          |
| **INTEGRATION_QA_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **INTEGRATION_QA_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **INTEGRATION_QA_TOWER_HOST**           | `msc-co-itass01.msorange.dom`                                            | Ansible tower host.                                           |
| **INTEGRATION_QA_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_QA_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **JMETER_SCRIPT_QA1**                   | `account.jmx`                                                              | Path of the JMeter script. Needs path under `https://gitlab.ph.esl-asia.com/Automation/droidle-jmeter/tree/master/jmx`                                       |
| **JMETER_USERNAME_QA1**                   | `leandrew`                                                              | Username to be used by JMeter. Default value is `AutoQaVip17RMB`                                       |
| **JMETER_LOAD_QA1**                   | `5`                                                              | No. of users that will be simulated by JMeter.                                       |
| **JMETER_QA1_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **JMETER_ENTRY_PAGE_QA1** | qa1/tct/stg/stg3-www.elysium-dfbt.com | Site to be feed into Jmeter script |
| **JMETER_LOOP_COUNT_QA1** | 10 | Loop count for Jmeter script |
| **JMETER_UNAME_START_COUNT_QA1** | 1 | Start count for Jmeter |
| **DEPLOY_TCT**                   | `CMS: deploy - TCT environment`                                                              | Ansible tower job name to execute deployment to QA2/TCT environment.                                       |
| **DEPLOY_TCT_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **DEPLOY_TCT_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **DEPLOY_TCT_TOWER_HOST**           | `mic-tst-itass01.msgreen.dom`                                              | Ansible tower host.                                           |
| **DEPLOY_TCT_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **DEPLOY_TCT_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_TCT**               | `Execute selenium integration tests`                                                         | Ansible tower job name to execute selenium tests.                                                          |
| **INTEGRATION_TCT_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **INTEGRATION_TCT_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **INTEGRATION_TCT_TOWER_HOST**           | `msc-co-itass01.msorange.dom`                                              | Ansible tower host.                                           |
| **INTEGRATION_TCT_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_TCT_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **JMETER_SCRIPT_TCT**                   | `account.jmx`                                                              | Path of the JMeter script. Needs path under `https://gitlab.ph.esl-asia.com/Automation/droidle-jmeter/tree/master/jmx`                                       |
| **JMETER_USERNAME_TCT**                   | `leandrew`                                                              | Username to be used by JMeter. Default value is `AutoQaVip17RMB`                                       |
| **JMETER_LOAD_TCT**                   | `5`                                                              | No. of users that will be simulated by JMeter.                                       |
| **JMETER_TCT_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **JMETER_ENTRY_PAGE_TCT** | qa1/tct/stg/stg3-www.elysium-dfbt.com | Site to be feed into Jmeter script |
| **JMETER_LOOP_COUNT_TCT** | 10 | Loop count for Jmeter script |
| **JMETER_UNAME_START_COUNT_TCT** | 1 | Start count for Jmeter |
| **CODE_SCAN**                    | `execute-code-scan`                                                                          | Ansible tower job name to execute HP Fortify scans.                                                        |
| **CODE_SCAN_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **CODE_SCAN_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **CODE_SCAN_TOWER_HOST**           | `mic-tst-itass01.msgreen.dom`                                              | Ansible tower host.                                           |
| **CODE_SCAN_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **CODE_SCAN_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **ACUNETIX_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **TESTING_SIGNOFF_USERS**        | `any`, or comma-separated emails                                                             | List of users that are authorized to sign-off staging deployment                                           |
| **DEPLOY_UAT**                   | `CMS: deploy - account - uat`                                                              | Ansible tower job name to execute deployment to UAT environment.                                           |
| **DEPLOY_UAT_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **DEPLOY_UAT_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **DEPLOY_UAT_TOWER_HOST**           | `msc-co-itass01.msorange.dom`                                              | Ansible tower host.                                           |
| **DEPLOY_UAT_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **DEPLOY_UAT_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_UAT**               | `Execute selenium integration tests`                                                         | Ansible tower job name to execute selenium tests.                                                          |
| **INTEGRATION_UAT_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **INTEGRATION_UAT_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **INTEGRATION_UAT_TOWER_HOST**           | `msc-co-itass01.msorange.dom`                                              | Ansible tower host.                                           |
| **INTEGRATION_UAT_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_UAT_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **JMETER_SCRIPT_UAT**                   | `account.jmx`                                                              | Path of the JMeter script. Needs path under `https://gitlab.ph.esl-asia.com/Automation/droidle-jmeter/tree/master/jmx`                                       |
| **JMETER_USERNAME_UAT**                   | `leandrew`                                                              | Username to be used by JMeter. Default value is `AutoQaVip17RMB`                                       |
| **JMETER_LOAD_UAT**                   | `5`                                                              | No. of users that will be simulated by JMeter.                                       |
| **JMETER_UAT_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **JMETER_ENTRY_PAGE_UAT** | qa1/tct/stg/stg3-www.elysium-dfbt.com | Site to be feed into Jmeter script |
| **JMETER_LOOP_COUNT_UAT** | 10 | Loop count for Jmeter script |
| **JMETER_UNAME_START_COUNT_UAT** | 1 | Start count for Jmeter |
| **DEPLOY_STG**                   | `CMS: deploy - account - staging`                                                          | Ansible tower job name to execute deployment to STG environment.                                           |
| **DEPLOY_STG_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **DEPLOY_STG_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **DEPLOY_STG_TOWER_HOST**           | `msc-co-itass01.msorange.dom`                                              | Ansible tower host.                                           |
| **DEPLOY_STG_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **DEPLOY_STG_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_STG**               | `Execute selenium integration tests`                                                         | Ansible tower job name to execute selenium tests.                                                          |
| **INTEGRATION_STG_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **INTEGRATION_STG_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **INTEGRATION_STG_TOWER_HOST**           | `msc-co-itass01.msorange.dom`                                              | Ansible tower host.                                           |
| **INTEGRATION_STG_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **INTEGRATION_STG_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **JMETER_SCRIPT_STG**                   | `account.jmx`                                                              | Path of the JMeter script. Needs path under `https://gitlab.ph.esl-asia.com/Automation/droidle-jmeter/tree/master/jmx`                                       |
| **JMETER_USERNAME_STG**                   | `leandrew`                                                              | Username to be used by JMeter. Default value is `AutoQaVip17RMB`                                       |
| **JMETER_LOAD_STG**                   | `5`                                                              | No. of users that will be simulated by JMeter.                                       |
| **JMETER_STG_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **JMETER_ENTRY_PAGE_STG** | qa1/tct/stg/stg3-www.elysium-dfbt.com | Site to be feed into Jmeter script |
| **JMETER_LOOP_COUNT_STG** | 10 | Loop count for Jmeter script |
| **JMETER_UNAME_START_COUNT_STG** | 1 | Start count for Jmeter |
| **STAGING_SIGNOFF_USERS**        | `any`, or comma-separated emails                                                             | List of users that are authorized to sign-off internal-production deployment                                           |
| **DEPLOY_INTERNAL_PROD**                   | `CMS: deploy - INTERNAL PROD environment`                                                              | Ansible tower job name to execute deployment to INTERNAL PRODUCTION environment.                                       |
| **DEPLOY_INTERNAL_PROD_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **DEPLOY_INTERNAL_PROD_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **DEPLOY_INTERNAL_PROD_TOWER_HOST**           | `trc-ptc-itass01.msred.dom`                                              | Ansible tower host.                                           |
| **DEPLOY_INTERNAL_PROD_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **DEPLOY_INTERNAL_PROD_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **PRODUCTION_SIGNOFF_USERS**        | `any`, or comma-separated emails                                                             | List of users that are authorized to sign-off production deployment                                           |
| **DEPLOY_PROD**                   | `CMS: deploy - account production`                                                              | Ansible tower job name to execute deployment to PRODUCTION environment.                                       |
| **DEPLOY_PROD_VARS**               | `{"email": "email@bayview.com"}`                                                         | Additional `--extra-vars` to be passed to your ansible job.                                                          |
| **DEPLOY_PROD_AUTHORIZED_USERS**     | `any`, or comma-separated emails                                                             | List of users that are authorized to execute a stage in `pipeline.json`                                    |
| **DEPLOY_PROD_TOWER_HOST**           | `trc-ptc-itass01.msred.dom`                                              | Ansible tower host.                                           |
| **DEPLOY_PROD_USERNAME**      | _Can be any string_                                                                          | Username used by your app to trigger deployment job in Ansible Tower.                                      |
| **DEPLOY_PROD_PASSWORD**      | _Can be any string_                                                                          | Password used by your app to trigger deployment job in Ansible Tower.                                      |
| **DEV_DOCKER_REGISTRY_PASSWORD**      | _Can be any string_                                                                          | DEV docker registry password                                      |
| **DEV_DOCKER_REGISTRY_PUSH**      | _Can be any string_                                                                          | DEV docker registry for push                                     |
| **DEV_DOCKER_REGISTRY_USER**      | _Can be any string_                                                                          | DEV docker registry user for push                                     |
| **DEV_DOCKER_USER_EMAIL**      | _Can be any string_                                                                         | DEV docker registry email                                     |
| **CHART_NAME_DEV**      | _Can be any string_                                                                         | DEV chart name to use. A basic example is "tomcat" if you will get that from remote repo. Otherwise, you may use a local chart located inside your git repo like "/app/charts/sata-persistency/v0.0.3/" (format: /app/path/to/chart)                                    |
| **CHART_RELEASE_BASE_NAME_DEV**      | _Can be any string_                                                                         | DEV release base name to use. Make sure to apped "-dev". Example is "sample-chart-dev".                                     |
| **HELM_REPO_DEV**      | _Can be any string_                                                                         | DEV helm repo. Can be a a remote repo like "https://kubernetes-charts.storage.googleapis.com" or local repo which is specified by "."                                     |
| **NAMESPACE_DEV**      | _Can be any string_                                                                         | DEV namespace. This is where the helm chart will be uploaded. Format should be $CI_PROJECT_NAME-$ENV. Example is myproject-dev.                                     |
| **CHART_NAME_QA1**      | _Can be any string_                                                                         | QA1 chart name to use. A basic example is "tomcat" if you will get that from remote repo. Otherwise, you may use a local chart located inside your git repo like "/app/charts/sata-persistency/v0.0.3/" (format: /app/path/to/chart)                                    |
| **CHART_RELEASE_BASE_NAME_QA1**      | _Can be any string_                                                                         | QA1 release base name to use. Make sure to apped "-qa1". Example is "sample-chart-qa1".                                     |
| **HELM_REPO_QA1**      | _Can be any string_                                                                         | QA1 helm repo. Can be a a remote repo like "https://kubernetes-charts.storage.googleapis.com" or local repo which is specified by "."                                     |
| **NAMESPACE_QA1**      | _Can be any string_                                                                         | QA1 namespace. This is where the helm chart will be uploaded. Format should be $CI_PROJECT_NAME-$ENV. Example is myproject-qa1.                                     |
| **CHART_NAME_TCT**      | _Can be any string_                                                                         | TCT chart name to use. A basic example is "tomcat" if you will get that from remote repo. Otherwise, you may use a local chart located inside your git repo like "/app/charts/sata-persistency/v0.0.3/" (format: /app/path/to/chart)                                    |
| **CHART_RELEASE_BASE_NAME_TCT**      | _Can be any string_                                                                         | TCT release base name to use. Make sure to apped "-tct". Example is "sample-chart-tct".                                     |
| **HELM_REPO_TCT**      | _Can be any string_                                                                         | TCT helm repo. Can be a a remote repo like "https://kubernetes-charts.storage.googleapis.com" or local repo which is specified by "."                                     |
| **NAMESPACE_TCT**      | _Can be any string_                                                                         | TCT namespace. This is where the helm chart will be uploaded. Format should be $CI_PROJECT_NAME-$ENV. Example is myproject-tct.                                     |
| **CHART_NAME_UAT**      | _Can be any string_                                                                         | UAT chart name to use. A basic example is "tomcat" if you will get that from remote repo. Otherwise, you may use a local chart located inside your git repo like "/app/charts/sata-persistency/v0.0.3/" (format: /app/path/to/chart)                                    |
| **CHART_RELEASE_BASE_NAME_UAT**      | _Can be any string_                                                                         | UAT release base name to use. Make sure to apped "-uat". Example is "sample-chart-uat".                                     |
| **HELM_REPO_UAT**      | _Can be any string_                                                                         | UAT helm repo. Can be a a remote repo like "https://kubernetes-charts.storage.googleapis.com" or local repo which is specified by "."                                     |
| **NAMESPACE_UAT**      | _Can be any string_                                                                         | UAT namespace. This is where the helm chart will be uploaded. Format should be $CI_PROJECT_NAME-$ENV. Example is myproject-uat.                                     |
| **CHART_NAME_STG**      | _Can be any string_                                                                         | STG chart name to use. A basic example is "tomcat" if you will get that from remote repo. Otherwise, you may use a local chart located inside your git repo like "/app/charts/sata-persistency/v0.0.3/" (format: /app/path/to/chart)                                    |
| **CHART_RELEASE_BASE_NAME_STG**      | _Can be any string_                                                                         | STG release base name to use. Make sure to apped "-stg". Example is "sample-chart-stg".                                     |
| **HELM_REPO_STG**      | _Can be any string_                                                                         | STG helm repo. Can be a a remote repo like "https://kubernetes-charts.storage.googleapis.com" or local repo which is specified by "."                                     |
| **NAMESPACE_STG**      | _Can be any string_                                                                         | STG namespace. This is where the helm chart will be uploaded. Format should be $CI_PROJECT_NAME-$ENV. Example is myproject-stg.                                     |
| **CHART_NAME_PRD**      | _Can be any string_                                                                         | PRD chart name to use. A basic example is "tomcat" if you will get that from remote repo. Otherwise, you may use a local chart located inside your git repo like "/app/charts/sata-persistency/v0.0.3/" (format: /app/path/to/chart)                                    |
| **CHART_RELEASE_BASE_NAME_PRD**      | _Can be any string_                                                                         | PRD release base name to use. Make sure to apped "-prd". Example is "sample-chart-prd".                                     |
| **HELM_REPO_PRD**      | _Can be any string_                                                                         | PRD helm repo. Can be a a remote repo like "https://kubernetes-charts.storage.googleapis.com" or local repo which is specified by "."                                     |
| **NAMESPACE_PRD**      | _Can be any string_                                                                         | PRD namespace. This is where the helm chart will be uploaded. Format should be $CI_PROJECT_NAME-$ENV. Example is myproject-prd.                                     |
| **LIGHTHOUSE_PWA_SCORE** | _An integer between 1 to 100_ | Defines the acceptable score for the PWA category |
| **LIGHTHOUSE_ACCESSIBILITY_SCORE** | _An integer between 1 to 100_ | Defines the acceptable score for the Accessibility category |
| **LIGHTHOUSE_BEST_PRACTICES_SCORE** | _An integer between 1 to 100_ | Defines the acceptable score for the Best Practices category |
| **LIGHTHOUSE_PERFORMANCE_SCORE** | _An integer between 1 to 100_ | Defines the acceptable score for the Performance category |
| **LIGHTHOUSE_SEO_SCORE** | _An integer between 1 to 100_ | Defines the acceptable score for the SEO category |
| **LIGHTHOUSE_DEV_TARGET_URL** | _An absolute URL_ | Defines the URL lighthouse will run against for DEV |
| **LIGHTHOUSE_QA1_TARGET_URL** | _An absolute URL_ | Defines the URL lighthouse will run against for QA1 |
| **LIGHTHOUSE_TCT_TARGET_URL** | _An absolute URL_ | Defines the URL lighthouse will run against for TCT |
| **LIGHTHOUSE_STG_TARGET_URL** | _An absolute URL_ | Defines the URL lighthouse will run against for STG |
| **LIGHTHOUSE_UAT_TARGET_URL** | _An absolute URL_ | Defines the URL lighthouse will run against for UAT |
