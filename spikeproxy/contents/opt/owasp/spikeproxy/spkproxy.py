#!/usr/bin/python
#
#SPIKE Proxy file: spkproxy.py
#
#Usage: python spkproxy.py [port:8080]

###################################################################
#Requires:
#pyOpenSSL v 5.0 pre or >
#python 2.2
###################################################################
#Version 1.1
#Author: Dave Aitel (dave@immunitysec.com)
#License: GPL v 2.0

####################################################################
#Known Bugs:
#1.
#http://www.btinternet.com/~wildfire/reference/httpstatus/500.htm
#for some reason the header is not parsed correctly...possibly TheCounter/2.1
#web server does not use \r\n?
#2. Netscape toolbar (from cnn.com) is not quite right
#FIXED 3. BBC.co.uk news - needs :// joined to work
#####################################################################

#BEGIN IMPORTS
import socket
import sys
from threading import Thread
import string
import os
from OpenSSL import SSL
import getopt

sys.path.append('ntlm')
#need to import aps stuff so we can send NTLM to the remote system
#annoyingly, he named it utils
from ntlmutils import str2unicode
import ntlm_messages
import ntlm_procs


#threadsafe workaround for PyOpenSSL 1.5.1
#import OpenSSL.tsafe
#should use OpenSSL.tsafe.Connection instead of OpenSSL.SSL.Connection!
#but we can't cause it doesn't seem to work

#default UI, could add others.
import spikeProxyUI 
import daveutil
import time

#time all sockets out at ten seconds
import timeoutsocket

timeoutsocket.setDefaultSocketTimeout(3)

import versioncheck


#END IMPORTS

#Begin Code!

VERSION="1.4.8"

default404stringlist=["Page Not Found"]

#### you change these to say what hosts and pages are ALLOWED. If they
#are not set, ALL are allowed

restrictedhosts=[]
restrictedpages=[]


denied1="<html><head><title>Error</title></head><body>You are not allowed to visit that page during this test, sorry. Try unsetting your proxy temporarily.</body></html>"
deniedstring="HTTP/1.1 404 404 Access Denied !\r\nContent-Length: %d"%len(denied1)+"\r\n\r\n"+denied1



                                                                        
#Class myConnection is used to wrap sockets so we can have some basic
#abstraction over which ssl library we use, for example
#we basically wrap a few socket calls here
class MyConnection:
    def __init__(self,conn):
        self.doSSL=0
        self.mysocket=conn

    def recv(self,size):
        #if self.doSSL:
        #    print "Reciving data as ssl!"
        #print "Recieving %d bytes" % size
        #if self.doSSL:
        #    print "Reading since we are SSL"
        #    return self.mysocket.read(size)
        result=self.mysocket.recv(size)
        #print "Returned from recv()"
        return result

    #reliable send over socket
    def send(self,data):
        sizetosend=len(data)
        sentsize=0
        while sentsize<sizetosend:
            #print "sentsize="+str(sentsize)+"/"+str(sizetosend)
            try:
                #IF YOU ARE GETTING AN ERROR HERE, USE PYTHON VERSION 2.2!
                #FOR REDHAT 7.3 USERS, IT IS PROBABLY CALLED /usr/bin/python2 !
                sentsize+=self.mysocket.send(data[sentsize:])
            except (SSL.SysCallError,socket.error):
                #pass (this will cause it to loop forever, sucking CPU like a donkey)
                return sentsize
        return sentsize

    #really never gets used
    def verify_cb(conn, cert, errnum, depth, ok):
        # This obviously has to be updated
        print 'Got certificate: %s' % cert.get_subject()
        return ok

    #DOES get used. Needs pyOpenSSL 5.0 Pre or >
    def startSSLserver(self):
        debug_ssl=0
        
        dir = os.path.dirname(sys.argv[0])
        if dir == '':
            dir = os.curdir

        self.mysocket.send("HTTP/1.1 200 Connection established\r\n\r\n")
        ctx = SSL.Context(SSL.SSLv23_METHOD)
        ctx.set_timeout(5)
        ctx.set_verify(SSL.VERIFY_NONE, self.verify_cb) # Don't demand a certificate
        try:
            ctx.use_privatekey_file (os.path.join(dir, 'server.pkey'))
        except:
            print "Couldn't find file %s"%(os.path.join(dir, 'server.pkey'))
            
        ctx.use_certificate_file(os.path.join(dir, 'server.cert'))
        ctx.load_verify_locations(os.path.join(dir, 'CA.cert'))
        #normally would be SSL.connection, but we want to be threadsafe
        self.mysocket = SSL.Connection(ctx, self.mysocket)
        
        #only works with pyOpenSSL 5.0pre or >
        self.mysocket.set_accept_state()
        if debug_ssl:
            print "State="+self.mysocket.state_string()
        #done automatically
        #self.mysocket.do_handshake()
        self.doSSL=1
        if debug_ssl:
            print "Now using SSL to talk to client"
        
    #wraps socket.close
    def close(self):
        #print "calling connection.close"
        self.mysocket.close()
        return

    #we read 0 and on any exception return 1
    def gotclosed(self):
        #print "Checking if we got closed"
        try:
            data=self.mysocket.send("")
        except:
            #print "CAUGHT EXCEPTION CHECKING IF WE WERE CLOSED"
            return 1
        return 0


