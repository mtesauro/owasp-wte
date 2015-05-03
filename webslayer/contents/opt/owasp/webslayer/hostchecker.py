#!/usr/bin/env python
# encoding: utf-8
"""
hostchecker.py

Created by laramies on 2008-08-21.
Copyright (c) 2008 __MyCompanyName__. All rights reserved.
"""

import sys
import getopt
import socket
import urlparse
import reqresp

help_message = '''
The help message goes here.
'''

class Checker():
	
	def __init__(self, host):
		self.host = host
		self.nsname =""
	def check(self):
		"""Function for checking if the host is alive 0 Alive, 1 Error de DNS, 2 error HTTP"""
		
		if self.host.count('FUZZ'):
			hosty=self.host
			hosttemp=hosty.replace("FUZZ","")
		else:
			hosttemp=self.host
		protocol,host,path,nose,var,nose2=urlparse.urlparse(hosttemp)
	 	try:
			res=socket.gethostbyname(host)
			self.nsname=res
		except Exception, e:
			stat=0
		try:
			a=reqresp.Request()
			url=protocol+"://"+host
			a.setUrl(url)
			a.setConnTimeout(10)
			a.perform()
			stat=1
		except Exception, e:
			stat=2
		return stat
		
	def non_standard_check(self,word):
		"""Function for checking if a directory reply with a NoN standard code
		"""
		if word=="":
			word="Carl0nch0"
		try:
			a=reqresp.Request()
			targy=self.host.replace("FUZZ",word)
			a.setUrl(targy)
			a.setConnTimeout(2)
			a.setConnTimeout(8)
			a.perform()
			stdcode=str(a.response.code)
			lines= str(a.response.getContent().count("\n"))
			if stdcode=="200":
				leng = str(len(a.response.getContent()))
			else:
				leng="0"
		except Exception, e:
			stdcode="666"
			leng=0
		return stdcode,leng,lines
