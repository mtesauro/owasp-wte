/*
 * Handles all of the importing and display of XML file information. User makes a 
 * selection from the form element and the corresponding information is retrieved
 * and displayed from XML files.
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
 * Load XML file info into select boxes on page load.
 */
function loadXmlFiles() {
	importXML('','files/xml/testTips.xml', true, true);
}

/*
 * Takes an input form selection, path to the xml file and load type as input and retrieves info.
 */
function importXML(selectIndex, url, topicsOnly, initLoad) {
	var reqHttp_request = '';

    // Non-Windows XMLHttpRequest.
	if (window.XMLHttpRequest) {
		try {
			reqHttp_request = new XMLHttpRequest();
        } catch (e) {
			reqHttp_request = false;
			alert('Cannot create XMLHttpRequest\n' + e);
        }
		
		try {
			if (reqHttp_request) {
	
				reqHttp_request.onreadystatechange = function() {
					if (reqHttp_request.readyState == 4) {
						if (topicsOnly) {
							switch (url) {
								case 'files/xml/testTips.xml':
									clearBox('tips');
									loadXmlTopics(reqHttp_request.responseXML, 'tips', 'tip', 'category', 'category', true);

									if (initLoad) {
										importXML('','files/xml/checklist.xml', true, true);
									}
									break;
								case 'files/xml/checklist.xml':
									clearBox('checkItems');
									loadXmlTopics(reqHttp_request.responseXML, 'checkItems', 'item', 'name', 'name', true);
					
									if (initLoad) {
										importXML('','files/xml/encodings.xml', true, true);
									}	
									break;
								case 'files/xml/encodings.xml':
									clearBox('encodingType');
									loadXmlTopics(reqHttp_request.responseXML, 'encodingType', 'type', 'display', 'value', true);
					
									clearBox('decodingType');
									loadXmlTopics(reqHttp_request.responseXML, 'decodingType', 'type', 'display', 'value', true);
					
									if (initLoad) {
										importXML('','files/xml/reqRespHistory.xml', true, true, true);
									}	
									break;
								case 'files/xml/reqRespHistory.xml':
									clearBox('reqHistory');
									loadXmlTopics(reqHttp_request.responseXML, 'reqHistory', 'case', 'time', 'time', true);
						
									clearBox('resHistory');
									loadXmlTopics(reqHttp_request.responseXML, 'resHistory', 'case', 'time', 'time', true);
					
									if (initLoad) {
										importXML('','files/xml/automator.xml', true, true, true);
									}	
									break;
								case 'files/xml/automator.xml':
 									clearBox('lists');
									loadXmlTopics(reqHttp_request.responseXML, 'lists', 'list', 'listName', 'listName', true);
					
									clearBox('reqLists');
									loadXmlTopics(reqHttp_request.responseXML, 'reqLists', 'list', 'listName', 'listName', true);
						
									if (initLoad) {
										importXML('','files/xml/xssAttacks.xml', true, true);
									}	
									break;
								case 'files/xml/xssAttacks.xml':
									clearBox('xssType');

									if (initLoad) {
										loadXmlTopics(reqHttp_request.responseXML, 'xssType', 'attack', 'name', 'name', true);
										importXML('','files/xml/xssUserAttacks.xml', true, true);
									} else {
										loadXmlTopics(reqHttp_request.responseXML, 'xssType', 'attack', 'name', 'name', false);
										importXML('','files/xml/xssUserAttacks.xml', true, false);
										goToAnchor('#xssAttacks');
									}
									break;
								case 'files/xml/xssUserAttacks.xml':
					
									if (initLoad) {
										loadXmlTopics(reqHttp_request.responseXML, 'xssType', 'attack', 'name', 'name', true);
										goToAnchor('#top');
									} else {
										loadXmlTopics(reqHttp_request.responseXML, 'xssType', 'attack', 'name', 'name', false);
										goToAnchor('#xssAttacks');
									}
									break;
								default:
									displayMessage('Topic loading Error');
							}
				
						} else {
							loadDetails(selectIndex, reqHttp_request.responseXML, url);
						}
					}    
				}
				reqHttp_request.open("GET", url, true);
				reqHttp_request.send(null);
			} else {
				displayMessage('XMLHttpRequest Retrieval Error');
			}	
		} catch(e) {
			alert('ERROR:\n' + e);
		}

    // Windows XMLHttpRequest.	
	} else if (window.ActiveXObject) {

		// Use XMLDOM instead of XMLHttpRequest
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = "false";
		xmlDoc.load(url);
	
		if (xmlDoc.readyState == 4) {
			if (topicsOnly) {
				// Check which xml file is being loaded.
				switch (url) {
					case 'files/xml/testTips.xml':
						clearBox('tips');
						loadXmlTopics(xmlDoc, 'tips', 'tip', 'category', 'category', true);

						if (initLoad) {
							importXML('','files/xml/checklist.xml', true, true);
						}	
						break;
					case 'files/xml/checklist.xml':
						clearBox('checkItems');
						loadXmlTopics(xmlDoc, 'checkItems', 'item', 'name', 'name', true);
		
						if (initLoad) {
							importXML('','files/xml/encodings.xml', true, true);
						}	
						break;
					case 'files/xml/encodings.xml':
						clearBox('encodingType');
						loadXmlTopics(xmlDoc, 'encodingType', 'type', 'display', 'value', true);
		
						clearBox('decodingType');
						loadXmlTopics(xmlDoc, 'decodingType', 'type', 'display', 'value', true);
		
						if (initLoad) {
							importXML('','files/xml/reqRespHistory.xml', true, true);
						}	
						break;
					case 'files/xml/reqRespHistory.xml':
						clearBox('reqHistory');
						loadXmlTopics(xmlDoc, 'reqHistory', 'case', 'time', 'time', true);
			
						clearBox('resHistory');
						loadXmlTopics(xmlDoc, 'resHistory', 'case', 'time', 'time', true);
		
						if (initLoad) {
							importXML('','files/xml/automator.xml', true, true);
						}	
						break;
					case 'files/xml/automator.xml':
						clearBox('lists');
						loadXmlTopics(xmlDoc, 'lists', 'list', 'listName', 'listName', true);
		
						clearBox('reqLists');
						loadXmlTopics(xmlDoc, 'reqLists', 'list', 'listName', 'listName', true);
			
						if (initLoad) {
							importXML('','files/xml/xssAttacks.xml', true, true);
						}	
						break;
					case 'files/xml/xssAttacks.xml':
						clearBox('xssType');

						if (initLoad) {
							loadXmlTopics(xmlDoc, 'xssType', 'attack', 'name', 'name', true);
							importXML('','files/xml/xssUserAttacks.xml', true, true);
						} else {
							loadXmlTopics(xmlDoc, 'xssType', 'attack', 'name', 'name', false);
							importXML('','files/xml/xssUserAttacks.xml', true, false);
							goToAnchor('#xssAttacks');
						}
						break;
					case 'files/xml/xssUserAttacks.xml':
		
						if (initLoad) {
							loadXmlTopics(xmlDoc, 'xssType', 'attack', 'name', 'name', true);
							goToAnchor('#top');
						} else {
							loadXmlTopics(xmlDoc, 'xssType', 'attack', 'name', 'name', false);
							goToAnchor('#xssAttacks');
						}
						break;
					default:
						displayMessage('Topic loading Error');
				}
				
			} else {
				loadDetails(selectIndex, xmlDoc, url);
			}
		}
	}
}
	