###########################################################################
#class header is what we use to store request and reponse headers
class header:
    def __init__(self):
        self.clear()

    #these two functions arn't necessary anymore
    #we have to remove any sockets from our header...
    #def __getstate__(self):
    #    odict = self.__dict__.copy() # copy the dict since we change it
    #    del odict['connection']              # remove filehandle entry
    #    return odict

    #you need to sometimes set the connection's state into SSL
    #def setConnection(self,conn):
    #    self.connection=conn
    #    return

    #clears out the data structure - used for init
    def clear(self):
        self.data=[]
        self.done=0
        self.goodHeader=0
        self.clientisSSL=0
        self.verb=""
        #for the first request, we see a CONNECT verb
        self.sawCONNECT=0
        self.firstline="" #sheesh
        #1 if we are reading a response instead of a GET/POST, etc
        self.responseHeader=0
        self.wasChunked=0

        #here is basically what we return from parsing the headers
        self.URLargsDict={}
        self.headerValuesDict={}
        self.useSSL=0
        self.connectHost=""
        self.URL=""
        self.sawsslinit=0
        self.connectPort=0
        self.mybodysize=0
        self.useRawArguments=0
        self.allURLargs=""
        self.version=""
        #set this to not send a content-length
        self.doSurpressContentLength=0
        
        #variables for server response headers
        self.returncode=""
        self.returnmessage=""
        self.proxyHeader=""
        self.orderlist=[]
        return


    def getProxyHeader(self):
        return self.proxyHeader
    
    #fixes the URL to not have a ? in it if it happens to
    def normalize(self):
        if self.URL.count("?")>0 and self.URLargsDict=={} and self.useRawArguments==0:
            urlbit=self.URL[:]
            #if we have a url as well
            self.URL=urlbit.split("?")[0]
            #if we have arguments too
            if len(urlbit.split("?"))>1:
                self.allURLargs="?".join(urlbit.split("?")[1:])
                #print "SELF.allURLARGS=%s"%self.allURLargs
                #print "SELF.URL=%s"%self.URL
                self.URLargsDict=daveutil.splitargs(self.allURLargs,orderlist=self.orderlist)
                if self.URLargsDict==None:
                    self.URLargsDict={}
                    self.useRawArguments=1
                return
            else:
                self.URL+="?"
        return

    #returns a site tuple (used for VulnXML)
    def getSiteTuple(self):
        result=(self.connectHost,self.connectPort,self.clientisSSL)
        return result

    #sets us up from a site tuple
    def setSiteTuple(self,site):
        self.connectHost=site[0]
        self.connectPort=site[1]
        self.clientisSSL=site[2]
        return
        

    #debug routine 
    def printme(self):
        #print "All my stuff:"
        result=""
        result+= "Host: "+self.connectHost + "\n"
        result+= "Port: "+str(self.connectPort) + "\n"
        result+= "SSL : "
        if self.clientisSSL:
            result+="Yes"
        else:
            result+="No"
        result+="\n\n"
        result+=self.verb
        for key in self.headerValuesDict.keys():
            for value in self.headerValuesDict[key]:
                result+=key+": "+value+"\n"
        return result

    #returns http://www.cnn.com from our header information
    def getSite(self):
        result=""
        if self.useSSL:
            result+="https://"
        else:
            result+="http://"
        result+=self.connectHost
        if self.connectPort!=80 and self.connectPort!=443:
            result+=":"+str(self.connectPort)
        return result
        
        
    #returns 1 if 2 headers (self and other) are basically the same
    def issame(self,other):
        #we don't compare the header itself. That makes us
        #get false negatives with Date: headers and such
        #self.headerValuesDict==other.headerValuesDict and \\
        if cmp(self.URL,other.URL)==0 and \
           self.clientisSSL==other.clientisSSL and \
           self.firstline==other.firstline and \
           cmp(self.URLargsDict,other.URLargsDict)==0 and \
           self.connectPort==other.connectPort and \
           self.mybodysize==other.mybodysize and \
           daveutil.headerdictcmp(self.headerValuesDict,other.headerValuesDict) and \
           self.allURLargs==other.allURLargs:
            return 1
        return 0

    #returns a string that is a "hash"
    def genhash(self):
        hash=""
        hash+=self.verb+self.returncode
        hash+=daveutil.hashstring(self.URL+self.allURLargs)
        #hash the cookies 
        if self.headerValuesDict.has_key("Cookie"):
            for key in self.headerValuesDict["Cookie"]:
                hash+=daveutil.hashstring(key)

        if self.headerValuesDict.has_key("Set-Cookie"):
            for key in self.headerValuesDict["Set-Cookie"]:
                hash+=daveutil.hashstring(key)

        #done!
        #return it encoded so we get rid of slashes
        return daveutil.strencode(hash,"A")

    def setSurpressContentLength(self):
        self.doSurpressContentLength=1
        return

    def surpressContentLength(self):
        return self.doSurpressContentLength
    
    def setclientSSL(self):
        self.useSSL=1
        self.clientisSSL=1
        return
        
    def addData(self,moredata):
        #print "addData "+moredata
        self.data.append(moredata)
        #print self.data[-4:]
        if self.data[-4:]==['\r', '\n', '\r', '\n']:
            #print "Got end of header!"
            self.done=1
            #print "All data="+"".join(self.data)
            self.verifyHeader()
        #we shouldn't NEED this, but economist.com has a misbehaving
        #IIS 5.0 server which does this!!!
        if self.data[-2:]==['\n','\n']:
            print "Weird \\n\\n in header!"
            self.done=1
            self.verifyHeader()
        return

    #keys is a set of values for which we're going to look and
    #return an integer associated with them from the headers
    #we return the first value in the header list as an int
    def getIntValue(self,keys):
        #iterate over all the keys in the argument until we have a match
        #print "all header keys: "+str(self.headerValuesDict.keys())

        for akey in keys:
            if self.headerValuesDict.has_key(akey):
                #print "Int key: "+akey+" matched "+self.headerValuesDict[akey][0]
                #we just return the first one we encounter, sorry
                #so multiple headers will just be on a first come
                #first serve basis
                return int(self.headerValuesDict[akey][0])
        return 0

    #we return the first value in the header list as a string
    #KEYS IS A LIST, NOT A STRING!
    def getStrValue(self,keys):
        #print "all header keys: "+str(self.headerValuesDict.keys())
        for akey in keys:
            #print "str: "+akey
            if self.headerValuesDict.has_key(akey):
                return str(self.headerValuesDict[akey][0])
        return "0"

    def removeHeaders(self,hstring):
        if self.headerValuesDict.has_key(hstring):
            del self.headerValuesDict[hstring]
    

    def addHeader(self,newheader,newheadervalue):
        #print "Adding header "+newheader+": "+newheadervalue
        #now we store it, at last
        if not self.headerValuesDict.has_key(newheader):
            #intialize it as a list
            self.headerValuesDict[newheader]=[]
        else:
            #print "Duplicate KEY: "+newheader
            pass

        #just separating them by commas doesn't work for hotmail.com 
        self.headerValuesDict[newheader].append(newheadervalue)        

    def verifyHeader(self):
        #this little ditty returns a list of lines, without \r\n's
        #the -2 is because there were 2 null \r\n thingies on the end
        self.allheaders="".join(self.data).split("\r\n")
        #print "Self.allheaders="+str(self.allheaders)
        firstline=self.allheaders[0]
        self.allheaders=self.allheaders[:-2]
        #this will fail if we can't parse the first line
        if not self.parseFirstLine(firstline):
            print "Couldn't parse first line!"
            return 0

        #did we see a CONNECT?
        if self.sawCONNECT:
            #print "Saw SSL CONNECT request!"
            self.sawsslinit=1
            return 1

        
        for headerLine in self.allheaders[1:]:
            #print "Doing header line: "+headerLine
            tempvalues=headerLine.split(": ")
            if len(tempvalues)<2:
                #MS hotmail login is lame - uses this header, notice no space:
                #P3P:CP="BUS CUR CONo FIN IVDo ONL OUR PHY SAMo TELo"
                #so we handle that condition now
                tempvalues=headerLine.split(":")
                if len(tempvalues)<2:
                    print "len(tempvalues)!=2 ="+str(len(tempvalues))+" in "+str(tempvalues)
                    return 0

            self.addHeader(tempvalues[0],":".join(tempvalues[1:]))

        #print "About to call massageHeaders"
        self.massageHeaders()
        #print "Headers="+str(self.headerValuesDict)

        #print "Got a good header."
        self.goodHeader=1
        return

    #this function takes in 
    def massageHeaders(self):

        #print "Inside massageHeaders"

        #non-IE user Agent, for reference
        #User-Agent: Mozilla/5.0 Galeon/1.0.3 (X11; Linux i686; U;) Gecko/0
        #IE string
        IEstring="Mozilla/4.0 (compatible; MSIE 5.0; Windows NT; Bob)"
        nonIEstring="Mozilla/5.0 Galeon/1.0.3 (X11; Linux i686; U;) Gecko/0"
        #always massage chunked out of the way
        #this will cause problems if someone sends over a gig of data
        #I doubt that will happen though
        if self.getStrValue(["Transfer-Encoding"])=="chunked":
            del self.headerValuesDict["Transfer-Encoding"]
            self.wasChunked=1
        
        #massage a response differently from a non-response
        #uncomment this for dave's cludgy early morning NTLM pass-through
        ## if self.responseHeader:
