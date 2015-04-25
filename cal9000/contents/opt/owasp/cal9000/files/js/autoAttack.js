/*
 * Handles CAL9000 Automated Attack Generator functions.
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
 * You may direct email inquiries to cal9000tool at mac dot com
 *
 */

var autoItemIndex = 0;

/*
 * Loads the automator.xml file and processes the requested function.
 */
function prepAutoXML(autoFunction, autoListIndex, inIndex) {	
	var autoHttp_request = '';

	if (inIndex != '') {
		autoItemIndex += inIndex;
	}
	
    // Firefox XMLHttpRequest.
	if (window.XMLHttpRequest) {

		// Create XHR.
		try {
			autoHttp_request = new XMLHttpRequest();
        } catch (e) {
			autoHttp_request = false;
			alert('Cannot create XMLHttpRequest\n' + e);
        }
		
		try {
			if (autoHttp_request) {	
				autoHttp_request.onreadystatechange =  function() {
				
					if (autoHttp_request.readyState == 4) {
						switch (autoFunction) {
							case 'createList':
								createAutoList(autoHttp_request.responseXML); break;
							case 'cloneList':
								cloneAutoList(autoHttp_request.responseXML, autoListIndex); break;
							case 'deleteList':
								deleteAutoList(autoHttp_request.responseXML, autoListIndex); break;
							case 'renameList':
								renameAutoList(autoHttp_request.responseXML, autoListIndex); break;
							case 'printList':
								autoPrePrint(autoHttp_request.responseXML, autoListIndex); break;
							case 'displayItem':
								displayAutoItem(autoHttp_request.responseXML, autoListIndex, autoItemIndex); break;
							case 'addItem':
								addAutoItem(autoHttp_request.responseXML, autoListIndex); break;
							case 'changeItem':
								changeAutoItem(autoHttp_request.responseXML, autoListIndex, autoItemIndex); break;
							case 'cloneItem':
								cloneAutoItem(autoHttp_request.responseXML, autoListIndex, autoItemIndex); break;
							case 'deleteItem':
								deleteAutoItem(autoHttp_request.responseXML, autoListIndex, autoItemIndex); break;
							case 'previous':
								displayAutoItem(autoHttp_request.responseXML, autoListIndex, autoItemIndex); break;
							case 'next':
								displayAutoItem(autoHttp_request.responseXML, autoListIndex, autoItemIndex); break;
							case 'launch':
								launchAutoAttack(autoHttp_request.responseXML, autoListIndex); break;
							default:
								displayMessage('Please select an action');
						}
					}
				}
				
				autoHttp_request.open("GET", 'files/xml/automator.xml', true);
				autoHttp_request.send(null);
			} else {
				displayMessage('XMLHttpRequest Retrieval Error');
			}	
		} catch(e) {
			alert('prepAutoXML Error:\n' + e);
		}

    // Windows XMLHttpRequest.	
	} else if (window.ActiveXObject) {

		// Use XMLDOM instead of XMLHttpRequest
		var autoIEDoc = new ActiveXObject("Microsoft.XMLDOM");
		autoIEDoc.async = "false";
		autoIEDoc.load('files/xml/automator.xml');
	
		if (autoIEDoc.readyState == 4) {
			switch (autoFunction) {
				case 'createList':
					createAutoList(autoIEDoc); break;
				case 'cloneList':
					cloneAutoList(autoIEDoc, autoListIndex); break;
				case 'deleteList':
					deleteAutoList(autoIEDoc, autoListIndex); break;
				case 'renameList':
					renameAutoList(autoIEDoc, autoListIndex); break;
				case 'printList':
					autoPrePrint(autoIEDoc, autoListIndex); break;
				case 'displayItem':
					displayAutoItem(autoIEDoc, autoListIndex, autoItemIndex); break;
				case 'addItem':
					addAutoItem(autoIEDoc, autoListIndex); break;
				case 'changeItem':
					changeAutoItem(autoIEDoc, autoListIndex, autoItemIndex); break;
				case 'cloneItem':
					cloneAutoItem(autoIEDoc, autoListIndex, autoItemIndex); break;
				case 'deleteItem':
					deleteAutoItem(autoIEDoc, autoListIndex, autoItemIndex); break;
				case 'previous':
					displayAutoItem(autoIEDoc, autoListIndex, autoItemIndex); break;
				case 'next':
					displayAutoItem(autoIEDoc, autoListIndex, autoItemIndex); break;
				case 'launch':
					launchAutoAttack(autoIEDoc, autoListIndex); break;
				default:
					displayMessage('Please select an action');
			}
		}
	}
}

