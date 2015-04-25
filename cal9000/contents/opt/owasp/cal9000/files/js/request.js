/*
 * Handles all of the functions for the Requests page. 
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
 * Loads the placeholder into the text field.
 */
function loadPlaceholder(inAttackList) {
	document.getElementById('reqPlaceHold').value = '|' + inAttackList + '|';
}

/*
 * Encodes the selected text in a field or the entire field if no text is selected.
 */
function quickEncode(inField, inAction, caller) {
	var inText = '';
	var outText = '';

	if ((inField != '') && (inAction != '')) {
		switch (inAction) {
			case 'encodeUrl':
				inText = findInText(inField);
				outText = plainToUrl(inText,false,'');
				keepUnselectedText(inField, inField, outText, caller);
				break;
			case 'encodeHex': 
				inText = findInText(inField);
				outText = plainToHex(inText,'standardHex',false,'','');
				keepUnselectedText(inField, inField, outText, caller);
				break;
			case 'encodeUni': 
				inText = findInText(inField);
				outText = plainToUnicode(inText,'unicode',false,'','');
				keepUnselectedText(inField, inField, outText, caller);
				break;
			case 'encodeB64': 
				inText = findInText(inField);
				outText = plainToBase64(inText);
				keepUnselectedText(inField, inField, outText, caller);
				break;
			case 'encodeMd5': 
				inText = findInText(inField);
				outText = hex_md5(inText);
				keepUnselectedText(inField, inField, outText, caller);
				break;
			default:
				displayMessage('Invalid Encoding Type');
		}
	}
}

/*
 * Find out if the user wants to process selected text instead of entire field.
 */
function findInText(inputField) {
	var inputText = '';

	setSelectedText(inputField);

	if (selectedText != '') {
		inputText = selectedText;
	} else {
		inputText = document.getElementById(inputField).value;
	}

	return inputText;
}

/*
 * Loads the header values based upon the requested header name.
 */
function loadReqHeadVal(headName) {
	var headLen = reqHeadNameArray.length;
	
	document.getElementById('reqHeadVal').options.length = 1;

	if (headName != '') {
		for (var i=0;i<headLen;i++) {
			if (headName == reqHeadNameArray[i]) {
				textValueEqual(reqHeadNameArray[i+1],'reqHeadVal');
				break;
			}
			i+=1;
		}
	}
	goToAnchor('#httpRequests');
}

/*
 * Adds the header to the reqHead textarea. Dynamically replaces values enclosed in {}.
 */
function addRequestHeader(name, value) {

	if (name != '') {
		if (value.match('{FQDN}')) {
			value = value.replace('{FQDN}',document.REQUEST.reqFqdn.value);
		}
		if (value.match('{b64 user:pass}')) {
			value = value.replace('{b64 user:pass}',plainToBase64(document.REQUEST.reqUser.value + ':' + document.REQUEST.reqPass.value));
		}
		if (value.match('{Request Body Length}')) {
			value = value.replace('{Request Body Length}',document.REQUEST.reqBody.value.length);
		}
		if (value.match('{md5 Request Body}')) {
			value = value.replace('{md5 Request Body}',hex_md5(document.REQUEST.reqBody.value));
		}

		document.REQUEST.reqHead.value += (name + ': ' + value + '\n');

	} else {
		displayMessage('Need to select a Header Name');
	}

	goToAnchor('#httpRequests');
	
}

/*
 * Adds the common headers for the requested Browser.
 */
function addBrowserHeaders(browser) {
	var browserArray = new Array();

	if (browser != '') {
		switch (browser) {
			case 'Firefox':
				browserArray = reqBrowHeadFirefox;
				break;
			case 'IE': 
				browserArray = reqBrowHeadIE;
				break;
			default:
				displayMessage('Invalid Browser Name'); 
		}

		for (var i=0;i<browserArray.length;i++) {
			addRequestHeader(browserArray[i],browserArray[i+1]); 
			i+=1;
		}	
	} else {
		displayMessage('Please select a Browser Name');
	}	
}

/*
 * Adds the "required" headers for the requested Method.
 */