##             #print "Did not see connection"
##             #print "Auth: "+self.getStrValue(["WWW-Authenticate"])
##             authenticate=self.getStrValue(["WWW-Authenticate"])
##             if authenticate.count("NTLM")>0 or authenticate.count("Negotiate")>0:
##                 print "Doing band-aide for NTLM"
##                 self.addHeader("Proxy-Authenticate",authenticate)
##                 del self.headerValuesDict["WWW-Authenticate"]

##                 #must replace return code for some reason as well
##                 #see http://squid.sourceforge.net/ntlm/client_proxy_protocol.html
##                 self.firstline=self.firstline.replace("401","407")
                
##             return 

##         #here we replace Proxy-Authentication with Authentication for NTLM
##         if self.headerValuesDict.has_key("Proxy-Authorization"):
##             self.headerValuesDict["Authorization"]=self.headerValuesDict["Proxy-Authorization"][:]
##             del self.headerValuesDict["Proxy-Authorization"]


        #by default, use IE 5.0
        replaceUserAgent=1
        userAgent=IEstring


            

        #change Proxy-Connection to Connection
        if self.headerValuesDict.has_key("Proxy-Connection"):
            #DEBUG
            #print "MassageHeaders: has key proxy-connection"
            self.headerValuesDict["Connection"]=self.headerValuesDict["Proxy-Connection"][:]
            #print "Connection is now: "+str(self.headerValuesDict["Connection"])
            del self.headerValuesDict["Proxy-Connection"]

        #replace the User-Agent
        if replaceUserAgent:
            #just overwrite the damn thing
            if self.headerValuesDict.has_key("User-Agent"):
                del self.headerValuesDict["User-Agent"]
            #comment out the next line for NO user agent
            self.addHeader("User-Agent",userAgent)
            pass


        #save this off before we delete it
        self.mybodysize=self.getIntValue(["Content-length","Content-Length"])
        #get rid of Content-Length or Content-length - this is
        #a requirement since we recalcuate it later for fun!
        if self.headerValuesDict.has_key("Content-length"):
            del  self.headerValuesDict["Content-length"]
        if self.headerValuesDict.has_key("Content-Length"):
            del  self.headerValuesDict["Content-Length"]

        #no return value for massageHeaders
        return


    def parseFirstLine(self,firstline):
        #print "firstline="+firstline
        templist=firstline.split(" ")
        if len(templist)<2:
            print "First line of header has less than 2 members!"
            return 0
        self.verb=templist[0]

        if self.verb in [ "HTTP/1.1", "HTTP/1.0" ]:
            #print "Response header - not verifying the first line of %s!" % (firstline)
            self.responseHeader=1
            if len(templist)>1:
                self.returncode=templist[1]
            if len(templist)>2:
                self.returnmessage=templist[2]
            self.firstline=firstline
            return 1
        
        #TODO: remove this code from the header class out into the spkProxy class
        #this is the only place we use self.connection!
        #SSL proxy check
        if self.verb=="CONNECT":
            #WE ARE SSL!
            #signifies we connect to server with ssl
            self.useSSL=1
            #signifies we connect to client with ssl
            self.clientisSSL=1
            self.sawCONNECT=1
            self.connectHost=templist[1].split(":")[0]

            #no port would be weird, but maybe it'll happen...
            if templist[1].split(":") < 2:
                self.connectPort=443
            else:
                self.connectPort=templist[1].split(":")[1]
            return 1
        
        if not self.processProxyUrl(templist[1]):
            return 0

        #HTTP/1.1 or HTTP/1.0
        self.version=templist[2]
        #print "VERB="+self.verb+" URL="+self.URL+" version="+self.version
        return 1
        

    def processProxyUrl(self, proxyurl):

        #here is basically what we return
        self.URLargsDict={}
        self.useSSL=0
        self.connectHost=""
        #this might already be set if we got an SSL proxy request
        if not self.connectPort:
            self.connectPort=80
        self.URL=""

        #print "processProxyUrl: "+proxyurl
        #just in case we ARE doing ssl...
        urlbit=proxyurl
        #if we're not doing an SSL proxy
        if not self.clientisSSL:
            #print "proxyURL is not SSL"
            #rip the http:// off
            urltype=proxyurl.split("://")[0]
            if len(proxyurl.split("://")) < 2:
                print "Need something after the http:// - exiting this thread"
                return 0
            #else we are good to go...we reassign urlbit here
            #need to do join because of multiple :// in arguments and stuff
            #should fix bbc news error
            urlbit="://".join(proxyurl.split("://")[1:])
            if urltype=="https":
                #this is probably broken: REVISIT
                self.useSSL=1
            elif urltype!="http":
                print "unknown url type "+urltype
                return 0

            #must have http://something
            if len(proxyurl.split("://"))<2:
                print "must have http://something"
                return 0
            
            self.connectHost=urlbit.split("/")[0]

            #get rid of the host from urlbit
            if len(urlbit.split("/"))<2:
                urlbit="/"
            else:
                urlbit="/".join(urlbit.split("/")[1:])

            if urlbit=="":
                urlbit="/"

            #lame, but should work
            if urlbit[0]!="/":
                urlbit="/"+urlbit

                
            #print "connectHost="+self.connectHost
            if len(self.connectHost.split(":"))>1:
                #print "ConnectHost Split: "+str(self.connectHost.split(":"))
                self.connectPort=int(self.connectHost.split(":")[1])
                self.connectHost=self.connectHost.split(":")[0]
                #print "Set self.connectHost to "+self.connectHost

            if self.connectHost=="":
                print "Error: empty connect host!"
                return 0
            
        #end if self.clientisSSL==0:

        #TODO: Fix this to work on blah.ng/asdf=asdf&asdf2=asdf2
        #this should work, but there's no way for me, as the client
        #to really know
        if urlbit.count("?")==0 and urlbit.count("=")>0:
            indexequal=urlbit.find("=")
            if indexequal!=-1:
                indexfirstslash=urlbit.rfind("/",0,indexequal)
                if indexfirstslash!=-1:
                    #print "original = "+urlbit
                    #print "indexequal="+str(indexequal)
                    #print "indexfirstslash="+str(indexfirstslash)
                    urlbit=urlbit[:indexfirstslash]+"?"+urlbit[indexfirstslash+1:]
                    #print "new="+urlbit

        #if we have a url as well
        self.URL=urlbit.split("?")[0]
        #if we have arguments too
        if len(urlbit.split("?"))>1:
            self.allURLargs="?".join(urlbit.split("?")[1:])
            #print "SELF.allURLARGS=%s"%self.allURLargs
            #print "SELF.URL=%s"%self.URL
            self.URLargsDict=daveutil.splitargs(self.allURLargs,orderlist=self.orderlist)
            if self.URLargsDict==None:
                self.URLargsDict={}
                self.useRawArguments=1
                return 1

    
            
        #got here! success!
        #we now have URLargsDict
        return 1
        
    def isdone(self):
        #print "self.isdone called "+str(self.done)
        if self.done==0:
            return 0
        return 1

    def gotGoodHeader(self):
        return self.goodHeader

    def bodySize(self):
        return self.mybodysize

    def grabHeader(self,header):
        if self.headerValuesDict.has_key(header):
            returnstr=""
            #iterate over the list and add a line for each
            for value in self.headerValuesDict[header]:
                returnstr+=header+": "+value+"\r\n"
            return returnstr
        else:
            return ""

    def setProxyHeader(self,newheader):
        self.proxyHeader=newheader
        return

