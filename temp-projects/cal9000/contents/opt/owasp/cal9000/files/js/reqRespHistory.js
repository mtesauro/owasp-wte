/*
 * Handles CAL9000 Request/Response History functions.
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
 * Load the reqRespHistory.xml file and processes request.
 */
function prepHistXML(histFunction, hIndex, hCaller, hCount) {	

	var histHttp_request = '';

    // Non-Windows XMLHttpRequest.
	if (window.XMLHttpRequest) {
		try {
			histHttp_request = new XMLHttpRequest();
        } catch (e) {
			histHttp_request = false;
			alert('Cannot create XMLHttpRequest\n' + e);
        }
		
		try {
			if (histHttp_request) {	
				histHttp_request.onreadystatechange = function() {
				
					if (histHttp_request.readyState == 4) {
						switch (histFunction) {
							case 'add':
								addHistCase(hCount); break;
							case 'delete':
								deleteCase(histHttp_request.responseXML, hIndex, hCaller); break;
							case 'printItem':
								histPrePrint(histHttp_request.responseXML, hIndex); break;
							default:
								displayMessage('Please select an edit action');
						}
					}
				}
				
				histHttp_request.open("GET", 'files/xml/reqRespHistory.xml', true);
				histHttp_request.send(null);
			} else {
				displayMessage('XMLHttpRequest Retrieval Error');
			}	
		} catch(e) {
			alert('ERROR:\n' + e);
		}

    // Windows XMLHttpRequest.	
	} else if (window.ActiveXObject) {

		// Use XMLDOM instead of XMLHttpRequest
		var histIEDoc = new ActiveXObject("Microsoft.XMLDOM");
		histIEDoc.async = "false";
		histIEDoc.load('files/xml/reqRespHistory.xml');
	
		if (histIEDoc.readyState == 4) {
			switch (histFunction) {
				case 'add':
					addHistCase(hCount); break;
				case 'delete':
					deleteCase(histIEDoc, hIndex, hCaller); break;
				case 'printItem':
					histPrePrint(histIEDoc, hIndex); break;
				default:
					displayMessage('Please select an edit action');
			}
		}
	}
}

/*
 * Replaces all ] characters with &#93;.
 */
function cdataEncode(inSource) {
	var cdataReg = new RegExp('\]','g');	
	var encSource = '';
	
	if (inSource != '') {
		encSource = inSource.replace(cdataReg,'&#93;');

		return(encSource);
	} else {
		return(inSource);
	}
}

/*
 * Adds a new Request/Response case to the xml file.
 */
function addHistCase(itemCount) {
	var addNewData = new stringBuffer();
	var addCurrentData = '';
	var histNodeLen = reqNodeArray.length;
	var reqDate = new Date();
	var reqTime = reqDate.getTime();
	var addReg = new RegExp('((.|\n)+?(history>\n){1})');
	var nodeName = '';

	itemCount = itemCount -1;

	addNewData.sbAppend('<?xml version="1.0" encoding="ISO-8859-1"?>\n<history>\n');

	for (var y=itemCount;y>=0;y--) {

		addNewData.sbAppend('\t<case>\n\t\t<time>' + reqTime + '</time>\n');
		reqTime = reqTime - 1;

		for (var z=0;z< histNodeLen; z++) {
			nodeName = reqNodeArray[z];

			if ((reqHoldArray[y][z] == '') || (typeof(reqHoldArray[y][z]) == 'undefined')) {
				addNewData.sbAppend('\t\t<'+ nodeName +'><![CDATA[]]></'+ nodeName +'>\n');
			} else {
				addNewData.sbAppend('\t\t<'+ nodeName +'><![CDATA[' + cdataEncode(reqHoldArray[y][z].toString()) + ']]></'+ nodeName +'>\n');
			}
		}
		addNewData.sbAppend('\t\t<label>  </label>\n\t</case>\n');
		
	}
	
	addCurrentData = loadData('files/xml', 'reqRespHistory', 'xml');
	addCurrentData = addCurrentData.replace(addReg,'');

	addNewData.sbAppend(addCurrentData);

	saveData('files/xml','reqRespHistory','xml',addNewData.sbToString());
	reloadHistDisplay();

}

