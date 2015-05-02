#!/usr/bin/python
#testpickle.py - tests the pickle routines for a RequestAndResponse

#global imports
import os
import dircache
import pickle
#my imports
from spkproxy import header,body
from requestandresponse import RequestAndResponse
import daveutil


clientheader=header()
clientbody=body()
serverheader=header()
serverbody=body()
filename="testpickle.pickle"
obj=RequestAndResponse(clientheader,clientbody,serverheader,serverbody)
openfile=open(filename,"w")
print "openfile="+str(openfile)+" object: "+str(obj)
pickle.dump(obj,openfile)
openfile.close()
print "Done!"
