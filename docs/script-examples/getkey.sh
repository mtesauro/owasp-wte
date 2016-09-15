#!/bin/bash

RESPONSE=`curl -s --proxy 127.0.0.1:8080 --insecure -include -X POST -d '{"auth":{ "passwordCredentials" : { "username": "example", "password": "example" }}}' https://identity.api.example.com/v2.0/tokens -H "Content-Type: application/json" -k `
#RESPONSE=`curl -s --proxy 127.0.0.1:8080 --insecure -include -X POST -d '{"auth":{ "passwordCredentials" : { "username": "example", "password": "example" }}}' https://identity.api.test.example.com/v2.0/tokens -H "Content-Type: application/json" -k `

echo $RESPONSE | cut --delimiter="\"" --field=8
echo -n "Expires on: "
echo $RESPONSE | cut --delimiter="\"" --field=12

