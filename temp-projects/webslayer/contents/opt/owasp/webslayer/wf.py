#Coded by Christian Martorella cmartorella@edge-security.com

from __future__ import generators
from wfuzz import *
import reqresp
import time
import re 
import pickle
import copy
import urlparse
import types
import encoders
import payloads
import dictio
import string
from MainGui import  *
import highLighter
import hostchecker
import sys
import os


try:
	import webbrowser
except:
	print "Import failed, Webbrowser library not available"
	sys.exit()
try:
	from PyQt4.QtGui import *
except:
	print "Import failed, PyQT libraries not found"


class Ui_MainWindow(MainGui):
	
	def __init__(self):
		self.filedicc=""
		self.filedicc2=""
		self.fz=None
		self.timer = QtCore.QTimer()
		self.timer_load=QtCore.QTimer()
		QtCore.QObject.connect(self.timer,QtCore.SIGNAL("timeout()")
		,self.timerFunc)
		QtCore.QObject.connect(self.timer_load, QtCore.SIGNAL("timeout()")
		, self.timer_loadres)
		self.md5=[] 
		self.lines=[]
		self.words=[]
		self.numtests=0 
		self.charlens=[] 
		self.AllRes=[]   #Lista con todas las ejecuciones, datos.
		self.datos=[]	 #Lista con los datos de esta ejecucion
		self.res_run=[]  #Resultados de la ultima ejecucion
		self.filteres=[] #Resultados luego de ser filtrados (para grabar)
		self.payload_imported2=""
		self.payload_imported=""
		self.last_recursion_res=0
		self.last_results=[]
		self.target=""
		#Code for populating encoding combos.	
		self.payloadNum=0
		self.PAYLOADS={}
		self.ENCODERS={}
		encs=dir(encoders)	
		#Live Filters
		self.actualretfilter=""
		self.actualcharfilter=""
		self.actualwordfilter=""
		self.actuallinesfilter=""
		self.includefilter="1"
		self.private_surfing="1"
		self.sleeper=0
		
		for i in encs:
			try:
				if i[:8]=='encoder_':
					self.ENCODERS[getattr(encoders,i).text]=i
			except:
				pass

	def setupUi(self, MainWindow):
		MainGui.setupUi(self, MainWindow)
		QtCore.QObject.connect(self.botonFile, QtCore.SIGNAL("clicked()"),
		self.loadFileDicc)
		QtCore.QObject.connect(self.pushButton, QtCore.SIGNAL("clicked()"),
		self.loadFileDicc2)
		QtCore.QObject.connect(self.botonLaunch, QtCore.SIGNAL("clicked()"),
		 self.pre_launch)
		
		QtCore.QObject.connect(self.comboListadoUrls,
		QtCore.SIGNAL("activated(QString)"), self.clicked_combo_url)
		
		QtCore.QObject.connect(self.ComboCodes,
		QtCore.SIGNAL("activated(QString)"), self.update_ret)
		
		QtCore.QObject.connect(self.comboFUZZ,
		QtCore.SIGNAL("activated(QString)"), self.enable_range)
		
		QtCore.QObject.connect(self.authCombo,
		QtCore.SIGNAL("activated(QString)"), self.enable_pass)
		
		QtCore.QObject.connect(self.comboFUZZ,
		QtCore.SIGNAL("activated(QString)"),self.fuzz_selection)
		
		QtCore.QObject.connect(self.linesCombo, 
		QtCore.SIGNAL("activated(QString)"), self.update_ret)
		
		QtCore.QObject.connect(self.ComboChars,
		QtCore.SIGNAL("activated(QString)"), self.update_ret)
		
		QtCore.QObject.connect(self.linesCombo_2,
		QtCore.SIGNAL("activated(QString)"),self.update_ret)
		
		QtCore.QObject.connect(self.md5Combo,
		QtCore.SIGNAL("activated(QString)"),self.update_ret)
		
		QtCore.QObject.connect(self.tableResults,
		QtCore.SIGNAL("cellClicked(int,int)"),self.clicked)
		
		
		QtCore.QObject.connect(self.tableResults,
		QtCore.SIGNAL("cellDoubleClicked(int,int)"), self.open_url)
		
		QtCore.QObject.connect(self.filterButton,
		QtCore.SIGNAL("clicked()"),	
		self.update_regular)
		#QtCore.QObject.connect(self.pushButton_4, QtCore.SIGNAL("clicked()"), self.update_errors)
		QtCore.QObject.connect(self.sendRequestButton,
		QtCore.SIGNAL("clicked()"), self.launch_req)
		QtCore.QObject.connect(self.cancelButton, QtCore.SIGNAL("clicked()")
		, self.cancel)
		QtCore.QObject.connect(self.clearButton, QtCore.SIGNAL("clicked()"),
		 self.clean_box)
		QtCore.QObject.connect(self.actionLoad_Session,
		QtCore.SIGNAL("triggered()"), 
		self.load_results)
		QtCore.QObject.connect(self.actionSave_Session,
		QtCore.SIGNAL("triggered()"), self.save_results)
		QtCore.QObject.connect(self.actionExport_results,
		QtCore.SIGNAL("triggered()"), self.export_res)
		QtCore.QObject.connect(self.actionExport_Payload_results,
		QtCore.SIGNAL("triggered()"), self.export_payloads)
		QtCore.QObject.connect(self.actionExport_results,
		QtCore.SIGNAL("triggered()"), self.export_res)
		QtCore.QObject.connect(self.actionExit,
		QtCore.SIGNAL("triggered()"), self.quit)
		QtCore.QObject.connect(self.actionAbout_Webslayer,
		QtCore.SIGNAL("triggered()"), self.about)
		QtCore.QObject.connect(self.addButton_3, 
		QtCore.SIGNAL("clicked()"), self.addDict)
		QtCore.QObject.connect(self.saveButton, 
		QtCore.SIGNAL("clicked()"), self.saveDict)
		QtCore.QObject.connect(self.clearButton_3, 
		QtCore.SIGNAL("clicked()"), self.clearDict)
		QtCore.QObject.connect(self.generateButton, 
		QtCore.SIGNAL("clicked()"), self.generateDict)
		QtCore.QObject.connect(self.addrangeButton, 
		QtCore.SIGNAL("clicked()"), self.addRange)
		QtCore.QObject.connect(self.addwordButton_2, 
		QtCore.SIGNAL("clicked()"), self.addWord_2)
		QtCore.QObject.connect(self.deletewordButton_3,
		QtCore.SIGNAL("clicked()"), self.deleteWord_2)
		QtCore.QObject.connect(self.addperutButton,
		QtCore.SIGNAL("clicked()"), self.addPermutation)
		QtCore.QObject.connect(self.addCredit,
		QtCore.SIGNAL("clicked()"), self.addCreditCards)
		QtCore.QObject.connect(self.addrangeButton_2, 
		QtCore.SIGNAL("clicked()"), self.creaListaFuzz)
		QtCore.QObject.connect(self.addUserComb, 
		QtCore.SIGNAL("clicked()"), self.addPermutation_users)
		QtCore.QObject.connect(self.droppayloadButton,
		QtCore.SIGNAL("clicked()"), self.dropPayload)
		QtCore.QObject.connect(self.clearselectionButton,
		QtCore.SIGNAL("clicked()"), self.clearSelection)
		QtCore.QObject.connect(self.fileButton, 
		QtCore.SIGNAL("clicked()"), self.payfile)
		QtCore.QObject.connect(self.apply1Button, 
		QtCore.SIGNAL("clicked()"), self.applyRegex)
		QtCore.QObject.connect(self.apply2Button, 
		QtCore.SIGNAL("clicked()"), self.applySet)
		QtCore.QObject.connect(self.pushButton_2, 
		QtCore.SIGNAL("clicked()"), self.import_payload)
		QtCore.QObject.connect(self.pushButton_3, 
		QtCore.SIGNAL("clicked()"), self.import_payload_2)
		QtCore.QObject.connect(self.clearEncButton, 
		QtCore.SIGNAL("clicked()"), self.cleanEncoder)
		QtCore.QObject.connect(self.tableResults,
		QtCore.SIGNAL("cellDoubleclicked(int,int)"), self.send_to_requester)
		QtCore.QObject.connect(self.pushButton_6, 
		QtCore.SIGNAL("clicked()"), self.finder)
		QtCore.QObject.connect(self.pushButton_7, 
		QtCore.SIGNAL("clicked()"), self.finder2)
		QtCore.QObject.connect(self.pushButton_5, 
		QtCore.SIGNAL("clicked()"), self.finder_requester)
		QtCore.QObject.connect(self.comboBox,
		QtCore.SIGNAL("activated(QString)"), self.reqSet)
		QtCore.QObject.connect(self.comboBox_2,
		QtCore.SIGNAL("activated(QString)"), self.load_credit)
		QtCore.QObject.connect(self.encoderCombo,
		QtCore.SIGNAL("activated(QString)"), self.encode)
		QtCore.QObject.connect(self.decoderCombo,
		QtCore.SIGNAL("activated(QString)"), self.decode)
		QtCore.QObject.connect(self.dictioList,
		QtCore.SIGNAL("activated(QString)"), self.dictioSelect)
		QtCore.QObject.connect(self.dict2List,
		QtCore.SIGNAL("activated(QString)"), self.dictioSelect2)
		QtCore.QObject.connect(self.pauseButton, 
		QtCore.SIGNAL("clicked()"), self.pause)
		QtCore.QObject.connect(self.resumeButton, 
		QtCore.SIGNAL("clicked()"), self.resume)
		QtCore.QObject.connect(self.checkInclude, 
		QtCore.SIGNAL("clicked()"), self.includeState)
		QtCore.QObject.connect(self.anonymousCheck, 
		QtCore.SIGNAL("clicked()"), self.anonymous)
		QtCore.QObject.connect(self.backButton, 
		QtCore.SIGNAL("clicked()"), self.back)
		QtCore.QObject.connect(self.forwardButton, 
		QtCore.SIGNAL("clicked()"), self.forward)
		QtCore.QObject.connect(self.cancelbrowserButton, 
		QtCore.SIGNAL("clicked()"), self.stop)
		QtCore.QObject.connect(self.reloadButton, 
		QtCore.SIGNAL("clicked()"), self.reload)
		QtCore.QObject.connect(self.scrotButton, 
		QtCore.SIGNAL("clicked()"), self.scrot)
		
		QtCore.QObject.connect(self.webView, 
		QtCore.SIGNAL("loadFinished(bool)"), self.updateUrl)
		
		self.populate_requester()
		self.populate_creditCards()
		self.populate_authorization()
		self.populate_decoder()
		self.messages=self.loadMessages()
		self.commonerrors=self.loadErrors()
		self.encoderCombo.addItem("None")
		self.encoderCombo.addItem("All")
		temp_encoders=self.ENCODERS.keys()
		temp_encoders.sort()
		self.encodingCombo.addItems(temp_encoders)
		self.encodingCombo_2.addItems(temp_encoders)
		self.encodingCombo_3.addItems(temp_encoders)
		self.encoderCombo.addItems(temp_encoders)
		self.tabWidget.setCurrentIndex(0)
		self.tabresults.setCurrentIndex(0)
		QtCore.QMetaObject.connectSlotsByName(MainWindow)
		self.pushButton_2.hide()
		self.progressBar.hide()
		self.pushButton_3.hide()
		self.rangeEdit.hide()
		self.label_8.hide()
		self.label_19.hide()
		self.passEdit.hide()
		self.cancelButton.hide()
		self.pauseButton.hide()
		self.resumeButton.hide()
		self.logsEdit.append(self.messages["welcome"])
		self.statusbar.showMessage('WebSlayer ready')
		self.tableResults.setColumnWidth(5,80)
		self.label_60.hide()
		self.label_65.hide()
		self.lastreq=""
		try:
			file=open("help.html","r")
			help=file.read()
			html_help=help
		except:
			print "Error loading help file"
		self.webView_2.setHtml(QtCore.QString(str(help)))
		self.loadDicts()
	def quit(self):
		sys.exit()
		
	def addbutton(self):
		payloadRows=0
		self.payloadTable.insertRow(payloadRows)
		col=QtGui.QTableWidgetItem()
		col.setText(str("Dictionary"))
		self.payloadTable.setItem(payloadRows,0,
		QtGui.QTableWidgetItem(col))
		payloadRows+=1