class body:
    def __init__(self):
        self.mysize=0
        self.data=[]

    def printme(self):
        result= "".join(self.data)
        result=daveutil.prettyprint(result)
        return result

    def setSize(self,size):
        self.mysize=size
        return
    
    #just compare sizes for speed.
    def issame(self,other):
        #and self.data==other.data:
        if self.mysize==other.mysize :
            return 1
        return 0

    def genhash(self):
        hash=""
        hash+=daveutil.hashstring("".join(self.data))
        return hash
    
    def getArgsDict(self):
        argsDict=daveutil.splitargs("".join(self.data))
        if argsDict==None:
            argsDict={}
        return argsDict
        
    def readBlock(self,connection,size):
        targetsize=size
        tempdata=""
        while targetsize > len(tempdata):
            #read some data
            tempdata+=connection.recv(targetsize-len(tempdata))
            #print "Targetsize=%d, len(tempdata)=%d" % (targetsize,len(tempdata))
        #print "read "+str(len(tempdata))+" bytes of data in readblock, wanted "+str(size)
        self.data+=tempdata
        self.mysize+=targetsize
        return size

    #This handles chunked data cleanly - well, handles it anyways
    #this is the cruftiest function ever made.
    def read(self,connection,size,waschunked,readtillclosed):
        if not waschunked:
            if readtillclosed and size==0:
                #print "reading till closed"
                temp=""
                while 1:
                    #this is a lame way to do it, but hopefully it will work
                    try:
                        length=len(temp)
                        #print "len="+str(length)
                        temp+=connection.recv(1000)
                        #print "len2="+str(len(temp))
                        #WAY crufty here...
                        if (length==len(temp)):
                            break
                        if temp.count("</html>")>0:
                            #this is necessary because stupid hotmail will
                            #not send a fin after sending lots of data
                            #with connection: close!
                            #print "Noticed a </html> - breaking out of this"
                            #time.sleep(4)
                            #break
                            pass
                    except (SSL.SysCallError,socket.error), diag:
                        #print "Caught exception in recv - "+str(diag)
                        break
                    except:
                        #some sort of exception sending or recieving data
                        #print "Unknown exception occured"
                        break
                     
                #print "Read till close occured - "+str(len(temp))+" bytes read"
                self.data+=temp
                self.mysize+=len(temp)
                
                return len(temp)
            else:
                return self.readBlock(connection,size)
        
        else:
            #print "Reading chunked data"
            while 1:
                #read in a chunked data stream and return the size
                linesize=[]
                while linesize[-2:]!=["\r","\n"]:
                    linesize+=connection.recv(1)
                #ok, now we have the size as a list, transform that to an int
                #base 16, of course
                #print "linesize in str = "+"".join(linesize)
                linesize=int("".join(linesize),16)
                #print "linesize="+str(linesize)
                if linesize==0:
                    #print "done with chunked transfer!"
                    #clear this out
                    linesize=[]
                    while linesize[-2:]!=["\r","\n"]:
                        linesize+=connection.recv(1)
                    return self.mysize
                #print "calling self.readBlock with size "+str(linesize)
                self.readBlock(connection,linesize)
                #clear this out
                linesize=[]
                while linesize[-2:]!=["\r","\n"]:
                    linesize+=connection.recv(1)

    def gotGoodBody(self):
        if self.mysize==len(self.data):
            return 1
        else:
            return 0
        
