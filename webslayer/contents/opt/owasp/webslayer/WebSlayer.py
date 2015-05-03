#!/usr/bin/python
#Coded by Christian Martorella cmartorella@edge-security.com

import sys
from PyQt4 import QtGui
from wf import *

app = QtGui.QApplication(sys.argv)
#window = QtGui.QWidget()

window = QtGui.QMainWindow()
ui = Ui_MainWindow()
ui.setupUi(window)
pix=QtGui.QPixmap("images/logo2.png")
splash=QtGui.QSplashScreen(pix)
splash.setMask(pix.mask())
splash.show()
app.processEvents()
time.sleep(1.5)
window.show()
splash.finish(window)
sys.exit(app.exec_())

