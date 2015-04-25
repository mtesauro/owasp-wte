/*
 * Handles CAL9000 XSS Editor functions.
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
 * Load the xssUserAttacks.xml file and processes the user request.
 */
function prepUdXML(udFunction, ddName, url) {	
	var eHttp_request = '';

    // Non-Windows XMLHttpRequest.
	if (window.XMLHttpRequest) {
		try {
			eHttp_request = new XMLHttpRequest();
        } catch (e) {
			eHttp_request = false;
			alert('Cannot create XMLHttpRequest\n' + e);
        }
		
		try {
			if (eHttp_request) {
	
				eHttp_request.onreadystatechange = function() {
					try {
						if (eHttp_request.readyState == 4) {
							switch (udFunction) {
								case 'change':
									changeAttack(eHttp_request.responseXML, ddName); break;
								case 'add':
									addAttack(eHttp_request.responseXML); break;
								case 'delete':
									deleteAttack(eHttp_request.responseXML, ddName); break;
								case 'print':
									xssPrePrint(eHttp_request.responseXML); break;
								default:
									displayMessage('Please select an edit action');
							}
						}
					} catch (e) {
						alert('PrepUdXML Error:\n' + e);
						return false;
					}    
				}
				eHttp_request.open("GET", url, true);
				eHttp_request.send(null);
			} else {
				displayMessage('XMLHttpRequest Retrieval Error');
			}	
		} catch(e) {
			alert('ERROR:\n' + e);
		}

    // Windows XMLHttpRequest.	
	} else if (window.ActiveXObject) {

		// Use XMLDOM instead of XMLHttpRequest
		var xmlIEDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlIEDoc.async = "false";
		xmlIEDoc.load(url);
	
		if (xmlIEDoc.readyState == 4) {
			switch (udFunction) {
				case 'change':
					changeAttack(xmlIEDoc, ddName); break;
				case 'add':
					addAttack(xmlIEDoc); break;
				case 'delete':
					deleteAttack(xmlIEDoc, ddName); break;
				case 'print':
					xssPrePrint(xmlIEDoc); break;
				default:
					displayMessage('Please select an edit action');
			}
		}
	}
}

/*
 * Add a new user-defined attack.
 */
function addAttack(xmlAddDoc) {
	var addContent = new stringBuffer();

	var aXml = xmlAddDoc.getElementsByTagName('attack');
	var aXmlLen = aXml.length;
	var aSelectLen = document.getElementById('xssType').length;
	
	for (var a=0;a<aSelectLen;a++) {
		if (document.getElementById('xssType')[a].value == document.getElementById('udAttackTitle').value) {
			document.getElementById('udAttackTitle').focus();
			document.getElementById('udAttackTitle').select();
			displayMessage('Attack title must be unique');
			return;
		}		
	}
	
	if (!nullValues()) {	
		var newContent = buildXmlFile(xmlAddDoc);
		newContent = newContent.replace('</xss>','');
		addContent.sbAppend(newContent);
	
		addContent.sbAppend('\t<attack>\n' +
			'\t\t<name>' + plainToEscapeXML(document.getElementById('udAttackTitle').value) + '</name>\n' +
			'\t\t<code>' + plainToEscapeXML(document.getElementById('attackCode').value) + '</code>\n' +
			'\t\t<desc>' + plainToEscapeXML(document.getElementById('description').value) + '</desc>\n' +
			'\t\t<label>User Defined</label>\n');
		
		var tempBrow = '';
		tempBrow = buildBrowString();

		if (tempBrow != '') {
			addContent.sbAppend('\t\t<browser>' + plainToEscapeXML(buildBrowString()) + '</browser>\n');
		} else {
			addContent.sbAppend('\t\t<browser> </browser>\n');
		}
		
		addContent.sbAppend('\t</attack>\n</xss>\n');
	
		saveXmlFile(addContent.sbToString());
		reloadDisplay();
	} else {
		displayMessage('Null values not allowed');
	}	
}

/*
 * Save changes to a user-defined attack.
 */