function addMethodHeaders(method) {

	var fqdnValue = document.REQUEST.reqFqdn.value;
	var reqBodyLen = document.REQUEST.reqBody.value.length;
	
	if (fqdnValue == '') {
		fqdnValue = '[USER DEFINED]';
	}

	if (reqBodyLen < 1) {
		reqBodyLen = '0';
	}

	// Set request headers based on Http Method type.
	if (method != '') {
		switch (method) {
			case 'GET':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8'); 
				addRequestHeader('Connection', 'close');				
				break;
			case 'POST': 
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8'); 
				addRequestHeader('Content-Length', reqBodyLen);
				break;
			case 'HEAD':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8'); 
				break;
			case 'TRACE':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Max-Forwards','0'); 
				break;
			case 'TRACK':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Max-Forwards','0'); 
				break;
			case 'OPTIONS':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Max-Forwards','0');
				break;
			case 'CONNECT':
				addRequestHeader('Host',fqdnValue);
				break;
			case 'PUT':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Content-Type','multipart/form-data; charset=UTF-8'); 
				addRequestHeader('Content-Length', reqBodyLen);
				break;
			case 'DELETE':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8'); 
				break;
			case 'COPY':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Depth','infinity');
				addRequestHeader('Destination','[USER DEFINED]');
				addRequestHeader('Overwrite','T');
				break;
			case 'LOCK':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Timeout','infinite');
				addRequestHeader('Content-Type','text/xml; charset=UTF-8'); 
				addRequestHeader('Content-Length', reqBodyLen);
				addRequestHeader('Authorization','Basic {b64 user:pass}');
				break;
			case 'MKCOL':
				addRequestHeader('Host',fqdnValue);
				break;
			case 'MOVE':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Depth','infinity');
				addRequestHeader('Destination','[USER DEFINED]');
				addRequestHeader('Overwrite','T');
				break;
			case 'PROPFIND':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Depth','infinity');
				addRequestHeader('Content-Type','text/xml; charset=UTF-8'); 
				addRequestHeader('Content-Length', reqBodyLen);
				break;
			case 'PROPPATCH':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Content-Type','text/xml; charset=UTF-8'); 
				addRequestHeader('Content-Length', reqBodyLen);
				break;
			case 'SEARCH':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Content-Type','text/xml; charset=UTF-8'); 
				addRequestHeader('Content-Length', reqBodyLen);
				break;
			case 'UNLOCK':
				addRequestHeader('Host',fqdnValue);
				addRequestHeader('Lock-Token','[USER DEFINED]');
				addRequestHeader('Authorization','Basic {b64 user:pass}');
				break;
			default:
				displayMessage('Invalid HTTP method type'); 
		}
	} else {
		displayMessage('Please select a Method');
	}	
}

/*
 * Adds the name/value pair to the QueryString or the Request Body.
 */
function addRequestParameter(location) {
	var name = document.REQUEST.reqParmName.value;
	var value = document.REQUEST.reqParmVal.value;

	if (location != '') {
		if (location == 'parmUrl') {	
			if (document.REQUEST.reqQString.value == '') {
				document.REQUEST.reqQString.value += (name + '=' + value);
			} else {
				document.REQUEST.reqQString.value += ('&' + name + '=' + value);
			}	
		} else if (location == 'parmBody') {
			if (document.REQUEST.reqBody.value == '') {
				document.REQUEST.reqBody.value += (name + '=' + value);
			} else {
				document.REQUEST.reqBody.value += ('&' + name + '=' + value);
			}	
		} else {
			displayMessage('Invalid Parm Set Location');
		}	
	} else {
		displayMessage('Select where to set Parameter');
	}	
}

/*
 * Perform actions on the request body contents.
 */
