#!/usr/bin/python
#VulnXML.py
#Dave Aitel
#GPL v 2.0
#this is an implementation of VulnXML that should fit into any web framework
#although it was originally designed to work with SPIKE Proxy
#it shouldn't require anything except Python 2.2

#TODO:
#DONE Adding headers is not exclusive - we need to make it so
#DONE Need to finish testcriteria and results
#DONE need to check if chunked, and if so, send no content length
#need to go through site example checking for /cgi-bin/pu3.asp
# without knowing anything about the site except for /
# hmm. First we need to do a directory check on /cgi-bin/
#   This needs to add itself to our GET requests
# then we need to do a directory check on pu3.asp
# hmm. On success we can save out our template request! We really want
# to store the serverheader and serverbody as well
#we can just resend with log=1 and we'll have logged it



#version 1.0
from xml.dom.minidom import parse,parseString
import cPickle
#for matching
import re
#random numbers are used for temp files
import random

#change this if you arn't using spike proxy
import spkproxy
import requestandresponse

import sys,os
import base64

#gets the text from a nodelist
def getText(nodelist):
    rc = ""
    for node in nodelist:
        if node.nodeType == node.TEXT_NODE:
            rc = rc + node.data
    return rc

def getTextWithEncoding(node):
    result=getText(node.childNodes)
    encoding=node.getAttributeNS(None,"encoding")
    if encoding==None or encoding=="text":
        return result
    if encoding=="base64":
        return base64.decodestring(result)
    else:
        #print "BUGBUG: encoding type not known %s"%encoding
        #acually, I am lazy and sometimes just use this for text with no encoding as well
        return result



#only gets child elements - does not get text elements
def getChildElementsByTagName(node,tagname):
    #print "Here we are!"
    resultList=[]
    for child in node.childNodes:
        if child.__class__.__name__=="Element" and child.tagName==tagname:
            resultList.append(child)
    return resultList

#handles groupings transparantly.
#if there is a group identified by parens
#then we use that, otherwise, we return the whole string
def makerematch(reobj):
    if reobj==None:
        return ""
    if len(reobj.groups())>0:
        return reobj.group(1)
    else:
        return reobj.group()
    

#this class encapsulates all the things you ever return from calling a VulnXMLTest
class VulnXMLResults:
    def __init__(self):
        self.foundFilesOrDirs=[]
        self.logMessages=[]
        self.doOnce=0

        
#we could implement a Dom Dictionary cache quite easily (in load)
#this class is used as an interface to whatever client request template you happen
#to have implemented
class TemplateRequest:
    def __init__(self):
        self.templateFile=""
        self.URIpath=""
        self.URIfile=""

        pass

    
    #load ourselves in from a file. You may need to change this if you don't
    #use SPIKE Proxy
    def loadFromFile(self,templateFile):
        infile=open(templateFile,"rb")
        #just pickle it in, whatever it is
        obj=cPickle.load(infile)
        #you must have these two items defined!
        self.clientheader=obj.clientheader
        self.clientbody=obj.clientbody
        self.templateFile=templateFile
        infile.close()
        return
    
    def reload(self):
        self.loadFromFile(self.templateFile)
        return 1

    #returns the last part of the URL (as determined by ? and then /'s)
    def getURIfile(self):
        if self.URIfile!="":
            return self.URIfile

        URL=self.clientheader.URL
        self.URIpath="/"+"/".join(URL.split("?")[0].split("/")[1:-1])
        self.URIpath=self.URIpath.replace("//","/")
        self.URIfile=URL.split("/")[-1]
        return self.URIfile

    #returns a site tuple (host,port,isssl)
    def getSite(self):
        result= self.clientheader.getSiteTuple()
        #print "Result=%s"%str(result)
        return result
        

    #opens up the template File and edits a path
    def getURIpath(self):
        if self.URIpath!="":
            return self.URIpath
        
        URL=self.clientheader.URL
        self.URIpath="/"+"/".join(URL.split("?")[0].split("/")[1:-1])
        self.URIpath=self.URIpath.replace("//","/")
        self.URIfile=URL.split("/")[-1]
        return self.URIpath


    #add a header to the request - delete whatever was there
    def addHeader(self,headername,headervalue):
        self.clientheader.removeHeaders(headername)
        self.clientheader.addHeader(headername,headervalue)
        #here we special case chunked transfer encodings
        if headername=="Transfer-Encoding" and headervalue=="chunked":
            self.clientheader.setSurpressContentLength()
        return

    #creates a body with our seperator and body values
    def createBody(self,seperator,bodyvals):
        bodyList=[]
        first=1
        for item in bodyvals:
            if not first:
                for sep in seperator:
                    bodyList.append(sep)
            for val in item:
                bodyList.append(val)
            first=0
        self.clientbody.data=bodyList
        self.clientbody.setSize(len(bodyList))
        return