/*
 * Loads the topics from XSS Attacks XML file into a select box.
 */
function loadXmlTopics(xmlDoc, selectID, xmlNode, textName, valName, showAll) {
	var x = new Array();
	var xLen = 0;
	var label = ' ';
	var newOptgroup = '';
	var newOpt = '';
	var browNode = '';
	
	var sel = document.getElementById(selectID); 
	var attr = selectID.substring(0,2);

	if (selectID == 'xssType') {
		document.getElementById('browser').innerHTML = 'Browser support:&nbsp;';
		document.getElementById('xssTitle').innerHTML = 'Description:';
	}
	
	if (xmlDoc) {
		x = xmlDoc.getElementsByTagName(xmlNode);
		xLen = x.length;
	
		var browVal = document.getElementById('browFilter').value;
	
		for (var i=0;i < xLen;i++) {
			if (x[i].hasChildNodes()) {
	
				if (typeof x[i].getElementsByTagName('browser')[0] != typeof undefined) {
					if (x[i].getElementsByTagName('browser').length > 0) {
						browNode = getText(x[i].getElementsByTagName('browser')[0]);
					} else {
						browNode = '';
					}	
				} else {
					browNode = '';
				}	
	
				if (showAll) {
	
					// Check that the new item is not part of the existing Optgroup
					if ((selectID != 'reqHistory') && (selectID != 'resHistory') && (selectID != 'lists') && (selectID != 'reqLists')) {
						if (label != getText(x[i].getElementsByTagName('label')[0])) {
							// Create new Optgroup and add to form.
							newOptgroup = document.createElement('optgroup');
							newOptgroup.label = getText(x[i].getElementsByTagName('label')[0]);
							newOptgroup.id = attr + i;
							sel.appendChild(newOptgroup);
							label = getText(x[i].getElementsByTagName('label')[0]);
						}
					}
					newOpt = document.createElement('option');
					newOpt.text  = getText(x[i].getElementsByTagName(textName)[0]);
					newOpt.value = getText(x[i].getElementsByTagName(valName)[0]);
					
					try { // IE browser
						if ((selectID != 'reqHistory') && (selectID != 'resHistory') && (selectID != 'lists') && (selectID != 'reqLists')) {
							sel.add(newOpt);
						} else {
							document.getElementById(selectID).add(newOpt);
						}
					} catch(ex) { // Firefox
						if ((selectID != 'reqHistory') && (selectID != 'resHistory') && (selectID != 'lists') && (selectID != 'reqLists')) {
							newOptgroup.appendChild(newOpt);
						} else {
							document.getElementById(selectID).appendChild(newOpt);
						}
					}
				} else if (browserType(browNode,browVal)) {
					clearXSSField('xssClearAll');
	
					// Check that the new item is not part of the existing Optgroup
					if (label != getText(x[i].getElementsByTagName('label')[0])) {
						// Create new Optgroup and add to form.
						newOptgroup = document.createElement('optgroup');
						newOptgroup.label = getText(x[i].getElementsByTagName('label')[0]);
						newOptgroup.id = attr + i;
						sel.appendChild(newOptgroup);
						label = getText(x[i].getElementsByTagName('label')[0]);
					}
	
					newOpt = document.createElement('option');
					newOpt.text  = getText(x[i].getElementsByTagName(textName)[0]);
					newOpt.value = getText(x[i].getElementsByTagName(valName)[0]);
					
					try { // IE browser
						if ((selectID != 'reqHistory') && (selectID != 'resHistory') && (selectID != 'lists') && (selectID != 'reqLists')) {
							sel.add(newOpt);
						} else {
							document.getElementById(selectID).add(newOpt);
						}
					} catch(ex) { // Firefox
						if ((selectID != 'reqHistory') && (selectID != 'resHistory') && (selectID != 'lists') && (selectID != 'reqLists')) {
							newOptgroup.appendChild(newOpt);
						} else {
							document.getElementById(selectID).appendChild(newOpt);
						}
					}
				}
			}
		}
	}
}