class spkProxyConnection( Thread ):

    def __init__(self,connection,myUI,proxy=None,ntlm=None):
        Thread.__init__(self)
        #client connection
        self.connection=connection
        self.clientisSSL=0
        self.currentHost=""
        self.currentPort=0
        self.haveSocket=0
        self.sslHost=""
        self.sslPort=""
        #serversion connection
        self.currentSocket=-1
        self.sawConnectionClose=0
        #new user interface
        self.myUI=myUI
        self.proxyHeader=""
        self.proxyHost=""
        self.proxyPort=0
        self.proxySSLHost=""
        self.proxySSLPort=0
        self.NTLMUser=""
        self.NTLMDomain=""
        self.NTLMPassword=""
        self.NTLMAuthState=""
        
        if proxy!=None:
            (self.proxyHost,self.proxyPort,self.proxySSLHost,self.proxySSLPort)=proxy

        if ntlm!=None:
            (self.NTLMUser,self.NTLMPassword,self.NTLMDomain)=ntlm
            #print "Initializing NTLM: %s@%s with password %s"%(self.NTLMUser,self.NTLMDomain,self.NTLMPassword)

        self.my404List=default404stringlist
            
        return
    
    def setProxyHeader(self,myheader):
        #print "spkProxyConnection: Proxy header set to %s"%myheader
        self.proxyHeader=myheader
        return
        
    def run( self ):
        #set to 1 to debug this function
        #DEBUGSET
        debug_spkProxyConnection=0

        if debug_spkProxyConnection:
            print "spkProxy: Handling new connection"
            
        while 1:
            if debug_spkProxyConnection:
                print "entering while loop"
            myheader = header()
            #myheader.setConnection(self.connection)
            if self.clientisSSL:
                myheader.setclientSSL()

            while myheader.isdone()==0:
                try:
                    data=self.connection.recv(1)
                except:
                    print "Client closed connection"
                    self.cleanup()
                    return
                    
                if not data:
                    if debug_spkProxyConnection:
                        print "end of data"
                    break
                myheader.addData(data)

            if myheader.sawsslinit==1:
                if debug_spkProxyConnection:
                    print "spkProxy: Saw ssl init!"
                self.clientisSSL=1
                self.sslHost=myheader.connectHost
                self.sslPort=myheader.connectPort
                self.connection.startSSLserver()
                continue

            #print "Continuing on with while loop!"
            mybody=body()
            if debug_spkProxyConnection:
                print "Done with header"
            #read the body from the client now
            if myheader.gotGoodHeader():
                if debug_spkProxyConnection:
                    print "reading body"
                if myheader.bodySize()>0 or myheader.wasChunked:
                    if debug_spkProxyConnection:
                        print "Reading the body!"
                    #readtillclosed always 0 on client
                    mybody.read(self.connection,myheader.bodySize(),myheader.wasChunked,0)
                else:
                    if debug_spkProxyConnection:
                        print "No body needed"
                    pass

                #reset this to the truth
                myheader.mybodysize=mybody.mysize
                    
                if not mybody.gotGoodBody():
                    self.cleanup()
                    return
                if debug_spkProxyConnection:
                    print "done with body"
            else:
                if debug_spkProxyConnection:
                    print "failed to get a good header, cleaning up."
                    print "Header we got: %s"%(str(myheader.data))
                self.cleanup()
                return
            #done with the body. So now we have a header and a body
            #print "header data="+str(myheader.data)
            #print "body data="+str(mybody.data)


            
            response = self.sendRequest(myheader,mybody)

            #print "Response : "+response
            sizetosend=len(response)
            sentsize=0

            sentsize+=self.connection.send(response[sentsize:])
            
            if debug_spkProxyConnection:
                print "Sent data to client."
                #print "Header we sent: %s"%response.split("\r\n\r\n")[0]

            if self.connection.gotclosed():
                if debug_spkProxyConnection:
                    print "self.connection.gotclosed() = true"
                self.sawConnectionClose=1

            if self.sawConnectionClose:
                if debug_spkProxyConnection:
                    print "Closing connection!"
                self.connection.close()
                self.cleanup()
                return

            if debug_spkProxyConnection:
                print "Continuing while loop"

            continue #while loop

    #creates a string with the total reponse in it
    def constructResponse(self,myheader,mybody):
        return daveutil.constructResponse(myheader,mybody)

    #connects to a remote proxy hopefully.
    #1 on success, 0 on failure
    def doProxyConnect(self,host,port):

        newsocket=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        if self.clientisSSL:
            #print "Connecting to SSL Proxy %s %s"%(self.proxySSLHost,self.proxySSLPort)
            newsocket.connect((self.proxySSLHost,int(self.proxyPort)))
            newsocket.send("CONNECT %s:%s\r\n\r\n"%(host,port))
            #get the response
            #print "Reading in until I get \\r\\n\\r\\n"
            data=daveutil.readuntil(newsocket,"\r\n\r\n")
            #print "Done reading in"
            if data.count("200")==0:
                print "Failed to connect to SSL Server via Proxy"
                return 0
            #SSL doesn't use proxy headers - just raw urls
            self.setProxyHeader("")

            
        else:
            print "Connecting to Proxy %s %s"%(self.proxyHost,self.proxyPort)
            newsocket.connect((self.proxyHost,int(self.proxyPort)))
            if newsocket==None:
                print "Couldn't connect to proxy host!"
                return 0
            #we don't print the port if it's port 80
            if str(port)!="80":
                self.setProxyHeader("http://"+host+":"+str(port))
            else:
                self.setProxyHeader("http://"+host)
        

        self.currentSocket=newsocket
        #success connecting to proxy
        return 1
        