###########################################



class VulnXMLTest:
    def __init__(self,file=""):
        if file!="":
            self.load(file)

        self.messagebody=None
        self.foundFilesOrDirs=[]
        self.doOnce=0
        self.dositetest=0
        self.dofilerun=0
        self.dodirrun=0
        return

    #used for sending requests!
    def setUI(self,UI):
        self.UI=UI
        return

    #gets the value of the test name
    def getTestName(self):
        return getTextWithEncoding(getChildElementsByTagName(self.testdescription,"TestName")[0])

    def getTestFile(self):
        return self.testFile

    def load(self,file):
        self.testFile=file
        #print "Loading %s into dom"%file
        self.dom = parse(file)
        return 1

    #site is a tuple (host,port,ssl_int)
    #SiteRun's don't have a template file to work from,
    #so we just create one on the fly.
    def SiteRun(self,site):
        newtemplatefilename="temp_siterun"+str(random.randint(0,65535))+".spt"
        #this is SPIKE Proxy specific code right here
        myRandR=requestandresponse.RequestAndResponse(spkproxy.header(),spkproxy.body(),spkproxy.header(),spkproxy.body())
        myRandR.clientheader.URL="/"
        myRandR.clientbody.body=[]
        myRandR.clientheader.setSiteTuple(site)
        myRandR.serverheader=None
        myRandR.serverbody=None
        
        #now write this as a pickle to our file
        #this is not SPIKE Proxy specific
        openfile=open(newtemplatefilename,"wb")
        binary=1
        cPickle.dump(myRandR,openfile,binary)
        openfile.close()

        #mark what test we are doing so we match correctly
        self.dositetest=1
        results=self.doTemplateRun(newtemplatefilename)

        #now delete our temporary file
        os.unlink(newtemplatefilename)
        return results
    
    #uses directory as the URL, but templateFile as the template
    def DirRun(self,directory,templateFile):
        self.dodirrun=1
        #set the directory and ignore the path
        results=self.doTemplateRun(templateFile,directory=directory,file="")
        return results


    def doTemplateRun(self,templateFile,directory="", file=""):
        results=VulnXMLResults()
        #print "do Template Run Called!"

        #load in the template
        #print running test name and test version
        #for each step
        #   run post/get
        #   set variables
        #   apply testcriteria
        #if testcriteria==SUCCESS then register as event

        #set the file we will use to load in the template
        self.templateRequest=TemplateRequest()
        self.templateRequest.loadFromFile(templateFile)
        #if we set eithar of these, they need to be used instead
        #of the ones in the template
        if directory=="" and file=="":
            self.URIfile=self.templateRequest.getURIfile()
            self.URIpath=self.templateRequest.getURIpath()
        else:
            self.URIfile=file
            self.URIpath=directory
            
        self.site=self.templateRequest.getSite()
        
        self.initDomForUse()
        #print "after init Dom For Use"
        #this string stores our result from our test criteria
        tcstring=self.runTest()

        #print "tcstring = %s after running test"%tcstring

        if tcstring=="SUCCESS":
            results.foundFilesOrDirs=self.foundFilesOrDirs
            results.doOnce=self.doOnce
            if self.dofilerun:
                results.logMessages.append("VulnXML Test reported SUCCESS on test %s in file %s with template %s"%(self.getTestName(),self.getTestFile(),templateFile))
            elif self.dositetest:
                results.logMessages.append("VulnXML Test reported SUCCESS on test %s in file %s"%(self.getTestName(),self.getTestFile()))
            elif self.dodirrun:
                results.logMessages.append("VulnXML Test %s reported SUCCESS on directory %s"%(self.getTestName(),self.URIpath))
            else:
                results.logMessages.append("VulnXML Test reported SUCCESS!")
                
        
        return results

    #done
    def FileRun(self,templateFile):
        self.dofilerun=1
        results=self.doTemplateRun(templateFile)
        return results

    def VariablesRun(self,templateFile):
        results=VulnXMLResults()
        return results

    #returns a string with all the gibberish replaced with actual strings
    def replaceConstantStrings(self,instring):
        result=instring
        result=result.replace("${file}",self.URIfile)
        result=result.replace("${path}",self.URIpath)
        (host,port,isssl)=self.templateRequest.getSite()
        result=result.replace("${host}",host)
        result=result.replace("${port}",str(port))
        result=result.replace("${5000}","A"*5000)
        return result

    #here we glean some variables from the DOM
    def initDomForUse(self):
        #ok, now load our Dom properly
        self.webtestnode=getChildElementsByTagName(self.dom,"WebApplicationTest")[0]

        self.testdescriptions=getChildElementsByTagName(self.webtestnode,"TestDescription")
        self.testdescription=self.testdescriptions[0]
        self.connectionNodes=getChildElementsByTagName(self.webtestnode,"Connection")
        self.connectionNode=self.connectionNodes[0]
        self.steps=getChildElementsByTagName(self.connectionNode,"Step")
        return

    def loadTemplateFromFile(self,templateFile):
        #load the template file for request -
        #if you are not using SPIKE Proxy you may want to change these
        #few lines here
        #to be cool, load it into a string, then unpickle it, and save the string
        #so you don't do disk reads in the future
        self.templateRequest=TemplateRequest()
        self.templateRequest.loadFromFile(templateFile)

        return

    #sets up the request based on our templateRequest and dom
    def setupRequest(self,step):
        #first do this...
        request=getChildElementsByTagName(step,"Request")[0]
        self.loadMessageHeader(request)
        self.loadMessageBody(request)
        return

    #tests if we need to match this - parsing the DOM and clientheader to find out
    #returns 1 on success, 0 on fail
    #example:
    #<TriggerOn event="file">
    #		<Match type="regex">.*.asp</Match>
    #</TriggerOn>
    def testMatch(self):
        #print "testMatch"
        triggeron=getChildElementsByTagName(self.testdescription,"TriggerOn")
        #print "after triggeron"
        #no trigger, then we always match
        if triggeron==None:
            #print "returning 1"
            return 1
        for triggerent in triggeron:
            #get the type of event
            triggertype=triggerent.getAttributeNS(None,"event")
            matches=getChildElementsByTagName(triggerent,"Match")
            for match in matches:
                matchregex=getText(match.childNodes)
                #ANY is magic type used for automatically trigger
                if ( triggertype=="file" or triggertype=="any" ) and self.dofilerun:
                    result=re.search(matchregex,self.templateRequest.URIfile)
                    if result!=None:
                        return 1
                elif ( triggertype=="any" or triggertype=="directory" ) and self.dodirrun:
                    result=re.search(matchregex,self.templateRequest.URIpath)
                    if result!=None:
                        return 1
                elif ( triggertype == "any" or triggertype=="scheme_host_port" ) and self.dositetest:
                    return 1
                #TODO: fill in site and variable here
                else:
                    print "BUGBUG: TRIGGER EVENT %s IS NOT RECOGNIZED!"%(triggertype)
            
        #print "returning 0"
        return 0

    #actually sends the request out and parses the response!
    def runTest(self):

        #test if we should even run this test against this template
        if not self.testMatch():
            return "NOMATCH"
        
        for step in self.steps:
            #might be a bit slow reading from the file each time
            #but this way we dont have to save off each variable
            #and restore it, which could be a pain
            #a better way would be to have a way to save a copy with pickle-to-string
            #or something
            #print "Running step."
            self.templateRequest.reload()
            self.setupRequest(step)
            self.response=self.sendRequest()
            self.parseResponseVariables(step)
            tcstring=self.parseTestCriteria(step)
            if tcstring=="FAILURE":
                print "VulnXML reported failure to find vulnerability"
                return tcstring
            if tcstring=="SUCCESS":
                print "VulnXML SUCCESS!"
                #resend request and save the response this time
                self.sendRequest(log=1)
                return tcstring

            

    
    def loadMessageHeader(self,request):
        print "loadMessageHeader"
        mh=getChildElementsByTagName(request,"MessageHeader")[0]
        #no Message header has to exist in the DOM, so if we don't find one
        #we return cleanly
        if mh==None:
            return

        methods=getChildElementsByTagName(mh,"Method")
        if methods!=None:
            #we only use the first method - if there are more than one, tough
            method=getText(methods[0].childNodes)
            #print "USING METHOD %s"%method
            self.templateRequest.clientheader.verb=method
        

        URIelements=getChildElementsByTagName(mh,"URI")
        if URIelements!=None:
            #we don't need a URI either - we can just use what we've got
            #the VulnXML guys are dead set on using a URI though, cause
            #they don't have a templateRequest.
            #For file/variable requests we should really
            #just ignore it, but we'll use it and see how that works
            URI=getText(URIelements[0].childNodes)
            URI=self.replaceConstantStrings(URI)
            #print "Setting URL to %s"%URI
            self.templateRequest.clientheader.URL=URI

        VersionElements=getChildElementsByTagName(mh,"Version")
        if VersionElements!=None:
            version=getText(VersionElements[0].childNodes)
            #print "USING VERSION %s"%version
            self.templateRequest.clientheader.version=version

        headerElements=getChildElementsByTagName(mh,"Header")
        for header in headerElements:
            headername=getText(getChildElementsByTagName(header,"Name")[0].childNodes)
            headervalue=getText(getChildElementsByTagName(header,"Value")[0].childNodes)
            #add that header
            headervalue=self.replaceConstantStrings(headervalue)
            self.templateRequest.addHeader(headername,headervalue)
            #we can also force content-length to something, in which case we don't want
            #to auto-calculate it
            if headername.lower()=="content-length":
                self.templateRequest.setForcedContentLength()

        #done with setting up the request's header
        return
            

    #sets up up the request's body - the old request's body ALWAYS gets overwritten
    #hopefully that won't cause a problem during anyone's testing...
    def loadMessageBody(self,request):
        #we don't necesserally even have a body
        if len(getChildElementsByTagName(request,"MessageBody"))==0:
            self.templateRequest.createBody("",[])
            return
        
        bodyElements=getChildElementsByTagName(request,"MessageBody")[0]
        separatorElements=getChildElementsByTagName(bodyElements,"Separator")
        if separatorElements!=None:
            #we've set a separator, since the default is "&"
            separator=getTextWithEncoding(separatorElements[0])
        else:
            separator="&"

        bodyItems=[]
        items=getChildElementsByTagName(bodyElements,"Item")
        for item in items:
            itemtext=getTextWithEncoding(item)
            #replace any ${something} strings with their real equivalents
            itemtext=self.replaceConstantStrings(itemtext)
            bodyItems.append(itemtext)

        self.templateRequest.createBody(separator,bodyItems)
        #done setting up the request's body
        return

    #sends the request and gets back a response
    #!!!you'll have to change this if you are not using SPIKE Proxy!!!
    def sendRequest(self,log=0):
        #we send our UI in as the UI for our child request
        myconnection=spkproxy.spkProxyConnection(None,self.UI)
        myconnection.clientisSSL=self.templateRequest.clientheader.clientisSSL
        if myconnection.clientisSSL:
            myconnection.sslHost=self.templateRequest.clientheader.connectHost
            myconnection.sslPort=self.templateRequest.clientheader.connectPort
        if not log:
            self.UI.dontLog(self.templateRequest.clientheader)
        result=myconnection.sendRequest(self.templateRequest.clientheader,self.templateRequest.clientbody)
        if not log:
            self.UI.removeDontLog(self.templateRequest.clientheader)
        return result
            

    
    #this has to go through the XML for our current step and set each variable appropriately
    #these get stored in a list
    def parseResponseVariables(self,step):
        #print "INSIDE PARSERESPONSE"
        response=getChildElementsByTagName(step,"Response")
        if response==None:
            return "Error: No response found!"

        if len(response)!=1:
            return "Error: More than one response block found!"

        #there can BE only one
        response=response[0]

        #reset this 
        self.variables=[]
        
        setvariables=getChildElementsByTagName(response,"SetVariable")
        for setvariable in setvariables:
            #variables must first have a name
            variableName=setvariable.getAttributeNS(None,"name")
            #and then a type
            variableType=setvariable.getAttributeNS(None,"type")
            if variableType!="string":
                print "BUGBUG: CANNOT HANDLE VARIABLE TYPE %s"%variableType
                return "NOTOK"
            #then they have a Source, which has a source attribute and a regex string value
            variableSource=getChildElementsByTagName(setvariable,"Source")
            if len(variableSource)!=1:
                print "BUGBUG: variableSource length != 1!"
                return "NOTOK"

            variableSource0=variableSource[0]
            variableSourceSource=variableSource0.getAttributeNS(None,"source")
            variableSourceText=getText(variableSource0.childNodes)

            if variableSourceSource=="message-body":
                variableResult=self.messagebodyRegex(variableSourceText)
            elif variableSourceSource=="status-line":
                #print "Status Line Regex: %s"%(variableSourceText)
                variableResult=self.statuslineRegex(variableSourceText)
            elif variableSourceSource=="message-header":
                variableResult=self.messageHeaderRegex(variableSourceText)
            else:
                print "BUGBUG: %s is not a valid source!"%variableSourceSource
                return "NOTOK"
            #store each as a tuple in a list
            self.variables.append((variableName,variableResult))

        #print "self.variables=%s"%str(self.variables)
        #all the variables have been set and stored in the self.variables list
        return "OK"

    #parses the test criteria and checks for a SUCCESS or FAILURE
    def parseTestCriteria(self,step):
        #print "INSIDE PARSETESTCRITERIA"
        tests=getChildElementsByTagName(step,"TestCriteria")
        for test in tests:
            #store off the test type ("SUCCESS" or "FAILURE")
            testType=test.getAttributeNS(None,"type")
            #we have a compare, and it can have many other compares under it, which are anded
            compares=getChildElementsByTagName(test,"Compare")
            testistrue=0
            #these compares get ORed
            for compare in compares:
                if self.testCompare(compare):
                    testistrue=1
                    break

            #only one test is ever true, hopefully
            if testistrue:
                return testType
            #solve each compareeach compare has attributes variable, test and value
        return "NOTESTWASTRUE"

    #recursive function that tests compares
    #example:
    #<Compare variable="${ResponseCode}" test="equals">
    #<Value encoding="text">200</Value>
    #   <Compare variable="${body404}" test="notequals" >
    #   <Value></Value>
    #   </Compare>
    #</Compare>
    def testCompare(self,compare):
        compareVariable=compare.getAttributeNS(None,"variable")
        #print "Compare Variable %s"%compareVariable
        #print "Length of Value elements = %d"%len(compare.getChildElementsByTagName("Value"))
        compareTest=compare.getAttributeNS(None,"test")
        #print "CompareTest=%s"%compareTest
        compareValue=getText(getChildElementsByTagName(compare,"Value")[0].childNodes)
        #strip ${ and }
        compareVariable=compareVariable[2:-1]
        #print "CompareValue=%s CompareVariable=%s"%(compareValue,compareVariable)
        #print "Get Compare Value is equal to: %s"%self.getVariableValue(compareVariable)
        #print "CompareTest=%s"%compareTest
        #do our compares
        if compareTest=="notequals":
            #print "notequals chosen"
            if compareValue==self.getVariableValue(compareVariable):
                return 0
        if compareTest=="equals":
            #print "Equals chosen"
            if compareValue!=self.getVariableValue(compareVariable):
                #print "returning zero"
                return 0
        
        
        morecompares=getChildElementsByTagName(compare,"Compare")
        #no more?
        if morecompares==None:
            return 1

        #we have more - we are recursing to handle them
        #these are all ANDed together - so if any are false, we are false
        for newcompare in morecompares:
                if not self.testCompare(newcompare):
                    return 0
        return 1

    def initInternalVariables(self):
        if self.messagebody==None:
            body=self.response.split("\r\n\r\n")
            if len(body)<2:
                print "Why is the len(body) from this response < 2?"
                return ""
            self.messagebody="\r\n\r\n".join(body[1:])
            self.messageheader=body[0]
            self.statusline=self.messageheader.split("\r\n")[0]
        return

    #match inside the header
    def messageHeaderRegex(self,regexstring):
        self.initInternalVariables()
        if regexstring=="" or self.messageheader=="":
            return ""
        result=re.search(regexstring,self.messageheader)
        if result==None:
            return ""
        #transform result into a string from an re object
        result=makerematch(result)
        return result

    #this function returns a string that matches a regex in the body
    def messagebodyRegex(self,regexstring):
        self.initInternalVariables()

        #print "messagebodyregex"
        #print "self.messagebody=%s"%self.messagebody
        #print "regexstring=%s"%regexstring
        if regexstring=="" or self.messagebody=="":
            return ""
  
        #print "regexstring=%s self.messagebody=%s"%(regexstring,self.messagebody)
        result=re.search(regexstring,self.messagebody)
        if result==None:
            #print "returning nothing"
            return ""
        result=makerematch(result)
        #print "Returning %s"%result
        return result
        
    #returns a string that is the match of the thing in the status line
    def statuslineRegex(self,regexstring):
        self.initInternalVariables()
        if regexstring=="" or self.statusline=="":
            return ""
        
        result=re.search(regexstring,self.statusline)
        if result==None:
            return ""
        result=makerematch(result)
        return result

    #gets a variable from our variables list
    def getVariableValue(self,compareVariable):
        #print "Variables=%s"%(self.variables)
        for variabletuple in self.variables:
            if variabletuple[0]==compareVariable:
                return variabletuple[1]

        print "BUGBUG: Did not find variable %s in our variables list"%compareVariable
        return ""
            
