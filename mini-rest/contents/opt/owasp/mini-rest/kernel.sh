#!/bin/bash

# -- jojo --
# description: Determine the server's kernel version 
# -- jojo --

KERNEL=`uname -sr`
MACHINE=`uname -m`
OS=`uname -o`

#echo "echo'd text: $UPTIME"
echo "jojo_return_value kernel=$KERNEL"
echo "jojo_return_value machine=$MACHINE"
echo "jojo_return_value operating-system=$OS"
exit 0