#####FIXME
        

        
    def closeServerSocket(self):
        if self.haveSocket:
            self.currentSocket.close()
        self.currentPort=0
        self.currentHost=""
        
        return
                          
    
    #TODO: This needs to be modified to handle NTLM authentication!
    def connectToWebServer(self,myheader):
        #DEBUGSET
        debug_connectToWebServer=0

        if self.clientisSSL:
            #do we already have a socket connected to the web server?
            #we need to set these just for the record
            myheader.connectHost=self.sslHost
            myheader.connectPort=self.sslPort
            #now we do some actual work
            if not self.haveSocket:
                self.haveSocket=1
                self.currentHost=self.sslHost
                self.currentPort=self.sslPort
                self.currentSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                print "Connecting to "+str(self.sslHost)+" "+str(self.sslPort)

                
                if self.proxyHost!="":
                    #DO PROXY CONNECT HERE
                    if self.doProxyConnect(myheader.connectHost,myheader.connectPort)!=1:
                        return 0
                else:
                    try:
                        self.currentSocket.connect((self.sslHost,int(self.sslPort)))
                    except:
                        print "Connection refused"
                        self.currentHost=""
                        self.currentPort=0
                        return 0
                    
                #HANDLE SSL HERE DO DO DO
                ctx = SSL.Context(SSL.SSLv23_METHOD)
                ctx.set_timeout(5)
                self.currentSocket = SSL.Connection(ctx,self.currentSocket)

                self.currentSocket.set_connect_state()
                #print "Set up SSL"
            else:
                if debug_connectToWebServer:
                    print "SSL connection not done since we already had a connection."
                
        else:
            #not SSL
            #do we already have a socket connected to the host
            print "Connecting to "+str(myheader.connectHost)+" "+str(myheader.connectPort)
            if debug_connectToWebServer:
                print "currentSocket=%s" % str(self.currentSocket)
            #this -1 compare is because sometimes the socket gets closed on us and we don't find out about it, so
            #we check to make sure - currentSocket!=<socket object, fd=-1, family=2, type=1, protocol=0>
            if self.currentHost==myheader.connectHost and self.currentPort==myheader.connectPort and str(self.currentSocket).count("-1")==0:
                if debug_connectToWebServer:
                    print "passing because currentHost and currentPort are the same"
                #nothing really
                pass
            else:
                #handle the condition where we have a socket, but it is the wrong host...
                if self.haveSocket:
                    self.currentSocket.close()

                #if we don't have a socket, or we had the wrong socket, we now need a socket
                #TODO: add error checking...

                self.currentSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)


                if self.proxyHost!="":
                    if self.doProxyConnect(myheader.connectHost,myheader.connectPort)!=1:
                        return 0
                    
                else:
                    print "Trying to connect to %s:%s"%(myheader.connectHost,myheader.connectPort)
                    try:
                        self.currentSocket.connect((myheader.connectHost,int(myheader.connectPort)))
                    except:
                        self.currentHost=""
                        self.currentPort=0
                        print "Could not connect."
                        return 0
                        
                self.currentHost=myheader.connectHost
                self.currentPort=myheader.connectPort

        #return success!
        return 1


    def massageResponse(self,serverheader,serverbody):
        """
        massageResponse() performs any additional changes on the response before we return it
        For example, this function handles false 200 responses that IIS misconfigurations do
        quite often
        """
        
        bodydata="".join(serverbody.data)
        #here we check for any misconfigured servers that return a 200 Success while
        #showing a lame "404 not found" page
        #404 string list is set up globally here
        for astring in self.my404List:
            if bodydata.count(astring):
                serverheader.returncode="404"
                
                
        

    def getNTLMEnv(self):
        env={}
        env["LM"]=1
        env["NT"]=1
        env["UNICODE"]=1
        
        env["HOST"]=(self.currentHost.upper())
        env["DOMAIN"]=(self.NTLMDomain.upper())
        env["USER"]=(self.NTLMUser.upper())
        env["FLAGS"] = "06820000"
        env["NTLM_TO_BASIC"]=0
        env['LM_HASHED_PW'] = ntlm_procs.create_LM_hashed_password(self.NTLMPassword)
        env['NT_HASHED_PW'] = ntlm_procs.create_NT_hashed_password(self.NTLMPassword)
        #whatever this is
        env["NTLM_MODE"]=0

        return env



    def sendRequest(self,myheader,mybody):
        (response,serverheader,serverbody)=self.sendRequestRaw(myheader,mybody)
        #check to see if we have to do the NTLM stuff and if so
        #try to authenticate
        if serverheader!=None:
            #print "Auth: "+serverheader.getStrValue(["WWW-Authenticate"])
            #print "self.NTLMUser="+self.NTLMUser
            pass

        if serverheader!=None and serverheader.getStrValue(["WWW-Authenticate"]) in ["NTLM","Negotiate"] and self.NTLMUser!="":
            print "Sending NTLM Authentication"
            #first, clean up our old socket...we're going to be reattempting
            #to open this socket and establish a connection
            #don't need this unless the socket is being kept open...
            #self.closeServerSocket()
            #send packet 1
            env=self.getNTLMEnv()
            ntlmstring1= ntlm_messages.create_message1(env)
            myheader.removeHeaders("Authorization")
            myheader.addHeader("Authorization","NTLM "+ntlmstring1)
            #must lock this to HTTP/1.0 for auth requests - why? Because
            #stupid IIS won't send Keep-Alive if it is 1.1. IE does this as well.
            myheader.version="HTTP/1.0"
            (response,serverheader,serverbody)=self.sendRequestRaw(myheader,mybody)
            ntlmchallenge=serverheader.getStrValue(["WWW-Authenticate"])
            #strip off the header, whatever it may be
            ntlmchallenge=ntlmchallenge.replace("NTLM ","")
            ntlmchallenge=ntlmchallenge.replace("NEGOTIATE ","")
            #create nonce
            nonce = ntlm_messages.parse_message2(ntlmchallenge)
            #print ntlm_messages.debug_message2(ntlmchallenge)
            #create new message
            NTLM_msg3 = ntlm_messages.create_message3(nonce, env)
            #print  ntlm_messages.debug_message3(NTLM_msg3)
            myheader.removeHeaders("Authorization")
            myheader.addHeader("Authorization","NTLM "+NTLM_msg3)
            #now read in from the new serverheader the new challenge
            #now construct a response
            #now send it, should get a 200 ok back!
            (response,serverheader,serverbody)=self.sendRequestRaw(myheader,mybody)
            #print "Sent last raw request"

        
        if serverheader!=None and serverbody!=None:
            self.myUI.registerRequestandResponse(myheader,mybody,serverheader,serverbody)
        #print "Returning response: %s"%response
        
        return response    
        
    #given a valid header and body, sends it off, and returns the result
    #also checks to see if the ui wants the requests, and can redirect it there
    #returns the response as a string
    #CALLED BY User Interface for rewrite support!!!
    def sendRequestRaw(self, myheader, mybody,newserverheader=None, newserverbody=None):

        #set this to 1 to enable this function's debugging messages
        #DEBUGSET
        debug_spkproxy=0
        myheader.normalize()
        if self.myUI.wantsRequest(myheader):
            #print "Diverting request to the UI"
            #we force a closed connection for IE - it apparantly will not work otherwise
            if debug_spkproxy:
                print "UI handling this request - sawConnectionClose==1"
            self.sawConnectionClose=1
            return (self.myUI.handleRequest(myheader,mybody),None,None)

        #here we handle any restricted conditions 
        if restrictedpages!=[]:
            print "Checking restricted pages"
            if myheader.URL not in restrictedpages:
                print "Page not in restricted pages list"
                return (deniedstring, None, None)

        if restrictedhosts!=[]:
            if myheader.connectHost not in restrictedhosts:
                return (deniedstring, None, None)
                
        byestring="<html><head><title>Error</title></head><body><h1>  No server there, sorry.</h1></body></html>"
        if not self.connectToWebServer(myheader):
            print "returning fake 501 page!"
            return ("HTTP/1.1 501 501 No Server There!\r\nContent-Length: "+str(len(byestring))+"\r\n\r\n"+byestring,None,None)

        #print "Setting proxy header to"+self.proxyHeader
        myheader.setProxyHeader(self.proxyHeader)


        #urg. I wish I could reference globals better
        myRequest=daveutil.constructRequest(myheader,mybody)
            
        #ok, now I have a socket connected to the host, send the data
        try:
            self.currentSocket.send(myRequest)
        except:
            return ("HTTP/1.1 501 No Server There!\r\nContent-Length: "+str(len(byestring))+"\r\n\r\n"+byestring,None,None)
            
        print "Sent request:\n"+myRequest

        returncode="100"
        #now read the response - we just ignore HTTP/1.1 100 Continue responses
        while returncode=="100":
            serverheader = header()
            #commented out for testing
            #serverheader.setConnection(self.currentSocket)

            #print "Reading response now"
            while serverheader.isdone()==0:
                try:
                    #print "recieving"
                    data=self.currentSocket.recv(1)
                    #print "Read a byte: "+data
                except SSL.ZeroReturnError:
                    print "Server closed connection - weird"
                    data=""
                except socket.error:
                    print "Connection reset by peer"
                    data=""
                except SSL.SysCallError:
                    print "SSL recv error"
                    data=""
            
                if not data:
                    #print "end of data in response!"
                    break
                serverheader.addData(data)
            returncode=serverheader.returncode
            #print "Return code from server response="+returncode

            
        #print "end of header in response!"
        #+str(serverheader.data)
        #does a case insensitive match and returns us the content length
        #variable
        bodylength=serverheader.mybodysize
        #ok, now we're going to find out if we need to read-till-closed
        #or if we've got a 304 which naturally has no content-length
        if debug_spkproxy:
            print "Server: "+serverheader.getStrValue(["Server"])
            print "Connection: "+serverheader.getStrValue(["Connection"]).lower()
            print "Returncode: "+serverheader.returncode
            print "Bodylength: "+str(bodylength)
        readtillclosed=0
        
        #if you said to close, or you are redirecting AND you didn't bother to say,
        # then close the connection
        
        if serverheader.getStrValue(["Connection"]).lower() in ["close"] or (serverheader.returncode not in ["304","302","301"] and serverheader.getStrValue(["Connection"]).lower() in ["0"] ):
            if debug_spkproxy:
                print "Connection: close detected"
            readtillclosed=1
        else:
            if debug_spkproxy:
                print "Connection: close not detected or returncode of 304,302,301 reported "
        

        print "\nResponse Header:\n"+"".join(serverheader.data)
        
        serverbody=body()
                   
        if bodylength>0 or readtillclosed or serverheader.wasChunked:
            if debug_spkproxy:
                print "Reading a body of length "+str(bodylength)+" readtillclosed="+str(readtillclosed)+" chunked="+str(serverheader.wasChunked)
            serverbody.read(self.currentSocket,bodylength,serverheader.wasChunked,readtillclosed)

        if debug_spkproxy:    
            print "Body turned out to be "+str(serverbody.mysize)+" or "+str(len(serverbody.data))+" bytes."

        self.massageResponse(serverheader,serverbody)

        response=self.constructResponse(serverheader,serverbody)
        if (readtillclosed):
            if debug_spkproxy:
                print "Saw Connection Close setting to 1"
            self.closeServerSocket()
            self.sawConnectionClose=1
        
            
        if newserverheader!=None:
            newserverheader=serverheader

        if newserverbody!=None:
            newserverbody=serverbody
        
        return (response,serverheader,serverbody)

    def cleanup(self):
        #needs to close socket and stuff
        self.connection.close()
        if self.haveSocket:
            self.currentSocket.close()
        self.haveSocket=0
        #print "CLEANING UP"
        #time.sleep(4)
        return
    
