from wfuzz import *
import reqresp
import copy
import payloads

fuzztype="File"
file="wordlist/test.txt"
py=["1","2"]
dic1=payload_list(py)

d1=dictionary()
d1.setpayload(dic1)

a=reqresp.Request()
a.setUrl("http://www.edge-security.com/FUZZ")

for x in d1:
		print x
print "XXX"
for x in d1:
		print x
print "XXX"
var="None"
d2=None
proxy=None
rh=requestGenerator(a,var,d1,d2,proxy)

threads=20
fz=Fuzzer(rh,threads)
fz.Launch()
res=fz.results
num=fz.numResults()
print num
i=fz.getResult(1)
print i.code