function changeAttack(xmlChDoc, pointer) {
	var chXml = new Array();
	
	chXml = xmlChDoc.getElementsByTagName('attack');
	var chXmlLen = chXml.length;
	var chSelectLen = document.getElementById('xssType').length;
	var chSelectInd = document.getElementById('xssType').selectedIndex;

	for (var a=0;a<chSelectLen;a++) {
		if (document.getElementById('xssType')[a].value == document.getElementById('udAttackTitle').value) {
			if (a != chSelectInd) {
				document.getElementById('udAttackTitle').focus();
				document.getElementById('udAttackTitle').select();
				displayMessage('Attack Title must be Unique');
				return;
			}	
		}		
	}
		
	for (var i=0;i < chXmlLen;i++) {
		if (chXml[i].hasChildNodes()) {
			if (pointer != '') {
				if (chXml[i].getElementsByTagName('name')[0].firstChild.nodeValue == pointer) {
					if (!nullValues()) {
						chXml[i].getElementsByTagName('name')[0].firstChild.nodeValue = document.getElementById('udAttackTitle').value;
						chXml[i].getElementsByTagName('code')[0].firstChild.nodeValue = document.getElementById('attackCode').value;
						chXml[i].getElementsByTagName('desc')[0].firstChild.nodeValue = document.getElementById('description').value;

						var tempBrow = '';
						tempBrow = buildBrowString();

						if (tempBrow != '') {
							chXml[i].getElementsByTagName('browser')[0].firstChild.nodeValue = buildBrowString();
						} else {
							chXml[i].getElementsByTagName('browser')[0].firstChild.nodeValue =  ' ';
						}
				
						chContent = buildXmlFile(xmlChDoc);
						saveXmlFile(chContent);
						reloadDisplay();
						return;
					} else {
						displayMessage('Null values not allowed');
						return;
					}
				}
			} else {
				displayMessage('Need to select an attack to change');
				return;
			}	
		} else {
			displayMessage('Can\'t find that attack');
			return;
		}
	} 
	displayMessage('Can\'t change that attack');
}

/*
 * Delete a user-defined attack.
 */
function deleteAttack(xmlDelDoc, pointer) {
	var dXml = new Array();
	var delContent = '';
	
	dXml = xmlDelDoc.getElementsByTagName('attack');
	dXmlLen = dXml.length;

	for (var i=0;i < dXmlLen;i++) {
		if (dXml[i].hasChildNodes()) {
			if (pointer != '') {
				if (dXml[i].getElementsByTagName('name')[0].firstChild.nodeValue == pointer) {
					while (dXml[i].childNodes[0]) {
						dXml[i].removeChild(dXml[i].childNodes[0]);
					}

					delContent = buildXmlFile(xmlDelDoc);
					saveXmlFile(delContent);
					reloadDisplay();
					return;
				} 
			} else {
				displayMessage('Select an attack to delete');
				return;
			}
		}
	}
	displayMessage('Cannot delete that attack');
}

/*
 * This array of browser names drives all browser support display.
 */
var editBrowString = new Array('IE7.0','IE6.0','NS8.1-IE','NS8.1-G','FF2.0','O9.02');

/*
 * Builds the string indicating which browsers the attack works in.
 */
function buildBrowString() {
	var browString = '';
	
	for (var a=0;a<editBrowString.length;a++) {
		if (document.getElementById('ud' + editBrowString[a]).checked == true) {
			browString += editBrowString[a] + ',';
		}
	}
	
	if (browString.length > 0) {
		browString = browString.substring(0,browString.length-1);
	}
	
	return browString;
}

/*
 * Builds the xml file and populates the nodes.
 */