############Browser###################################
	def back(self):
		self.webView.back()

	def forward(self):
		self.webView.forward()

	def stop(self):
		self.webView.stop()
	
	def reload(self):
		self.webView.reload()
	
	def updateUrl(self):
		self.browserLine.setText((self.webView.url().toString()))

	def scrot(self):
		page=self.webView.page()
		frame= page.currentFrame()
		page.setViewportSize(frame.contentsSize())
		img=QImage(page.viewportSize(), QImage.Format_ARGB32)
		paint = QPainter(img)
		frame.render(paint)
		paint.end()
		thumb= QImage(img)
		#thumb= QImage(img.scaled(int(1024),int(768)))
		filename = QtGui.QFileDialog.getSaveFileName()
		if filename != "":
			thumb.save(filename)
		else:
			pass

######################################################
	def dictioSelect(self): #Dictionary loading stuff
		dic=self.dictioList.currentText()
		if dic != "None":
			self.editFilename.setText("")
			self.editFilename.setEnabled(False)
			self.filedicc=""
		else:
			self.editFilename.setEnabled(True)
			
	def dictioSelect2(self):
		dic=self.dict2List.currentText()
		if dic != "None":
			self.lineEdit_2.setText("")
			self.lineEdit_2.setEnabled(False)
			self.filedicc2=""
		else:
			self.lineEdit_2.setEnabled(True)
	
 	def loadDicts(self):
		osname=os.name
		if osname =="nt":
			test=os.getcwd()+"\\wordlist\\"
			print test
		else:
			test=os.getcwd()+"/wordlist/"
		files=os.listdir(test)
		dirs=[]
		self.dictionaryDict={}

		for x in files:
			file=test+x
			if os.path.isfile(file):
				if file.split(".")[1] == "txt":
					self.dictionaryDict[x]=file
			else:
				if file.count("."):
					pass
				else:
					dirs.append(x)
		self.dictioList.addItem("None")
		self.dict2List.addItem("None")
		
		for x in dirs:
			if osname=="nt":	
				dir=test+x+"\\"
			else:
				dir=test+x+"/"
			files=os.listdir(dir)
			for y in files:
				self.dictionaryDict[x]=dir+x
				if osname=="nt":	
					self.dictioList.addItem(x+"\\"+y)
					self.dict2List.addItem(x+"\\"+y)
				else:
					self.dictioList.addItem(x+"/"+y)
					self.dict2List.addItem(x+"/"+y)

############################################################
#Messages and other combos population
	def loadErrors(self):
		file="config/common-errors.txt"
		errors="("
		if len(file)>0:
			f=open(file,"r")
			mes=f.readlines()
			for x in mes:
				x=x.strip("\n")
				errors+=x+"|"
		error=errors.rstrip("|")
		errors=error+")"
		return errors		
		
	def loadMessages(self):
		file="config/messages.txt"
		messages={}
		if len(file)>0:
			f=open(file,"r")
			mes=f.readlines()
			for x in mes:
				pair=x.split("=")
				messages[pair[0]]=pair[1]
		return messages	
	
	def includeState(self):
		if self.checkInclude.checkState():
			self.includefilter=1
		else:
			self.includefilter=0
			
	def populate_decoder(self):
		self.decoderCombo.addItem("None")
		self.decoderCombo.addItem("urlencode")
		self.decoderCombo.addItem("base64")
		self.decoderCombo.addItem("Binary Ascii")
		self.decoderCombo.addItem("Mssql Char")
		self.decoderCombo.addItem("Mysql Char")
		self.decoderCombo.addItem("Oracle Char")

		
	def populate_authorization(self):
		self.authCombo.addItem("None")
		self.authCombo.addItem("ntlm")
		self.authCombo.addItem("basic")
		self.authCombo.addItem("digest")

	def populate_creditCards(self):
		self.comboBox_2.addItem("MasterCard")
		self.comboBox_2.addItem("VISA 16 Digits")
		self.comboBox_2.addItem("VISA 13 Digits")
		self.comboBox_2.addItem("American Express")
		self.comboBox_2.addItem("Discover")
		self.comboBox_2.addItem("Diners Club")
		self.comboBox_2.addItem("Voyager")
	
	def populate_requester(self):
		self.comboBox.addItem("None")	
		self.comboBox.addItem("GET / HTTP/1.0")	
		self.comboBox.addItem("GET / HTTP/1.1")	
		self.comboBox.addItem("HEAD / HTTP/1.0")	
		self.comboBox.addItem("HEAD / HTTP/1.1")	
		self.comboBox.addItem("OPTIONS / HTTP/1.0")
		self.comboBox.addItem("OPTIONS / HTTP/1.1")
		self.comboBox.addItem("SEARCH / HTTP/1.1")

	def load_credit(self):
		import gencc
		res=gencc.select_type("MasterCard")
		self.listWidget.clear()
		for x in res:
			self.listWidget.addItem(x)

	def anonymous(self):
		if self.anonymousCheck.checkState():
			self.private_surfing="0"
		else:
			self.private_surfing="1"
		
##################################################
#Code to check for backup files not used at the moment
	def backups(self):
		thisresults=self.res_run
		results=[]
		for x in thisresults:
			if self.last_results.count(x):
				pass
			else:
				results.append(x)
				self.last_results.append(x)
		voidDicc=dictionary()
		rh2=requestGenerator(Request(),"None",voidDicc)
		for i in results:
			if i.code==200: 
				i.req.setUrl(i.req.completeUrl+"FUZZ")
				rhtemp=requestGenerator(i.req,"None",\
				self.dictio1,None,self.proxy)
				rh2.append(rhtemp)

				if self.extensions:
					a=copy.deepcopy(i.req)
					a.setUrl(a.req.completeUrl+".FUZ2Z")
					rhtemp=requestGenerator(a.req,"None",self.dictio1,\
					self.dicExtensions,self.proxy)
					rh2.append(rhtemp)
#####################################################
#Preflight check, here we control that all the conditions for a test are OK
	def pre_launch(self):
		self.logsEdit.append(self.messages["pre_launch0"])
		self.logsEdit.append(self.messages["pre_launch1"])
		self.statusbar.showMessage(self.messages["pre_launch2"])
		self.target=str(self.editUrl.text())
		self.range=self.rangeEdit.text()
		self.allvars=self.allparameterCombo.currentText()
		self.fuzztype=self.comboFUZZ.currentText()
		self.method=str(self.authCombo.currentText())
		self.userpass=str(self.passEdit.text())
		self.testhost=hostchecker.Checker(self.target)
		hostcheck=self.testhost.check()
		self.sleeper=int(self.sleeperEdit.text())
		if hostcheck ==1:
			self.logsEdit.append("[-] Host check ok! "+ self.target)
		else:
			self.logsEdit.append("[-] Host invalid: "+ self.target)

		if os.name =="nt":
			dir=os.getcwd()+"\\wordlist\\"
		else:	
			dir=os.getcwd()+"/wordlist/"
		
		if self.filedicc=="":
			self.filedicc=dir+self.dictioList.currentText()
		if self.postinputEdit.toPlainText().isEmpty():
			self.postins= ""
			post_temp=""
		else:
			postins=str(self.postinputEdit.toPlainText())
			postins=postins.rstrip()
			self.postins=postins
			post_temp=self.postinputEdit.toPlainText()
			
		if self.headersinputEdit.toPlainText().isEmpty():
			self.headins= ""
			head_temp=""
		else:
			headins=str(self.headersinputEdit.toPlainText())
			headins=headins.rstrip()
			self.headins=headins.split("\n")
			head_temp=self.headersinputEdit.toPlainText()
				
		ok=1
		
		if self.target == "":
			test=QtGui.QMessageBox.warning(None,str( \
			"Invalid TARGET"),self.messages["target_1"],0,1)
			self.logsEdit.append("[-] Empty target")
			ok=0
			
		if hostcheck == 0:
			test=QtGui.QMessageBox.warning(None,str("Invalid \
			 HOST"),self.messages["target_2"],0,1)
			ok=0	
		elif hostcheck == 2:
			test=QtGui.QMessageBox.warning(None,self.messages["error1"]
			,self.messages["target_3"],0,1)
			self.logsEdit.append(self.messages["error0"] + self.target)
			ok=0	
			
		if self.allvars == "No":
			if self.target.count('FUZZ') or post_temp.count("FUZZ")\
			 or head_temp.count("FUZZ") or self.userpass.count("FUZZ"):
				pass
			else:	
				test=QtGui.QMessageBox.warning(None,str("Error"),
				self.messages["fuzz_1"],0,1)
				self.logsEdit.append(self.messages["fuzz_2"])
				ok=0
				
		if self.fuzztype=="Dictionary" and self.filedicc=="None":
				test=QtGui.QMessageBox.warning(None,str("File\
				error"),self.messages["fuzz_3"],0,1)
				self.logsEdit.append(self.messages["fuzz_4"])
				ok=0
				
		if self.method != "None" and self.userpass =="":
				test=QtGui.QMessageBox.warning(None,str(\
				"Authentication error"),self.messages["auth_1"],0,1)
				self.logsEdit.append(self.messages["auth_2"])
				ok=0
				
		if self.fuzztype == "Range": 
			try:
				int(self.range.split("-")[0])
				int(self.range.split("-")[1])
			except:
				test=QtGui.QMessageBox.warning(None,str(\
				"Range error"),self.messages["range_1"],0,1)
				self.logsEdit.append(self.messages["range_2"])
				ok=0
				
		if self.fuzztype == "Payload" and self.payload_imported=="":
				test=QtGui.QMessageBox.warning(None,str\
				("File error"),self.messages["fuzz_5"],0,1)
				self.logsEdit.append(self.messages["fuzz_6"])
				ok=0
				
		if self.target.count('FUZ2Z') or post_temp.count("FUZ2Z") \
		or head_temp.count("FUZ2Z"):
			if self.filedicc2=="" and self.payload_imported2=="":
				test=QtGui.QMessageBox.warning(None,str("File\
				error"),self.messages["file_1"],0,1)
				self.logsEdit.append(self.messages["file_2"])
				ok=0
				
		#NSC checking
		self.ignore=self.lineEdit.text()
		self.ignore=self.ignore.split(",")
		self.ignore_chars=self.lineChars.text()
		self.ignore_chars=self.ignore_chars.split(",")
		self.ignore_lines=self.lineLines.text()
		self.ignore_lines=self.ignore_lines.split(",")

		if ok==1:
			self.logsEdit.append("[-] Preflight check succeeded")
			if self.checkBox.isChecked():
				if self.target.count("FUZZ"):
					try:					
						self.stdcode,leng,lines=self.testhost.non_standard_check("CarlonCh0")
						if self.stdcode in ("302","301","401","403"):
							self.ignore.append(self.stdcode)
							self.logsEdit.append("[-] NSC detected: "\
							+ self.stdcode)
						elif self.stdcode == "200":
							self.stdcode,leng2,lines2=self.testhost.non_standard_check("Tit0elL0codeSiempr3")
							if leng2==leng:
								self.logsEdit.append("[-] NSC detected: "\
								+ self.stdcode +" Length: " + str(leng))
								self.ignore_chars.append(str(leng))
							else:
								if lines==lines2:
									self.logsEdit.append("[-] NSC detected: "\
									+ self.stdcode +" Lines:" + str(lines))
									self.ignore_lines.append(str(lines))
								else:
									"Revisar caso"
						else:
							self.logsEdit.append("[-] NSC not detected")
					except Exception,e:
							self.logsEdit.append("[-] Error performing NSC")
							raise e
			self.launch()
		else:	
			self.logsEdit.append(self.messages["pre_launch3"])
			self.statusbar.showMessage(self.messages["pre_launch4"])