/*
 * Creates a new attack list.
 */
function createAutoList(xmlAddDoc) {
	var addAutoContent = '';
	
	if (document.getElementById('listName').value != '') {
		var addAutoXml = xmlAddDoc.getElementsByTagName('listName');
		var addLen = addAutoXml.length;
		
		// Checks that the new attack list name doesn't already exist.
		for (var a=0;a<addLen;a++) {
			if (getText(addAutoXml[a]) == document.getElementById('listName').value) {
				document.getElementById('listName').focus();
				document.getElementById('listName').select();
				displayMessage('Attack List Name must be Unique');
				return;
			}		
		}

		addAutoContent = buildAutoFile(xmlAddDoc);
		addAutoContent = addAutoContent.replace('</auto>','');
	
		addAutoContent += '\t<list>\n\t\t<listName>' + 
			plainToEscapeXML(document.getElementById('listName').value) + '</listName>\n\t\t<listItems>\n' +
			'\t\t\t<code>item</code>\n\t\t</listItems>\n\t</list>\n</auto>\n';
	
		saveData('files/xml','automator','xml',addAutoContent);
		clearAutoField('autoClearAll');
		reloadAutoDisplay();
	} else {
		displayMessage('Attack List Name Cannot Be Null');
		document.getElementById('listName').focus();
	}	
}

/*
 * Clones an existing attack list.
 */
function cloneAutoList(xmlCloneDoc, pointer) {
	var cloneAutoXml = new Array();
	var cAutoListXml = new Array();
	var cloneAutoContent = '';
	
	if (document.getElementById('listName').value != '') {
		var cloneAutoXml = xmlCloneDoc.getElementsByTagName('listName');
		var cloneLen = cloneAutoXml.length;
		
		// Checks that the attack list name doesn't already exist.
		for (var c=0;c<cloneLen;c++) {
			if (getText(cloneAutoXml[c]) == document.getElementById('listName').value) {
				document.getElementById('listName').focus();
				document.getElementById('listName').select();
				displayMessage('New Attack List Name must be Unique');
				return;
			}		
		}
	
 		cAutoListXml = xmlCloneDoc.getElementsByTagName('list');
		var cAutoListXmlLen = cAutoListXml.length;

		var clonedElement = cAutoListXml[pointer].cloneNode(true);
		
		// Add the new list to the xmlCloneDoc
		try {
			xmlCloneDoc.getElementsByTagName('list')[cAutoListXmlLen-1].appendChild(clonedElement);
			xmlCloneDoc.getElementsByTagName('listName')[cAutoListXmlLen].firstChild.nodeValue = document.getElementById('listName').value;
		} catch(ex) {
			xmlCloneDoc.getElementsByTagName('list')[cAutoListXmlLen-1].add(clonedElement);
			xmlCloneDoc.getElementsByTagName('listName')[cAutoListXmlLen].firstChild.nodeValue = document.getElementById('listName').value;
		}

		cloneAutoContent = buildAutoFile(xmlCloneDoc);
		cloneAutoContent += '</auto>\n';

		saveData('files/xml','automator','xml',cloneAutoContent);
		clearAutoField('autoClearAll');
		reloadAutoDisplay();
	} else {
		displayMessage('Select a List to Clone');
	}	
}

/*
 * Rename an attack list.
 */
function renameAutoList(xmlRenDoc, pointer) {

	var renAutoXml = new Array();
	var renContent = '';
	
	if (document.getElementById('listName').value != '') {
		renAutoXml = xmlRenDoc.getElementsByTagName('listName');
		var renLen = renAutoXml.length;
		
		// Checks that the new name is different than the existing name.
		if (getText(renAutoXml[pointer]) == document.getElementById('listName').value) {
			displayMessage('That is the Same Name');
			return;
		}		

		// Checks that the attack list name doesn't already exist.
		for (var r=0;r<renLen;r++) {
			if (getText(renAutoXml[r]) == document.getElementById('listName').value) {
				document.getElementById('listName').focus();
				document.getElementById('listName').select();
				displayMessage('New Attack List Name must be Unique');
				return;
			}		
		}
	}
	
	if (pointer >= 0) {
		if (document.getElementById('listName').value != '') {
			renAutoXml[pointer].firstChild.nodeValue = document.getElementById('listName').value;
			renContent = buildAutoFile(xmlRenDoc, 'del');
			saveData('files/xml','automator','xml',renContent);
		
			clearAutoField('autoClearAll');
			reloadAutoDisplay();
		} else {
			displayMessage('List Name Cannot be Null');
			document.getElementById('listName').focus();
			return;
		}
	} else {
		displayMessage('Select a List to Rename');
		return;
	}
}