function requestBodyActions(inAction) {

	if(inAction) {	
		switch (inAction) {
			case 'splitNV':
				document.getElementById('reqBody').value = 
					document.getElementById('reqBody').value.replace(/\&/g,'\n');
				break;
			case 'concatNV': 
				if (window.getSelection) { // Firefox
					document.getElementById('reqBody').value = 
						document.getElementById('reqBody').value.replace(/\n/g,'&');
				} else {
					document.getElementById('reqBody').value = 
						document.getElementById('reqBody').value.replace(/\r\n/g,'&');
				}				
				break;
			case 'charCount':
				displayMessage('Character Count is: ' + document.getElementById('reqBody').value.length);
				break;
			default:
				displayMessage('Invalid Request Body Action');
		}
	}
}

/*
 * Sets HTTP Request Headers to the request.
 */
function setRequestHeaders(httpRequest) {
	var headerTextarea = document.REQUEST.reqHead.value;
	var headerArray = new Array();
	var componentsArray = new Array();
	
	if (headerTextarea != '') {
		headerArray = headerTextarea.split('\n');
		var headLen = headerArray.length;

		for (var i=0;i<headLen;i++) {
			if (headerArray[i] != '') {
				componentsArray = headerArray[i].split(': ');
				if (componentsArray.length > 1) {
					httpRequest.setRequestHeader(componentsArray[0],componentsArray[1]);
				}
			}
		}
	}
}

/*
 * Clears all HTTP Request Headers that the browser may set automatically. 
 * NOTE: The Host header cannot be deleted/edited in Firefox.
 */
function clearRequestHeaders(httpRequest) {
	var reqHeadLen = reqHeadNameArray.length;

	for (var z=0;z<reqHeadLen;z++) {
		httpRequest.setRequestHeader(reqHeadNameArray[z],'');
		z++;
	}
}

/*
 * Parses the TRACE response. This is a workaround until Firefox can process TRACE requests.
 */
function serverSideTrace(response, traceIndex) {
	var responseRaw = new Array();
	var resHeader = '';
	var resBody = '';
	var regEx = /<[^>]*>/g;
	var regEx2 = /\[.*\]/g;
	var regEx3 = /(.)*TRACE(.)*/i;

	if (response != '') {
		responseRaw = response.split('<\/small><\/p>');

		if (responseRaw.length > 0) {
			resHeader = responseRaw[3];
			resHeader = resHeader.replace(regEx,'');
			resHeader = resHeader.replace(regEx2,'');
			resBody = responseRaw[4];
			resBody = resBody.replace(regEx,'');
			resBody = resBody.replace(regEx2,'');

			var resStatus = resHeader.split('\n');

			reqHoldArray[traceIndex][16] = resStatus[3].substr(9,4);
			reqHoldArray[traceIndex][17] = resStatus[3].substring(13,resStatus[3].length);

			resHeader = resHeader.split(resStatus[3] + '\n');

			reqHoldArray[traceIndex][18] = resHeader[1];
			var holdResBody = resBody.substring(15,resBody.length);
			var resBodyLen = holdResBody.length;

			if (holdResBody.match(regEx3)) {
				reqHoldArray[traceIndex][19] = holdResBody;			
			} else {
				reqHoldArray[traceIndex][19] = '\nNo TRACE Information in Body\n'; 
			}
		}
	} else {
		reqHoldArray[traceIndex][19] = 'No Information Returned.';
	}
}

/*
 * Check that file that is to be uploaded has been preloaded.
 */
function checkPreload(reqMethod, uploadIndex) {

	// Before we can upload a file, we need to load the file contents into the Request Body. 
 	if (reqMethod == 'PUT') {

		if (document.getElementById('reqBody').value == '') {
			displayMessage('Need To Preload a File First');
			document.getElementById('reqUpFile').focus();
			return(false);
		}	
	}
	return(true);
}

/*
 * Files that are to be uploaded need to be preloaded first.
 */