###############RECURSION#######################################
	def recursion(self):
		self.logsEdit.append(self.messages["recursion0"])
		if self.recursionLevel:
			thisresults=self.res_run
			results=[]
			exit_count=0
			for x in thisresults:

				if self.last_results.count(x):
					pass
				else:
					results.append(x)
					self.last_results.append(x)
					exit_count=1

			if exit_count==0:
				return 0

			self.recursionLevel-=1
			voidDicc=dictionary()
			self.proxy=None #Temporal
			rh2=requestGenerator(Request(),"None",voidDicc)
			self.statusbar.showMessage(self.messages["recursion1"])
			########MOVIDA DE LOCATION, en RECURSION#####################
			
			for i in results:
				self.logsEdit.append("\tChecking recursion for "\
				+ str(i.req.completeUrl))
				self.statusbar.showMessage(self.messages["recursion2"]\
				+ str(i.req.completeUrl))
				
				if i.code==200 and i.req.completeUrl[-1]=='/':
					#i.req.setUrl(i.req.completeUrl+"FUZZ")
					c=copy.deepcopy(i.req)
					c.req.setUrl(c.req.completeUrl+"FUZZ")
					rhtemp=requestGenerator(c.req,"None",self.dictio1,\
					None,self.proxy)
					rh2.append(rhtemp)
					if self.extensions:
						a=copy.deepcopy(i.req)
						a.setUrl(a.req.completeUrl+".FUZ2Z")
						rhtemp=requestGenerator(a.req,"None",self.dictio1,\
						self.dicExtensions,self.proxy)
						rh2.append(rhtemp)
				elif i.code>=300 and i.code<400:
					fail=0
					#El tema de los location sin host
					
					if i.has_header("Location") and i["Location"][-1]=='/':
						a=reqresp.Request()
					
						if i["Location"][0]!="/":
							a.setUrl(i["Location"]+"carL0nch0")
						else:
							url=urlparse.urlparse(i.req.completeUrl)
							urlstrip=url[0]+"://"+url[1]
							a.setUrl(urlstrip+i["Location"]+"carL0nch0")
						
						try:
							a.perform()
							self.stdcode=str(a.response.code)
							if self.stdcode in ("302","301","401","403"):
								self.ignore.append(self.stdcode)
								self.logsEdit.append("[-] NSC detected: "+ self.stdcode)
							elif self.stdcode == "200":
								leng=a.response.getContent().count("\n")
								self.ignore_lines.append(str(leng))
							#elif i.has_header("Location") and i["Location"][-1]=='/':
							else:
								#i.req.setUrl(i["Location"]+"FUZZ")
								b=copy.deepcopy(i.req)
								b.setUrl(i["Location"]+"FUZZ")
								rhtemp=requestGenerator(b,"None",self.dictio1,\
								None,self.proxy)
								rh2.append(rhtemp)
								if self.extensions:
									d=copy.deepcopy(i.req)
									d.setUrl(d.completeUrl+".FUZ2Z")
									rhtemp=requestGenerator(d,"None",\
									self.dictio1,self.dicExtensions,self.proxy)
									rh2.append(rhtemp)
						except:
							print "Error en el host"
							fail=1
							pass
						if fail==1:
							a.setUrl(i.completeUrl+"/")
							try:
								a.perform()
								self.stdcode=str(a.response.code)
								if self.stdcode in ("302","301","401","403"):
									self.ignore.append(self.stdcode)
									self.logsEdit.append("[-] NSC detected: "\
									+ self.stdcode)
								elif self.stdcode == "200":
									leng=a.response.getContent().count("\n")
									self.ignore_lines.append(str(leng))
								#elif i.has_header("Location") and i["Location"][-1]=='/':
								else:
									i.req.setUrl(i.completeUrl+"/FUZZ")
									rhtemp=requestGenerator(i.req,"None"\
									,self.dictio1,None,self.proxy)
									rh2.append(rhtemp)
									if self.extensions:
										b=copy.deepcopy(i.req)
										b.setUrl(b.completeUrl+".FUZ2Z")
										rhtemp=requestGenerator(b,"None",\
										self.dictio1,self.dicExtensions,\
										self.proxy)
										rh2.append(rhtemp)
							except:
								pass
#############################################################################################
			if rh2.moreRequests:
				self.logsEdit.append("[-] Recursive attack...")
				tim=time.localtime(time.time())
				startime=time.strftime("%H:%M:%S",tim)
				self.logsEdit.append("\tStart Time:" + startime)
				reqs=rh2.count()
				if int(reqs)==0:
					return 0
				#print "This run reqs" +str(reqs)
				self.logsEdit.append("[-] This recursive requests count:"\
				+ str(reqs))
				#self.totalreqs+=int(reqs)
				self.reqcounter=0
				self.totalreqs=int(reqs)
				self.logsEdit.append("\tPayloads:" + str(self.totalreqs))
				self.fz=Fuzzer(rh2,self.ignore,self.sleeper,self.threads)
				self.fz.Launch()
				self.numResults=0
				self.timer.start(300)
				self.botonLaunch.setEnabled(False)
				self.cancelButton.setEnabled(True)
				self.progressBar.show()	
				self.label_19.show()	
				self.progressBar.setTextVisible(True)
				self.progressBar.setMaximum(self.totalreqs)	
				self.progressBar.setMinimum(0)
				#self.pushButton_6.hide()
				#self.lineEdit_4.hide()
				self.tabWidget.setCurrentIndex(2)
			else:
					pass
##############################################################################################	
	def about (self):
		test=QtGui.QMessageBox.about(None, str("About WebSlayer"),self.messages["about"]) 

	def enable_range(self):
		type=self.comboFUZZ.currentText()
		if type !="Dictionary":
				self.rangeEdit.setEnabled(True)
		else:
				self.rangeEdit.setEnabled(False)
	
	def import_payload(self):
		if self.create_dict()!=[]:
			self.payload_imported=self.create_dict()
			self.logsEdit.append(self.messages["payload0"])
			self.statusbar.showMessage(self.messages["payload1"])
			self.label_60.show()
		else:	
			self.logsEdit.append(self.messages["payload2"])
			test=QtGui.QMessageBox.warning(None,str("Payload"),self.messages["payload_1"],0,1)
	
	def import_payload_2(self):
			if self.create_dict()!=[]:
				self.payload_imported2=self.create_dict()
				self.logsEdit.append(self.messages["payload3"])
				self.statusbar.showMessage('Payload 2 imported OK')
				self.label_65.show()
			else:	
				self.logsEdit.append(self.messages["payload4"])
				test=QtGui.QMessageBox.warning(None,str("Payload"),self.messages["payload_2"],0,1)

##########################################################################################
#Exporting results code
	def export_payloads(self):
		import datetime
		fileName = QtGui.QFileDialog.getSaveFileName()
		if fileName != "":
			output = open(fileName, 'wb')
			tim=time.localtime(time.time())
			finishtime=time.strftime("%H:%M:%S",tim)
			date=datetime.date.today()

			if self.filteres ==[]:
				resultados=self.res_run
			else:
				resultados=self.filteres
			for x in resultados:
						output.write ("\r\n"+x.req.description)
			output.close()
			self.logsEdit.append(self.messages["export1"])
		else:
			pass
	
	def export_res(self):
		import datetime
		fileName = QtGui.QFileDialog.getSaveFileName()
		if fileName != "":
			output = open(fileName, 'wb')
			tim=time.localtime(time.time())
			finishtime=time.strftime("%H:%M:%S",tim)
			date=datetime.date.today()

			if self.filteres ==[]:
				resultados=self.res_run
			else:
				resultados=self.filteres
			output.write("<html><head></head><body bgcolor=#FFFFFF text=#000000><h1>Analysis for: "+self.target+" </h1><br><h4>Analysis date: "+str(date)+" "+ str(finishtime)+"</h4>\r\n<table border=\"1\">\r\n<tr><td>Code</td><td>#Lines</td><td>#Words</td><td>Url</td></tr>\r\n")
			for x in resultados:
					htmlc="<font color=#000000>"
					postVars=x.req.variablesPOST()
					if postVars != []:
						output.write("<form action=\""+x.completeUrl+"\"\
						 method='POST'>"+x.completeUrl+"<br>")
						output.write("<table>")
						for var in postVars:
							t=x.req.getVariablePOST(var)
							output.write('<tr>')
							output.write('<td>'+var+'</td><td>\
							<input type="text" name="'+var+'" value="'+t+'"></td>')
							output.write('</tr>')
						output.write("</table>")
						output.write('<input type="submit" value="Replay post">')
						output.write("Code: "+ str(x.code) + " Lines: "+ str(x.lines) + " Words: "+str(x.words))
						output.write('<hr>')
						output.write('</form><br>')
					else:
						output.write ("\r\n<tr><td>%s%d</font></td><td>%4dL</td><td>%5dW</td><td><a href=%s>%s    </a></td></tr>\r\n" %(htmlc,x.code,x.lines,x.words,str(x.completeUrl),str(x.completeUrl)))
			output.write("</table></body></html><h5>Webslayer an OWASP Project<h5>\r\n")	
			output.close()
			self.logsEdit.append(self.messages["export1"])
		else:
			pass
