/*
 * Handles CAL9000 Checklist Editor functions.
 *
 * This file is part of CAL9000 
 *
 * CAL9000 Web Application Security Testing Assistant, Version 2.0 
 * Copyright (C) 2006 Christopher Loomis
 *
 * Distributed under the GNU General Public License
 *
 * CAL9000 is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 * 
 * CAL9000 is distributed in the hope that it will be useful, but WITHOUT 
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with 
 * CAL9000; if not, write to the Free Software Foundation, Inc., 51 Franklin 
 * Street, Fifth Floor, Boston, MA 02110-1301 USA
 *
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
 * DATA OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * See http://www.digilantesecurity.com/CAL9000/index.html for more info.
 * You may direct email inquiries to cal9000tool at mac.com
 *
 */

/*
 * Loads the checklist.xml file and processes the requested function.
 */
function prepChkXML(checkFunction, checkName) {	
	var chkHttp_request = '';
	
    // Non-Windows XMLHttpRequest.
	if (window.XMLHttpRequest) {
		try {
			chkHttp_request = new XMLHttpRequest();
        } catch (e) {
			chkHttp_request = false;
			alert('Cannot create XMLHttpRequest\n' + e);
        }
		
		try {
			if (chkHttp_request) {
				chkHttp_request.onreadystatechange = function() {
				
					if (chkHttp_request.readyState == 4) {
						switch (checkFunction) {
							case 'addCat':
								addChkCat(chkHttp_request.responseXML); break;
							case 'renCat':
								renChkCat(chkHttp_request.responseXML); break;
							case 'delCat':
								delChkCat(chkHttp_request.responseXML); break;
							case 'print':
								chkPrePrint(chkHttp_request.responseXML); break;
							case 'addItem':
								addChkItem(chkHttp_request.responseXML); break;
							case 'changeItem':
								changeChkItem(chkHttp_request.responseXML, checkName); break;
							case 'delItem':
								delChkItem(chkHttp_request.responseXML, checkName); break;
							default:
								displayMessage('Please select an edit action');
						}
					}
				}
				chkHttp_request.open("GET", 'files/xml/checklist.xml', true);
				chkHttp_request.send(null);
			} else {
				displayMessage('XMLHttpRequest Creation Error');
			}	
		} catch(e) {
			alert('ERROR:\n' + e);
		}

    // Windows XMLHttpRequest.	
	} else if (window.ActiveXObject) {

		// Use XMLDOM instead of XMLHttpRequest
		var xmlIEDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlIEDoc.async = "false";
		xmlIEDoc.load('files/xml/checklist.xml');
	
		if (xmlIEDoc.readyState == 4) {
			switch (checkFunction) {
				case 'addCat':
					addChkCat(xmlIEDoc); break;
				case 'renCat':
					renChkCat(xmlIEDoc); break;
				case 'delCat':
					delChkCat(xmlIEDoc); break;
				case 'print':
					chkPrePrint(xmlIEDoc); break;
				case 'addItem':
					addChkItem(xmlIEDoc); break;
				case 'changeItem':
					changeChkItem(xmlIEDoc); break;
				case 'delItem':
					delChkItem(xmlIEDoc, checkName); break;
				default:
					displayMessage('Please select an edit action');
			}
		}
	}
}

/*
 * Add a new checklist category.
 */
function addChkCat(xmlAddDoc) {
	var newChkContent = '';
	var addChkContent = new stringBuffer();

	var addXml = xmlAddDoc.getElementsByTagName('label');
	var addLen = addXml.length;
	
	if (document.getElementById('checkLabel').value != '') {
		// Check that new Category Name is Unique.
		for (var a=0;a<addLen;a++) {
			if (getText(addXml[a]) == document.getElementById('checkLabel').value) {
				document.getElementById('checkLabel').focus();
				document.getElementById('checkLabel').select();
				displayMessage('Checklist Category name must be unique');
				return;
			}		
		}
	
		newChkContent = buildChkXmlFile(xmlAddDoc, 0);
		newChkContent = newChkContent.replace('</checklist>','');
		addChkContent.sbAppend(newChkContent);

		addChkContent.sbAppend('\t<item>\n' +
			'\t\t<name>' + plainToEscapeXML(document.getElementById('checkLabel').value) + '_Item' + '</name>\n' +
			'\t\t<results>Your results here</results>\n' +
			'\t\t<label>' + plainToEscapeXML(document.getElementById('checkLabel').value) + '</label>\n' +
			'\t</item>\n</checklist>');

		saveChkXmlFile(addChkContent.sbToString());
		reloadChkDisplay();
 	} else {
		displayMessage('Category name cannot be null');
		document.getElementById('checkLabel').focus();
 	}	
}

