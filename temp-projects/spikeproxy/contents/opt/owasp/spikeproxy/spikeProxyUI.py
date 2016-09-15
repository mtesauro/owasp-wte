#!/usr/bin/python
#spikeProxyUI.py, a basic web based interface for the SPIKE Proxy

#Version: 1.4.8
#License: GPL v 2.0
#
#externally, offers 2 classes:
#   wantsRequest, which takes in a header and returns a boolean, yes or no
#   handleRequest, which handles a request as defined by header and body
#that's it. :> Hmm. not quite correct actually

###Known Bugs
#FIXED 1. Some sites use /bob.extention/argument=value&arg2=val2 . . . we don't
#handle this right at the moment. (see getPageH() comment )
#FIXED 2. The economist.com site fails. They appear to break spec Grr.
#3. locking not implemented in key sections, like the donotlog array, request cache, etc
#4. Invalid "sites" are created when scanning sometimes..why?

##############
#Features to do
#
#crawling
#directory finding
#delete tree/page/site
#persistant bugs found page
#some sort of whisker behavior - possibly reading whisker2 files and
#  parsing those
#All of these are done except DELETE

######IMPORTS
#global imports
import os
import dircache
import cPickle
import urllib
import urlparse
import time
#my imports
from requestandresponse import RequestAndResponse
#import some misc stuff Dave wrote
import daveutil
#import the main spkproxy library
import spkproxy
#import Dave's VulnXML library
import VulnXML

#END IMPORTS

UIVERSION="1.4.8"

#global
notimplementedyet="<html><head><title>Error</title></head><body><h1>Not implemented yet, sorry.</h1></body></html>"

#extentions that are never valid html pages
invalidHTMLExtentions=["ppt","pdf","tgz","gz","zip","jpg","gif","png","cab","tar","sig"]

#these two lists need some serious filling in
#we check for www.site.com/file.html.bak for example
backupSuffixList=["~",".bak",".backup",".zip",".back",".txt",".xsl",".orig",".Orig",".BAK",".Bak",".Backup",".TXT",".ORIG"]
#we check for www.site.com/directory/ws_ftp.log, etc
fileRotList=["global.asa","ws_ftp.log",".bash_history",".private","template.xsl","include.asp"]

succeededList=["Successfully"]
passwordFailedList=["Failed"]
#Uncomment if needed but "error" may produce false positives
#sqlinjectSucceeded=["ODBC","SQL","4096","<DIR>","500","error","Error",":0:0","[boot","<xss>alert('XSS')</vulnerable>"]
sqlinjectSucceeded=["ODBC","SQL","4096","<DIR>","500",":0:0","[boot","<xss>alert('XSS')</vulnerable>","ORA-017"]


#here we do some wackyness to read in the words file.
def chomp(line):
    line = line.split('\n')[0]
    return line.split('\r')[0]

f=open("words","r") 
#read entire file
contents=f.readlines()
f.close()
scanDirList = [chomp(line) for line in contents]
#print "Loaded wordlist from \"words\""

f=open("passchecklist","r") 
#read entire file
contents=f.readlines()
f.close()
PassCheckList = [chomp(line) for line in contents]
#print "Loaded password list from \"passchecklist\""