#############################################################################################

	def enable_pass(self):
		passw=self.authCombo.currentText()
		if passw!="None":
				self.passEdit.setEnabled(True)
				self.passEdit.show()
		else:
			self.passEdit.setEnabled(False)
			self.passEdit.hide()
			
	def fuzz_selection(self):
		fuzz=self.comboFUZZ.currentText()
		if fuzz=="Dictionary":
			self.editFilename.setEnabled(True)
			self.editFilename.show()
			self.lineEdit_2.setEnabled(True)
			self.lineEdit_2.show()
			self.rangeEdit.setEnabled(False)
			self.label_2.show()
			self.label_14.show()
			self.label_8.hide()
			self.botonFile.show()
			self.pushButton.show()
			self.rangeEdit.hide()
			self.pushButton_2.hide()
			self.pushButton_3.hide()
			self.filedicc2=""
			self.filedicc=""
			self.label_60.hide()
			self.label_65.hide()	
			self.dictioList.show()
			self.dict2List.show()
	
		elif fuzz=="Payload":
			self.editFilename.setText('')
			self.editFilename.setEnabled(False)
			self.editFilename.hide()
			self.label_2.hide()
			self.label_8.hide()
			self.label_14.hide()
			self.botonFile.hide()
			self.pushButton.hide()
			self.lineEdit_2.setText('')
			self.lineEdit_2.setEnabled(False)
			self.lineEdit_2.hide()
			self.rangeEdit.setEnabled(False)
			self.rangeEdit.hide()
			self.pushButton_2.show()
			self.pushButton_3.show()
			self.filedicc2=""
			self.filedicc=""	
			self.dictioList.hide()
			self.dict2List.hide()
		else:
			self.pushButton_2.hide()
			self.pushButton_3.hide()
			self.editFilename.setText('')
			self.editFilename.setEnabled(False)
			self.editFilename.hide()
			self.lineEdit_2.setText('')
			self.lineEdit_2.hide()
			self.lineEdit_2.setEnabled(False)
			self.rangeEdit.setEnabled(True)
			self.label_2.hide()
			self.label_8.show()
			self.label_14.hide()
			self.botonFile.hide()
			self.pushButton.hide()
			self.filedicc2=""
			self.filedicc=""
			self.rangeEdit.show()
			self.dictioList.hide()
			self.dict2List.hide()
	
	
	def loadFileDicc (self):
		fileget = QtGui.QFileDialog()
		try:
			fileName=fileget.getOpenFileName()
			self.logsEdit.append("[-] File loaded ok:" + str(fileName))
		except:
			self.logsEdit.append("[X] File load failed:"+ str(fileName))
		if len(fileName)>0:		
			self.filedicc=fileName
		self.editFilename.setText(fileName)
		self.dictioList.setCurrentIndex(0)
		
	def loadFileDicc2 (self):
		fileget = QtGui.QFileDialog()
		try:
			fileName2=fileget.getOpenFileName()
			self.logsEdit.append("[-] File loaded ok:" + str(fileName2))
		except:
			self.logsEdit.append("[X] File load failed:" + str(fileName2))
		if len(fileName2)>0:		
			self.filedicc2=fileName2
		self.lineEdit_2.setText(fileName2)
		self.dict2List.setCurrentIndex(0)
		
###########################LAUNCH##################################
	
	def launch (self):
		self.threads=int(self.threadSpin.value())
		self.encoding=self.encodingCombo.currentText()
		url=""
		self.webView.setUrl(QtCore.QUrl(url))
		self.target=str(self.editUrl.text())
		self.proxy=str(self.proxyEdit.text())
		self.allvars=self.allparameterCombo.currentText()
		self.dicsource=[]
		self.limpiatablas()
		self.flagfinish=0
		a=reqresp.Request()
		a.setUrl(self.target)
		self.actualretfilter=""
		self.actualcharfilter=""
		self.actualwordfilter=""
		self.actuallinesfilter=""
		if self.anonymousCheck.checkState():
			self.private_surfing="0"
		if self.method!="None":
			a.setAuth(self.method,self.userpass)
		
		if self.proxy =="":
				self.proxy=None
		else:
				pass
		
		if self.allvars == "Headers":
				self.allvar="allheaders"
		elif self.allvars=="Post":
				self.allvar="allpost"
		elif self.allvars=="Get":
				self.allvar="allvars"
		elif self.allvars=="No":
				self.allvar="None"
				
		if self.range != "":
				self.dicc=self.range
		
		self.recursionLevel=int(self.recursionSpin.value())
		
		if self.headins!="":
			for x in self.headins:
					splitted=x.split(":",1)
					a.addHeader(str(splitted[0]),str(splitted[1]))
		else:
			pass
		
		if self.postins =="":
			pass
		else:
			a.addPostdata(str(self.postins))
		self.statusbar.showMessage(self.messages["dict0"])
		self.logsEdit.append(self.messages["dict1"])
		self.logsEdit.append("\t"+self.messages["dict0"])
		
		if self.postins.count("FUZ2Z") or self.headins.count("FUZ2Z") \
		or self.target.count("FUZ2Z"):
			pass
		else:
			self.filedicc2 =""
			self.lineEdit_2.setText('')
			self.lineEdit_2.setEnabled(True)
		
		if self.fuzztype=="Dictionary":
			self.payload1=payload_file(self.filedicc)
			if self.filedicc2 != "":
				self.payload2=payload_file(self.filedicc2)
		elif self.fuzztype=="Range":
			self.payload1=payload_range(self.range)
		elif self.fuzztype=="HexRange":
			self.payload1=payload_hexrange(self.range)
		elif self.fuzztype=="Payload":
			self.payload1=payload_list(self.payload_imported)
			if self.payload_imported2 != "":
				self.payload2=payload_list(self.payload_imported2)
		
		self.dictio1=dictionary()
		self.dictio1.setpayload(self.payload1)
		self.dictio2=None
		
		if self.filedicc2 != "" or self.payload_imported2 != "":
			self.dictio2=dictionary()
			self.dictio2.setpayload(self.payload2)
			self.logsEdit.append("\tDictionaries generated.")
		else:
			self.logsEdit.append("\tDictionary generated.")
		
		if self.encoding!="None":
				enc= getattr(encoders,self.ENCODERS[str(self.encoding)])() 
				self.dictio1.setencoder(enc)
				if self.filedicc2 != "" or self.payload_imported2 != "":
						self.dictio2.setencoder(enc)
						
		#We generate the request set=========================================
		self.rh=requestGenerator(a,str(self.allvar),self.dictio1,
		self.dictio2,self.proxy)
		self.extensions=str(self.lineExtensions.text())
		if self.extensions:
			self.extensions=self.extensions.split(",")
			self.payExtensions=payload_list(self.extensions)
			self.dicExtensions=dictionary()
			self.dicExtensions.setpayload(self.payExtensions)
			x=copy.deepcopy(a)
			x.setUrl(self.target+".FUZ2Z")
			rhtemp=requestGenerator(x,"None",self.dictio1,self.dicExtensions,
			self.proxy)
			self.rh.append(rhtemp)
		self.logsEdit.append("\tRequest generetad succesfully.")
		self.logsEdit.append("[-] Attack ready")
		self.totalreqs=self.rh.count()
		#Information from the current execution====================================
		res=[] 
		self.datos=[self.numtests,self.target,str(self.fuzztype),self.dicsource,
		str(self.range),res,str(self.filedicc),str(self.filedicc2),
		str(self.postins),self.headins]
		self.statusbar.showMessage('Starting attack..')
		self.AllRes.append(self.datos)
		self.fz=Fuzzer(self.rh,self.ignore,self.sleeper,self.threads)
		self.res_run=[]
		self.reqcounter=0
		#We complete the analyzed urls combo===========================
		new=QtGui.QTableWidgetItem()
		new.setText(str(self.editUrl.text()))
		id=self.numtests
		datosrun=[self.target,self.fuzztype,self.filedicc]
		i=0
		self.comboListadoUrls.addItem(str(id)+"| "+datosrun[0]+" | "+datosrun[1]+" | "+datosrun[2].split("\\")[-1])
		self.comboListadoUrls.setCurrentIndex(id)
		for x in datosrun:
			a=QtGui.QTableWidgetItem()
			a.setText(x)
			if id%2 == 0:
				a.setBackgroundColor(QtGui.QColor(0, 177, 255, 94))
			else:
				a.setBackgroundColor(QtGui.QColor(0,0,100,127))	
			i+=1
		self.logsEdit.append("[+] Starting attack...")
		self.logsEdit.append("\tTarget: " + self.target)
		tim=time.localtime(time.time())
		startime=time.strftime("%H:%M:%S",tim)
		self.logsEdit.append("\tStart Time:" + startime)
		self.logsEdit.append("\tDictionary:" + str(self.filedicc))
		self.logsEdit.append("\tPayloads:" + str(self.totalreqs))
		self.numtests+=1
		self.numResults=0
		self.codes=[]	#Para el tema de los combos
		self.md5=[]
		self.lines=[]
		self.words=[]
		self.fz.Launch()
		self.res_id=0
		self.sourceEdit.clear()
		self.headersEdit.clear()
		self.textEdit_7.clear()
		self.rows=0
		self.lista_tope=0
		self.rows_poper=[]
		self.timer.start(150)
		self.botonLaunch.setEnabled(False)
		self.cancelButton.show()
		self.pauseButton.show()
		self.resumeButton.hide()
		self.cancelButton.setEnabled(True)
		self.comboListadoUrls.setEnabled(False)
		self.progressBar.show()	
		self.label_19.show()	
		self.progressBar.setMaximum(self.totalreqs)	
		self.progressBar.setMinimum(0)
		self.progressBar.setTextVisible(True)
		self.tabWidget.setCurrentIndex(2)

#############################################################################
#Code for the Analyzed combo box, to load info from attack
	def clicked_combo_url(self):
		position=int(self.comboListadoUrls.currentText().split("|")[0])
		self.statusbar.showMessage("Loading results..")
		self.limpiatablas()
		self.reqcounter=0
		self.charlens=[]
		self.words=[]
		self.lines=[]
		self.md5=[]
		self.words=[]
		self.codes=[]
#		position= row 
		self.res_run=[]
		self.sourceEdit.clear()
		#self.htmlEdit.clear()
		self.headersEdit.clear()
		self.textEdit_7.clear()
		self.target=self.AllRes[position][1]
		self.editUrl.setText(self.target)
		#poner toda la  lista
		self.headersinputEdit.setPlainText("")
		for x in self.AllRes[position][9]:
			self.headersinputEdit.appendPlainText(str(x))
		self.postinputEdit.setPlainText(self.AllRes[position][8])
		self.res_run=copy.deepcopy(self.AllRes[position][5])
		self.res_run_topop=copy.deepcopy(self.AllRes[position][5])
		if len(self.res_run)!=0:
			self.lengload=len(self.res_run)
			self.progressBar.setMaximum(self.lengload)
			self.progressBar.show()
			self.label_19.show()
			self.timer_load.start(0)
		else:
			pass
		self.statusbar.showMessage("")
	

	def clicked_url(self,row,col):
		self.statusbar.showMessage("Loading results..")
		self.limpiatablas()
		self.reqcounter=0
		self.charlens=[]
		self.words=[]
		self.lines=[]
		self.md5=[]
		self.words=[]
		self.codes=[]
		position= row 
		self.res_run=[]
		self.sourceEdit.clear()
		#self.htmlEdit.clear()
		self.headersEdit.clear()
		self.textEdit_7.clear()
		self.target=self.AllRes[position][1]
		self.editUrl.setText(self.target)
		#poner toda la  lista
		self.headersinputEdit.setPlainText("")
		for x in self.AllRes[position][9]:
			self.headersinputEdit.appendPlainText(str(x))
		self.postinputEdit.setPlainText(self.AllRes[position][8])
		self.res_run=copy.deepcopy(self.AllRes[position][5])
		self.res_run_topop=copy.deepcopy(self.AllRes[position][5])
		if len(self.res_run)!=0:
			self.lengload=len(self.res_run)
			self.progressBar.setMaximum(self.lengload)
			self.progressBar.show()
			self.label_19.show()
			self.timer_load.start(0)
		else:
			pass
		self.statusbar.showMessage("")
