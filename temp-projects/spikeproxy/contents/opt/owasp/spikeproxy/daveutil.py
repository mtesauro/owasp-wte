#daveutil.py
import os
import random
import string
import cPickle
from htmllib import HTMLParser
from formatter import DumbWriter, AbstractFormatter
from cStringIO import StringIO


#need this for body()
import spkproxy

#returns data read or "" if none
def readuntil(mysocket,mybreakpoint):
    data=""
    length=-len(mybreakpoint)
    #print "length=%d"%length
    while data[length:]!=mybreakpoint:
        newdata=mysocket.recv(1)
        data+=newdata
        #print "data=%s"%(data[length:])

    return data

def urlnormalize(url):
    """
    /cow/../../../bob/bob2.php -> /bob/bob2.php
    """
    #for win32 users
    f=url.replace("\\","/")
    if f[-1]=="/":
        tailslash=1
    else:
        tailslash=0
        
    dot=f.split("/")
    while "." in dot:
        dot=dot.remove(".")
    while "" in dot:
        dot.remove("")
    while ".." in dot:
        firstdotdot=dot.index("..") 
        #go one directory up
        if firstdotdot==0:
            dot.remove(dot[0])
            continue
        #get rid of parent directory
        dot.remove(dot[firstdotdot-1])
        #do this again to get rid of the ..
        dot.remove(dot[firstdotdot-1])
    fin="/".join(dot)+"/"*tailslash
    if fin=="":
        fin="/"
    if fin[0]!="/":
        fin="/"+fin
    return fin
    

#stolen from  http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/82465
def dmkdir(newdir):
    """works the way a good mkdir should :)
        - already exists, silently complete
        - regular file in the way, raise an exception
        - parent directory(ies) does not exist, make them as well
    """
    if os.path.isdir(newdir):
        pass
    elif os.path.isfile(newdir):
        raise OSError("a file with the same name as the desired " \
                      "dir, '%s', already exists." % newdir)
    else:
        head, tail = os.path.split(newdir)
        if head and not os.path.isdir(head):
            dmkdir(head)
        #print "_mkdir %s" % repr(newdir)
        if tail:
            os.mkdir(newdir)

#joins all the spaces in a string
def joinallspaces(input):
    inputold=""
    inputnew=input[:]
    while inputold!=inputnew:
        inputold=inputnew[:]        
        inputnew=inputnew.replace("  "," ")

    return inputnew


    
def getrandomnumber():
    return random.randrange(1,100000,1)

def pathjoin(*paths):
    temp=""

    for path in paths:
        #print "Pathjoin "+path
        if path!="":
            if path[0]=="/" or path[0]=="\\":
                #we are windoze compliant!
                path=path[1:]
            temp=os.path.join(temp,path)
    #if the first was an absolute path...
    if paths[0][0]=="/":
        temp="/"+temp
        #add that back
        
    return temp

def pathsplit(path):
    temp=path
    last="tempval"
    retList=[]
    while last!="":
        temp,last=os.path.split(temp)
        if last!="":
            retList=[last]+retList
    return retList
        

#following inits are for prettyprint
norm = string.maketrans('', '') #builds list of all characters
non_alnum = string.translate(norm, norm, string.letters+string.digits)
trans_nontext=string.maketrans(non_alnum,'#'*len(non_alnum))

def prettyprint(data):
    cleaned=string.translate(data,trans_nontext)
    return cleaned
 
#openss a requestandresponse object in a file and
#obtains the url from the header
def getURLfromFile(file):
    #load our request and response object
    infile=open(file,"rb")
    obj=cPickle.load(infile)
    infile.close()
    url=obj.clientheader.URL
    return url

#takes a url like /bob/bob2/bob3/asdf.cgi
#and returns [bob,bob2,bob3,asdf.cgi]
def getDirsFromURL(url):
    dirList=url.split("/")
    #check for a file at the last one
    if dirList[-1].count(".")>0:
        dirList=dirList[:-1]

    #now combine them up
    start="/"
    realDirList=[]
    for dir in dirList:
        start+=dir+"/"
        start=start.replace("_directory_","")
        start=start.replace("///","/")
        start=start.replace("//","/")
        realDirList.append(start)
        
    return realDirList


