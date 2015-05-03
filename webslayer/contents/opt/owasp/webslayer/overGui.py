#from PyQt4.QtCore import *
#from PyQt4.QtGui import * 
from PyQt4.QtCore import *
from PyQt4.QtGui import *
from PyQt4 import QtCore,QtGui

class ListPay(QtGui.QListWidget):
	def _init_(self,parent=None):
		super(ListPay, self._init_(parent))
		self.setAcceptDrops(True)
		self.setDragEnabled(True)
		self.dropAction = Qt.CopyAction

	def dragEnterEvent(self,event):
		event.accept()

	def dragMoveEvent(self, event):
		event.setDropAction(Qt.CopyAction)
		event.accept()

	def setCopyAction(self):
		self.dropAction = Qt.CopyAction
	
	def startDrag(self, dropActions):
		item=self.currentItem()
		data =QByteArray()
		stream=QDataStream(data,QIODevice.WriteOnly)
		stream << item.text()
		mimeData = QMimeData()
		mimeData.setData("application-x-text",data)
		drag =QDrag(self)
		drag.setMimeData(mimeData)
		if drag.start(Qt.MoveAction|Qt.CopyAction) == Qt.MoveAction:
			self.takeItem(self.row(item))
	
	def setMoveAction(self):
		self.dropAction=Qt.MoveAction
	
	def dropEvent(self, event):
		if event.mimeData().hasFormat("application/x-icon-and-text"):
			data = event.mimeData().data("application/x-icon-and-text")
			stream = QDataStream(data, QIODevice.ReadOnly)
	  		text = QString()
			icon = QIcon()
			stream >> text >> icon
			menu = QMenu(self)
			menu.addAction("&Copy", self.setCopyAction)
			menu.addAction("&Move", self.setMoveAction)
			menu.exec_(QCursor.pos())
			item = QListWidgetItem(text, self)
			item.setIcon(icon)
			event.setDropAction(self.dropAction)	
			event.accept()
	  	else:
			event.ignore()

class DropLine(QtGui.QLineEdit):
	def _init_(self,parent=None):
		super(DropLine, self._init_(parent))
		self.setAcceptDrops(True)

	def dragEnterEvent(self,event):
		event.accept()

	def dragMoveEvent(self, event):
		event.setDropAction(Qt.CopyAction)
		event.accept()

	def dropEvent(self,event):
		data=event.mimeData().data("application-x-text")
		print data
		stream = QtCore.QDataStream(data,QtCore.QIODevice.ReadOnly)
		text=QtCore.QString()
		stream >> text
		test=self.text()
		test+="[@"+text+"@]"
		self.setText(test)
		event.setDropAction(Qt.CopyAction)
		event.accept()