################################################################################
#Code to cancel,pause,resume the running attack
	def cancel(self):
		self.statusbar.showMessage("Stopping attack, please wait..")
		self.timer.stop()
		self.fz.stop()
		tim=time.localtime(time.time())
		startime=time.strftime("%H:%M:%S",tim)
		self.logsEdit.append("[-]Cancel time:" + startime)
		self.progressBar.reset()
		self.progressBar.hide()
		self.label_19.hide()
		self.logsEdit.append("============================")
		self.resumeButton.hide()
		self.pauseButton.hide()
		test=QtGui.QMessageBox.warning(None,str("Information"),
		"Attack cancel",0,1)
		self.botonLaunch.setEnabled(True)
		self.comboListadoUrls.setEnabled(True)
		self.statusbar.showMessage("Attack cancel.")
		self.cancelButton.hide()
		
	def pause(self):
		self.statusbar.showMessage("Attack paused at request:"
		+str(self.reqcounter))
		self.timer.stop()
		self.fz.stop()
		time.sleep(2)
		count=self.fz.numResults()
		if self.reqcounter< count:
			self.reqcounter=count
		tim=time.localtime(time.time())
		startime=time.strftime("%H:%M:%S",tim)
		self.logsEdit.append("[-] Pause time:" + startime)
		self.label_19.hide()
		self.logsEdit.append("============================")
		self.resumeButton.setEnabled(True)
		self.cancelButton.show()
		self.resumeButton.show()
		self.pauseButton.hide()

	def resume(self):
		self.statusbar.showMessage("Attack resume")
		self.fz.resum()
		self.fz.Launch()
		self.timer.start(100)
		self.resumeButton.hide()
		self.pauseButton.show()
		self.cancelButton.show()
###################################################################################	
#Code to save and load the session

	def save_results(self):
		fileName = QtGui.QFileDialog.getSaveFileName()
		if fileName != "":
			output = open(fileName, 'wb')
			pickle.dump(self.AllRes, output)
			output.close()
		else:
			pass
	
		
	def load_results(self):
		fileName = QtGui.QFileDialog.getOpenFileName()
		if len(fileName)>0:		
			unpicfile=file(fileName,"r")
			try:
				data=pickle.load(unpicfile)
				self.AllRes=['']
				self.AllRes=data
				self.comboListadoUrls.clear()
				for datosrun in self.AllRes:
					id=datosrun[0]
					datos=[datosrun[1],datosrun[2],datosrun[6]]
					i=0
					self.comboListadoUrls.addItem(str(id)+"| "+datos[0]+" | "+datos[1]+" | "+datos[2].split("\\")[-1])
					for x in datos:
						a=QtGui.QTableWidgetItem()
						a.setText(str(x))
						if id%2 == 0:
							a.setBackgroundColor(QtGui.QColor(0, 177, 255, 94))
						else:
							a.setBackgroundColor(QtGui.QColor(0,0,100,127))	
						i+=1
				self.tabWidget.setCurrentIndex(2)
				self.logsEdit.append("Session"+str(self.filedicc)+
				 " restored succesfuly")
				self.statusbar.showMessage("Session restored succesfully")
				self.clicked_url(0,0)
				self.webView.setUrl(QtCore.QUrl(""))
				self.sourceEdit.clear()
				self.headersEdit.clear()
				self.textEdit_7.clear()
				self.textHtml.clear()
			except:
				test=QtGui.QMessageBox.warning(None,str("Error"),
				"Failed loading results",0,1)
		else:
			pass
			
########################################################################################
#Code that fill the information for each requests
			
	def pinta_load(self,r,a):
		col=QtGui.QTableWidgetItem()
		a=int(a)
		res=[r.timer,r.code,r.lines,r.words,r.len,r.md5,r.req.description,r.cookie,r.location]
		self.tableResults.insertRow(a)
		self.tableResults.hideRow(a)	
		position=0
		for x in res:
			col.setText(str(x))
			if r.code==200:
				col.setBackgroundColor(QtGui.QColor(0,150,0,127))
			elif r.code==301:
				col.setBackgroundColor(QtGui.QColor(100,130,0,127))
			elif r.code==302:
				col.setBackgroundColor(QtGui.QColor(255,100,0,127))
			elif r.code==404:
				col.setBackgroundColor(QtGui.QColor(255,0,0,127))
			elif r.code==403:
				col.setBackgroundColor(QtGui.QColor(255,100,0,127))
			else:	
				col.setBackgroundColor(QtGui.QColor(255,255,0,127))
				pass
			self.tableResults.setItem(a,position,QtGui.QTableWidgetItem(col))
			position+=1		
		if self.codes.count(r.code):
			pass
		else:
			self.codes.append(r.code)
			self.ComboCodes.addItem(str(r.code))
		if self.charlens.count(r.len):
			pass
		else:
			self.charlens.append(r.len)
			self.ComboChars.addItem(str(r.len))
		if self.md5.count(r.md5):
			pass
		else:
			self.md5.append(r.md5)
			self.md5Combo.addItem(str(r.md5))
		if self.lines.count(r.lines):
			pass
		else:
			self.lines.append(r.lines)
			self.linesCombo.addItem(str(r.lines))
		if self.words.count(r.words):
			pass
		else:
			self.words.append(r.words)
			self.linesCombo_2.addItem(str(r.words))
				
	def open_url(self,row,col):
		for x in self.res_run:
				if x.id==row:
					url=x.completeUrl
				else:
					pass
		webbrowser.open(url)
		
	def clicked(self,row,col):
		from PyQt4 import QtNetwork
		for x in self.res_run:
			r=row-1
			if x.id == row:
				content=x.req.response.getContent()	
				headers=x.respHeaders
				raw=x.req.getAll()
				url=x.completeUrl
				url2=QtCore.QUrl(url.strip())
				request=QtNetwork.QNetworkRequest(url2)
				heads=x.req.getHeaders()
				if x.req.getPostData() != "":
					posts=x.req.getPostData()
				else:
					posts=""
		else:
			pass
		if self.private_surfing=="1":	
			if posts !="":
				for y in heads:
					key = y.split(": ")[0]
					val= y.split(": ")[1].lstrip()
					if key == "Content-Length":
						val=str(len(posts))
					request.setRawHeader(key,val)
				self.webView.load(request,QtNetwork.QNetworkAccessManager.Operation(4),str(posts))
			else: 
				for y in heads:
					key = y.split(": ")[0]
					val= y.split(": ")[1].lstrip()
					request.setRawHeader(key,val)
				self.webView.load(request,QtNetwork.QNetworkAccessManager.Operation(2))
			self.sourceEdit.clear()
		else:
			html="Not available in anonymous mode"
			self.webView.setHtml(QtCore.QString(html))
			
		self.browserLine.setText(url)
		self.headersEdit.clear()
		self.textEdit_7.clear()
		self.textHtml.clear()
		self.textEdit_7.append(str(raw))
		self.textHtml.append(content)
		self.sourceEdit.setPlainText(content)
		#self.highlight = highLighter.PythonHighlighter(self.sourceEdit)
		for x in headers:
			self.headersEdit.append(x[0]+": "+x[1])	
			
###################################################################################
#Code that will loop through all the request when loading an URL			
	def timer_loadres(self):
			req=self.res_run_topop.pop(0)
			self.pinta_load(req,self.reqcounter)
			self.reqcounter+=1
			self.progressBar.setValue(self.reqcounter)
			if self.reqcounter==self.lengload:
					self.timer_load.stop()
					tim=time.localtime(time.time())
					startime=time.strftime("%H:%M:%S",tim)
					self.logsEdit.append("Loading results..")
					self.logsEdit.append("Finish Time:" + startime)
					self.logsEdit.append("========================")
					self.botonLaunch.setEnabled(True)
					self.comboListadoUrls.setEnabled(True)
					self.progressBar.reset()
					self.progressBar.hide()
					self.label_19.hide()
					i=0
					self.tableResults.setSortingEnabled(False)
					for x in self.res_run:
							self.tableResults.showRow(i)
							i+=1
					self.tableResults.resizeRowsToContents()
					self.tableResults.resizeColumnsToContents()
			self.statusbar.showMessage('Results loaded')

#############################################################################
#Code that will loop through all the request during an attack
	def timerFunc(self):
		import time
		flag=0
		rec=1
		size=self.fz.numResults()
		if size>self.numResults:
			a=self.numResults
			for n in range(self.numResults,size):
				i=self.fz.getResult(n)
				self.reqcounter+=1
				if i.code != 0:
					self.progressBar.setValue(self.reqcounter)
					try:
						self.pintaResult(self.reqcounter,i)
					except:
						print "Error in pintaResults"
					self.statusbar.showMessage("Checking: "+ 
					str(self.reqcounter)+"/"+str(self.totalreqs)+" - "+ i.descrip)
				else:
					self.progressBar.setValue(self.reqcounter)
					self.statusbar.showMessage("Checking: "+ 
					str(self.reqcounter)+"/"+str(self.totalreqs)+" - "+ i.descrip)
					self.logsEdit.append("\tError with:"+ i.descrip)
				a+=1
				if self.reqcounter>=self.totalreqs:
					self.timer.stop()
					self.botonLaunch.setEnabled(True)
					self.cancelButton.setEnabled(False)
					self.comboListadoUrls.setEnabled(True)
					self.progressBar.reset()
					self.fz.delete()
					if self.recursionLevel!=0:
						self.logsEdit.append("\t[++] Going recursive:")
						self.statusbar.showMessage("Starting recursive attack..")
						rec=self.recursion()
						flag=1
					else:
						tim=time.localtime(time.time())
						startime=time.strftime("%H:%M:%S",tim)
						self.statusbar.showMessage(self.messages["attack1"])
						self.logsEdit.append(self.messages["attack0"] + startime)
						self.logsEdit.append("==================================")
						self.progressBar.reset()
						self.progressBar.hide()
						self.label_19.hide()
						self.comboListadoUrls.setEnabled(True)
						self.cancelButton.setEnabled(False)
						self.cancelButton.hide()
						self.pauseButton.hide()
						self.botonLaunch.setEnabled(True)
						self.tableResults.resizeColumnToContents(4)
						self.tableResults.resizeColumnToContents(5)
						self.tableResults.resizeColumnToContents(6)
						self.tableResults.resizeColumnToContents(7)
						self.tableResults.resizeColumnsToContents()
						self.tableResults.resizeRowsToContents()
					
					if rec==0:
						tim=time.localtime(time.time())
						startime=time.strftime("%H:%M:%S",tim)
						self.statusbar.showMessage(self.message["attack1"])
						self.logsEdit.append(self.message["attack0"]+ startime)
						self.logsEdit.append("==================================")
						self.progressBar.reset()
						self.progressBar.hide()
						self.label_19.hide()
						self.comboListadoUrls.setEnabled(True)
						self.cancelButton.setEnabled(False)
						self.cancelButton.hide()
						self.pauseButton.hide()
						self.botonLaunch.setEnabled(True)
						self.tableResults.resizeColumnToContents(4)
						self.tableResults.resizeColumnToContents(5)
						self.tableResults.resizeRowsToContents()
						return 0
			
			if flag!=1:
				self.numResults=size