function buildXmlFile(xmlBuildDoc) {
	var buildContent = new stringBuffer();
	var xFile = new Array();
	var xFileLen = 0;
	
	xFile = xmlBuildDoc.getElementsByTagName('attack');
	xFileLen = xFile.length;

	buildContent.sbAppend('<?xml version="1.0" encoding="ISO-8859-1"?>\n<xss>\n');

	for (var i=0;i < xFileLen;i++) {
		if (xFile[i].hasChildNodes()) {
			buildContent.sbAppend('\t<attack>\n' +
				'\t\t<name>' + plainToEscapeXML(getText(xFile[i].getElementsByTagName('name')[0])) + '</name>\n' +
				'\t\t<code>' + plainToEscapeXML(getText(xFile[i].getElementsByTagName('code')[0])) + '</code>\n' +
				'\t\t<desc>' + plainToEscapeXML(getText(xFile[i].getElementsByTagName('desc')[0])) + '</desc>\n' +
				'\t\t<label>User Defined</label>\n' +
				'\t\t<browser>' +  plainToEscapeXML(getText(xFile[i].getElementsByTagName('browser')[0])) + '</browser>\n' +
				'\t</attack>\n');
		}
	}
	buildContent.sbAppend('</xss>');
	
	return buildContent.sbToString();
}

/*
 * Save the xml file.
 */
function saveXmlFile(content) {
	saveData('files/xml','xssUserAttacks','xml',content);
}

/*
 * Reloads the xss attack select box.
 */
function reloadDisplay() {

	clearXSSField('xssCodeDesc');
	importXML('','files/xml/xssAttacks.xml',true, false);
}

/*
 * Displays the user-defined attack info in a new window.
 */
function xssPrePrint(printXMLDoc) {
	var new_window = ''; 
	var printContent = new stringBuffer();
	
	new_window = window.open('files/test/scriptTest.html','PrintXssAttacks','scrollbars=yes,resizable=yes,width=600,height=400');
	
	printFile = printXMLDoc.getElementsByTagName('attack');
	printFileLen = printFile.length;

	if (printFileLen > 0) {
	
	printContent.sbAppend('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 TRANSITIONAL//EN"><html><head>' +
		'<title>XSS Attacks</title><STYLE type="text/css" media="all">@import "' + 
		getBackupPath("files/help/style", "helpStyle", "css") + '";</STYLE></head><body><dl>\n');
		
		for (var i=0;i < printFileLen;i++) {
			if (printFile[i].hasChildNodes()) {
				printContent.sbAppend('<dt>' + safeDisplay(getText(printFile[i].getElementsByTagName('name')[0])) + ':</dt>\n' +
					'<dd>' + safeDisplay(getText(printFile[i].getElementsByTagName('code')[0])) + '</dd>\n\n' +
					'<dd>' + safeDisplay(getText(printFile[i].getElementsByTagName('desc')[0])) + '</dd>\n<hr>');
			}
		}
		printContent.sbAppend('</dl>');
	}
	printContent.sbAppend('</body></html>');
	
	new_window.document.writeln(printContent.sbToString());
	new_window.document.close();	
}

/*
 * Checks for null values in the attack fields.
 */
function nullValues() {

	if (document.getElementById('udAttackTitle').value == '') {
		document.getElementById('udAttackTitle').focus();
		return true;
	}
	if (document.getElementById('attackCode').value == '') {
		document.getElementById('attackCode').focus();
		return true;
	
	}
	if (document.getElementById('description').value == '') {
		document.getElementById('description').focus();
		return true;
	}
	
	return false;
}

/*
 * Clears XSS Attack page fields.
 */
function clearXSSField(xssID) {
	var ebsLen = editBrowString.length;
			
	if (xssID != '') {
		if (xssID == 'xssClearAll') {
			for (var i=5; i<xssClearValueArray.length; i++) {
				clearField(xssClearValueArray[i].toString(), false);
				i+=1;
			}
			
			for (var j=0; j< ebsLen; j++) {
				document.getElementById('ud' + editBrowString[j]).checked = false;
			}

		} else if (xssID == 'xssCodeDesc') {
			for (var i=5; i<10; i++) {
				clearField(xssClearValueArray[i].toString(), false);
				i+=1;
			}
			
		} else if (xssID == 'xssBrowCheck') {
			for (var j=0; j< ebsLen; j++) {
				document.getElementById('ud' + editBrowString[j]).checked = false;
			}

		} else {
			clearField(xssID);
			document.getElementById(xssID).focus();
		}	
	} else {
		displayMessage('Select a field to clear');
	}	
}