#main class
class spkProxyUI:
    
    def __init__(self):
        self.triggerhost="spike"
	# Directory to use as cache
	# Upstream uses this:
        # self.cachedir="/usr/share/spikeproxy/cache/"
	# but that does not follow the FHS and will not work
	# when /usr is mounted ro. We use this instead:
        # (which is set by parent and defaults to /var/cache/spikeproxy/
        self.cachedir="/var/cache/spikeproxy"
	# Debian users, please read README.Debian!
        self.dostore=1
        self.stopallactions=0
        self.parent=None
        #set up our keywords function table
        self.initkeywords()
        self.setupfuzzstrings()
        self.requestCache=[]
        self.requestCacheMaxLength=500
        self.logs=[]
        self.maxlogs=1500
        self.setupTriggers()
        #stores objects we don't want to talk about
        self.nottolog=[]
        self.VulnXMLDirectory="VulnXML"
        self.VulnXMLVariableTestsDirectory="VariableTests"
        self.VulnXMLDirectoryTestsDirectory="DirectoryTests"
        self.VulnXMLFileTestsDirectory="FileTests"
        self.VulnXMLSiteTestDirectory="SiteTests"
        self.log("SPIKE UI version "+UIVERSION+" Started")
        self.ntlm=()
        self.proxy=()
        self.parent=None
        return

    def setCache(self,cachedir):
        self.cachedir=cachedir
        if not os.path.isdir(self.cachedir) and not os.path.islink(self.cachedir):
        #if the path doesn't exit, make it exist
  	    try:
                daveutil.dmkdir(self.cachedir)
            except:
                print "I could not create the Cachedir "+self.cachedir+"!"
        #make sure the path we are using is writable
	try:
            daveutil.dmkdir(daveutil.pathjoin(self.cachedir,"testsite"))
        except:
            print "Could not create sitedir under the cachedir "+self.cachedir
	    print "Review the permissions of that directory or use an alternate location (-c)"
	    print "(if running Debian see /usr/share/doc/spikeproxy/README.Debian)"
            return 1

        # remove the dir
        if os.path.isdir(daveutil.pathjoin(self.cachedir,"testsite")):
            try:
                os.rmdir(daveutil.pathjoin(self.cachedir,"testsite"))
            except:
                print "Could not remove testing directory under the cachedir "+self.cachedir
	        print "Please review the permissions of that directory."
                return 1
        return 0

    def setNTLM(self,ntlm):
        self.ntlm=ntlm

    def setProxy(self,proxy):
        self.proxy=proxy

    def setParent(self,parent):
        """
        This function lets the UI talk to the first spkproxy instance
        """
        self.parent=parent

    #any sort of trigger based on the header is supported,
    #but we just look at the hostname
    def wantsRequest(self,myheader):
        #print "Inside wantsRequest"
        if myheader.connectHost==self.triggerhost:
            #print "I want to look at this request with spike in it."
            return 1

        if myheader.URLargsDict.has_key("SPIKE_TRIGGER"):
            return 1
        
        return 0

    #handles the request and returns a string
    #as the response
    def handleRequest(self,myheader,mybody):
        if not self.wantsRequest(myheader):
            return "Uh, why did we get this request?"


        extention=myheader.URL.split(".")[-1]
        #print "extention: "+extention
        if extention=="html" and not myheader.URLargsDict.has_key("SPIKE_TRIGGER"):
            #print "html request received with no SPIKE_TRIGGER"
            filename=myheader.URL.replace("http://spike/","")
            #print "filename="+filename
            return self.serveFile(filename)

        urlfile=myheader.URL.split("/")[-1]
        #handle all the wacky file stuff
        file=""
        data=""
        haveheader=0
        
        if myheader.URLargsDict.has_key("file"):
            file = myheader.URLargsDict["file"]

        #print "Handling: urlfile="+urlfile+" file="+file+" SPIKE_TRIGGER="+str(myheader.URLargsDict.has_key("SPIKE_TRIGGER"))
        #print "myheader.URL="+myheader.URL
        
        if urlfile=="getinfo":
            data=self.getinfo(file)
        elif urlfile=="stop":
            self.stopallactions=1
            data="All actions stopped"
        elif urlfile=="allow":
            self.stopallactions=0
            data="All actions allowed"
        elif urlfile=="crawl":
            data=self.crawl(file)
        elif urlfile=="argscan":
            data=self.argscan(file)
        elif urlfile=="xmlTest":
            data=self.doXMLTest(file)
        elif urlfile=="dirscan":
            data=self.dirscan(file)
        elif urlfile=="overflow":
            data=self.overflow(file)

        #argument scanning support
        elif urlfile=="sqlargscan":
            if myheader.URLargsDict.has_key("name"):
                name = myheader.URLargsDict["name"]
                data=self.sqlargscan(file,name)
            else:
                data=""

        elif urlfile=="passwordargscan":
            print "passwordargscan: "+file
                 
            if myheader.URLargsDict.has_key("name"):
                name = myheader.URLargsDict["name"]
                data=self.passwordargscan(file,name)
            else:
                data=""


        #configuration support
        elif urlfile=="config":
            data=self.printConfig()
            
        elif urlfile in ["setconfig","setConfig"]:
            if myheader.URLargsDict.has_key("name"):
                name = myheader.URLargsDict["name"]
                if myheader.URLargsDict.has_key("value"):
                    value=urllib.unquote_plus(myheader.URLargsDict["value"])
                else:
                    value=""
                    
                data=self.setConfig(name,value)
            else:
                data=""
                
                

        elif urlfile=="displayresponse":
            data=self.displayResponse(file)
        #print a form for calling sendrequest
        elif urlfile=="rewrite" and myheader.URLargsDict.has_key("SPIKE_TRIGGER"):
            #print "rewriting"
            data= self.rewrite(file)
        elif urlfile.count("sendrequest") and mybody.getArgsDict().has_key("SPIKE_TRIGGER"):
            #send out a new request and return the results
            data=self.sendrequest(myheader,mybody)
            haveheader=1

        #otherwise, let's move on and handle this request
        if myheader.URL=="/":
            filename="index.html"
            #print "filename="+filename
            return self.serveFile(filename)

        
        if (data==""):
            byestring=notimplementedyet
            return "HTTP/1.1 501 Not implemented!\r\nContent-Length: "+str(len(byestring))+"\r\n\r\n"+byestring
        else:
            if not haveheader:
                data=self.addHeader(data)
            return data
    
    #registers the header and body of the request and response in our store
    def registerRequestandResponse(self,clientheader,clientbody,serverheader,serverbody):

        if self.dostore==0:
            return 1
        #basically we organize things as first Sites, then pages,
        #then requests+responses

        #we need to check this in case we are crawling or otherwise don't want to store this
        #page
        if clientheader in self.nottolog:
            return 1

        #do we have this "site" in our store?
        #A site is defined by host,port,isSSL
        site=self.getSiteFromHeader(clientheader)

        if serverheader==None:
            serverheader=spkproxy.header()
        if serverbody==None:
            serverbody=spkproxy.body()
        
        if not self.haveSiteInStore(site):
            self.createSite(site)

        #need to check for if we have this page or not
        #a page is just: /foo/bar.php or similar
        page=self.getPageH(clientheader)
        if not self.havePageInStore(page):
            self.createPage(page)

        #we don't want to store duplicates
        if self.duplicateRequestandResponse(clientheader,clientbody,serverheader,serverbody):
            #print "Duplicate request and response"
            return 1

        #print "before store: "+str(clientheader)+" Type: "+str(type(clientheader))
        #otherwise, we need to store this request and response off
        result=self.storeRequestandResponse(clientheader,clientbody,serverheader,serverbody)
        return result
    

        
    ###########################################################################
    #End public methods
    ###########################################################################
    def getSiteFromHeader(self,clientheader):
        return [clientheader.connectHost,str(clientheader.connectPort),str(clientheader.clientisSSL)]

    #converts a site to a string, just a .join call for now
    def sitestr(self,site):
        #print "Site="+str(site)
        return self.strencode("_".join(site))

    def sitestrh(self,clientheader):
        return self.sitestr(self.getSiteFromHeader(clientheader))
    
    #returns a 1 if we have that site in our store
    def haveSiteInStore(self,site):
        sitename=self.sitestr(site)
        result= os.path.isdir(daveutil.pathjoin(self.cachedir,sitename))
        #print "Do we have "+sitename+" in our store: "+str(result)
        return result
                              

    #creates a "site" store on disk
    def createSite(self,site):
        #is this / going to bite us when we go win32? Who cares? :>
        #fixed with daveutil.pathjoin!
	try:
            daveutil.dmkdir(daveutil.pathjoin(self.cachedir,self.sitestr(site)))
        except:
            print "Could not create sitedir under the cachedir "+self.cachedir
	    print "Please review the permissions of that directory."
	    print "(if running Debian see /usr/share/doc/spikeproxy/README.Debian)"
        return 1
        

    #returns the entire directory structure for a given page
    def pagestrh(self,clientheader):
        #not too complex
        return daveutil.pathjoin(self.sitrstrh(clientheader),self.getPageH(clientheader))

    #rips off the arguments and stuff to yield a nice /bob/dave.php
    #takes in a clientheader, not a string!
    #TODO: this fails currently for urls with a asdf.ng/bob=asdf&asdf=asdf
    #syntax
    def getPageH(self,clientheader):
        #we already have this stored in the client header
        #print "getPageH "+str(clientheader)+" Type: "+str(type(clientheader))
        site=self.sitestrh(clientheader)
        url=daveutil.urlnormalize(clientheader.URL)
        #dunno why this happens, but it does - techinsurance.com does it
        if url[-1]=="/":
            return daveutil.pathjoin(site,url,"_directory_")
        else:
            return daveutil.pathjoin(site,url)

    #strip off the following dave.php and leave /bob/
    def getDir(self,page):
        return "/"+os.path.dirname(page)

    #returns boolean value for whether we've seen this page before
    def havePageInStore(self,page):
        dir=self.getDir(page)
        wholepath, filename = os.path.split(page)
        return os.path.isdir(daveutil.pathjoin(self.cachedir,dir,filename))

    #creates a directory for our page. It looks like this: ./sitebase/bob/dave.php/
    def createPage(self,page):
        #used to do some crazy stuff here, but it's really quite simple
        #print "page="+page
        #print "basedir="+self.cachedir
        dirtomake=daveutil.pathjoin(self.cachedir,page)
        #print "Trying to make dir "+dirtomake
        daveutil.dmkdir(dirtomake)
        return 1

    #returns 1 if it's a request and response we've seen before, otherwise 0
    def duplicateRequestandResponse(self,clientheader,clientbody,serverheader,serverbody):
        #print "inside duplicateRequestandResponse"
        #first get a list of the files in page's directory. the directory
        #is guaranteed to exist
        pagedir=daveutil.pathjoin(self.cachedir,self.getPageH(clientheader))
        filelist=dircache.listdir(pagedir)
        #print "pagedir="+pagedir
        #print "filelist="+str(filelist)

        #order N operation here...we iterate over data
        newhash=daveutil.genhash(clientheader,clientbody,serverheader,serverbody)
        #print "Done with hashing in duplicateRequestandReponse"
        
        #we just compare hashes now
        for afile in filelist:
            #ignore directories
            if os.path.isdir(afile):
                continue
            oldhash=afile.split("_")[0]
            if oldhash==newhash:
                return 1

        #print "Unique object: leaving duplicateRequestandResponse"
        return 0

    def strencode(self,astring):
        return daveutil.strencode(astring)
                          

        #stores a request and response into our file structure for later retrival
    def storeRequestandResponse(self, clientheader,clientbody,serverheader,serverbody):
        #print "instore "+str(clientheader)+" Type: "+str(type(clientheader))
        dir=daveutil.pathjoin(self.cachedir,self.getPageH(clientheader))
        #print "Dir: "+dir
        hash=daveutil.genhash(clientheader,clientbody,serverheader,serverbody)
        #we encode the directory name (the full page) for easy uniqueness test
        filename=daveutil.pathjoin(dir,hash+"_"+self.strencode(clientheader.connectHost))

        #here we check for any ODBC strings or whatnot, and if we don't
        #see one of those, and we are in the "don't store" list, we just
        #return
        triginfo=self.scanForTriggers(serverheader,serverbody)
        if triginfo=="" and clientheader in self.nottolog:
            return 1

        #print out the warning
        if triginfo!="":
            self.log("Warning: "+filename+" triggered "+triginfo)

        #print "Storing request in filename: "+filename
        
        obj=RequestAndResponse(clientheader,clientbody,serverheader,serverbody)
        
        #print "obj: "+str(obj)
        #obj.printme()
	try:
            openfile=open(filename,"wb")
        except:
            print "Could not create a file under the cachedir "+self.cachedir
	    print "Please review the permissions of that directory."
	    print "(if running Debian see /usr/share/doc/spikeproxy/README.Debian)"
        #print "openfile="+str(openfile)+" object: "+str(obj)
        binary=1
        cPickle.dump(obj,openfile,binary)
        openfile.close()
        #print "Done storing request in filename: "+filename
        #print "Now saving in requestCache"
        #ok, now we need to store it in our bucket of things we've just done for the request cache
        if clientheader.URL[-4:].lower() not in [".gif",".jpg",".png"]:
            #let's not save pictures in the request cache
            self.saveInRequestCache(filename)
        return 1

    #serve a file, replacing keywords with something appropriate
    #used for static html files. not spike cgi requests
    def serveFile(self,filename):
        debug_serveFile=0
        if debug_serveFile:
            print "serving file "+filename
        #strip this last bit off
	mybase="/opt/owasp/spikeproxy"
        realfilename=daveutil.pathjoin(mybase,filename)
        if os.path.isfile(realfilename):
            file=open(realfilename,"r")
            data=file.read()
            file.close()
        else:
            data="Error in Spike Proxy UI - No file found: "+realfilename


        for word in self.keywords.keys():
            if data.count(word) != 0:
                data=data.replace(word,self.runkeyword(word))
                
        header=""
        #adds both the header and the data
        header+=self.addHeader(data)
        if debug_serveFile:
            print "done serving file "+filename
        response=header
        return response

    #init function to set up our function list for keywords in our responses
    def initkeywords(self):
        self.keywords={}
        self.keywords["***SITES***"]=self.getSites
        self.keywords["***requestcache***"]=self.printRequestCache
        self.keywords["***LOGS***"]=self.printLogs
        return

    #called whenever we find a keyword in our response - used to replace
    #things in html files we respond with
    #returns an html string
    def runkeyword(self,word):
        #print "Running keyword: "+word
        if not self.keywords.has_key(word):
            return "Some sort of keyword error: keyword "+word+" not found."

        return self.keywords[word]()
        

    #returns an html string of all the sites we have seen
    def getSites(self):
        sitedir=daveutil.pathjoin(self.cachedir)
        return self.htmlDirectory(sitedir)

    def printRequestCache(self):
        result="<ul>"
        for file in self.requestCache:
            display=file.split("/")[-1]
            link=file.replace(self.cachedir,"")
            start="Request: "
            result+="<li> "+ start + display + " <br>  " +  self.getOptions(file,1)+"</li>"
        return result

    def printLogs(self):
        result=""
        for log in self.logs:
            result+="Log: "+log+"<br>"
        return result

    #takes in a directory name and returns an html string representing all the fun you can
    #have with it!
    def htmlDirectory(self,dir):
        result="<ul>"
        #print "htmlDirectory on "+dir
        filelist=os.listdir(dir)
        #print "str(filelist)="+str(filelist)
        for site in filelist:
            if not os.path.isdir(daveutil.pathjoin(dir,site)):
                isrequest=1
                start="Request: "
            else:
                isrequest=0
                start="Directory: "
            #print "Options: %s"%daveutil.pathjoin(dir,site)
            result+="<li> "+ start + site + " <br>  " +  self.getOptions(daveutil.pathjoin(dir,site),isrequest)+"</li>"

        result+="</ul>"
        return result

    #returns and html string for the options the user can click on to do
    #things like "crawl" "resend with modifications" etc
    #must change site around for rewrite request
    def getOptions(self,dir,isrequest):
        realdir=dir.replace(self.cachedir,"")

        #print "getOptions realdir="+realdir
        site=daveutil.pathsplit(realdir)[0]
        #print "Site=%s"%site
        try: 
            sitename=site.split("_")[0]
            siteport=site.split("_")[1]
            sitessl=site.split("_")[2]=="1"
        except:
            #something bad happened
            #XXX - Must fix this bug
            return "Error"
        if sitessl:
            site="https://"+sitename
        else:
            site="http://"+sitename
        #site always uses / because it is a URL now
        site+=":"+siteport+"/"
        site+="/".join(daveutil.pathsplit(realdir)[1:-1])
        site=site.replace("/_directory_","")

        if isrequest==1:
            getinfo="Print Request Info"
        else:
            getinfo="Delve into Dir"

        
        #print "getOptions site: "+site
        result= "<a href=\"/getinfo?file="+realdir+"\">   "+getinfo+",</a>   "
        if isrequest:
            result+="<a href=\""+site+"/rewrite?SPIKE_TRIGGER=yes&file="+realdir+"\">   rewrite request,</a>   "
            result+="<a href=\"/displayresponse?file="+realdir+"\">   Display Response,</a>    "
        if isrequest:
            result+="<a href=\"/crawl?file="+realdir+"\">     crawl,</a>    "
        result+="<a href=\"/argscan?file="+realdir+"\">   argscan,</a>   "
        result+="<a href=\"/dirscan?file="+realdir+"\">   dirscan,</a>   "
        result+="<a href=\"/overflow?file="+realdir+"\">  overflow</a>   "
        result+="<a href=\"/xmlTest?file="+realdir+"\"> VulnXML Tests</a> "

        return result

    #rewrite a request and resend it
    def rewrite(self,file):
        #print "inside rewrite"
        realfile=daveutil.pathjoin(self.cachedir,file)
        if os.path.isfile(realfile):
            result= self.displayRequestForm(realfile)
            return result
        print "Could not rewrite file: "+realfile
        return notimplementedyet
    
    def crawl(self,file):
        #set this to 1 to enable debug printfs
        debug_crawl=0
        
        #ok, I have a file I want to crawl
        #I need to open this file, get the IP and virtualhost we are
        #crawling and the start URL and any cookies and whatnot
        crawlURLList=[]
        doneURLList=[]
        realfile=daveutil.pathjoin(self.cachedir,file)
        if not os.path.isfile(realfile):
            self.log( "!!!Some sort of error trying to crawl "+file)
            return notimplementedyet

        infile=open(realfile,"rb")
        obj=cPickle.load(infile)
        infile.close()

        response=obj.getResponse()
        myhdr=obj.clientheader
        mybdy=obj.clientbody
        startURLs=[myhdr.URL]
        if startURLs==[]:
            self.log( "No URLS found to crawl from "+file)
        for o in startURLs:
            crawlURLList.append(o)

        #site is now https://www.cnn.com/ or similar
        site=myhdr.getSite()

        self.log("Starting crawl on site %s with URLs %s" % (site,str(startURLs)))
        #we're not done yet. :>
        done=0
        while not done:

            if self.stopallactions==1:
                return "stopped"

            #cding into this url freezes my shell. Let's not use it
            #Why does python treat it as ..? Must
            #be some bug in my code
            buglist=["/=\\"]
            
            #we set this and unset it if we find any we need to do
            done=1
            for url in crawlURLList:
                if debug_crawl:
                    print "crawl: URLList: %s" % url
                if url in buglist:
                    continue
                if url not in doneURLList:
                    doneURLList.append(url)
                    if debug_crawl:
                        print "Setting done to 0"
                    done=0
                    myhdr.URL=url
                    #if you don't remove these, then you sometimes get 304s which are not useful for crawling
                    myhdr.removeHeaders("If-Modified-Since")
                    myhdr.removeHeaders("If-None-Match")
                    self.log("Crawling URL: "+url)
                    #we store every request as we crawl it
                    newpage=self.makeRequest(myhdr,mybdy)
                    newURLS=daveutil.collectURLSFromPage(newpage)
                    if debug_crawl:
                        self.log("Collected %d URLS from Page of length %d" % (len(newURLS),len(newpage)))
                    #print "New URLS are: "+str(newURLS)
                    for newurl in newURLS:
                        if debug_crawl:
                            print "crawl: newurl=%s" % newurl

                            
                        if newurl[:4] != "http" and newurl.find("://")==-1:
                            if self.stopallactions==1:
                                return "stopped"
                            
                            if debug_crawl:
                                print "Found non-absolute URL %s" % newurl
                                
                            newurl=urlparse.urljoin(url,newurl)
                            
                        if debug_crawl:
                            print "Doing: "+newurl


                        #get extention and make sure we want to parse it
                        if newurl.split(".")[-1] in invalidHTMLExtentions:
                            self.log("Skipping non HTML page: "+newurl)
                            #continue with for loop
                            continue
                            
                        if debug_crawl:
                            print "newurl header: _%s_" % newurl[:7]

                        if newurl[:7] == "http://" or newurl[:8]=="https://":
                            if debug_crawl:
                                print "crawl: Absolute URL found " + newurl
                            #this doesn't have a trailing /
                            newsite="/".join(newurl.split("/")[:3])

                            #rip the site off of the newurl
                            newerurl="/".join(newurl.split("/")[3:])
                            #why would this happen? Well, we're covered if it does.
                            if newerurl=="":
                                newerurl="/"
                            if newerurl[0]!="/":
                                newerurl="/"+newerurl
                            
                            if newurl[-1]=="/" and newerurl[-1]!="/":
                                newerurl+="/"
                            if newurl[-1]!="/" and newerurl[-1]=="/":
                                newerurl=newerurl[:-1]
                            newurl=newerurl

                            if newsite != site:
                                if debug_crawl:
                                    self.log("crawl: Ignoring url on non-crawled site:"+newsite)
                                
                            else:
                                if newurl not in doneURLList:
                                    if debug_crawl:
                                        print "New URL Found: "+newurl
                                    crawlURLList.append(newurl)
                        else:
                            #not an absolute URL
                            if newurl[:7]=="mailto:":
                                if debug_crawl:
                                    self.log( "Ignoring mailto URL:"+newurl)
                                continue
                            if debug_crawl:
                                print "non-absolute URL found:"+newurl
                            newurl=urlparse.urljoin(url,newurl)
                            if newurl[0]!="/":
                                newurl="/"+newurl
                            if newurl not in doneURLList:
                                if debug_crawl:
                                    print "crawl: New URL Found: "+newurl
                                crawlURLList.append(newurl)
        
        self.log("Done with crawl!")
        
        header="<html><body>"
        footer="</body></html>"
        middle="Crawled Urls:<P>"
        for url in doneURLList:
            middle+="<li>"+url+"</li>"
        return header+middle+footer

    #gives the client the response.
    def displayResponse(self,file):
        result=""
        realfile=daveutil.pathjoin(self.cachedir,file)

        #unpickle
        infile=open(realfile,"rb")
        obj=cPickle.load(infile)
        infile.close()
        #load response
        result+=obj.getResponse()
        #send it out
        return result
        

    def getinfo(self,file):
        realfile=daveutil.pathjoin(self.cachedir,file)
        #print "getinfo on realfile: "+realfile
        if os.path.isdir(realfile):
            #print "Was a directory."
            return self.htmlDirectory(realfile)
        else:
            #it's a file so we need to display it in text
            return self.printRequestFile(realfile)

    def printRequestFile(self,realfile):
        try:
            infile=open(realfile,"rb")
        except:
            return "Error opening that file."
        obj=cPickle.load(infile)
        infile.close()
        data=obj.printme()
        return data


    #TODO: Move this stuff into separate files with readline
    #so you can just vi a new string into existance
    def setupfuzzstrings(self):

        self.odbcscanfuzzstrings=[]
        self.overflowfuzzstrings=[]

        fuzzcharacters=["A","1","\"",".","<","%","%n"]
        maxchars=5000
        for fchar in fuzzcharacters:
            i=1
            while i<maxchars/len(fchar):
                #a small selection of fuzz characters
                self.overflowfuzzstrings.append(fchar*i)
                self.overflowfuzzstrings.append(fchar*(i-1))
                self.overflowfuzzstrings.append(fchar*(i+1))
                self.overflowfuzzstrings.append(fchar*(i+1024))
                i=i*2

        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../etc/hosts%00")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../etc/hosts")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../etc/passwd%00")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../etc/passwd")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../etc/shadow%00")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../etc/shadow")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../boot.ini%00")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../boot.ini")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../localstart.asp%00")
        self.odbcscanfuzzstrings.append("../../../../../../../../../../../../localstart.asp")
        self.odbcscanfuzzstrings.append("%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%00")
        self.odbcscanfuzzstrings.append("%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%255cboot.ini")
        self.odbcscanfuzzstrings.append("/%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%00")
        self.odbcscanfuzzstrings.append("/%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..winnt/desktop.ini")
        self.odbcscanfuzzstrings.append("65536")
        self.odbcscanfuzzstrings.append("0xfffffff")
        self.odbcscanfuzzstrings.append("268435455")
        self.odbcscanfuzzstrings.append("1")
        self.odbcscanfuzzstrings.append("0")
        self.odbcscanfuzzstrings.append("-1")
        self.odbcscanfuzzstrings.append("-268435455")
        self.odbcscanfuzzstrings.append("-20")
        self.odbcscanfuzzstrings.append("1;SELECT%20*")
        self.odbcscanfuzzstrings.append("'sqlattempt1")
        self.odbcscanfuzzstrings.append("(sqlattempt2)")
        self.odbcscanfuzzstrings.append("OR%201=1")
        self.odbcscanfuzzstrings.append(";read;")
        self.odbcscanfuzzstrings.append(";netstat -a;")
        #postnuke issue - just a backslash
        self.odbcscanfuzzstrings.append("\\")
        self.odbcscanfuzzstrings.append("%5c")
        #backslash then forwardslash
        self.odbcscanfuzzstrings.append("\\/")
        self.odbcscanfuzzstrings.append("%5c/")
        #causes all sorts of problems
        self.odbcscanfuzzstrings.append("\nnetstat -a%\n")
        self.odbcscanfuzzstrings.append("\"hihihi")
        
        self.odbcscanfuzzstrings.append("|dir")
        
        self.odbcscanfuzzstrings.append("|ls")
        self.odbcscanfuzzstrings.append("|/bin/ls -al")
        self.odbcscanfuzzstrings.append("\n/bin/ls -al\n")
        
        self.odbcscanfuzzstrings.append("+%00")
        self.odbcscanfuzzstrings.append("%20$(sleep%2050)")
        self.odbcscanfuzzstrings.append("%20'sleep%2050'")
        self.odbcscanfuzzstrings.append("!@#$%%^#$%#$@#$%$$@#$%^^**(()")
        self.odbcscanfuzzstrings.append("%01%02%03%04%0a%0d%0aADSF")
        self.odbcscanfuzzstrings.append("Bob's%20Foot")
        self.odbcscanfuzzstrings.append("<xss>alert('XSS')</vulnerable>")
        



    #look for /backup/ /admin/ etc
    def dirscan(self,file):
        self.log("Starting directory scan on "+file)
        self.scannedForDirs={}
        self.scannedForFiles={}
        
        result= self.dofilescan(file)
        self.log("Done with directory scan on "+file)
        return result

    #scans a single field for a password
    def passwordargscan(self,file,name,failed=[],succeeded=succeededList,wordlist=PassCheckList):

        self.log("Password Scan Started on %s name %s" % (file,name) )
        foundnameinheader=0
        foundnameinbody=0
        
        if failed==[]:
            failed=passwordFailedList
            
        #read in file and unpickle it into a request object
        realfile=daveutil.pathjoin(self.cachedir,file)
        infile=open(realfile,"rb")
        obj=cPickle.load(infile)
        infile.close()
        #save these off in shorter form
        ch=obj.clientheader
        cb=obj.clientbody
        #split the body data for processing
        oldbodydata=cb.data[:]
        orderlist=[]
        bodyargs=daveutil.splitargs("".join(cb.data),orderlist=orderlist)
        
        if ch.URLargsDict.has_key(name):
            foundnameinheader=1
            oldheader=ch.URLargsDict[name][:]
             
        if bodyargs.has_key(name):
            foundnameinbody=1
                
        if not foundnameinheader and not foundnameinbody:
            return "Sorry, did not find that name %s in the arguments!" % name

        if foundnameinheader and foundnameinbody:
            return "Sorry, found %s in BOTH header and body! Can't fuzz that." % name

        #so now we know we got one or the other
        foundone=0
        oldvalue=bodyargs[name][:]
        for passwordguess in wordlist:
            if self.stopallactions:
                   return "Stopped."

            if foundnameinheader:
                ch.URLargsDict[name]=urllib.quote_plus(passwordguess)
            else:
                bodyargs[name]=urllib.quote_plus(passwordguess)
                 
            cb.data=daveutil.joinargs(bodyargs,orderlist=orderlist)
            self.dontLog(ch)
            result=self.makeRequest(ch,cb)
            self.removeDontLog(ch)
             
            #fail controls whether we log
            fail=0
            if succeeded==[]:
                for key in failed:
                    if result.find(key)!=-1:
                        fail=1
            else:
                fail=1
                for key in succeeded:
                    if result.find(key)!=-1:
                        fail=0
                        break
                   
            if fail==0:
                self.log("Found password %s" % passwordguess)
                self.registerRequestandResponse(ch,cb,None,None)
                foundone=1
                break


            if foundnameinheader:
                ch.URLargsDict[name]=oldheader[:]
            else:
                bodyargs[name]=oldvalue[:]
                cb.data=oldbodydata[:]
           
        if foundone:
            return "Done Scanning for password: found=%s" % passwordguess
        else:
            return "Done scanning for password but found no passwords"


    #Scans a single argument for bad parms injection 
    def sqlargscan(self,file,name,failed=[],succeeded=[]):
        if succeeded==[]:
            succeeded=sqlinjectSucceeded
            
        self.log("Argument Scan Started on %s name %s" % (file,name) )
        foundnameinheader=0
        foundnameinbody=0
        
        if failed==[]:
            failed=[]
            
        #read in file and unpickle it into a request object
        realfile=daveutil.pathjoin(self.cachedir,file)
        infile=open(realfile,"rb")
        obj=cPickle.load(infile)
        infile.close()
        #save these off in shorter form
        ch=obj.clientheader
        cb=obj.clientbody
        #split the body data for processing
        oldbodydata=cb.data[:]
        orderlist=[]
        bodyargs=daveutil.splitargs("".join(cb.data),orderlist)
        
        if ch.URLargsDict.has_key(name):
            foundnameinheader=1
             
        if bodyargs.has_key(name):
            foundnameinbody=1
                
        if not foundnameinheader and not foundnameinbody:
            return "Sorry, did not find that name %s in the arguments!" % name

        if foundnameinheader and foundnameinbody:
            return "Sorry, found %s in BOTH header and body! Can't fuzz that." % name

        #so now we know we got one or the other
        if foundnameinheader:
            oldvalue=ch.URLargsDict[name][:]
        else:
            oldvalue=bodyargs[name][:]

        foundone=0
        for guess in self.odbcscanfuzzstrings:
            if self.stopallactions:
                   return "Stopped."

            #DEBUG
            #print "Testing guess %s"%guess

            if foundnameinheader:
                ch.URLargsDict[name]=urllib.quote_plus(guess)
            else:
                bodyargs[name]=urllib.quote_plus(guess)
                cb.data=daveutil.joinargs(bodyargs,orderlist=orderlist)
                
            self.dontLog(ch)
            result=self.makeRequest(ch,cb)
            self.removeDontLog(ch)
             
            #fail controls whether we log
            fail=0
            if succeeded==[]:
                for key in failed:
                    if result.find(key)!=-1:
                        fail=1
            else:
                fail=1
                for key in succeeded:
                    if result.find(key)!=-1:
                        fail=0
                                           
            if fail==0:
                self.log("Found Injection Vulnerability with <B>%s</B>" % guess)
                self.registerRequestandResponse(ch,cb,None,None)
                foundone=1
                break


            if foundnameinheader:
                ch.URLargsDict[name]=oldvalue[:]
            else:
                bodyargs[name]=oldvalue[:]
                cb.data=oldbodydata[:]
                            
        return "Done scanning for injection click refresh and view log."


    

    
    def argscan(self,file):
        self.log("Starting argument fuzz on "+file)
        return self.doargsfuzz(file,self.odbcscanfuzzstrings)

    def overflow(self,file):
        self.log("Starting overflow fuzz on "+file)
        return self.doargsfuzz(file,self.overflowfuzzstrings)

    def lookforfiles(self,ch,cb):
        #copy this off
        oldheaderurl=ch.URL[:]
        if self.scannedForFiles.has_key(oldheaderurl):
            return "Already scanned directory "+oldheaderurl
        else:
            #save us off so we don't scan us again
            self.scannedForFiles[oldheaderurl]=""
            
        for suffix in backupSuffixList:
            newurl=oldheaderurl+suffix
            ch.URL=newurl
            self.dontLog(ch)
            result=self.makeRequest(ch,cb)
            self.removeDontLog(ch)
            #if we didn't see a "did not exist," then we found gold!
            if (result.count("404")==0 or result.count("403.6")!=0) and result.count("No such list <em>")==0 and result.count("405")==0:
                self.log("Found file! *"+newurl+"*")
                self.registerRequestandResponse(ch,cb,None,None)

            

        return "Done with scanning a file!"

    #ch is header of request we are going to scan for directories
    #such as /admin/ etc
    #also looks for file turds such as ws_ftp.log
    def lookfordirs(self,ch,cb):

        #copy this off
        oldheaderurl=ch.URL[:]
        if self.scannedForDirs.has_key(oldheaderurl):
            return "Already scanned directory "+oldheaderurl
        else:
            #save us off so we don't scan us again
            self.scannedForDirs[oldheaderurl]=""

        #self.log("Looking for dirs in "+oldheaderurl)
        
        for dir in scanDirList:
            newurl=oldheaderurl+dir+"/"
            ch.URL=newurl
            self.dontLog(ch)
            result=self.makeRequest(ch,cb)
            self.removeDontLog(ch)
            #No such list is the error message mailman gives...this reduces false positives
            if (result.count("404")==0 or result.count("403.6")!=0) and result.count("No such list <em>")==0 and result.count("405")==0:
                self.log("Found directory! *"+newurl+"*")
                self.registerRequestandResponse(ch,cb,None,None)

                

            if self.stopallactions:
                return "Stopped."

        for file in fileRotList:

            newurl=oldheaderurl+file
            ch.URL=newurl
            self.dontLog(ch)
            result=self.makeRequest(ch,cb)
            self.removeDontLog(ch)
            if (result.count("404")==0 or result.count("403.6")!=0) and result.count("No such list <em>")==0 and result.count("405")==0:
                self.log("Found file! <B>*"+newurl+"*</B>")
                self.registerRequestandResponse(ch,cb,None,None)


            if self.stopallactions:
                return "Stopped."

        return "Done with scanning a directory!"


    def dofilescan(self,file):

        if self.stopallactions:
            return "Stopped."

        #read in file and unpickle it into a request object
        realfile=daveutil.pathjoin(self.cachedir,file)

        #here we delve into directories transparently!
        if os.path.isdir(realfile):
            #self.log("Is a directory:"+realfile)
            filelist=os.listdir(realfile)
            for newfile in filelist:
                realnewfile=daveutil.pathjoin(file,newfile)
                #self.log("Delving file scan into: "+realnewfile)
                self.dofilescan(realnewfile)
            return "Done scanning for files and directories!"

        infile=open(realfile,"rb")
        obj=cPickle.load(infile)
        infile.close()
        #save these off in shorter form
        ch=obj.clientheader
        cb=obj.clientbody

        if realfile.count("_directory_")>0:
            self.lookfordirs(ch,cb)
        else:
            self.lookforfiles(ch,cb)
            #rip off the filename
            #self.log("New Dir from: "+ch.URL)
            base="/"
            dirs="/".join(ch.URL.split("/")[1:-1])
            if dirs: 
                base += dirs + "/"
            #self.log("Base="+base)
            ch.URL=base
            self.lookfordirs(ch,cb)

        return "Completed scanning for files and directories."

    #changes each value in the file's request to a fuzzstring
    #and sends the requests
    def doargsfuzz(self,file,fuzzstringsset,succeeded=sqlinjectSucceeded):
        #read in file and unpickle it into a request object
        realfile=daveutil.pathjoin(self.cachedir,file)

        if self.stopallactions:
            return "Stopped."



        #here we handle directories transparently!
        if os.path.isdir(realfile):
            filelist=os.listdir(realfile)
            for newfile in filelist:
                realnewfile=daveutil.pathjoin(file,newfile)
                self.log("Delving test into: "+realnewfile)
                self.doargsfuzz(realnewfile,fuzzstringsset)
            return "Done with fuzzing a directory!"
        
        try:
            infile=open(realfile,"rb")
            obj=cPickle.load(infile)
            infile.close()
        except:
            return "Error reading file - most likely did not exist."
        #save these off in shorter form
        ch=obj.clientheader
        cb=obj.clientbody
        #for each argument
        #   for each fuzzstring
        #       replace argument with fuzzstring and try attack
        #       when the attack is read into the Request storer, it'll
        #       get scanned for successful ODBC messages and stuff

        if self.stopallactions:
            return "Stopped."

        #URL Arguments (GET requests)
        for variable in ch.URLargsDict.keys():
            self.log(variable)
            oldvalue=ch.URLargsDict[variable][:]
            for fuzzstring in fuzzstringsset:
                #print "Using fuzzstring %s"%fuzzstring
                if self.stopallactions:
                    return "Stopped."
                ch.URLargsDict[variable]=urllib.quote_plus(fuzzstring)
                #we basically ignore result!
                self.dontLog(ch)
                result=self.makeRequest(ch,cb)
                self.removeDontLog(ch)
                #fail controls whether we log
                fail=1
                for key in succeeded:
                    fail=1
                    if result.find(key)!=-1:
                        fail=0
                    if fail==0:
                        self.log("Possible injection vuln with <B>%s</B> via %s" % (fuzzstring,key))
                        self.registerRequestandResponse(ch,cb,None,None)

                ch.URLargsDict[variable]=oldvalue[:]
                
        #BODY arguments (POSTS)
        #copy off old body data

        #copy this off
        oldbodydata=cb.data[:]
        orderlist=[]
        bodyargs=daveutil.splitargs("".join(cb.data),orderlist=orderlist)
        if bodyargs!=None:
            j=0
            keylist=bodyargs.keys()
            for akey in keylist:
                oldvalue=bodyargs[akey]
                self.log("Fuzzing Body Argument: %s %d out of %d"%(akey,j,len(keylist)))
                j+=1
                         
                i=0
                for fuzzstring in fuzzstringsset:
                    print "Fuzzing Body Argument: %s %d out of %d"%(akey,j,len(keylist))
                    print "Using fuzzstring %d out of %d"%(i,len(fuzzstringsset))
                    i+=1
                    
                    #if i<359:
                    #    continue
                        
                    if self.stopallactions:
                        return "Stopped."
                    
                    #just use the fuzzstring
                    bodyargs[akey]=urllib.quote_plus(fuzzstring)
                    self.dontLog(ch)
                    cb.data=daveutil.joinargs(bodyargs,orderlist=orderlist)
                    result=self.makeRequest(ch,cb)
                    self.removeDontLog(ch)
                    #fail controls whether we log
                    fail=1
                    for key in succeeded:
                        fail=1
                        if result.find(key)!=-1:
                            fail=0
                        if fail==0:
                            self.log("Possible injection vuln with <B>%s</B>" % fuzzstring)
                    #now add the long string to the oldvalue.
                    #works on MS Content Management Server!
                    bodyargs[akey]=oldvalue+urllib.quote_plus(fuzzstring)
                    self.dontLog(ch)
                    cb.data=daveutil.joinargs(bodyargs,orderlist=orderlist)
                    result=self.makeRequest(ch,cb)
                    self.removeDontLog(ch)
                    #fail controls whether we log
                    fail=1
                    for key in succeeded:
                        fail=1
                        if result.find(key)!=-1:
                            fail=0
                        if fail==0:
                            self.log("Possible injection vuln with <B>%s</B> via %s" % (fuzzstring,key))
                            
                bodyargs[akey]=oldvalue
                cb.data=oldbodydata[:]
        return "Done with fuzzing a file click refresh to review log!"

    #prints out a configuration form
    def printConfig(self):
        result=""
        result+="<h1>SPIKE Configuration Table</h1>\n"

        result+="<h2>General Options</h2>\n"

        result+="<form action=\"http://spike/setConfig\"> Load Dictionary from File \n"
        result+="<input type=\"text\" name=\"value\">"
        result+="<input type=\"hidden\" name=\"name\" value=\"loadDictFromFile\">"
        result+=" <input type=\"submit\"> </form> <br> \n"

        result+="<form action=\"http://spike/setConfig\"> Add Word To Dictionary \n"
        result+="<input type=\"text\" name=\"value\">"
        result+="<input type=\"hidden\" name=\"name\" value=\"AddToDict\">"
        result+=" <input type=\"submit\"> </form> <br> \n"
        
        result+="<form action=\"http://spike/setConfig\"> Remove Word From Dictionary \n "
        result+="<input type=\"text\" name=\"value\">"
        result+="<input type=\"hidden\" name=\"name\" value=\"removeFromDict\">"
        result+=" <input type=\"submit\"> </form> <br> \n"
        
        result+="<hl>"
        
        result+="<h2>Password and SQL Argument Scanning Options</h2>\n"
        result+="Current Success List: "+str(succeededList)+"<br>"
        result+="Current Failure List: "+str(passwordFailedList)+"<P>"
        result+="<form action=\"http://spike/setConfig\"> Add Phrase To Success List \n  "
        result+="<input type=\"text\" name=\"value\">"
        result+="<input type=\"hidden\" name=\"name\" value=\"AddToSuccess\">"
        result+=" <input type=\"submit\"> </form> <br> \n"

        result+="<form action=\"http://spike/setConfig\"> Remove Phrase From Success List   "
        result+="<input type=\"text\" name=\"value\">"
        result+="<input type=\"hidden\" name=\"name\" value=\"removeFromSuccess\">"
        result+=" <input type=\"submit\"> </form> <br> \n"


        result+="<form action=\"http://spike/setConfig\"> Add Phrase To Failure List   "
        result+="<input type=\"text\" name=\"value\">"
        result+="<input type=\"hidden\" name=\"name\" value=\"addToFailure\">"
        result+=" <input type=\"submit\"> </form> <br> \n"

        result+="<form action=\"http://spike/setConfig\"> Remove Phrase From Failure List   "
        result+="<input type=\"text\" name=\"value\">"
        result+="<input type=\"hidden\" name=\"name\" value=\"removeFromFailure\">"
        result+=" <input type=\"submit\"> </form> <br> \n"

        result+="<h2>False 404 Detection Options</h2>\n"
        result+="Current List of Strings: "+str(self.parent.get404List())+"<br>\n"
        result+="<form action=\"http://spike/setConfig\"> Add phrase to list \n"
        result+="<input type=\"text\" name=\"value\">\n"
        result+="<input type=\"hidden\" name=\"name\" value=\"AddTo404List\">"
        result+=" <input type=\"submit\"> </form> <br> \n"
        
        result+="<form action=\"http://spike/setConfig\"> Remove phrase from list \n"
        result+="<input type=\"text\" name=\"value\">\n"
        result+="<input type=\"hidden\" name=\"name\" value=\"RemoveFrom404List\">"
        result+=" <input type=\"submit\"> </form> <br> \n"
        
        result+="<hl>\n"

        return result

    def setConfig(self,name,value):
        if name=="AddToDict":
            scanDirList.append(value)
        elif name=="AddTo404List":
            self.parent.addTo404List(value)
        elif name=="RemoveFrom404List":
            self.parent.removeFrom404List(value)
        elif name=="AddToSuccess":
            succeededList.append(value)
        elif name=="removeFromDict":
            scanDirList.remove(value)
        elif name=="removeFromSuccess":
            succeededList.remove(value)
        elif name=="addToFailure":
            passwordFailedList.append(value)
        elif name=="removeFromFailure":
            passwordFailedList.remove(value)
        elif name=="loadDictFromFile":
            if value.count("/")>0 or value.count(".")>0:
                return "Cannot add a different directory's files"
            try:
                f=open(value,"r")
            except:
                return "Could not find file %s" % (value)
            
            contents=f.readlines()
            f.close()
            scanDirList = [chomp(line) for line in contents]
            return "Loaded wordlist from \""+value+"\""

        return "Done."
        
        