/*
 * Applies the Browser Filter to the attack list.
 */
function browserType(browserNode,browserFilter) {
	var browSplit = '';
	var browSplitLen = 0;
	
	var ebsLen = editBrowString.length;
	
	if (browserNode != '') {
		browSplit = browserNode.split(',');
		browSplitLen = browSplit.length;
	}
		
	switch (browserFilter) {
		case '':
			return true; 
			break;
		case 'ALL':
			for (var a=0;a<ebsLen;a++) {
				if (editBrowString[a] != browSplit[a]) {
					return false;
				}	
			}
			return true;
			break;
		default:
			for (var a=0;a<browSplitLen;a++) {
				if (browSplit[a] == browserFilter) {
					return true;
				}
			}
			return false;
	}
}

/*
 * Builds Supported Browser string.
 */
function browserDisplay(browList) {
	var browSplit = '';
	var browOut = '';
	var match = false;
	
	if (browList != '') {
		browSplit = browList.split(',');
	}

	if (browSplit.length > 0) {
		for (var a=0;a<editBrowString.length;a++) {
			for (var b=0;b<browSplit.length;b++) {
				if (editBrowString[a] == browSplit[b]) {
					browOut += '[<span class="s">' + browSplit[b] + '</span>]';
					match = true;
				} 
			}
			
			if (!match) {
				browOut += '[<span class="ns">' + editBrowString[a] + '</span>]';
			}
			match = false;
		}
	}
	return browOut;
}

