#!/usr/bin/env python
# Copyright (c) 2007 Qtrac Ltd. All rights reserved.
# This program or module is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as published
# by the Free Software Foundation, either version 3 of the License, or (at
# your option) any later version. It is provided for educational purposes
# and is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
# more details.

import os
import sys
from PyQt4.QtCore import *
from PyQt4.QtGui import *
#import qrc_resources


__version__ = "1.0.0"


class PythonHighlighter(QSyntaxHighlighter):

	Rules = []
	Formats = {}
	TEST = ["body","title","td","table","tr","b","script","html","form","h1","h2","h3","script","meta","style","div","br","head","a","ul","li","p","label","strong","option","a"]
	ERROR = ["error","type mismatch","ORA-","sql","exception","system","XSS","invalid","illegal","stack","ODBC","SQL","syntax","unknown","uid","c:\\","password"]

	def __init__(self, parent=None):
		super(PythonHighlighter, self).__init__(parent)
		self.initializeFormats()

		html=QRegExp("|".join([r"<%s>" % test for test in PythonHighlighter.TEST]))
		a=Qt.CaseInsensitive
		html.setCaseSensitivity(a)
		PythonHighlighter.Rules.append((html,"test"))

		htmlclose=QRegExp("|".join([r"</%s>" % test for test in PythonHighlighter.TEST]))
		a=Qt.CaseInsensitive
		htmlclose.setCaseSensitivity(a)
		PythonHighlighter.Rules.append((htmlclose,"test"))

		error=QRegExp("|".join([r" %s.*" % error for error in PythonHighlighter.ERROR]))
		a=Qt.CaseInsensitive
		error.setCaseSensitivity(a)
		PythonHighlighter.Rules.append((error,"error"))

#Pyt	honHighlighter.Rules.append((QRegExp(r"\b@\w+\b"), "decorator"))
		PythonHighlighter.Rules.append((QRegExp(r"#.*"), "comment"))       
		PythonHighlighter.Rules.append((QRegExp(r"<!--.*-->"), "comment"))       
#stringRe = QRegExp(r"""(?:'[^']*'|"[^"]*")""")
#stringRe.setMinimal(True)
#PythonHighlighter.Rules.append((stringRe, "string"))
#self.stringRe = QRegExp(r"""(:?"["]".*"["]"|'''.*''')""")
#self.stringRe.setMinimal(True)
#a=Qt.CaseInsensitive
#self.stringRe.setCaseSensitivity(a)
#PythonHighlighter.Rules.append((self.stringRe, "string"))
#self.tripleSingleRe = QRegExp(r"""'''(?!")""")
#self.tripleDoubleRe = QRegExp(r'''"""(?!')''')


	@staticmethod
	def initializeFormats():
		baseFormat = QTextCharFormat()
		baseFormat.setFontFamily("courier")
		baseFormat.setFontPointSize(10)
		for name, color, bold, italic in (
			("normal", "#000000", False, False),
			#("keyword", "#000080", True, False),
			#("builtin", "#0000A0", False, False),
			("test", "#0000A0", False, False),
			#("constant", "#0000C0", False, False),
			("decorator", "#0000E0", False, False),
			("comment", "#007F00", False, True),
			#("string", "#808000", False, False),
			#("number", "#924900", False, False),
			("error", "#FF0000", True, False)):
			format = QTextCharFormat(baseFormat)
			format.setForeground(QColor(color))
			if bold:
				format.setFontWeight(QFont.Bold)
			format.setFontItalic(italic)
			PythonHighlighter.Formats[name] = format


	def highlightBlock(self, text):
		NORMAL, TRIPLESINGLE, TRIPLEDOUBLE, ERROR = range(4)
		textLength = text.length()
		prevState = self.previousBlockState()
		self.setFormat(0, textLength,
					   PythonHighlighter.Formats["normal"])
		#if text.count("Error: ") or text.count("Type mismatch") or text.count("SQL") or text.count("error") or text.count("exception"):
		#    self.setCurrentBlockState(ERROR)
		#    self.setFormat(0, textLength,
		#                   PythonHighlighter.Formats["error"])
		#    return
		#if prevState == ERROR and \
		#  not (text.startsWith(sys.ps1) or text.startsWith("#")):
		#    self.setCurrentBlockState(ERROR)
		#    self.setFormat(0, textLength,
		#                   PythonHighlighter.Formats["error"])
		#    return

		for regex, format in PythonHighlighter.Rules:
			i = text.indexOf(regex)
			while i >= 0:
				length = regex.matchedLength()
				self.setFormat(i, length,
							   PythonHighlighter.Formats[format])
				i = text.indexOf(regex, i + length)

		self.setCurrentBlockState(NORMAL)

        #if text.indexOf(self.stringRe) != -1:
        #    return
        # This is fooled by triple quotes inside single quoted strings
        #for i, state in ((text.indexOf(self.tripleSingleRe),
        #                  TRIPLESINGLE),
        #                 (text.indexOf(self.tripleDoubleRe),
        #                  TRIPLEDOUBLE)):
        #    if self.previousBlockState() == state:
        #        if i == -1:
        #            i = text.length()
        #            self.setCurrentBlockState(state)
        #        self.setFormat(0, i + 3,     
        #                       PythonHighlighter.Formats["string"])
        #    elif i > -1:
        #        self.setCurrentBlockState(state)
        #        self.setFormat(i, text.length(),
        #                       PythonHighlighter.Formats["string"])

	def rehighlight(self):
		QApplication.setOverrideCursor(QCursor(Qt.WaitCursor))
		QSyntaxHighlighter.rehighlight(self)
		QApplication.restoreOverrideCursor()



