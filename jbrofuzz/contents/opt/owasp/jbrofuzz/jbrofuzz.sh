#!/bin/sh

JAVA=`which java`
# JAVA_PARAMS="-XX:+PrintGCDetails -Xms32m -Xmx512m"
JAVA_PARAMS="-Xmx512m"

# Launch JBroFuzz
if [ -r ./JBroFuzz.jar ]; then
    $JAVA $JAVA_PARAMS -jar ./JBroFuzz.jar $@
    exit 0;
fi

echo "Unable to find JBroFuzz.jar file.  "
echo -n $0
echo " needs to be in the same directory as JBroFuzz.jar"