/*
 * Rename a checklist category.
 */
function renChkCat(xmlRenDoc) {
	var renChkContent = '';
	var oldCatName = '';
	
	var renIndex = document.getElementById('checkItems').selectedIndex;
	var renXml = xmlRenDoc.getElementsByTagName('label');
	var renLen = renXml.length;

	if (renIndex >= 0) {
		oldCatName = getText(renXml[renIndex]);
	} else {
		displayMessage('Select an Item in the Category you wish to rename');
		return;
	}		
		
	if (document.getElementById('checkLabel').value != '') {
		// Check that new Category Name is Unique.
		for (var a=0;a<renLen;a++) {
			if (getText(renXml[a]) == document.getElementById('checkLabel').value) {
				document.getElementById('checkLabel').focus();
				document.getElementById('checkLabel').select();
				displayMessage('Checklist Category name must be unique');
				return;
			}		
		}
		
		if (oldCatName != '') {
			for (var b=0;b<renLen;b++) {
				if (getText(renXml[b]) == oldCatName) {
					xmlRenDoc.getElementsByTagName('label')[b].firstChild.nodeValue = document.getElementById('checkLabel').value;
				}		
			}
		}
		
 		renChkContent = buildChkXmlFile(xmlRenDoc, 0);
 		saveChkXmlFile(renChkContent);
 		reloadChkDisplay();
 	} else {
		displayMessage('Category name cannot be null');
		document.getElementById('checkLabel').focus();
 	}	
}

/*
 * Delete a checklist category.
 */
function delChkCat(xmlDelDoc) {
	var catName = '';
	var delContent = '';
	
	var delIndex = document.getElementById('checkItems').selectedIndex;
	var dXml = xmlDelDoc.getElementsByTagName('item');
	var dXmlLen = dXml.length;

	if (delIndex >= 0) {
		var catName = getText(xmlDelDoc.getElementsByTagName('label')[delIndex]);
	} else {
		displayMessage('Select an Item in the Category you wish to delete');
		return;
	}		

	if (catName != '') {
		var delXml = xmlDelDoc.getElementsByTagName('label');
		for (var d=0;d < dXmlLen;d++) {
			if (getText(delXml[d]) == catName) {
				xmlDelDoc.getElementsByTagName('checklist')[0].removeChild(dXml[d]);
 				d -= 1;
 				dXmlLen -= 1;
			} 
		}
		delContent = buildChkXmlFile(xmlDelDoc);
		saveChkXmlFile(delContent);
		reloadChkDisplay();
	}	
}

/*
 * Add a new checklist item.
 */
function addChkItem(xmlAddDoc) {
	var addChkContent = new stringBuffer();

	var addXml = xmlAddDoc.getElementsByTagName('item');
	var addLen = addXml.length;
	var addSelectLen = document.getElementById('checkItems').length;
	var insertPoint = 0;
	
	// Check that new Item Title is Unique;
	for (var a=0;a<addSelectLen;a++) {
		if (document.getElementById('checkItems')[a].value == document.getElementById('checkTitle').value) {
			document.getElementById('checkTitle').focus();
			document.getElementById('checkTitle').select();
			displayMessage('Checklist Item Title must be unique');
			return;
		}		
	}
	
	if (!nullChkValues()) {
		for (var b=0;b<addLen;b++) {
			if (addXml[b].getElementsByTagName('label')[0].firstChild.nodeValue == document.getElementById('checkLabel').value) {
				for (var c=b;c<addSelectLen;c++) {
					if (addXml[c].getElementsByTagName('label')[0].firstChild.nodeValue != document.getElementById('checkLabel').value) {
						insertPoint = c;
						break;
					}
				}
			}		
		}
		
		if (insertPoint != c) {
			insertPoint = addLen;		
		}
	
		addChkContent.sbAppend(buildChkXmlFile(xmlAddDoc, insertPoint));

		addChkContent.sbAppend('\t<item>\n' +
			'\t\t<name>' + plainToEscapeXML(document.getElementById('checkTitle').value) + '</name>\n' +
			'\t\t<results>' + plainToEscapeXML(document.getElementById('checkResults').value) + '</results>\n' +
			'\t\t<label>' + plainToEscapeXML(document.getElementById('checkLabel').value) + '</label>\n' +
			'\t</item>\n');

		addChkContent.sbAppend(buildChkXmlFile2(xmlAddDoc, insertPoint));

		saveChkXmlFile(addChkContent.sbToString());
		reloadChkDisplay();
	} else {
		displayMessage('Null values not allowed');
	}	
}