class spkProxy:
    def __init__(self):
        self.mylistenport=8080
        self.mylistenhost=''
        self.myUI=spikeProxyUI.spkProxyUI()
        #here we set ourselves as the parent to the UI
        self.myUI.setParent(self)
        
        self.proxyHost=""
        self.proxyPort=0
        self.SSLProxyHost=""
        self.SSLProxyPort=0
        self.NTLMUser=""
        self.NTLMDomain=""
        self.NTLMPassword=""


    def setPort(self,port):
        self.mylistenport=int(port)
        return

    def setCacheDir(self,cachedir):
        self.myUI.setCache(cachedir)
        return

    def setListenHost(self,host):
        self.mylistenhost=host
        return
    
    def setProxyHost(self,host):
        self.proxyHost=host

    def setProxyPort(self,port):
        self.proxyPort=port

    def setSSLProxyHost(self,host):
        self.SSLProxyHost=host

    def setSSLProxyPort(self,port):
        self.SSLProxyPort=port

    def setNTLMUser(self, user):
        self.NTLMUser=user

    def setNTLMDomain(self, domain):
        self.NTLMDomain=domain

    def setNTLMPassword(self, passwd):
        self.NTLMPassword=passwd
    
    def set404List(self,a404list):
        default404stringlist=a404list
        return

    def addTo404List(self,newstring):
        default404stringlist.append(newstring)
        return

    def removeFrom404List(self,oldstring):
        if oldstring in default404stringlist:
            default404stringlist.remove(oldstring)
        return

    def get404List(self):
        return default404stringlist

    def run(self):
        self.myUI.setNTLM((self.NTLMUser,self.NTLMPassword,self.NTLMDomain))
        self.myUI.setProxy((self.proxyHost,self.proxyPort,self.SSLProxyHost,self.SSLProxyPort))
        
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
        s.bind((self.mylistenhost, self.mylistenport))
        s.listen(5)
        while 1:
            s.set_timeout(None)
            conn, addr = s.accept()
            s.set_timeout(10)
            print 'Connected to by', addr
            connection=MyConnection(conn)
            self.handleConnection(connection)


    def handleConnection(self,connection):
        #this needs to spawn a new thread!!
        connection=spkProxyConnection(connection,self.myUI,proxy=(self.proxyHost,self.proxyPort,self.SSLProxyHost,self.SSLProxyPort),ntlm=(self.NTLMUser,self.NTLMPassword,self.NTLMDomain))
        connection.start()
        #done. :>
        
