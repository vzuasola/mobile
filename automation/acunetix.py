#!/bin/env python

import requests
import click
import json

@click.command()
@click.option('target', '--target', '-t')
@click.option('profile', '--profile', '-p')
@click.option('report_template', '--report_template', '-r')
def trigger_scan(target, profile, report_template):
    session = requests.Session()
    headers = {'X-Auth': '1986ad8c0a5b3df4d7028d5f3c06e936cebd0994d093941be9fb5dac9b03b6b01'}
    datastring = '{"target_id": "'+ target +\
                 '", "profile_id": "'+ profile +\
                 '", "report_template_id": "'+ report_template +\
                 '", "schedule": {"disable": false, "start_date": null, "time_sensitive": false}}'
    triggerdata = json.loads(datastring)
    trigger = session.post("https://acunetix.bayviewtechnology.com:3443/api/v1/scans",
                           headers=headers,
                           json=triggerdata,
                           verify=False,
                           )

    if trigger.status_code != 201:
        print('Error message:', trigger.status_code)
    else:
        print('Acunetix scan triggered!')

if __name__ == '__main__':
    trigger_scan()