/*
 * Delete an attack list.
 */
function deleteAutoList(xmlDelDoc, pointer) {

	var dAutoListXml = new Array();
	var delContent = '';
	
	if (document.getElementById('listName').value != '') {
		dAutoListXml = xmlDelDoc.getElementsByTagName('list');
		dAutoXmlLen = dAutoListXml.length;
	
		if (dAutoXmlLen < 1) {
			displayMessage('No list to delete');
			return;
		}
		
		if (dAutoListXml[pointer]) {
			if (document.getElementById('listName').value != '') {
				xmlDelDoc.getElementsByTagName('auto')[0].removeChild(dAutoListXml[pointer]);
			
				delContent = buildAutoFile(xmlDelDoc, 'del');
				saveData('files/xml','automator','xml',delContent);
			
				clearAutoField('autoClearAll');
				reloadAutoDisplay();

			} else {
				displayMessage('Select a List to Delete');
				return;
			}
		}
	} else {
		displayMessage('Select a List to Delete');
		return;
	}
}

/*
 * Display the selected item.
 */
function displayAutoItem(xmlDispDoc,listIndex,itemIndex) {

	var xDisp = new Array();
	xDisp = xmlDispDoc.getElementsByTagName('listItems');
	var xDispLen = xDisp.length;

	var xItem = new Array();
	xItem = xDisp[listIndex].getElementsByTagName('code');
	var xItemLen = xItem.length;

	document.getElementById('listName').value = document.getElementById('lists').value;

	if (xItemLen > 0) {
		if (itemIndex < 0) {
			itemIndex = xItemLen-1;
			displayMessage('Going to Last Item');
		} else if (itemIndex >= xItemLen) {
			itemIndex = 0;
			displayMessage('Going to First Item');
		}
		
		if (itemIndex >= 0) {
			autoItemIndex = itemIndex;
		} else {
			autoItemIndex = 0;
			itemIndex = 0;
		}

		document.getElementById('autoDiv').innerHTML = 'Item ' + (autoItemIndex+1) + ' of ' + xItemLen + ':&nbsp;&nbsp;' + 
			'<INPUT type="button" class="button" value="Previous" onClick="prepAutoXML(\'previous\',document.AUTO.lists.selectedIndex,-1);">' +
			'<INPUT type="button" class="button" value="Next" onClick="prepAutoXML(\'next\',document.AUTO.lists.selectedIndex,1);">';

		var tempText = getText(xDisp[listIndex].getElementsByTagName('code')[itemIndex]);
		
		if (tempText == ' ') {
			document.getElementById('itemContents').value = '';
		} else {	
			document.getElementById('itemContents').value = tempText;
		}
	} else {

		document.getElementById('autoDiv').innerHTML = 'Item # of #' + ':&nbsp;&nbsp;' + 
			'<INPUT type="button" class="button" value="Previous" onClick="prepAutoXML(\'previous\',document.AUTO.lists.selectedIndex,-1);">' +
			'<INPUT type="button" class="button" value="Next" onClick="prepAutoXML(\'next\',document.AUTO.lists.selectedIndex,1);">';
		clearField('itemContents', true);
		displayMessage('No Items to display');
	}
}

/*
 * Add a new attack item.
 */
function addAutoItem(xmlItemDoc, listIndex) {
	var xDisp = new Array();
	xDisp = xmlItemDoc.getElementsByTagName('listItems');

	var xItem = new Array();
	xItem = xDisp[listIndex].getElementsByTagName('code');
	var xItemLen = xItem.length;

	if (xDisp.length > 0) {
		var newel = xmlItemDoc.createElement('code');
		
		if (document.getElementById('itemContents').value != '') {
			var newText = xmlItemDoc.createTextNode(document.getElementById('itemContents').value);
		} else {
			var newText = xmlItemDoc.createTextNode('new_item');
		}
		
		try {
			newel.add(newText);
			xDisp[listIndex].add(newel);
		} catch(ex) {
			newel.appendChild(newText);
			xDisp[listIndex].appendChild(newel);
		}
	
		addAutoContent = buildAutoFile(xmlItemDoc, 'add');
	
		saveData('files/xml','automator','xml',addAutoContent);
		displayAutoItem(xmlItemDoc,listIndex,xItemLen);
	} else {
		displayMessage('Select list to add item to');
		document.getElementById('lists').focus();
	}	
}