#end of class spkProxy    

def usage():
    print """
    SPIKE Proxy Version "+VERSION+", Immunity, Inc.
    http://www.immunitysec.com/spike.html for more help and information
    usage: spkproxy.py [-p port] [-h proxyHost -H proxyPort] [-s proxySSLHost -S proxySSLPort]
           [-U NTLM Username -P NTLM Password -D NTLM Domain] [-l listenhost]
           [-c cache directory]
    """

#this stuff happens.
if __name__ == '__main__':

    print "Running SPIKE Proxy v "+VERSION
    print "SPIKE Proxy is copyright Dave Aitel 2002"
    print "License: GPL v 2.0"
    print "Please visit www.immunitysec.com for updates and other useful tools!"
    print "*** To use the GUI, configure as your proxy the following ***"
    print "*** address http://127.0.0.1:8080 and browse to http://spike/ ***"
    print "Let dave@immunitysec.com know if you like this project. :>"

    #VERSIONCHECK
    #just comment this out if it pisses you off
    #versioncheck.getversion(VERSION)


    #quit on control C and control break (win32)
    import signal
    signal.signal(signal.SIGINT,sys.exit)
    
    app = spkProxy()

    try:
        (opts,args)=getopt.getopt(sys.argv[1:],"h:H:p:s:S:U:P:D:l:c:")
    except getopt.GetoptError:
        #print help
        usage()
        sys.exit(2)
    for o,a in opts:
        if o in ["-s"]:
            app.setSSLProxyHost(a)
        if o in ["-S"]:
            app.setSSLProxyPort(a)
        if o in ["-h"]:
            app.setProxyHost(a)
        if o in ["-H"]:
            app.setProxyPort(a)
        if o in ["-p"]:
            app.setPort(int(a))
        if o in ["-U"]:
            app.setNTLMUser(a)
        if o in ["-D"]:
            app.setNTLMDomain(a)
        if o in ["-P"]:
            app.setNTLMPassword(a)
        if o in ["-l"]:
            app.setListenHost(a)
        if o in ["-c"]:
            app.setCacheDir(a)
    # Default value of the cache
    if app.myUI.cachedir == '':
        app.myUI.setCache("/var/cache/spikeproxy/")

            
    app.run()
