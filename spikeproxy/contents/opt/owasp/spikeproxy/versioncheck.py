#!/usr/bin/python

#versioncheck is just a simple utility that checks the current version against the version
#you have, and prints out whether you have the most current version
import urllib

URL="http://www.immunitysec.com/SPIKEPROXYVERSION.txt"

def getversion(currentversion):
    try:
        f = urllib.urlopen(URL)
        version=f.read()
        if version!=currentversion:
            print "You might want to upgrade to a more current version: %s is available!" % version
    except:
        return
    