#constructs a request given a header and optionally a body
def constructRequest(myheader,mybody=None):

    #for null value
    if (mybody==None):
        mybody=spkproxy.body()
    
    #debug 
    if 0:
        return "GET / HTTP/1.1\r\nHost: www.immunitysec.com\r\nContent-Length: 0\r\n\r\n"

    
    request=myheader.verb+" "+myheader.getProxyHeader()+myheader.URL
    #if we have arguments
    if myheader.useRawArguments:
        if len(myheader.allURLargs) > 0:
            request+="?"+myheader.allURLargs
    else:
        if len(myheader.URLargsDict) > 0:
            request+="?"
            request+=joinargs(myheader.URLargsDict,orderlist=myheader.orderlist)

                
    request+=" "+myheader.version+"\r\n"


        
    #ok, the first line is done!
    
    #do the rest of the headers that need order
    #I dunno if any except Host really need ordering, but I do it
    #to erase any chance of lame bugs later on
    #plus, python makes it quite easy
    needOrdered=["Host","User-Agent","Accept","Accept-Language","Accept-Encoding","Accept-Charset","Keep-Alive","Connection","Pragma","Cache-Control"]
    for avalue in needOrdered:
        request+=myheader.grabHeader(avalue)
    #now work on the header pairs we haven't already done
    for akey in myheader.headerValuesDict.keys():
        if akey not in needOrdered:
            request+=myheader.grabHeader(akey)

        

    #ok, headers are all done except for content-length
    #Content-Length: 0 should always be valid, but it's
    #not working for some reason on get requests!
    if mybody.mysize!=0 or myheader.verb!="GET":
        if not myheader.surpressContentLength():
            request+="Content-Length: "+str(len(mybody.data))+"\r\n"

    #ok, all headers are done, finish with blank line
    request+="\r\n"

    #ok, now add body
    request+="".join(mybody.data)

    #done!
    return request

#takes in a dict, returls A=B&C=D,etc
def joinargs(argdict,orderlist=[]):
    first=1
    result=""
    donelist=[]
    for akey in orderlist:
        donelist.append(akey)
        if not first:
            result+="&"
        first=0
        result+=akey+"="+argdict[akey]

    for akey in argdict.keys():
        if akey in donelist:
            continue
        if not first:
            result+="&"
        first=0
        result+=akey+"="+argdict[akey]

    return result

#returns None on error
#returns a dictionary of a string split like a normal HTTP argument list
def splitargs(argstring,orderlist=[]):
    resultDict={}
    templist=argstring.split("&")
    for pair in templist:
        if pair!="":
            templist2=pair.split("=")
            if len(templist2)<2:
                #print "Failed to parse the URL arguments because of
                #invalid number of equal signs in one argument in:
                #\""+pair+"\" len="+str(len(templist2))
                return None
            else:
                #add this argument to the Dict
                orderlist.append(templist2[0])
                resultDict[templist2[0]]="=".join(templist2[1:])
    return resultDict

#turns a string into a one character list
def splitstring(astring):
    alist=[]
    for ch in astring:
        alist.append(ch)
    return alist

def printFormEntry(name,value):
    result= name+": <input type=\"text\" name=\""+name+"\" value=\""+value+"\"><br>\n"
    return result


#here is where you would add actions that you want to take when
#you have an argument or variable (on the rewrite request page)
def printFormEntryAndValue(name,key,value,file=""):
    result=""
    result+=name+": <input type=\"text\" name=\""+name+"N\" value=\""+key+"\"> : "
    result+="<input type=\"text\" name=\""+name+"V\" value=\""+value+"\">"
    result+="<br>\n"
    #if we have a file (e.g. we are an actual argument)
    if file != "":
        result+="Entry Actions: <a href=\"http://spike/sqlargscan?file="+file+"&name="+key+"\">INJECTIONSCAN</a>"
        result+="\n"
        result+="<a href=\"http://spike/passwordargscan?file="+file+"&name="+key+"\">PASSWORD</a>"
        result+="<br>\n"
        
    return result

def printFormCheckbox(name,checked):
    result=""
    result+=name+": <input type=\"checkbox\" name=\""+name+"\" value=\"yes\" "
    if checked:
        result+="CHECKED"
    result+="><br>\n"
    return result

def printHiddenEntry(name,value):
    result=""
    result+="<input type=\"hidden\" name=\""+name+"\" value=\""+value+"\">\n"
    return result

#returns 1 if they are basically the same
#filters out Date: and whatnot
#this is basically to detect if we get different Cookies
#this is lame, but it should work ok
def headerdictcmp(dict1,dict2):
    for akey in dict1.keys():
        if akey=="Date":
            continue
        if not dict2.has_key(akey):
            return 0
        for bkey in dict1[akey]:
            if not bkey in dict2[akey]:
                return 0
    return 1

#hashes a requestandresponse so we can do matches quickly
#returns a string as the hash
def genhash(clientheader,clientbody,serverheader,serverbody):
    #print "in genhash"
    CH=clientheader.genhash()
    CB=clientbody.genhash()
    SH=serverheader.genhash()
    SB=serverbody.genhash()
    return CH+CB+SH+SB

#hashes a string to a number, then returns that number as a string
def hashstring(astring):
    i=0
    #print "in hashstring"
    if astring=="":
        return ""

    hashnum=0
    l=len(astring)
    while i<l:
        hashnum+=ord(astring[i])*2
        i=i+1

    return str(hashnum)