################

    def dontLog(self,ch):
        self.nottolog+=[ch]
        #print "self.nottolog="+str(self.nottolog)
        
    def removeDontLog(self,ch):
        self.nottolog.remove(ch)
        
    #loads a Request and displays it as a form
    def displayRequestForm(self,file):
        infile=open(file,"rb")
        obj=cPickle.load(infile)
        infile.close()
        ch=obj.clientheader
        cb=obj.clientbody

        requestfile=file.replace(self.cachedir,"")

        #must use the real URL so that loading href "/bob.something" works as if from that server
        our_url=ch.URL+"_sendrequest"
        #strip off leading double slashes
        if our_url[:2]=="//":
            our_url=our_url[1:]
        site="http"
        if ch.clientisSSL:
            site+="s"
        site+="://"+ch.connectHost+":"+str(ch.connectPort)
        result=""
        result+="<FORM action=\""+site+our_url+"?SPIKE_TRIGGER=yes\" method=\"POST\">\n"
        result+=daveutil.printHiddenEntry("SPIKE_TRIGGER","yes")
        result+=daveutil.printFormEntry("Verb", ch.verb)
        result+=daveutil.printFormEntry("ConnectHost",ch.connectHost)
        result+=daveutil.printFormEntry("ConnectPort",str(ch.connectPort))
        result+=daveutil.printFormEntry("URL",ch.URL)
        result+=daveutil.printFormCheckbox("SSL",ch.clientisSSL)

        result +="<P><h1>Headers</H1><P>"
        #print out all the headers

        i=0
        for hkey in ch.headerValuesDict.keys():
            for val in ch.headerValuesDict[hkey]:
                result+=daveutil.printFormEntryAndValue("Header"+str(i),hkey,val)
                i=i+1
                
        #some extra headers if the user wants
        for i in range(i,i+5,1):
            result+=daveutil.printFormEntryAndValue("Header"+str(i),"","")
            
            
        result +="<P><h1>URL Args</H1>"
        i=0
        if len(obj.clientheader.URLargsDict) > 0:
            for akey in ch.URLargsDict.keys():
                result+=daveutil.printFormEntryAndValue("URLArg"+str(i),akey,ch.URLargsDict[akey],requestfile)
                i=i+1
                
                

        #some extra URL arguments if the user wants
        for i in range(i,i+5,1):
            result+=daveutil.printFormEntryAndValue("URLArg"+str(i),"","")


        #now the body arguments
        i=0
        result+="<P><h1>Body Args</h1></p>"
        if len(cb.data)>0:
            bodyargs=daveutil.splitargs("".join(obj.clientbody.data))
            if bodyargs!=None:
                for akey in bodyargs.keys():
                    result+=daveutil.printFormEntryAndValue("BodyArg"+str(i),akey,bodyargs[akey],requestfile)
                    i=i+1

        #some extra body arguments if the user wants
        for i in range(i,i+5,1):
            result+=daveutil.printFormEntryAndValue("BodyArg"+str(i),"","")

        result+="<input type=\"submit\" >"
        result+="<input type=\"reset\">"
        result+="</form>"


        return result
    

    #just a little default header thing
    def addHeader(self,data):
        result="HTTP/1.1 200 OK\r\n"
        result+="Server: SPIKE Proxy 1.1\r\n"
        result+="Content-Type: text/html\r\n"
        result+="Content-Length: "+str(len(data))+"\r\n"
        result+="\r\n"
        result+=data
        return result


    #supports rewrite!
    #sends the actual request to the remote server!
    def sendrequest(self,myheader,mybody):
        result=""
        #new header and body to fill up
        newh=spkproxy.header()
        newb=spkproxy.body()
        #now disassemble myheader

        #debug
        #keys=myheader.URLargsDict.keys()
        #print "Keys: "+str(keys)
        bodyDict=mybody.getArgsDict()
        #print "BodyDict=%s"%str(bodyDict)
        newh.URL=urllib.unquote_plus(bodyDict["URL"])
        #print "newh.URL="+newh.URL
        newh.verb=urllib.unquote_plus(bodyDict["Verb"])
        newh.connectHost=urllib.unquote_plus(bodyDict["ConnectHost"])
        newh.connectPort=urllib.unquote_plus(bodyDict["ConnectPort"])
        newh.version="HTTP/1.1"
        #checkbox, only exists if it is checked
        newh.clientisSSL= bodyDict.has_key("SSL")


        #handle each other
        did=["SPIKE_TRIGGER","URL","Verb","ConnectHost","ConnectPort","SSL"]
        firstbodyarg=1
        for akey in bodyDict.keys():
            #filter the ones we already did
            if akey in did:
                continue
            #is it a header value?
            if akey.count("Header"):
                #names
                if akey[-1]=="N":
                    valuename=akey[:-1]+"V"
                    headername=akey
                else:
                    valuename=akey
                    headername=akey[:-1]+"N"
                    
                header=bodyDict[headername]
                value=bodyDict[valuename]
                #add this to the did list so we don't do it again
                did.append(valuename)
                did.append(headername)

                if header!="":
                    if not newh.headerValuesDict.has_key(header):
                        newh.headerValuesDict[header]=[]
                    newh.headerValuesDict[header].append(urllib.unquote_plus(value))

            if akey.count("URLArg"):
                #names
                if akey[-1]=="N":
                    valuename=akey[:-1]+"V"
                    argname=akey
                else:
                    valuename=akey
                    argname=akey[:-1]+"N"

                arg=urllib.quote_plus(bodyDict[argname])
                value=bodyDict[valuename]
                #add this to the did list so we don't do it again
                did.append(valuename)
                did.append(argname)
                #store it
                if arg!="":
                    newh.URLargsDict[arg]=urllib.unquote_plus(value)

            
            if akey.count("Body"):
                #names
                if akey[-1]=="N":
                    valuename=akey[:-1]+"V"
                    argname=akey
                else:
                    valuename=akey
                    argname=akey[:-1]+"N"

                arg=urllib.quote_plus(bodyDict[argname])
                value=bodyDict[valuename]
                #add this to the did list so we don't do it again
                did.append(valuename)
                did.append(argname)
                #storeit
                #print "arg=%s argname=%s valuename=%s"%(arg,argname,valuename)
                #print "Args:%s"%str(myheader.URLargsDict)
                if arg!="":
                    if not firstbodyarg:
                        newb.data.append("&")
                    #we must put characters into the body, not strings
                    newstring=urllib.unquote_plus(arg)+"="+urllib.unquote_plus(value)
                    for ch in newstring:
                        newb.data.append(ch)
                    firstbodyarg=0
                
        
        #ok, so now we have a new header and body (newh, newb)
        #print "newbody=%s"%str(newb.data)
        result=self.makeRequest(newh,newb)
        return result

    def saveInRequestCache(self,filename):
        self.requestCache=[filename]+self.requestCache
        #cut the last entry off if we're getting too big
        if len(self.requestCache)==self.requestCacheMaxLength:
            del self.requestCache[-1]

    def log(self,loginfo):
        timeoflog=time.asctime()
        logstring= "[%s] : %s" % (timeoflog,loginfo)
        #print it out to our running string
        print logstring
        self.logs=[logstring]+self.logs
        if len(self.logs)==self.maxlogs:
            del self.logs[-1]

    #makes a request - doesn't fork off a new thread
    #takes in a header and body
    #does handle SSL
    #returns a header and body from the server as a string
    def makeRequest(self,newh,newb):
        #we send ourselves in as the UI for our child request
        myconnection=spkproxy.spkProxyConnection(None,self,proxy=self.proxy,ntlm=self.ntlm)
        myconnection.clientisSSL=newh.clientisSSL
        if newh.clientisSSL:
            myconnection.sslHost=newh.connectHost
            myconnection.sslPort=newh.connectPort
        result=myconnection.sendRequest(newh,newb)
        return result

    #sets up the triggers for errors messages we detect
    def setupTriggers(self):
        self.scantriggers=[]
        self.scantriggers.append(("ODBC","ODBC Error!"))
        self.scantriggers.append(("Internal Server","Internal Server Error!"))
        self.scantriggers.append(("SQLException","SQL Injection flaw on DB2!"))
        self.scantriggers.append(("SQLSTATE","SQL Injection flaw on DB2!"))
        self.scantriggers.append(("Volume in drive","dir.exe was spawned!"))
        self.scantriggers.append(("Microsoft Windows 2000 [Version","cmd.exe was spawned!"))
        self.scantriggers.append(("Internal Server Error","Internal Server Error was detected!"))

    #returns a 1 if triggered on something
    #BUGS: we only return one trigger at a time
    def scanForTriggers(self,serverheader,serverbody):
        retval=""
        allbody="".join(serverbody.data)
        for triggerstring,triggervalue in self.scantriggers:
            if allbody.count(triggerstring):
                retval=triggerstring

        return retval