######################################################################################
#Code that will fill all the info related a request while running an attack 	
	def pintaResult(self,a,r):
		#QCoreApplication.processEvents()
		#QApplication.processEvents(QEventLoop.AllEvents)
		col=QtGui.QTableWidgetItem()
		col.setText(str(r.code))
		#QApplication.processEvents()
		if (str(r.code) in self.ignore) or (str(r.lines) in self.ignore_lines) \
		or (str(r.len) in self.ignore_chars):
				del r
				pass
		else:
				r.id=self.res_id
				a=self.res_id
				self.res_id+=1
				self.res_run.append(r)
				self.AllRes[self.numtests-1][5].append(r)
				res=[r.timer,r.code,r.lines,r.words,r.len,r.md5,
				r.req.description,r.cookie,r.location]
				self.tableResults.insertRow(a)
				self.rows_poper.append(a)
				position=0
				if r.code==200:
					col.setBackgroundColor(QtGui.QColor(0,150,0,127))
				elif r.code==301:
					col.setBackgroundColor(QtGui.QColor(100,130,0,127))
				elif r.code==302:
					col.setBackgroundColor(QtGui.QColor(255,100,0,127))
				elif r.code==404:
					col.setBackgroundColor(QtGui.QColor(255,0,0,127))
				elif r.code==403:
					col.setBackgroundColor(QtGui.QColor(255,100,0,127))
				else:	
					col.setBackgroundColor(QtGui.QColor(255,255,0,127))
					pass
				for x in res:
						col.setText(str(x))
						self.tableResults.setItem(a,position,
						QtGui.QTableWidgetItem(col))
						position+=1
						
				#REVISAR Y METER IF DEPENDIENDO DE INCLUDE (TODOl)
				if str(self.actualretfilter)==str(r.code) or \
				 str(self.actualcharfilter)==str(r.len) or \
				  str(self.actualwordfilter)==str(r.words) or \
				   str(self.actuallinesfilter)==str(r.lines):
					if self.includefilter==0:
						self.tableResults.hideRow(a)	
					else:
						self.tableResults.showRow(a)	
				else:
					if self.includefilter==0 :
						self.tableResults.showRow(a)	
					elif self.actualretfilter =="" and \
					self.actualcharfilter == "" and\
					self.actualwordfilter =="" and \
					self.actuallinesfilter == "":
						self.tableResults.showRow(a)	
						#self.tableResults.hideRow(a)	
					else:
						self.tableResults.hideRow(a)	
				if self.codes.count(r.code):
					pass
				else:
					self.codes.append(r.code)
					self.ComboCodes.addItem(str(r.code))
				if self.charlens.count(r.len):
					pass
				else:
					self.charlens.append(r.len)
					self.ComboChars.addItem(str(r.len))
				if self.md5.count(r.md5):
					pass
				else:
					self.md5.append(r.md5)
					self.md5Combo.addItem(str(r.md5))
				if self.lines.count(r.lines):
					pass
				else:
					self.lines.append(r.lines)
					self.linesCombo.addItem(str(r.lines))
				if self.words.count(r.words):
					pass
				else:
					self.words.append(r.words)
					self.linesCombo_2.addItem(str(r.words))
					
################################################################
#Regular expression filtering
	
	def clearfilter(self):
		self.regexpLine.setText("")
		self.update_regular()
		
	def update_regular(self):
		text=str(self.regexpLine.text())
		reg=re.compile(text)
		regres=[]
		for x in self.res_run:
			content=x.req.response.getAll()
			regres=reg.findall(content)
			if regres ==[]:
				self.tableResults.hideRow(x.id)
			else:
				self.tableResults.showRow(x.id)
		self.tableResults.resizeRowsToContents()
		self.tableResults.resizeColumnToContents(4)
		self.tableResults.resizeColumnToContents(5)

################################################################
		
	def update_errors(self):
		reg=re.compile(self.commonerrors)
		regres=[]
		for x in self.res_run:
			content=x.req.response.getContent()
			regres=reg.findall(content)
			if regres ==[]:
				self.tableResults.hideRow(x.id)
			else:
				self.tableResults.showRow(x.id)
		self.tableResults.resizeRowsToContents()
		self.tableResults.resizeColumnToContents(4)
		self.tableResults.resizeColumnToContents(5)

##########################################################################
#Code to find in html and text view
	def finder(self):
		text=str(self.lineEdit_4.text())
		self.sourceEdit.find(text)
		self.textHtml.find(text)
		return
	
	def finder2(self):
		text=str(self.lineEdit_5.text())
		self.sourceEdit.find(text)
		self.textHtml.find(text)
		return


	def finder_requester(self):
		text=str(self.lineEdit_3.text())
		self.textBrowser.find(text)
		self.textEdit.find(text)
		return

###########################################################################
	
	def update_ret(self):
		if self.checkInclude.checkState():
			self.include=1
		else:
			self.include=0
			
		self.filteres=[]
		ret=self.ComboCodes.currentText()
		char=self.ComboChars.currentText()
		lines=self.linesCombo.currentText()
		words=self.linesCombo_2.currentText()
		md5=self.md5Combo.currentText()
		self.actualretfilter=ret
		self.actualcharfilter=char
		self.actualwordfilter=words
		self.actuallinesfilter=lines
		self.includefilter=self.include
		ai=0
		#Distintos
		if self.include==0:
			for x in self.res_run:
					if str(x.code)!=ret:
							if str(x.len)!=char:
									if str(x.lines)!=lines:
										if str(x.words)!=words:
											if str(x.md5)!=md5:
												self.tableResults.showRow(x.id)
												self.filteres.append(x)
											else:
												self.tableResults.hideRow(x.id)
										else:
											self.tableResults.hideRow(x.id)	
									else:
										self.tableResults.hideRow(x.id)
							else:
								self.tableResults.hideRow(x.id)
					else:
							self.tableResults.hideRow(x.id)
					ai+=1
		else:
			#Iguales
			locobox=[ret,char,lines,words,md5]
			for x in self.res_run:
				loco2=[str(x.code),str(x.len),str(x.lines),
				str(x.words),str(x.md5)]
				id=0
				qan=0
				match=0
				for z in locobox:
					if z!="---":
						qan+=1
						if locobox[id]==loco2[id]:
							match+=1
						else:
							pass
					else:
						pass
					id+=1
				if qan==match:
					self.tableResults.showRow(x.id)
					self.filteres.append(x)
				else:
					self.tableResults.hideRow(x.id)
		self.tableResults.resizeRowsToContents()
		self.tableResults.resizeColumnToContents(4)
		self.tableResults.resizeColumnToContents(5)


##########################################################################

	def limpia_Analyzed(self):
		self.AnalyzedUrls.clear()
		self.AnalyzedUrls.setColumnCount(3)
		self.AnalyzedUrls.setRowCount(0)
		headerItem5 = QtGui.QTableWidgetItem()
		headerItem6 = QtGui.QTableWidgetItem()
		headerItem6.setText(QtGui.QApplication.translate("Form",
		 "URL", None, QtGui.QApplication.UnicodeUTF8))
		self.AnalyzedUrls.setHorizontalHeaderItem(0,headerItem6)
		headerItem7 = QtGui.QTableWidgetItem()
		headerItem7.setText(QtGui.QApplication.translate("Form",
		 "FUZZtype", None, QtGui.QApplication.UnicodeUTF8))
		self.AnalyzedUrls.setHorizontalHeaderItem(1,headerItem7)
		headerItem8 = QtGui.QTableWidgetItem()
		headerItem8.setText(QtGui.QApplication.translate("Form",
		 "Dictionary", None, QtGui.QApplication.UnicodeUTF8))
		self.AnalyzedUrls.setHorizontalHeaderItem(2,headerItem8)
		