function preload() {

	reqHttp_request = false;
	var url = '';
	
	url = document.getElementById('reqUpFile').value;

	// Process Valid URLs.
	if (validateUrl(url)) {

		createHttpRequest();

		// Execute XMLHttpRequest.
		try {		
			reqHttp_request.open('GET', url, true);
			reqHttp_request.onreadystatechange = function() {
			
				try {
					if (reqHttp_request.readyState == 4) {
						if (reqHttp_request.status == 200) {	
							document.getElementById('reqBody').value = reqHttp_request.responseText;
							displayMessage('Remote File Preload Complete');
							return true;
						} else if (reqHttp_request.responseText != null) {
							document.getElementById('reqBody').value = reqHttp_request.responseText;
							displayMessage('Local File Preload Complete');
							return true;
						} else {
							displayMessage('File not found');
							return false;
						}	
					} else {
						displayMessage('Processing...');
					}
				} catch (e) {
					alert('loadHoldError:\n' + e);
					return false;
				}
			}
			reqHttp_request.send(null);		
		} catch (e) {
			alert('PreloadError:\n' + e);
			return false;
		}    
	// Invalid URL.
	} else {
		goToAnchor('#httpRequests');
		displayMessage('Invalid Path To File');
		document.REQUEST.reqUpFile.focus();
		return false;
	}
	return true;
}

/*
 * Process a single http request.
 */
function singleRequest() {

	if (validateRequest()) {
		reqHoldArray = new Array();
		reqHoldArray[0] = new Array();
		
		for (var col=0; col<20; col++) {
			reqHoldArray[col] = new Array();
		}
		
		for (var v=0;v<14;v++) {
			reqHoldArray[0][v] = document.getElementById(reqFieldArray[v]).value;
		}
		
		clearResField('resClearAll', false, false);	
		createMultReq(0);
		multReqSend(0,1);
	}
}

/*
 * Process multiple http requests at once. Driven by an Attack List.
 */
function launchAutoAttack(xmlLaunchDoc, inListIndex) {

	var itemValue = '';

	reqHoldArray = new Array();
	reqHoldArray[0] = new Array();
	
	for (var col=0; col<20; col++) {
		reqHoldArray[col] = new Array();
	}
 
	if (('|' + document.getElementById('reqLists').value + '|') == document.getElementById('reqPlaceHold').value) {
		var xList = new Array();
		xList = xmlLaunchDoc.getElementsByTagName('listItems');
	
		var xItem = new Array();
		xItem = xList[inListIndex].getElementsByTagName('code');
		var xItemLen = xItem.length;
	} else {
		displayMessage('AttackList/Placeholder Mismatch');
		return;
	}
	
	if (xItemLen > 0) {
		clearResField('resClearAll', false, false);	

		for (var o=0;o<xItemLen;o++) {
			itemValue = getText(xItem[o]);
			if (insertAttackValue(o,itemValue)) {
					createMultReq(0);
			} else {
				displayMessage('No Placeholder Defined');
				return;
			}
		}
		
		for (var p=0;p<xItemLen;p++) {
			if (validateRequest()) {
				multReqSend(p, xItemLen);
			}	
		}
	} else {
		displayMessage('Need to select a valid Attack List');
	}
}

/*  
 * Method, FQDN and Schema are required for a Request.
 */
function validateRequest() {

	if ((document.getElementById('reqMethod').value == ' ') ||
		(document.getElementById('reqFqdn').value == '') ||
		(document.getElementById('reqSchema').value == '')) {
		
		displayMessage('Missing mandatory information');

		if (document.getElementById('reqMethod').value == ' ') {
			document.REQUEST.reqMethod.focus();
		} else if (document.getElementById('reqFqdn').value == '') {
			document.REQUEST.reqFqdn.focus();
		} else {
			document.REQUEST.reqSchema.focus();
		}
		return(false);
	}
	
	return(true);
}

/*
 * Replaces the [placeholder] with the value in the attack list.
 */
function insertAttackValue(holdIndex, attackListValue) {
	var placeValue = '';
	var attackValue = '';

	placeValue = document.getElementById('reqPlaceHold').value;
	attackValue = attackListValue;

	if (placeValue != '') {
		for (var w=0;w<14;w++) {
			reqHoldArray[holdIndex][w] = 
				document.getElementById(reqFieldArray[w]).value.replace(placeValue, attackValue);
		}
		return(true);
	} else {
		return(false);
	}
}


var reqHoldArray = new Array();
var xmlreqs = new Array();
var reqHttp_request = '';

/*
 * Create a single XHR.
 */