/*
 * Save changes to a checklist item.
 */
function changeChkItem(xmlChDoc, pointer) {
	
	var chSelIndex = document.getElementById('checkItems').selectedIndex;

	if (chSelIndex >= 0) {

		var chXml = xmlChDoc.getElementsByTagName('name');
		var chXmlLen = chXml.length;
	
		var chResultsXml = xmlChDoc.getElementsByTagName('results');
		var chLabelXml = xmlChDoc.getElementsByTagName('label');
	
		if (document.getElementById('checkTitle').value != '') {
			for (var a=0;a<chXmlLen;a++) {
				if (a != chSelIndex) {
					if (getText(chXml[a]) == document.getElementById('checkTitle').value) {
						document.getElementById('checkTitle').focus();
						document.getElementById('checkTitle').select();
						displayMessage('Checklist Item Title must be unique');
						return;
					}
				}	
			}
			
			if (getText(chLabelXml[chSelIndex]) != document.getElementById('checkLabel').value) {
				displayMessage('Cannot change Category Name with this function');
				return;
			}
				
			if (!nullChkValues()) {
				chXml[chSelIndex].firstChild.nodeValue = document.getElementById('checkTitle').value;
				chResultsXml[chSelIndex].firstChild.nodeValue = document.getElementById('checkResults').value;
		
				chContent = buildChkXmlFile(xmlChDoc);
				saveChkXmlFile(chContent);
				reloadChkDisplay();
				return;
			} else {
				displayMessage('Null values not allowed');
				return;
			}
		} else {
			displayMessage('Item name cannot be null');
			document.getElementById('checkTitle').focus();
		}	
	} else {
		displayMessage('Select an Item to change');
		document.getElementById('checkItems').focus();
 	}	
}

/*
 * Delete a checklist item.
 */
function delChkItem(xmlDelDoc, pointer) {
	var dXml = new Array();
	var delContent = '';
	
	dXml = xmlDelDoc.getElementsByTagName('item');
	var dXmlLen = dXml.length;

	for (var i=0;i < dXmlLen;i++) {
		if (dXml[i].hasChildNodes()) {
			if (pointer != '') {
				if (dXml[i].getElementsByTagName('name')[0].firstChild.nodeValue == pointer) {
					while (dXml[i].childNodes[0]) {
						dXml[i].removeChild(dXml[i].childNodes[0]);
					}

					delContent = buildChkXmlFile(xmlDelDoc);
					saveChkXmlFile(delContent);
					reloadChkDisplay();
					return;
				} 
			} else {
				displayMessage('Select an item to delete');
				return;
			}
		}
	}
}

/*
 * Build the checklist file up to the new entry.
 */
function buildChkXmlFile(xmlBuildChkDoc, inInsert) {
	var buildChkContent = new stringBuffer();
	var chkFile = new Array();
	var chkFileLen = 0;
	var chkInsert = 0;
	
	chkFile = xmlBuildChkDoc.getElementsByTagName('item');
	chkFileLen = chkFile.length;

	if (inInsert) {
		chkInsert = inInsert;
	} else {
		chkInsert = chkFileLen;
	}	

	if (chkFileLen > 0) {
		buildChkContent.sbAppend('<?xml version="1.0" encoding="ISO-8859-1"?>\n<checklist>\n');
	
		for (var i=0;i < chkInsert;i++) {
			if (chkFile[i].hasChildNodes()) {
				buildChkContent.sbAppend('\t<item>\n' +
					'\t\t<name>' + plainToEscapeXML(getText(chkFile[i].getElementsByTagName('name')[0])) + '</name>\n' +
					'\t\t<results>' + plainToEscapeXML(getText(chkFile[i].getElementsByTagName('results')[0])) + '</results>\n' +
					'\t\t<label>' + plainToEscapeXML(getText(chkFile[i].getElementsByTagName('label')[0])) + '</label>\n' +
					'\t</item>\n');
			}
		}

		if (!inInsert) {
			buildChkContent.sbAppend('</checklist>');
		}
		return buildChkContent.sbToString();

	} else {
		displayMessage('Error building checklist file');
	}
	return false;
}

