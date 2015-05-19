#!/bin/bash

# -- jojo --
# description: Determine the server's uptime
# -- jojo --

UPTIME=`uptime`

echo "echo'd text: $UPTIME"
echo "jojo_return_value uptime=$UPTIME"
exit 0