/*
 * Save changes to an attack item.
 */
function changeAutoItem(xmlChDoc, listIndex, itemIndex) {

	var xDisp = new Array();
	xDisp = xmlChDoc.getElementsByTagName('listItems');
	var ourDisp = xDisp[listIndex];

	var xItem = new Array();
	xItem = xDisp[listIndex].getElementsByTagName('code');

	if (document.getElementById('listName').value != '') {
		if (document.getElementById('itemContents').value != '') {
			if (xItem[itemIndex]) {
				var newValue = document.getElementById('itemContents').value;
				xItem[itemIndex].firstChild.nodeValue = newValue;
			} else {
				var newel = xmlChDoc.createElement('code');
				var newText = xmlChDoc.createTextNode(document.getElementById('itemContents').value);
			
				try {
					newel.add(newText);
					xDisp[listIndex].add(newel);
				} catch(ex) {
					newel.appendChild(newText);
					xDisp[listIndex].appendChild(newel);
				}
			}
			
			saveData('files/xml','automator','xml',buildAutoFile(xmlChDoc,'change'));
			displayAutoItem(xmlChDoc,listIndex,itemIndex);
		} else {
			displayMessage('Null value not allowed');
			document.getElementById('itemContents').focus();
		}	
	} else {
		displayMessage('Select list and item to change');
		document.getElementById('lists').focus();
	}	
}

/*
 * Clone an attack item.
 */
function cloneAutoItem(xmlItemDoc, listIndex, itemIndex) {
	var xDisp = new Array();
	xDisp = xmlItemDoc.getElementsByTagName('listItems');

	var xItem = new Array();
	xItem = xDisp[listIndex].getElementsByTagName('code');
	var xItemLen = xItem.length;

	if (document.getElementById('listName').value != '') {
		if (document.getElementById('itemContents').value != '') {
			if (xItem.length > 0) {
				var newel = xmlItemDoc.createElement('code');
				var newContents = getText(xItem[itemIndex]);
			
				if (newContents != '') {
					var newText = xmlItemDoc.createTextNode(newContents);
				} else {
					var newText = xmlItemDoc.createTextNode('new_item');
				}
				
				try {
					newel.add(newText);
					xDisp[listIndex].add(newel);
				} catch(ex) {
					newel.appendChild(newText);
					xDisp[listIndex].appendChild(newel);
				}
			
				var cloneAutoContent = buildAutoFile(xmlItemDoc, 'add');
			
				saveData('files/xml','automator','xml',cloneAutoContent);
				displayAutoItem(xmlItemDoc,listIndex,xItemLen);
			} else {
				displayMessage('No Items to Clone');
				document.getElementById('lists').focus();
			}
		} else {
			displayMessage('Null value not allowed');
			document.getElementById('itemContents').focus();
		}	
	} else {
		displayMessage('Select list and item to clone');
		document.getElementById('lists').focus();
	}	
}

/*
 * Delete an attack item.
 */
function deleteAutoItem(xmlDelDoc, listIndex, itemIndex) {
	var holdIndex = itemIndex;

	if (document.getElementById('listName').value != '') {
		var xDisp = new Array();
		xDisp = xmlDelDoc.getElementsByTagName('listItems')[listIndex];
		
		var xItem = new Array();
		xItem = xDisp.getElementsByTagName('code');
	
		if (xItem.length < 1) {
			displayMessage('No Item to Delete');
			return;
		}
	
		if (itemIndex >= 0) {
			xDisp.removeChild(xItem[itemIndex]);
		}
		
		saveData('files/xml','automator','xml',buildAutoFile(xmlDelDoc,'del'));
		clearAutoField('autoClearAll');

		if (holdIndex > 0) {
			displayAutoItem(xmlDelDoc,listIndex,holdIndex-1);
		} else {
			displayAutoItem(xmlDelDoc,listIndex,0);
		}			
	} else {
		displayMessage('Select list and item to delete');
		document.getElementById('lists').focus();
	}	
}

/*
 * Manually build the automator.xml file for saves.
 */
