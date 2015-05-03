import socket
class requester:
def sendrequest(server,port,post,request,ssl):
	prt = port
	host = server
	req = request
	
	peticion = req
	peticion = peticion + "\r\n\r\n"
	skt = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	skt.settimeout(8)
	try:
		skt.connect((host, prt))
	except socket.error,err:
		print "Error %s" % err[0]
		timed = ": Are you sure the port is open?\n"
		return	
	if ssl:
		try:
			sslskt = socket.ssl(skt)
		except socket.sslerror, error:
			if error[0] != 8:
				print "Couldn't SSL connect socket [%s]" % str(error)
				return
		sslskt.write(peticion)
		res = sslskt.read()
		raw = res.encode("String_Escape")
	else:
		skt.send(peticion)
		res = skt.recv(10000)
		while 1:
			block = skt.recv(1024)
			if not block:
				break
			res += block
		raw= res.encode("String_Escape")
	pet = peticion
	sep0 ="#################################################################\n"
	sep = "\n-----------------------------------\n\n"
	rw  = "Raw response:\n\n"
	rp = "Clean response:\n\n"
	print res
	print "##################################################################\n"
	print raw
