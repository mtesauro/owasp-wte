#!/usr/bin/env python

"""

read_query.py

Reads a query from a stored pickled file and displays it

This is going to be really slow because the imports do a lot of initializing.
Use this as an example if you want to script up somethign that needs to loop
or whatever.

"""


import os
import getopt
import dircache
import cPickle
#my imports
from spkproxy import header,body
from requestandresponse import RequestAndResponse
import daveutil
import sys

def usage():
        print "Usage: read_query.py -f file [-r: print request] [-R: print response]"
        sys.exit(1)

try:
        (opts,args)=getopt.getopt(sys.argv[1:],"f:rR")
except getopt.GetoptError:
        #print help
        usage()

dorequest=0
doresponse=0
target=""
for o,a in opts:
        if o in ["-f"]:
                target=a
        if o in ["-r"]:
                dorequest=1
        if o in ["-R"]:
                doresponse=1

if target=="":
        usage()
clientheader=header()
clientbody=body()
serverheader=header()
serverbody=body()
filename=target
fd=open(filename)
if fd==None:
        print "Bad Filename: %s"%filename
        sys.exit(1)
        
obj=cPickle.load(fd)
fd.close()
if dorequest:
        print daveutil.constructRequest(obj.clientheader,obj.clientbody)
if doresponse:
        print daveutil.constructResponse(obj.serverheader,obj.serverbody)
        
#DONE
        