/*
 *  Build the checklist file after the new entry.
 */
function buildChkXmlFile2(xmlBuildChkDoc, chkInsert) {
	var buildChkContent = new stringBuffer();
	var chkFile = new Array();
	var chkFileLen = 0;
	
	chkFile = xmlBuildChkDoc.getElementsByTagName('item');
	chkFileLen = chkFile.length;

	if (chkFileLen > 0) {
	
		for (var i=chkInsert;i < chkFileLen;i++) {
			if (chkFile[i].hasChildNodes()) {
				buildChkContent.sbAppend('\t<item>\n' +
					'\t\t<name>' + plainToEscapeXML(getText(chkFile[i].getElementsByTagName('name')[0])) + '</name>\n' +
					'\t\t<results>' + plainToEscapeXML(getText(chkFile[i].getElementsByTagName('results')[0])) + '</results>\n' +
					'\t\t<label>' + plainToEscapeXML(getText(chkFile[i].getElementsByTagName('label')[0])) + '</label>\n' +
					'\t</item>\n');
			}
		}
		buildChkContent.sbAppend('</checklist>');
		
		return buildChkContent.sbToString();
	} else {
		displayMessage('Error building checklist file');
	}
	return false;
}

/*
 * Save the checklist file.
 */
function saveChkXmlFile(chkContent) {
	var saveContent = '';
	
	saveContent = chkContent;
	saveData('files/xml','checklist','xml',saveContent);
}

/*
 * Reload the checklist select box.
 */
function reloadChkDisplay() {

	clearChkField('clearAllChk');
	importXML('','files/xml/checklist.xml',true);
	goToAnchor('#checkList');
}

/*
 * Check fields for null values.
 */
function nullChkValues() {

	if (document.getElementById('checkTitle').value == '') {
		document.getElementById('checkTitle').focus();
		return true;
	}
	if (document.getElementById('checkResults').value == '') {
		document.getElementById('checkResults').focus();
		return true;
	
	}
	if (document.getElementById('checkLabel').value == '') {
		document.getElementById('checkLabel').focus();
		return true;
	}
	
	return false;
}

/*
 * Display checklist items in a new window.
 */
function chkPrePrint(printXMLDoc) {
	var new_window = ''; 
	var printContent = new stringBuffer();
	var holdCategory = '';
	
	new_window = window.open('files/test/scriptTest.html','PrintChecklist','scrollbars=yes,resizable=yes,width=600,height=400');
	
	var printFile = printXMLDoc.getElementsByTagName('item');
	var printFileLen = printFile.length;

	if (printFileLen > 0) {
	
		printContent.sbAppend('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 TRANSITIONAL//EN">' +
			'<html><head><title>Test Results</title>' +
			'<STYLE type="text/css" media="all">@import "' + getBackupPath("files/help/style", "helpStyle", "css") + '";</STYLE>' +
			'</head><body><dl>\n');
		
		for (var i=0;i < printFileLen;i++) {
			if (printFile[i].hasChildNodes()) {
				if (getText(printFile[i].getElementsByTagName('label')[0]) != holdCategory) {
					printContent.sbAppend('<center>-- ' + safeDisplay(getText(printFile[i].getElementsByTagName('label')[0])) + ' --</center>');
					holdCategory = getText(printFile[i].getElementsByTagName('label')[0]);
				}

				printContent.sbAppend('<dt>' + safeDisplay(getText(printFile[i].getElementsByTagName('name')[0])) + ':</dt>\n' +
					'<dd>' + safeDisplay(getText(printFile[i].getElementsByTagName('results')[0])) + '</dd>\n<hr>');
			}
		}
		printContent.sbAppend('</dl>');
	}
	printContent.sbAppend('</body></html>');
	
	new_window.document.writeln(printContent.sbToString());
	new_window.document.close();	
}

/*
 * Clear Checklist page fields.
 */
function clearChkField(checkID) {

	if (checkID == 'clearAllChk') {
		clearField('checkTitle');
		clearField('checkResults');
		clearField('checkLabel');
		document.getElementById('checkTitle').focus();

	} else if (checkID != '') {
		clearField(checkID);
		document.getElementById(checkID).focus();

	} else {
		displayMessage('Select a field to clear');
	}	
}