function createHttpRequest() {

	// Non-Windows XMLHttpRequest.
	if (window.XMLHttpRequest) {
		try {
			reqHttp_request = new XMLHttpRequest();
		} catch (e) {
			alert('Cannot create XMLHttpRequest:\n' + e);
			reqHttp_request = false;
		}
	// Windows XMLHttpRequest.
	} else if (window.ActiveXObject) {
		try {
			reqHttp_request = new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try {
				reqHttp_request = new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e) {
				alert('Cannot create XMLHttpRequest:\n' + e);
				reqHttp_request = false;
			}
		}
	}
}	

/*
 * Create a multiple XHR.
 */
function createMultReq(freed) {

	this.freed = freed;
	this.xmlhttp = false;

	// Non-Windows XMLHttpRequest.
	if (window.XMLHttpRequest) {
		try {
			this.xmlhttp = new XMLHttpRequest();
		} catch (e) {
			alert('Cannot create XMLHttpRequest:\n' + e);
			return false;
		}
	// Windows XMLHttpRequest.
	} else if (window.ActiveXObject) {
		try {
			this.xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');

		} catch (e) {
			try {
				this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');

			} catch (e) {
				alert('Cannot create XMLHttpRequest:\n' + e);
				return false;
			}
		}
	}
	return false;
}

/*
 * Send multiple XHRs.
 */
function multReqSend(inIndex, inItemLen) {

	try {
		if (netscape.security.PrivilegeManager.enablePrivilege) {
			netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
		}
	} catch(ex) {
	}
	
	var pos = -1;
	for (var f=0; f<xmlreqs.length; f++) {
		if (xmlreqs[f].freed == 1) { 
			pos = f; 
			break; 
		}
	}

	if (pos == -1) {
		pos = xmlreqs.length; 
		xmlreqs[pos] = new createMultReq(1); 
	}
	
	if (xmlreqs[pos].xmlhttp) {
		xmlreqs[pos].freed = 0;

		if (reqHoldArray[inIndex][3] != '') {
			reqHoldArray[inIndex][3] = ':' + reqHoldArray[inIndex][3];
		}
	
		if (reqHoldArray[inIndex][11] == 'URL') {
			reqHoldArray[inIndex][2] = reqHoldArray[inIndex][12] + ':' + 
				reqHoldArray[inIndex][13] + '@' + reqHoldArray[inIndex][2];
		}

		if (reqHoldArray[inIndex][0] == 'PUT') {
			if (reqHoldArray[inIndex][10] == '') {
				displayMessage('Need To Preload a File First');
				document.getElementById('reqUpFile').focus();
				return;
			}	
		}

		try {
			// Workaround for TRACE requests until(if) Firefox is able to process them natively.
			// Sends request to webservice, then sets reqHttp_request.open as a GET.
			if (reqHoldArray[inIndex][0] == 'TRACE') {
				xmlreqs[pos].xmlhttp.open('GET','http://www.digilantesecurity.com/cgi/http_trace.pl?url='+ 
				reqHoldArray[inIndex][1] + reqHoldArray[inIndex][2] + reqHoldArray[inIndex][3] + 
				reqHoldArray[inIndex][4] + reqHoldArray[inIndex][5] + reqHoldArray[inIndex][6] + 
				reqHoldArray[inIndex][7] + reqHoldArray[inIndex][8] +'&method=TRACE&version=HTTP%2F1.0', 
				true, reqHoldArray[inIndex][12], reqHoldArray[inIndex][13]);
			} else {
				xmlreqs[pos].xmlhttp.open(reqHoldArray[inIndex][0], reqHoldArray[inIndex][1] + 
				reqHoldArray[inIndex][2] + reqHoldArray[inIndex][3] + reqHoldArray[inIndex][4] + 
				reqHoldArray[inIndex][5] + reqHoldArray[inIndex][6] + reqHoldArray[inIndex][7] + 
				reqHoldArray[inIndex][8], true, reqHoldArray[inIndex][12], reqHoldArray[inIndex][13]);
			}
			
			if (window.XMLHttpRequest) { // IE cannot set request headers to null
				clearRequestHeaders(xmlreqs[pos].xmlhttp);
			}
			
			setRequestHeaders(xmlreqs[pos].xmlhttp);
	
			xmlreqs[pos].xmlhttp.onreadystatechange = function() {
				if (typeof(multReqProcess) != 'undefined') { 
					multReqProcess(pos,inIndex,inItemLen); 
				}
			}
			xmlreqs[pos].xmlhttp.send(reqHoldArray[inIndex][10]);

		} catch (e) {
			alert('multReqSend Error:\n' + e);
		}
	}
}