/*
 * Deletes a Request/Response case from the xml file.
 */
function deleteCase(xmlDelCase, delIndex, caller) {

	var delCaseXml = new Array();
	var delContent = '';
	
 	delCaseXml = xmlDelCase.getElementsByTagName('case');
	delCaseXmlLen = delCaseXml.length;

	if (delCaseXmlLen < 1) {
		displayMessage('No case to delete');
		return;
	}
	
	if (delCaseXml[delIndex]) {
		if (delIndex >= 0) {
			xmlDelCase.getElementsByTagName('history')[0].removeChild(delCaseXml[delIndex]);
		
			delContent = buildHistFile(xmlDelCase, 'del');

			if (delContent != '') {
				saveData('files/xml','reqRespHistory','xml',delContent);
		
				clearReqField('reqClearAll', false);
				clearResField('resClearAll', false);
				reloadHistDisplay();
			}
		} else {
			displayMessage('Select a case to delete');
			return;
		}
	}
	
	// Refocuses to the correct page.
	if (caller == 'request') {
		goToAnchor('#httpRequests');
	} else if (caller == 'response') {
		goToAnchor('#httpResponses');
	}	
}

/*
 * Builds the contents of the xml file.
 */
function buildHistFile(xmlBuildDoc) {
	var buildContent = new stringBuffer();
	var histFile = new Array();
	var histFileLen = 0;
	var histNodeLen = reqNodeArray.length;
	
	histFile = xmlBuildDoc.getElementsByTagName('case');
	histFileLen = histFile.length;

	buildContent.sbAppend('<?xml version="1.0" encoding="ISO-8859-1"?>\n<history>\n');
	
	for (var i=0;i < histFileLen;i++) {
		if (histFile[i].hasChildNodes()) {
			buildContent.sbAppend('\t<case>\n\t\t<time>' + getText(histFile[i].getElementsByTagName('time')[0]) + '</time>\n');

			for (var j=0;j< histNodeLen; j++) {
				buildContent.sbAppend('\t\t<'+ reqNodeArray[j] +'><![CDATA[' + 
				cdataEncode(getText(histFile[i].getElementsByTagName(reqNodeArray[j])[0])) + 
				']]></'+ reqNodeArray[j] +'>\n');
			}
			buildContent.sbAppend('\t\t<label>  </label>\n\t</case>\n');
		}
	}
	buildContent.sbAppend('</history>');
	
	return buildContent.sbToString();
}

/*
 * Reloads the reqHistory and resHistory select boxes.
 */
function reloadHistDisplay() {

	clearBox('reqHistory');
	clearBox('resHistory');
	importXML('','files/xml/reqRespHistory.xml',true);	
}

/*
 * Displays the Request/Response case in a new window.
 */
