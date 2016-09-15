#!/usr/bin/python

#takes in a file of the form
#x,x,root,file,search for in body,method,information about vuln
#if "search for in body" is just a number without " then we are looking for a status-code

import time
import os,sys

def xmltabify(instring,base):
    newstring=""
    currentindent=0
    lines=instring.split("\n")
    for line in lines:
        #print "current indent=%d base=%d"%(currentindent,base)
        if line[1]=="/":
            currentindent+=-1
        newstring+="\t"*base
        newstring+="\t"*currentindent
        newstring+=line+"\n"
        #print "%s"%newstring
        #now we must modify indent

        if line.count("</")==0:
            currentindent+=1
    return newstring

defaultresponse="""
<SetVariable name="ResponseCode" type="string">
	<Description>The HTTP Response Code</Description>
	<Source source="status-line">^.*\s(\d\d\d)\s</Source>
</SetVariable>
<SetVariable name="body404" type="string">
	<Description>See if we got a custom error page, incorrectly implemented with a return code of 200</Description>
	<Source source="message-body">(404.*[Nn]ot [Ff]ound)</Source>
</SetVariable>
<SetVariable name="redir302" type="string">
	<Description>Check to see if we are being redirected to another page</Description>
	<Source source="message-header">^Location: (.*)$</Source>
</SetVariable>
<SetVariable name="bodymatch" type="string">
	<Source source="message-body">BODYMATCH</Source>
</SetVariable>"""

defaultresponse=xmltabify(defaultresponse,4)        
#print "Default Response=\n%s"%defaultresponse


defaulttestcriteria="""
<TestCriteria type="SUCCESS">
	<Compare variable="${ResponseCode}" test="equals">
		<Value>200</Value>
		<Compare variable="${body404}" test="equals" >
			<Value></Value>
			<Compare variable="${bodymatch}" test="equals">
				<Value>BODYMATCH</Value>
			</Compare>
		</Compare>
	</Compare>
</TestCriteria>
<TestCriteria type="FAILURE">
	<Compare variable="${ResponseCode}" test="equals">
		<Value>404</Value>
	</Compare>
</TestCriteria>
<TestCriteria type="FAILURE">
	<ErrorMessage>This test was redirected to ${redir302}. The program that 
	generated this test does not know how to handle 302 responses. 
	Unfortunately, they are quite common in the Microsoft arena. Please 
	update the generator, and rebuild these tests.
	</ErrorMessage>
	<Compare variable="${ResponseCode}" test="equals">
		<Value>302</Value>
	</Compare>
</TestCriteria>
<TestCriteria type="FAILURE">
	<ErrorMessage>This message indicates a failure to properly execute the test,
	or an unhandled HTTP response. Please investigate further, and modify this 
	test before re-executing it. The server returned ${ResponseCode}
	</ErrorMessage>
	<Compare variable="${ResponseCode}" test="notequals">
		<Value>200</Value>
	</Compare>
</TestCriteria>
"""

defaulttestcriteria=xmltabify(defaulttestcriteria,3)
#print "Default Test Criteria:"
#print defaulttestcriteria


#this stuff happens.

import os,sys


def xmlescape(line):
    """
    escapes a sequence with xml escape characters
    """
    line=line.replace("&","&amp;")
    line=line.replace("<","&lt;")
    line=line.replace(">","&gt;")
    return line

#for when we get a string that gets passed directly to regex but
#is not actually a regex string
def regexEscape(instring):
    for ch in ["?","\\","*",".","{","}","(",")","$","^",":"]:
        instring=instring.replace(ch,"\\"+ch)
    return instring

class whiskertovulnxml:
    def __init__(self):
        pass

    def usage(self):
        print """
        Usage: ./whiskerdbtovulnxml.py infile outdirectory
        """
        sys.exit(1)

    def run(self,infile,outdir):
        file=open(infile,"r")
        data=file.readlines()
        file.close()

        #read in our template
        file=open("FileTemplate.xml","r")
        templatedata=file.read()
        file.close()

        i=0
        for line in data:
            if line[:2]!="c,":
                continue
            line=xmlescape(line)
            linesplit=line.split(",")
            #print "linesplit=%s"%str(linesplit)

            #if I see @CGIDIRS, then just make it ${path}
            directory=linesplit[2]
            if directory=="@CGIDIRS":
                directory="${path}"
                typeoftest="directorytest"
            else:
                typeoftest="sitetest"

            file=linesplit[3]

            #un quoteafy some things
            if len(file)>1 and file[0]=="\"" and file[-1]=="\"":
                file=file[1:-1]
            
            #if I see just a number, then we want a particular status code
            searchfor=regexEscape(linesplit[4])
            
            #method we use sending the request
            method=linesplit[5]

            #description of bug
            description=linesplit[6]

            newdata=templatedata.replace("FILENAME",file)
            newdata=newdata.replace("PATH",directory)
            
            #if it is just a number
            if searchfor.count("\"")==0:
                newdata=newdata.replace("RESPONSE",defaultresponse)
                newdata=newdata.replace("TESTCRITERIA",defaulttestcriteria.replace("<Value>200</Value>","<Value>"+searchfor+"</Value>"))
                newdata=newdata.replace("BODYMATCH","")

            else:
                #we have a string to look for in the body
                #first remove quotes
                searchfor=searchfor[1:-1]
                newdata=newdata.replace("RESPONSE",defaultresponse)
                newdata=newdata.replace("TESTCRITERIA",defaulttestcriteria)
                newdata=newdata.replace("BODYMATCH",searchfor)
 

            newdata=newdata.replace("DESCRIPTION",description)
            #this little character causes problems.
            newdatya=newdata.replace("Ê","")
            
            file=open(os.path.join(outdir,"%s-%d.xml"%(typeoftest,i)),"w")
            file.write(newdata)
            file.close()
            i=i+1
    

if __name__ == '__main__':


    
    app = whiskertovulnxml()
    if len(sys.argv) < 3:
        app.usage()

    app.run(sys.argv[1],sys.argv[2])
            