var reqFieldArray = new Array('reqMethod','reqSchema','reqFqdn','reqPort','reqPath',
							'reqSeparator','reqParameter','reqQSep','reqQString','reqHead',
							'reqBody','reqAuth','reqUser','reqPass','reqUpFile','resTargetUrl',
							'resStatCode','resStatText','resHead','resBody');

var reqNodeArray = new Array('method','schema','uri','port','path',
							'paramSep','parameter','querySep','queryString','headers',
							'values','authType','authUser','authPass','file','resTargetUrl',
							'resStatCode','resStatText','resHead','resBody');

/*
 * Parses the XML and inserts the proper data into textareas.
 */
function loadDetails(pointer, xmlDoc, url) {
	
	if (url == 'files/xml/xssAttacks.xml') {
		var xLoad = new Array();
		xLoad = xmlDoc.getElementsByTagName('attack');
		var xXmlLen = xLoad.length;

 		clearXSSField('xssClearAll');

		for (var i=0;i < xXmlLen;i++) {
			if (xLoad[i].hasChildNodes()) {
				if (getText(xLoad[i].getElementsByTagName('name')[0]) == pointer) {
					document.XSS.attackCode.value  = getText(xLoad[i].getElementsByTagName('code')[0]);
					document.XSS.description.value = getText(xLoad[i].getElementsByTagName('desc')[0]);
					document.getElementById('browser').innerHTML = 'Browser support:&nbsp;' + 
						browserDisplay(getText(xLoad[i].getElementsByTagName('browser')[0]));
					document.getElementById('xssTitle').innerHTML = 'Description:';
					return;	
				}
			}
		}
		importXML(pointer, 'files/xml/xssUserAttacks.xml', false);
	
	} else if (url == 'files/xml/xssUserAttacks.xml') {
		var x = new Array();
		x = xmlDoc.getElementsByTagName('attack');
		var uaXmlLen = x.length;

		for (var i=0;i < uaXmlLen;i++) {
			if (x[i].hasChildNodes()) {
				if (getText(x[i].getElementsByTagName('name')[0]) == pointer) {

					document.XSS.udAttackTitle.value = getText(x[i].getElementsByTagName('name')[0]);
					document.XSS.attackCode.value  = getText(x[i].getElementsByTagName('code')[0]);
					document.XSS.description.value = getText(x[i].getElementsByTagName('desc')[0]);
					document.getElementById('browser').innerHTML = 'Browser support:&nbsp;' + 
						browserDisplay(getText(x[i].getElementsByTagName('browser')[0]));
					document.getElementById('xssTitle').innerHTML = 'Description:';

					if (typeof x[i].getElementsByTagName('browser')[0] != typeof undefined) {
						browNode = getText(x[i].getElementsByTagName('browser')[0]);
					} else {
						browNode = ' ';
					}	
					
					for (var j=0;j < editBrowString.length;j++) {
						if (browserType(browNode,editBrowString[j])) {
							document.getElementById('ud' + editBrowString[j]).checked = true;
						} else {
							document.getElementById('ud' + editBrowString[j]).checked = false;							
						}
					}
					return;
				}
			} else {
				displayMessage('XSS Attack Information Not Found');
			}
		}
				
	// Web app security testing tips.
	} else if (url == 'files/xml/testTips.xml') {
		var xTip = new Array();
		xTip = xmlDoc.getElementsByTagName('tip');
		var xTipLen = xTip.length;
		var chIndex = document.getElementById('tips').selectedIndex;

		if ((chIndex >= 0) && (chIndex <= xTipLen)) {
			document.CHECKLIST.desc.value     = getText(xTip[chIndex].getElementsByTagName('desc')[0]);
			document.CHECKLIST.examples.value = getText(xTip[chIndex].getElementsByTagName('examples')[0]);
			return;
		} else {
			displayMessage('Testing Tip Not Found');
			return;
		}
		
	// Web app security checklist.
	} else if (url == 'files/xml/checklist.xml') {
		var xChk = new Array();
		xChk = xmlDoc.getElementsByTagName('item');
		var xChkLen = xChk.length;

		for (var i=0;i < xChkLen;i++) {
			if (xChk[i].hasChildNodes()) {
				if (getText(xChk[i].getElementsByTagName('name')[0]) == pointer) {
					document.CHECKLIST.checkTitle.value   = getText(xChk[i].getElementsByTagName('name')[0]);
					document.CHECKLIST.checkResults.value = getText(xChk[i].getElementsByTagName('results')[0]);
					document.CHECKLIST.checkLabel.value = getText(xChk[i].getElementsByTagName('label')[0]);
					return;
				}	
			} else {
				displayMessage('Checklist Item Not Found');
				return;
			}
		}

	// Request/response History List.
	} else if (url == 'files/xml/reqRespHistory.xml') {
		var xHist = new Array();
		xHist = xmlDoc.getElementsByTagName('case');
		var xHistLen = xHist.length;
		var reqFieldLen = reqFieldArray.length;

		for (var i=0;i < xHistLen;i++) {
			if (xHist[i].hasChildNodes()) {
				if (getText(xHist[i].getElementsByTagName('time')[0]) == pointer) {
					for (var j=0;j< reqFieldLen; j++) {
						document.getElementById(reqFieldArray[j]).value = cdataDecode(getText(xHist[i].getElementsByTagName(reqNodeArray[j])[0]));
		
						if (document.getElementById(reqFieldArray[j]).value == ' ') {
							document.getElementById(reqFieldArray[j]).value = '';
						}	
					}
					return;
				}	
			} else {
				displayMessage('Request/Response Not Found');
				return;
			}
		}

	} else {
		displayMessage('No File To Load');
		return;
	}
}

/*
 * Replaces any instances of &#93 in the string with ].
 */
function cdataDecode(inSource) {
	var cdataReg = new RegExp('\&\#93\;','g');	
	var encSource = '';
	
	if (inSource != '') {
		encSource = inSource.replace(cdataReg,']');
		return(encSource);
	} else {
		return(inSource);
	}
}

/*
 * Gets the text for the element.
 */
function getText(inElement) {
	
	if (typeof inElement.textContent != typeof undefined) {
		return inElement.textContent;
	} else if (typeof inElement.firstChild != typeof undefined) {
		return inElement.firstChild.nodeValue;
	} else {
		return null;
	}	
}

/*
 * Clears out the contents of a select box.
 */
function clearBox(boxID) {
	var selID = '';
	
	if (boxID != '') {
		selID = document.getElementById(boxID); 
	}

	if (selID) {
		while (selID.firstChild) { 
			selID.removeChild(selID.firstChild); 
		}
	}
}