####################################################################################
#Clean all the tables

	def limpiatablas(self):
		self.ComboCodes.clear()
		self.ComboChars.clear()
		self.linesCombo.clear()
		self.linesCombo_2.clear()
		self.ComboChars.clear()
		self.md5Combo.clear()
		self.ComboCodes.addItem("---")
		self.linesCombo.addItem("---")
		self.linesCombo_2.addItem("---")
		self.md5Combo.addItem("---")
		self.ComboChars.addItem("---")
		self.tableResults.clear()
		self.tableResults.setRowCount(0)
		self.tableResults.setColumnCount(9)
		headerItem2 = QtGui.QTableWidgetItem()
		headerItem2.setText(QtGui.QApplication.translate("Form",
		 "Timer", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(0,headerItem2)
		headerItem4 = QtGui.QTableWidgetItem()
		headerItem4.setText(QtGui.QApplication.translate("Form",
		 "Code", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(1,headerItem4)
		headerItem5 = QtGui.QTableWidgetItem()
		headerItem5.setText(QtGui.QApplication.translate("Form",
		 "Lines", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(2,headerItem5)
		headerItem6 = QtGui.QTableWidgetItem()
		headerItem6.setText(QtGui.QApplication.translate("Form",
		 "Words", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(3,headerItem6)
		headerItem7 = QtGui.QTableWidgetItem()
		headerItem7.setText(QtGui.QApplication.translate("Form",
		 "Chars", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(4,headerItem7)
		headerItem8 = QtGui.QTableWidgetItem()
		headerItem8.setText(QtGui.QApplication.translate("Form",
		 "MD5", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(5,headerItem8)
		headerItem3 = QtGui.QTableWidgetItem()
		headerItem3.setText(QtGui.QApplication.translate("Form",
		 "Payload", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(6,headerItem3)
		headerItem9 = QtGui.QTableWidgetItem()
		headerItem9.setText(QtGui.QApplication.translate("Form",
		 "Cookie", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(7,headerItem9)
		headerItem10 = QtGui.QTableWidgetItem()
		headerItem10.setText(QtGui.QApplication.translate("Form",
		 "Location", None, QtGui.QApplication.UnicodeUTF8))
		self.tableResults.setHorizontalHeaderItem(8,headerItem10)
				

##################################################
#Code for the Requester (need improvements)

	def sendrequest(self,server,port,post,request,ssl):
			import socket
			prt = port
			host = server
			req = request
			length=len(post)
			if length == 0:
				peticion = req + "\r\n\r\n"
			else:
				import re
				req=re.sub("Content-Length: .*\n","",req)
				peticion = req + "\r\n" + "Content-Length:" +\
				str(length) +"\r\n\r\n" + post + "\r\n\r\n"
			
			skt = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
			skt.settimeout(8)
			try:
				skt.connect((host, prt))
			except socket.error,err:
				print "Error %s" % err[0]
				test=QtGui.QMessageBox.warning(None,str("Information"),
				"Socket error, check host and port.",0,1)
				return	
			if ssl=="Yes":
				try:
					sslskt = socket.ssl(skt)
					sslskt.write(peticion)
					res = sslskt.read()
					raw = res.encode("String_Escape")
				except socket.sslerror, error:
					if error[0] != 8:
						test=QtGui.QMessageBox.warning(None,str("Information"),
						"Could'nt connect SSL socket",0,1)
						return
			else:
				skt.send(peticion)
				res = skt.recv(10000)
				while 1:
					block = skt.recv(1024)
					if not block:
						break
					res += block
				raw= res.encode("String_Escape")
			return res,raw	

	
	def reqSet(self):
		text=self.comboBox.currentText()
		verb=text.split(' ')[0]
		server=str(self.serverLine.text())
		if verb=="SEARCH":
			req="SEARCH / HTTP/1.1\n"
			req+="Host: "+server+"\n"
			req+="Content-Type: text/xml\n"
			post="<?xml version=\"1.0\"?>\n"
			post+="<D:searchrequest xmlns:D = \"DAV:\">\n"
			post+="\t<D:sql>\n"
			post+="\tSELECT \"DAV:href\"\n"
			post+="\tFROM SCOPE('hierarchical traversal of \"/\"')\n"
			post+="\t</D:sql>\n"
			post+="</D:searchrequest>\n"
			self.requestEdit.setPlainText(req)
			self.postEdit.setPlainText(post)
		elif verb=="None":
			post=""
			req=""
			self.postEdit.setPlainText(post)
			self.requestEdit.setPlainText(req)
		else:
			self.requestEdit.setPlainText(text)
			self.postEdit.clear()
			
#################################################################
	
	def  send_to_requester(self):
		import urlparse
		row=self.tableResults.currentRow()
		if row != -1:
			for x in self.res_run:
				if x.id==row:
					prot,host,path,d,variables,f=urlparse.urlparse(x.completeUrl)
					self.serverLine.setText(host)
					#Arreglar esto, es cutre tengo que buscar que puerto tiene.
					if prot=="https":
						self.portLine.setText("443")
						self.sslCombo.setCurrentIndex(0)
					else:
						self.portLine.setText("80")
					req=str(x.req.getAll_wpost())
					post=x.req.getPostData()
			self.requestEdit.clear()
			if post!="":
				newreq=req.replace('keep-alive','close')
				if req.count('Content-Type'):
					pass
				else:
					self.requestEdit.append("Content-Type: application/x-www-form-urlencoded")
			else:
				if req.count("HTTP/1.1"):
					req+="Connection: close"
				newreq=req
			self.requestEdit.append(newreq.rstrip("\n"))
			self.postEdit.setPlainText(post)
		return

####################################################################################
	def launch_req(self):
		self.oldrequest=self.lastreq
		self.server=str(self.serverLine.text())
		self.port=int(self.portLine.text())
		self.ssl=str(self.sslCombo.currentText())
		self.req=str(self.requestEdit.toPlainText())
		self.post=str(self.postEdit.toPlainText())
		self.res,self.raw=self.sendrequest(self.server,self.port,
		self.post,self.req,self.ssl)
		self.textBrowser.clear()
		self.lastreq=self.res.split("\r\n\r\n",1)[1]
		self.textBrowser.append(self.res.split("\r\n\r\n",1)[1])
		self.textEdit.clear()
		self.textEdit.setPlainText(self.res)
		#self.highlight = highLighter.PythonHighlighter(self.textEdit)
		
	def clean_box(self):
		self.textBrowser.clear()
		self.textEdit.clear()

	def show_diff(self):
		self.diffText.clear()
		self.diffText.append(textDiff(self.lastreq,self.oldrequest))

	def cleanEncoder(self):
		self.ouputencoderTextedit.clear()


################################################### PAYLOAD GENERATOR ################################################

	def addDict(self):
		fileName = QtGui.QFileDialog.getOpenFileName()
		if fileName:
			a=open(fileName,"r")
			words=[]
			for i in a:
				words.append (i.strip())
			self.diccList.addItems(words)

	def saveDict(self):
		fileName = QtGui.QFileDialog.getSaveFileName()
		if fileName:
			count = self.diccList.count()
			f=open(fileName,"w")
			for i in range(count):
				f.write(self.diccList.item(i).text()+"\r\n")
			f.close()

	def create_dict(self):
		dict=[]
		count = self.diccList.count()
		for i in range(count):
			dict.append(str(self.diccList.item(i).text()))
		import random
		random.shuffle(dict)
		return dict

	def clearDict(self):
		self.diccList.clear()
	
	def payfile(self):
		fileName = QtGui.QFileDialog.getOpenFileName()
		if fileName:
			newpay=dictio.dictionary()
			newpay.setpayload(payloads.payload_file(fileName))
			if self.encodingCombo_3.currentText()!="None":
				newpay.setencoder( getattr(encoders,self.ENCODERS[str
				(self.encodingCombo_3.currentText())])() )
			self.PAYLOADS["PFile%02d" % (self.payloadNum)]=newpay
			self.payloadList.addItem("PFile%02d" % (self.payloadNum))
			self.payloadNum+=1

	def addRange(self):
		if self.fromSpin.value() < self.toSpin.value():
			newpay=dictio.dictionary()
			if self.encodingCombo_3.currentText()!="None":
				newpay.setencoder( getattr(encoders,self.ENCODERS[str(
				self.encodingCombo_3.currentText())])() )
			if self.fixCheck.checkState()==QtCore.Qt.Unchecked:
				newpay.setpayload(payloads.payload_range("%d-%d" %
				 (self.fromSpin.value(),self.toSpin.value()) ))
			else:
				newpay.setpayload(payloads.payload_range("%d-%d" %
				 (self.fromSpin.value(),self.toSpin.value()),
				self.widthSpin.value()))
			self.PAYLOADS["PRange%02d" % (self.payloadNum)]=newpay
			self.payloadList.addItem("PRange%02d" % (self.payloadNum))
			self.payloadNum+=1

	def addWord(self):
		if self.wodEdit.text():
			self.wordsList.addItem(self.wodEdit.text())
			self.wodEdit.setText('')

	def addWord_2(self):
		if self.wodEdit_2.text():
			self.wordsList_3.addItem(self.wodEdit_2.text())
			self.wodEdit_2.setText('')
			self.wodEdit_2.setFocus()

	def deleteWord(self):
		if self.wordsList.currentRow()>-1:
			self.wordsList.takeItem( self.wordsList.currentRow())

	def deleteWord_2(self):
		if self.wordsList_3.currentRow()>-1:
			self.wordsList_3.takeItem( self.wordsList_3.currentRow())

	def dropPayload(self):
		if self.payloadList.currentRow()>-1:
			a=self.payloadList.takeItem( self.payloadList.currentRow())
			del self.PAYLOADS[str(a.text())]

	def clearSelection(self):
		a=self.diccList.selectedItems()
		for i in a:
			self.diccList.takeItem(self.diccList.row(i))
		
	def addPermutation(self):
		charset=str(self.wodEdit.text())
		width=int(self.wodEdit_3.text())
		set=[]
		for x in charset:
			set.append(x)
		words=self.xcombinations(set,width)
		listawords=[]
		for x in words:
			listawords.append(''.join(x))
		
		newpay=dictio.dictionary()
		newpay.setpayload(payloads.payload_list(listawords))
		if self.encodingCombo_3.currentText()!="None":
			newpay.setencoder( getattr(encoders,self.ENCODERS[str(
			self.encodingCombo_3.currentText())])() )
		
		self.PAYLOADS["PPerm%02d" % (self.payloadNum)]=newpay
		self.payloadList.addItem("PPerm%02d" % (self.payloadNum))
		self.payloadNum+=1
	
	def addPermutation_old(self):
		words=[]
		count = self.wordsList.count()
		if count:
			for i in range(count):
				words.append(str(self.wordsList.item(i).text()))
			words=self.permuteWords2(words)
			newpay=dictio.dictionary()
			newpay.setpayload(payloads.payload_list(words))
			if self.encodingCombo_3.currentText()!="None":
				newpay.setencoder( getattr(encoders,self.ENCODERS[str(self.encodingCombo_3.currentText())])() )
			self.PAYLOADS["PPerm%02d" % (self.payloadNum)]=newpay
			self.payloadList.addItem("PPerm%02d" % (self.payloadNum))
			self.payloadNum+=1

	def xcombinations(self,items, n):
		if n==0:
			yield []
		else:
			for i in xrange(len(items)):
				for cc in self.xcombinations(items[:i]+items[i+1:],n-1):
					yield [items[i]]+cc

	def addPermutation_users(self):
		words=[]
		count = self.wordsList_3.count()
		if count:
			for i in range(count):
				words.append(str(self.wordsList_3.item(i).text()))
			words=self.permuteWords(words)
			newpay=dictio.dictionary()
			newpay.setpayload(payloads.payload_list(words))
			if self.encodingCombo_3.currentText()!="None":
				newpay.setencoder( getattr(encoders,self.ENCODERS[str(self.encodingCombo_3.currentText())])() )
			self.PAYLOADS["PUsr%02d" % (self.payloadNum)]=newpay
			self.payloadList.addItem("PUsr%02d" % (self.payloadNum))
			self.payloadNum+=1
	
	def addCreditCards(self):
		words=[]
		count = self.listWidget.count()
		if count:
			for i in range(count):
				words.append(str(self.listWidget.item(i).text()))
			newpay=dictio.dictionary()
			newpay.setpayload(payloads.payload_list(words))
			if self.encodingCombo_3.currentText()!="None":
				newpay.setencoder( getattr(encoders,self.ENCODERS[str(
				self.encodingCombo_3.currentText())])() )
			self.PAYLOADS["PCred%02d" % (self.payloadNum)]=newpay
			self.payloadList.addItem("PCred%02d" % (self.payloadNum))
			self.payloadNum+=1

	def permuteWords(self,list):
		from sets import Set
		possibleusernames=[]
		#name=(name.strip()).lower()
		name=""
		for x in list:
			if name=="":
				name=name+x
			else:
				name=name+" "+x
		if " " in name:
			parts=name.split()
			possibleusernames.append(parts[0])
			possibleusernames.append(parts[0]+"."+parts[1])
			possibleusernames.append(parts[0]+parts[1])
			possibleusernames.append(parts[0]+"."+parts[1][0])
			possibleusernames.append(parts[0][0]+"."+parts[1])
			possibleusernames.append(parts[0]+parts[1][0])
			possibleusernames.append(parts[0][0]+parts[1])
			str1=""
			str2=""
			str3=""
			str4=""
			for i in range(0,len(parts)-1):
				 str1=str1+parts[i]+"."
				 str2=str2+parts[i]
				 str3=str3+parts[i][0]+"."
				 str4=str4+parts[i][0]
			str5=str1+parts[-1]
			str6=str2+parts[-1]
			str7=str4+parts[-1]
			str8=str3+parts[-1]
			str9=str2+parts[-1][0]
			str10=str4+parts[-1][0]
			possibleusernames.append(str5)
			possibleusernames.append(str6)
			possibleusernames.append(str7)
			possibleusernames.append(str8)
			possibleusernames.append(str9)
			possibleusernames.append(str10)
			possibleusernames.append(parts[-1])
			possibleusernames.append(parts[0]+"."+parts[-1])
			possibleusernames.append(parts[0]+parts[-1])
			possibleusernames.append(parts[0]+"."+parts[-1][0])
			possibleusernames.append(parts[0][0]+"."+parts[-1])
			possibleusernames.append(parts[0]+parts[-1][0])
			possibleusernames.append(parts[0][0]+parts[-1])
			return possibleusernames
		else:
			possibleusernames.append(name)
		return possibleusernames

	def permuteWords2(self,list):
		l=len(list)
		words=[]
		if l==2:
			return [list[0]+list[1],list[1]+list[0]]
		elif l<2:
			return list
		else:
			for i in range (l):
				newlist=self.permuteWords(list[0:i]+list[i+1:])
				for j in newlist:
					words.append(list[i]+j)	
		return words

	def creaListaFuzz(self):
		palabra=str(self.blockStringEdit.text())
		inicio=int(self.blockMinEdit.text())
		fin=int(self.blockMaxEdit.text())
		incremento=int(self.blockStepsEdit.text())

		newpay=dictio.dictionary()
   		listaResultado = []
		palabraTmp = palabra * inicio
		i = 0
		while i<=((fin-inicio+1)/incremento):
			listaResultado.append(palabraTmp)
			palabraTmp = palabraTmp + (palabra)*incremento
			i = i+1

		newpay.setpayload(payloads.payload_list(listaResultado))
		self.PAYLOADS["PBlock%02d" % (self.payloadNum)]=newpay
		self.payloadList.addItem("PBlock%02d" % (self.payloadNum))
		self.payloadNum+=1

	def generateDict(self):
		string=str(self.patternEdit.text())
		if string:
			substs=re.findall("\[@[a-zA-Z0-9]+@\]",string)
			payloads=re.findall("[a-zA-Z0-9]+"," ".join(substs))

			for i in payloads:
				if not i in self.PAYLOADS:
					mb = QtGui.QMessageBox ("Pattern error","Payload [@%s@] does not exists" % (i),QtGui.QMessageBox.Warning,1,0,0)
					mb.exec_()
					return 

			result = self.buildPattern(string,payloads,len(payloads)-1)
			self.diccList.addItems(result)
			print "GenerateDict"

	def buildPattern (self,patt,payloads,level):
		if level==-1:
			return [patt]
		else:
			newset=self.buildPattern(patt,payloads,level-1)
			newset2=[]
			for i in newset:
				dicc=dictio.dictionary(self.PAYLOADS[payloads[level]])
				for j in dicc:
					strin=i.replace("[@"+payloads[level]+"@]",j,1)
					newset2.append(strin)
			return newset2

	def applyRegex (self):
		cnt=self.diccList.count()
		if str(self.regex1Edit.text()):
			try:
				rx=re.compile(str(self.regex1Edit.text()))
			except:
				mb = QtGui.QMessageBox ("Error",
				"Regex does not compile",QtGui.QMessageBox.Warning,1,0,0)
				mb.exec_()
				return 
			for i in range(cnt):
				a=self.diccList.takeItem(i)
				txt=str(a.text())
				txt=rx.sub(str(self.regex2Edit.text()),txt)
				a.setText(txt)
				self.diccList.insertItem(i,a)

	def applySet (self):
		if len (str(self.set1Edit.text()))!=len (str(self.set2Edit.text())):
			mb = QtGui.QMessageBox ("Error",
			"Set 1 and set 2 have different lengths",
			QtGui.QMessageBox.Warning,1,0,0)
			mb.exec_()
			return 
		trns=string.maketrans(str(self.set1Edit.text()),
		str(self.set2Edit.text()))
		cnt=self.diccList.count()
		for i in range(cnt):
			a=self.diccList.takeItem(i)
			txt=str(a.text())
			txt=txt.translate(trns)
			a.setText(txt)
			self.diccList.insertItem(i,a)

###########################ENCODER##################################################
###########################ENCODER##################################################
	def encode(self):
		clear=str(self.inputencoderTextedit.toPlainText())
		type=self.encoderCombo.currentText()
		if type == "urlencode":
			a=encoders.encoder_urlencode()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkBlue"))
		elif type == "double urlencode":
			a=encoders.encoder_double_urlencode()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkGreen"))
		elif type == "base64":
			a=encoders.encoder_base64()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkRed"))
		elif type == "uri hexadecimal":
			a=encoders.encoder_uri_hex()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkCyan"))
		elif type == "random Uppercase":
			a=encoders.encoder_random_upper()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkGray"))
		elif type == "double nibble Hexa":
			a=encoders.encoder_doble_nibble_hex()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkGray"))
		elif type == "sha1":
			a=encoders.encoder_sha1()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Blue"))
		elif type == "md5":
			a=encoders.encoder_md5()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Red"))
		elif type == "binary Ascii":
			a=encoders.encoder_binascii()
			res=a.encode(clear)
		elif type == "html encoder":
			a=encoders.encoder_html()
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Green"))
			res=a.encode(clear)
		elif type == "html encoder decimal":
			a=encoders.encoder_html_decimal()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Magenta"))
		elif type == "html encoder Hexa":
			a=encoders.encoder_html_hexadecimal()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkMagenta"))
		elif type == "utf8 binary":
			a=encoders.encoder_utf8_binary()
			res=a.encode(clear)
		elif type == "utf8":
			a=encoders.encoder_utf8()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Cyan"))
		elif type == "mysql char":
			a=encoders.encoder_mysqlchar()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Green"))
		elif type == "mssql Char":
			a=encoders.encoder_mssqlchar()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Red"))
		elif type == "oracle Char":
			a=encoders.encoder_oraclechar()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Cyan"))
		elif type == "uri unicode":
			a=encoders.encoder_uri_unicode()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Red"))
		
		elif type == "All":
			a=encoders.encoder_urlencode()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkBlue"))
			self.ouputencoderTextedit.append("Urlencode" +" : "+  res)
			a=encoders.encoder_double_urlencode()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkGreen"))
			self.ouputencoderTextedit.append("Double Urlencode" +" : "+  res)
			a=encoders.encoder_base64()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkRed"))
			self.ouputencoderTextedit.append("Base 64" +" : "+  res)
			a=encoders.encoder_uri_hex()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkCyan"))
			self.ouputencoderTextedit.append("Uri Hexadecimal" +" : "+  res)
			a=encoders.encoder_random_upper()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkGray"))
			self.ouputencoderTextedit.append("Random upper" +" : "+  res)
			a=encoders.encoder_doble_nibble_hex()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkGray"))
			self.ouputencoderTextedit.append("Double nibble hexa" +" : "+  res)
			a=encoders.encoder_sha1()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Blue"))
			self.ouputencoderTextedit.append("SHA1" +" : "+  res)	
			a=encoders.encoder_md5()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Red"))
			self.ouputencoderTextedit.append("MD5" +" : "+  res)
			a=encoders.encoder_binascii()
			res=a.encode(clear)
			
			a=encoders.encoder_html()
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Green"))
			self.ouputencoderTextedit.append("Binary Ascii" +" : "+  res)
			res=a.encode(clear)
			

			a=encoders.encoder_html_decimal()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Magenta"))
			self.ouputencoderTextedit.append("Html Decimal" +" : "+  res)
			
			a=encoders.encoder_html_hexadecimal()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("DarkMagenta"))
			self.ouputencoderTextedit.append("Html Hexadecimal" +" : "+  res)
			
			a=encoders.encoder_utf8_binary()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Green"))
			self.ouputencoderTextedit.append("UTF-8 Binary" +" : "+  res)
			
			a=encoders.encoder_utf8()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Red"))
			self.ouputencoderTextedit.append("UTF-8" +" : "+  res)
			
			a=encoders.encoder_mysqlchar()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Green"))
			self.ouputencoderTextedit.append("Mysql char" +" : "+  res)
			
			a=encoders.encoder_mssqlchar()
			res=a.encode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Red"))
			self.ouputencoderTextedit.append("MSsql char" +" : "+  res)
		elif type=="None":
			pass
		self.ouputencoderTextedit.append(type +" : "+  res)
	

	def decode(self):
		clear=str(self.inputencoderTextedit.toPlainText())
		type=self.decoderCombo.currentText()
		if type=="base64":
			a=encoders.encoder_base64()
			res=a.decode(clear)
			if res != "1":
				self.ouputencoderTextedit.setTextColor(QtGui.QColor("Green"))
				self.ouputencoderTextedit.append("Base64" +" : "+  res)
			else:
				mb = QtGui.QMessageBox ("Error","Error in input string,\
				 check the padding",QtGui.QMessageBox.Warning,1,0,0)
		elif type=="urlencode":
			a=encoders.encoder_base64()
			res=a.decode(clear)
			if res != "1":
				self.ouputencoderTextedit.setTextColor(QtGui.QColor("Blue"))
				self.ouputencoderTextedit.append("Urlencode" +" : "+  res)
			else:	
				mb = QtGui.QMessageBox ("Error","Error in input string, \
				check if it urlencoded",QtGui.QMessageBox.Warning,1,0,0)
		elif type=="Binary Ascii":
			import binascii
			try:
				res = binascii.unhexlify(clear)
				self.ouputencoderTextedit.setTextColor(QtGui.QColor("Cyan"))
				self.ouputencoderTextedit.append("Binary Ascii" +" : "+  res)
			except:
				mb = QtGui.QMessageBox ("Error","Error in input string,\
				check the padding",QtGui.QMessageBox.Warning,1,0,0)
		elif type=="None":
			pass		
		elif type=="Mssql Char":
			a=encoders.encoder_mssqlchar()
			res=a.decode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Red"))
			self.ouputencoderTextedit.append("Mssql Char" +" : "+  res)
		elif type=="Oracle Char":
			a=encoders.encoder_oraclechar()
			res=a.decode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Blue"))
			self.ouputencoderTextedit.append("Oracle Char" +" : "+  res)
		elif type=="Mysql Char":
			a=encoders.encoder_mysqlchar()
			res=a.decode(clear)
			self.ouputencoderTextedit.setTextColor(QtGui.QColor("Green"))
			self.ouputencoderTextedit.append("Mysql Char" +" : "+  res)
		

#############################################################################
#Code for diffing (not implemented yet)
			
def html2list(x, b=0):
	mode = 'char'
	cur = ''
	out = []
	for c in x:
		if mode == 'tag':
			if c == '>':
				if b: cur += ']'
				else: cur += c
				out.append(cur); cur = ''; mode = 'char'
			else: cur += c
		elif mode == 'char':
			if c == '<':
				out.append(cur)
				if b: cur = '['
				else: cur = c
				mode = 'tag'
			elif c in string.whitespace: out.append(cur+c); cur = ''
			else: cur += c
	out.append(cur)
	return filter(lambda x: x is not '', out)


def textDiff(a, b):
	"""Takes in strings a and b and returns a human-readable HTML diff."""

	a=a.replace("<","&lt;")
	b=b.replace("<","&lt;")
	a=a.replace(">","&gt;")
	b=b.replace(">","&gt;")

	out = []
	a, b = html2list(a), html2list(b)
	s = difflib.SequenceMatcher(None, a, b)
	for e in s.get_opcodes():
		if e[0] == "replace":
			# @@ need to do something more complicated here
			# call textDiff but not for html, but for some html... ugh
			# gonna cop-out for now
			out.append('<font style="BACKGROUND-COLOR:\
			 red">'+''.join(a[e[1]:e[2]]) + '</font><font style="BACKGROUND-\
			 COLOR: green">'+''.join(b[e[3]:e[4]])+"</font>")
		elif e[0] == "delete":
			out.append('<font style="BACKGROUND-COLOR: red">'+
			 ''.join(a[e[1]:e[2]]) + "</font>")
		elif e[0] == "insert":
			out.append('<font style="BACKGROUND-COLOR: \
			green">'+''.join(b[e[3]:e[4]]) + "</font>")
		elif e[0] == "equal":
			out.append(''.join(b[e[3]:e[4]]))
		else: 
			raise "Um, something's broken. I didn't expect a '" + `e[0]` + "'."
	
	html=''.join(out)
	html=html.replace("\n","<br>")
	html=html.replace("\t","&nbsp;&nbsp;&nbsp;&nbsp;")
	return html