function buildAutoFile(xmlBuildDoc, caller) {
	var buildContent = new stringBuffer();
	var autoFile = new Array();
	var autoFileLen = 0;
	var listNameFile = '';
	var itemFile = '';
	var itemFileLen = 0;
	
	autoFile = xmlBuildDoc.getElementsByTagName('list');
	autoFileLen = autoFile.length;

	buildContent.sbAppend('<?xml version="1.0" encoding="ISO-8859-1"?>\n<auto>\n');
	
	for (var j=0;j < autoFileLen;j++) {
		if (autoFile[j].hasChildNodes()) {
			buildContent.sbAppend('\t<list>\n\t\t<listName>' + 
				plainToEscapeXML(getText(autoFile[j].getElementsByTagName('listName')[0])) + 
				'</listName>\n\t\t<listItems>\n');

			listNameFile = xmlBuildDoc.getElementsByTagName('listItems');
			
			if (listNameFile[j]) {
				if (listNameFile[j].hasChildNodes()) {
					itemFile = listNameFile[j].getElementsByTagName('code');
					itemFileLen = itemFile.length;

					for (var k=0;k< itemFileLen; k++) {

						if (getText(itemFile[k]) != '') {
							buildContent.sbAppend('\t\t\t<code>' + plainToEscapeXML(getText(itemFile[k])) + '</code>\n');
						}
					}
				}
			}	
			buildContent.sbAppend('\t\t</listItems>\n\t</list>\n');
		}
	}
	if ((caller == 'del') || (caller == 'add') || (caller == 'change')) {
		buildContent.sbAppend('</auto>\n');
	}
	
	return buildContent.sbToString();
}

/*
 * Display attack list items in a new window.
 */
function autoPrePrint(printXMLDoc, pointer) {
	var new_window = ''; 
	var printContent = new stringBuffer();
	
	if (document.getElementById('listName').value != '') {
		printFile = printXMLDoc.getElementsByTagName('list');
		printFileLen = printFile.length;
	
		if (printFileLen > 0) {
		
			new_window = window.open('files/test/scriptTest.html','Auto','scrollbars=yes,resizable=yes,width=600,height=400');
		
			printContent.sbAppend('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 TRANSITIONAL//EN">' +
				'<html><head><title>Attack List</title><STYLE type="text/css" media="all">@import "' + 
				getBackupPath("files/help/style", "helpStyle", "css") + '";</STYLE></head><body><dl>\n');
			
			if (printFile[pointer].hasChildNodes()) {
	
				printContent.sbAppend('<dt>' + safeDisplay(getText(printFile[pointer].getElementsByTagName('listName')[0])) + ':</dt>\n');
	
				var printItemList = printXMLDoc.getElementsByTagName('listItems');
				if (printItemList[pointer]) {
					if (printItemList[pointer].hasChildNodes()) {
						printItem = printItemList[pointer].getElementsByTagName('code');
						printItemLen = printItem.length;
		
						for (var k=0;k< printItemLen; k++) {
							if (getText(printItem[k]) != '') {
								printContent.sbAppend('<dd>' + safeDisplay(getText(printItem[k])) + '</dd>\n');
							}
						}
					}
				}	
			}
	
			printContent.sbAppend('</dl></body></html>');
			
			new_window.document.writeln(printContent.sbToString());
			new_window.document.close();
			printContent = '';
		} else {
			displayMessage('Nothing To Display');
		}
	} else {
		displayMessage('Select a List to Display');
		document.getElementById('lists').focus();
		return;
	}
}

/*
 * Clear contents of Auto Attack fields.
 */
function clearAutoField(clearID) {

	if (clearID == 'autoClearAll') {
		document.getElementById('autoDiv').innerHTML = 'Item # of #:&nbsp;&nbsp;<INPUT type="button" class="button" value="Previous" onClick="prepAutoXML(\'previous\',document.AUTO.lists.selectedIndex,-1);"><INPUT type="button" class="button" value="Next" onClick="prepAutoXML(\'next\',document.AUTO.lists.selectedIndex,1);">';
		document.getElementById('itemContents').focus();
		clearField('itemContents', false);
		clearField('listName', false);

	} else if (clearID != '') {
		clearField(clearID);
		document.getElementById(clearID).focus();

	} else {
		displayMessage('Select a field to clear');
	}	
}

/*
 * Reloads the Attack List drop-down box.
 */
function reloadAutoDisplay() {

	importXML('','files/xml/automator.xml', true, true);
	goToAnchor('#auto');
}