function histPrePrint(printXMLDoc, pointer) {
	var new_window = ''; 
	var printContent = new stringBuffer();
	var reqHeadContent = '';
	var resHeadContent = '';
	
	printFile = printXMLDoc.getElementsByTagName('case');
	printFileLen = printFile.length;

	if (printFileLen > 0) {
	
		new_window = window.open('files/test/scriptTest.html','History','scrollbars=yes,resizable=yes,width=600,height=400');
	
		printContent.sbAppend('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 TRANSITIONAL//EN">' +
						'<html><head><title>Request/Response History</title>' +
						'<STYLE type="text/css" media="all">@import "' + getBackupPath("files/help/style", "helpStyle", "css") + 
						'";</STYLE></head><body><dl>\n');
		
		if (printFile[pointer]) {
			printContent.sbAppend('<dt>' + getText(printFile[pointer].getElementsByTagName('time')[0]) + ':</dt>\n<dd>' + 
				getText(printFile[pointer].getElementsByTagName('method')[0]) + ' ' +
				safeDisplay(cdataDecode(getText(printFile[pointer].getElementsByTagName('resTargetUrl')[0]))) + '</dd>');
			
			var reqHeadArray = getText(printFile[pointer].getElementsByTagName('headers')[0]).split('\n');
			var reqHeadLen = reqHeadArray.length;
			
			for (var h=0;h<reqHeadLen;h++) {
					reqHeadContent += safeDisplay(cdataDecode(reqHeadArray[h])) + '<BR>';
			}
			
			printContent.sbAppend('<dd>' + reqHeadContent + '</dd>' +
				'<dd>' + safeDisplay(cdataDecode(getText(printFile[pointer].getElementsByTagName('values')[0]))) + '</dd>' +
				'<dd>' + (getText(printFile[pointer].getElementsByTagName('authType')[0])) + 
				safeDisplay(getText(printFile[pointer].getElementsByTagName('authUser')[0])) + 
				safeDisplay(getText(printFile[pointer].getElementsByTagName('authPass')[0])) + '</dd>' +
				'<dd>' + safeDisplay(getText(printFile[pointer].getElementsByTagName('file')[0])) + '</dd>' +
				'<dd>' + getText(printFile[pointer].getElementsByTagName('resStatCode')[0]) + ' ' +
				getText(printFile[pointer].getElementsByTagName('resStatText')[0]) + '</dd>');
			
			var resHeadArray = getText(printFile[pointer].getElementsByTagName('resHead')[0]).split('\n');
			var resHeadLen = resHeadArray.length;
			
			for (var j=0;j<resHeadLen;j++) {
				resHeadContent += safeDisplay(cdataDecode(resHeadArray[j])) + '<BR>';
			}
			
			printContent.sbAppend('<dd>' + resHeadContent + '</dd><dd>' + 
				safeDisplay(cdataDecode(getText(printFile[pointer].getElementsByTagName('resBody')[0]))) + '</dd><hr>');
		} else {
			displayMessage('Select a Request/Response To Display');
		}

		printContent.sbAppend('</dl></body></html>');
		
		new_window.document.writeln(printContent.sbToString());
		new_window.document.close();
		printContent = '';
		
	} else {
		displayMessage('Nothing To Display');
	}
}

/*
 * Navigate up/down the case list select box.
 */
function cycleAttacks(direction, histIndex, caller) {
	var newIndex = 0;
	var newValue = '';
	var reqHistLength = document.getElementById('reqHistory').length;
	
	switch (direction) {
		case 'previous':
			newIndex = histIndex + 1;
			break;
		case 'next':
			newIndex = histIndex - 1;
			break;
		default:
			displayMessage('Invalid direction');
	}
	
	if (newIndex >= 0) {
		if (newIndex < reqHistLength) {
			if (caller == 'request') {
				newValue = document.REQUEST.reqHistory[newIndex].value;
				document.REQUEST.reqHistory.selectedIndex = newIndex;
			} else if (caller == 'response') {
				newValue = document.RESPONSE.resHistory[newIndex].value;
				document.RESPONSE.resHistory.selectedIndex = newIndex;
			}

			displayDetails(newValue, caller);

		} else {
			displayMessage('At the earliest history item');
		}
	} else {
		displayMessage('At the latest history item');
	}	
}

/*
 * Displays the case details in the corresponding text fields/textareas.
 */
function displayDetails(pointer, caller) {

	setIndex(caller);
	
	if (caller == 'request') {
		clearReqField('reqClearAll', false);
	} else if (caller == 'response') {
		clearResField('resClearAll', false);
	}

	importXML(pointer,'files/xml/reqRespHistory.xml',false ,false);

	if (caller == 'request') {
		goToAnchor('#httpRequests');
	} else if (caller == 'response') {
		goToAnchor('#httpResponses');
	}
}

/*
 * Makes sure the indexes between reqHistory and resHistory are in synch.
 */
function setIndex(caller) {

	if (caller == 'request') {
		document.RESPONSE.resHistory.selectedIndex = document.REQUEST.reqHistory.selectedIndex;
	} else if (caller == 'response') {
		document.REQUEST.reqHistory.selectedIndex = document.RESPONSE.resHistory.selectedIndex;
	}
}