###XML TESTS
    def doXMLTest(self,file):
        #init code
        self.XMLDirectoriesScanned=[]
        self.XMLFilesScanned=[]
        self.XMLSitesScanned=[]

        self.xmlTest(file)

        #fin code
        self.log("Completely done with VulnXML Test on %s!"%file)
        return "Done with VulnXML Tests on %s" % (file)
    
    def xmlTest(self,file):
        #if the file is a directory or site, recurse into it
        #if the site-only has been clicked, only run site tests
        realfile=daveutil.pathjoin(self.cachedir,file)

        #we have to use the directory to get the SITE because
        #we do not necessarally have an actual request file
        #get the first directory after the basedir
        site=daveutil.pathsplit(realfile.replace(self.cachedir,""))[0]
        #split it up
        siteList=site.split("_")
        #get the site info
        sitename=siteList[0]
        siteport=siteList[1]
        siteSSL=int(siteList[2])
        self.runXMLSiteTests(sitename,siteport,siteSSL)

        #here we handle directories transparently!
        if os.path.isdir(realfile):
            
            filelist=os.listdir(realfile)
            for newfile in filelist:
                realnewfile=daveutil.pathjoin(file,newfile)
                self.log("Delving XML test into: "+realnewfile)
                #self.log("<B>XML SITES SCANNED %s</B>"%str(self.XMLSitesScanned))

                self.xmlTest(realnewfile)
            return "Done with xmlTesting the %s directory!"%file

        #we are a file - meaning we are an actual request
        self.runXMLFileandVariableTests(file)

        self.log("Finished xmlTest on %s"%file)
        return "Done with xmlTest"

    def runXMLSiteTests(self,sitename,siteport,siteSSL):
        if "_".join([sitename,str(siteport),str(siteSSL)]) in self.XMLSitesScanned:
            #self.log("<b>MATCHED</B>")
            return 

        self.log("Doing XML Site Tests on %s %s %d"%(sitename,siteport,siteSSL))

        time.sleep(15)
        #self.log("XML SITES SCANNED %s"%str(self.XMLSitesScanned))
        self.XMLSitesScanned.append("_".join([sitename,str(siteport),str(siteSSL)]))
        #self.XMLSitesScanned.append("ASDF")


        siteTestsDir=os.path.join(os.path.join(os.getcwd(),self.VulnXMLDirectory),self.VulnXMLSiteTestDirectory)
        allSiteTests=os.listdir(siteTestsDir)
        for sitetest in allSiteTests:
            if sitetest[-4:]!=".xml":
                continue

            if self.stopallactions==1:
                return "stopped"

            #load the site test
            siteTest=VulnXML.VulnXMLTest(file=daveutil.pathjoin(siteTestsDir,sitetest))
            siteTest.setUI(self)
            #run the site test against our site
            results=siteTest.SiteRun((sitename,siteport,siteSSL))
            #report the results
            for message in results.logMessages:
                self.log("<b>%s</b>"%message)

        return

    def runXMLDirectoryTests(self,directory,infile):
        #check if we've done this one
        if directory in self.XMLDirectoriesScanned:
            return
        
        self.log("runXMLDirectoryTests on %s"%directory)
        self.XMLDirectoriesScanned.append(directory)

        dirTestsDir=os.path.join(os.path.join(os.getcwd(),self.VulnXMLDirectory),self.VulnXMLDirectoryTestsDirectory)
        allDirTests=os.listdir(dirTestsDir)
        for dirtest in allDirTests:
            if dirtest[-4:]!=".xml":
                continue

            if self.stopallactions==1:
                return "stopped"

            #load the site test
            dirTest=VulnXML.VulnXMLTest(file=daveutil.pathjoin(dirTestsDir,dirtest))
            dirTest.setUI(self)
            #run the directory test against our site
            #using infile as the template request
            #print "Directory = %s"%directory
            results=dirTest.DirRun(directory,daveutil.pathjoin(self.cachedir,infile))
            #report the results
            for message in results.logMessages:
                self.log("<b>%s</b>"%message)

        return

    def runXMLFileandVariableTests(self,infile):
        self.log("RunXMLFileandVariableTests on %s"%infile)

        url=daveutil.getURLfromFile(daveutil.pathjoin(self.cachedir,infile))
        dirs=daveutil.getDirsFromURL(url)
        for dir in dirs:
            self.runXMLDirectoryTests(dir,os.path.join(self.cachedir,infile))

        fileTestsDir=os.path.join(os.path.join(os.getcwd(),self.VulnXMLDirectory),self.VulnXMLFileTestsDirectory)
        allFileTests=os.listdir(fileTestsDir)
        for filetest in allFileTests:
            if filetest[-4:]!=".xml":
                continue

            if self.stopallactions==1:
                return "stopped"

            ftest=VulnXML.VulnXMLTest(file=os.path.join(fileTestsDir,filetest))
            ftest.setUI(self)
            results=ftest.FileRun(daveutil.pathjoin(self.cachedir,infile))
            for message in results.logMessages:
                self.log("<b>%s</b>"%message)
        
        variableTestsDir=os.path.join(os.path.join(os.getcwd(),self.VulnXMLDirectory),self.VulnXMLVariableTestsDirectory)
        allVariableTests=os.listdir(variableTestsDir)
        for variabletest in allVariableTests:
            if variabletest[-4:]!=".xml":
                continue

            if self.stopallactions==1:
                return "stopped"

            vtest=VulnXML.VulnXMLTest(file=os.path.join(variableTestsDir,variabletest))
            vtest.setUI(self)
            results=vtest.VariablesRun(os.path.join(self.cachedir,infile))
            for message in results.logMessages:
                self.log("<b>%s</b>"%message)


            
        
        return "Done with runXMLFileandVariableTests"



    