/*
 * Process multiple XHRs.
 */
function multReqProcess(pos,resIndex,resItemLen) {

	var received = false;
	var workLen = 0;
	workLen = resItemLen-1;
	
	try {
		if (netscape.security.PrivilegeManager.enablePrivilege) {
			netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
		}
	} catch(ex) {
	}
	
	try {
		if ((typeof(xmlreqs[pos]) != 'undefined') && (xmlreqs[pos].freed == 0) && (xmlreqs[pos].xmlhttp.readyState == 4)) {
			if (reqHoldArray[resIndex][0] == 'TRACE') {
				serverSideTrace(xmlreqs[pos].xmlhttp.responseText,resIndex);
				
				reqHoldArray[resIndex][15] = (reqHoldArray[resIndex][1] + reqHoldArray[resIndex][2] + 
					reqHoldArray[resIndex][3] + reqHoldArray[resIndex][4] + reqHoldArray[resIndex][5] + 
					reqHoldArray[resIndex][6] + reqHoldArray[resIndex][7] + reqHoldArray[resIndex][8]);
	
			} else {
				reqHoldArray[resIndex][15] = (reqHoldArray[resIndex][1] + reqHoldArray[resIndex][2] + 
					reqHoldArray[resIndex][3] + reqHoldArray[resIndex][4] + reqHoldArray[resIndex][5] + 
					reqHoldArray[resIndex][6] + reqHoldArray[resIndex][7] + reqHoldArray[resIndex][8]);
					reqHoldArray[resIndex][16] = xmlreqs[pos].xmlhttp.status;
					reqHoldArray[resIndex][17] = getStatusText(xmlreqs[pos].xmlhttp.status);
	
				reqHoldArray[resIndex][18] = xmlreqs[pos].xmlhttp.getAllResponseHeaders(); 
				reqHoldArray[resIndex][19] = xmlreqs[pos].xmlhttp.responseText;
			}
			
			// Makes sure all responses have been received before continuing to process.
			for (t=workLen;t>=0;t--) {
				if (typeof(reqHoldArray[t][18]) != 'undefined') {
					received = true;
				} else {
					received = false;
					break;
				}
			}
			
			// Add results to reqRespHistory.xml file.
			if (received) {
				prepHistXML('add','','',resItemLen);
				displayMessage('Request(s) Complete');
			}
			
			xmlreqs[pos].freed = 1;
		} else {
			displayMessage('Processing...');
		}
	} catch (e) {
		alert('multReqProcess Error:\n' + e);
		return;
	}
}

/*
 * Apply UniversalBrowserRead privilege.
 */
function applyPrivilege(functionCallback, param) {
	
	try {
		if (netscape.security.PrivilegeManager.enablePrivilege) {
			netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
		}
	} catch(ex) {
	}

	// Proceed on to the Function.
	functionCallback(param);
}

/*
 * Clears out Requests page text fields/textareas.
 */
function clearReqField(reqID, inFocus) {

	if (reqID != '') {
		if (reqID == 'reqClearAll') {
			for (var i=3; i<reqClearValueArray.length; i++) {
				clearField(reqClearValueArray[i].toString(), inFocus);
				i+=1;
			}
			document.REQUEST.reqPath.value = '/';
			document.REQUEST.reqFqdn.focus();
		} else {
			if (reqID == 'reqPath') {
				document.REQUEST.reqPath.value = '/';
			} else {
				clearField(reqID);
			}
			document.getElementById(reqID).focus();
		}	
	} else {
		displayMessage('Select a field to clear');
	}	
}