def strencode(astring,sepchar="_"):
    temp=astring.replace(":",sepchar)
    temp=temp.replace("/",sepchar)
    temp=temp.replace("\\",sepchar)
    #should we replace _ here as well?
    return temp


def constructResponse(myheader,mybody):
    if myheader.firstline=="":
        print "Serious error: response's first line is empty!"
        print "Full response: %s" % str(myheader.data)
            
    response=myheader.firstline+"\r\n"


    needOrdered=["Server"]
    for avalue in needOrdered:
        response+=myheader.grabHeader(avalue)
        
    for akey in myheader.headerValuesDict.keys():
        #don't send 2 Content-lengths
        if akey not in [ "Content-Length", "Content-length"]:
            if akey not in needOrdered:
                response+=myheader.grabHeader(akey)

    #this may be lame and need to be taken out, but I want people to know.
    response+="BUGBUG: You should never see this. Try hitting shift-reload.\r\n" 
    response+="Content-Length: "+str(mybody.mysize)+"\r\n"

            
    response+="\r\n"
    response+="".join(mybody.data)
    return response

#returns a list of urls with arguments we've parsed from the page
#very kludgy function
def daveFormParse(page):
    formList=[]
    resultList=[]

    debug_daveformparse=0

    if debug_daveformparse:
        print "ENTERED FORM PARSER"
    #split the forms out
    formList=page.split("<form")
    for form in formList:
        if debug_daveformparse:
            print "Handling form: "+form[:50]
        match=" action"
        if form[:len(match)].lower() not in [match]:
            continue
        index=form.find("action=\"")+8
        if index==-1:
            index=form.find("ACTION=\"")+8
            if index==-1:
                continue
        #if find is bugging out on you, upgrade python
        index2=form.find("\"",index+1)
        if index2==-1:
            continue
        url=form[index:index2]
        index2=form.find("/form>")
        if index2==-1:
            continue
        form=form[:index2]
        if debug_daveformparse:
            print "***Form Url is "+url
        argsDict={}
        inputList=form.split("<input")
        for input in inputList:
            input=joinallspaces(input)
            if debug_daveformparse:
                print "Parsing input %s" % input
            spacessplit=input.split(" ")
            name=""
            value=""
            type=""
            for entry in spacessplit:
                if debug_daveformparse:
                    print "Parsing entry"+entry
                if entry[:len("name=\"")]=="name=\"":
                    name=entry.replace("name=\"","")
                    index=name.find("\"")
                    name=name[:index]
                elif entry[:len("value=\"")]=="value=\"":
                    value=entry.replace("value=\"","")
                    index=value.find("\"")
                    value=value[:index]
                elif entry[:len("type=\"")]=="type=\"":
                    type=entry.replace("type=\"","")
                    index=type.find("\"")
                    type=type[:index]
            
            if debug_daveformparse:
                print "Name="+name+" Value="+value+" type="+type

            if name!="" and type!="submit":
                argsDict[name]=value
        if debug_daveformparse:
            print "Found form: %s?%s"  % (url,joinargs(argsDict))
        resultList.append("%s?%s" % (url,joinargs(argsDict)))

    return resultList

def rawParse(page):
    results=[]
    debug_rawparse=0
    if debug_rawparse:
        print "Entered rawparse"
    list=page.split("href=")
    for file in list:
        if file[0]!="\"":
            continue
        file=file[1:255]
        #print "Parsing file %s" % file
        index=file.find("\"")
        if index==-1:
            continue
        newurl=file[:index]
        if debug_rawparse:
            print "newurl=%s" % newurl
        results.append(newurl)
    return results

#takes in the page as a string, then returns a list of URLS
#eventally this will do forms as well. :>
def collectURLSFromPage(page):

    resultList=[]


    #print "Doing form parser"
    if page.count("<form")>0:
        otherlist=daveFormParse(page)
        for key in otherlist:
            resultList.append(key)
            pass

    #DEBUG
    #return resultList

    #print "Doing RAW Parser"
    spamList=rawParse(page)
    for key in spamList:
        resultList.append(key)
        pass

    #the whole "AbstractFormater()" line is a bunch of crap I copied
    #That needs to be documented somehow, but I have no idea what it does
    try:
        parser=HTMLParser(AbstractFormatter(DumbWriter(StringIO())))
        parser.feed(page)
        parser.close()
        
    except:
        #print "DEBUG: Caught an exception trying to parse that html file."
        #print "(Not sure why this happens - you'll have to crawl this page manually)"
        return resultList

    #print "Adding HTML Parser data"
    for key in parser.anchorlist:
            resultList.append(key)
            pass
            
    return resultList
