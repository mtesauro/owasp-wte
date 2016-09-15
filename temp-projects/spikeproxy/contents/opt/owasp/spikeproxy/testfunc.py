#yes, list becomes A. :>
#yay! I can pass pointers to a function! (heh)
def testfunc(some=[]):
    some.append("A")

list=[]
testfunc(list)
print list

#and the for in statement produces order
list=["A","B","C","D"]
for a in list:
    print a

