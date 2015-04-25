/*
 * Processes the functions in the Responses page.
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

/*
 * Takes a url as input and retrieves its source code.
 */
function loadTarget() {		
	reqHttp_request = '';
	var url = '';
	var hashPos = 0;

	url = document.RESPONSE.resTargetUrl.value;		
	clearResField('resClearAll',false);
	document.RESPONSE.resTargetUrl.value = url;
	url = validateUrl(url);		
	
	// Process Valid URLs.
	if (url) {
		// Remove any anchors in the path.
		hashPos = url.indexOf("#");		
		if (hashPos != -1) {
			url = url.substring(0,hashPos);
		}

		createHttpRequest(0);

		// Execute XMLHttpRequest.
		try {		
			reqHttp_request.onreadystatechange = function() {
			
				try {
					if (reqHttp_request.readyState == 4) {
						document.RESPONSE.resStatCode.value = reqHttp_request.status;
						document.RESPONSE.resStatText.value = getStatusText(reqHttp_request.status);
						document.RESPONSE.resHead.value = reqHttp_request.getAllResponseHeaders();
						document.RESPONSE.resBody.value = reqHttp_request.responseText;
					} else {
						displayMessage('Processing...'); 		       
					}
				} catch (e) {
					alert('Retrieval Error:\n' + e);
					return false;
				}
				goToAnchor('#httpResponses');
				return true;			
			}
			
			reqHttp_request.open('GET', url, true);
			reqHttp_request.send(null);		
		} catch (e) {
			alert('loadTarget Error:\n' + e);
		}    
	// Invalid URL.
	} else {
		document.RESPONSE.resTargetUrl.focus();
		document.RESPONSE.resTargetUrl.select();		
		displayMessage('Invalid URL');
		return false;
	}
	return(true);
}
 
var statusArray = new Array(
	'1xx','Informational 1xx',
	'100','Continue',
	'101','Switching Protocols',
	'102','Processing',
	'2xx','Successful 2xx',
	'200','OK',
	'201','Created',
	'202','Accepted',
	'203','Non-Authoritative Information',
	'204','No Content',
	'205','Reset Content',
	'206','Partial Content',
	'207','Multi-Status',
	'3xx','Redirection 3xx',
	'300','Multiple Choices',
	'301','Moved Permanently',
	'302','Found',
	'303','See Other',
	'304','Not Modified',
	'305','Use Proxy',
	'306','(Unused)',
	'307','Temporary Redirect',
	'4xx','Client Error 4xx',
	'400','Bad Request',
	'401','Unauthorized',
	'402','Payment Required',
	'403','Forbidden',
	'404','Not Found',
	'405','Method Not Allowed',
	'406','Not Acceptable',
	'407','Proxy Authentication Required',
	'408','Request Timeout',
	'409','Conflict',
	'410','Gone',
	'411','Length Required',
	'412','Precondition Failed',
	'413','Request Entity Too Large',
	'414','Request-URI Too Long',
	'415','Unsupported Media Type',
	'416','Requested Range Not Satisfiable',
	'417','Expectation Failed',
	'422','Unprocessable Entity',
	'423','Locked',
	'424','Failed Dependency',
	'5xx','Server Error 5xx',
	'500','Internal Server Error',
	'501','Not Implemented',
	'502','Bad Gateway',
	'503','Service Unavailable',
	'504','Gateway Timeout',
	'505','HTTP Version Not Supported',
	'507','Insufficient Storage',
	'12002','ERROR_INTERNET_TIMEOUT',
	'12005','ERROR_INTERNET_INVALID_URL',
	'12006','ERROR_INTERNET_UNRECOGNIZED_SCHEME',
	'12007','ERROR_INTERNET_NAME_NOT_RESOLVED',
	'12008','ERROR_INTERNET_PROTOCOL_NOT_FOUND',
	'12009','ERROR_INTERNET_INVALID_OPTION',
	'12015','ERROR_INTERNET_LOGIN_FAILURE',
	'12023','ERROR_INTERNET_NO_DIRECT_ACCESS',
	'12027','ERROR_INTERNET_INCORRECT_FORMAT',
	'12028','ERROR_INTERNET_ITEM_NOT_FOUND',
	'12029','ERROR_INTERNET_CANNOT_CONNECT',
	'12030','ERROR_INTERNET_CONNECTION_ABORTED',
	'12031','ERROR_INTERNET_CONNECTION_RESET',
	'12041','ERROR_INTERNET_MIXED_SECURITY',
	'12043','ERROR_INTERNET_POST_IS_NON_SECURE',
	'12044','ERROR_INTERNET_CLIENT_AUTH_CERT_NEEDED',
	'12046','ERROR_INTERNET_CLIENT_AUTH_NOT_SETUP',
	'12049','ERROR_INTERNET_DIALOG_PENDING',
	'12150','ERROR_HTTP_HEADER_NOT_FOUND',
	'12152','ERROR_HTTP_INVALID_SERVER_RESPONSE',
	'12153','ERROR_HTTP_INVALID_HEADER',
	'12154','ERROR_HTTP_INVALID_QUERY_REQUEST',
	'12155','ERROR_HTTP_HEADER_ALREADY_EXISTS',
	'12156','ERROR_HTTP_REDIRECT_FAILED',
	'12161','ERROR_HTTP_COOKIE_NEEDS_CONFIRMATION',
	'12162','ERROR_HTTP_COOKIE_DECLINED',
	'12163','ERROR_INTERNET_DISCONNECTED',
	'12164','ERROR_INTERNET_SERVER_UNREACHABLE',
	'12165','ERROR_INTERNET_PROXY_SERVER_UNREACHABLE',
	'12169','ERROR_INTERNET_SEC_INVALID_CERT',
	'12175','ERROR_INTERNET_DECODING_FAILED'
	);
	
/*
 * Gets the Status Text based on the Status Code.
 */
function getStatusText(statusCode) {
	var statusText = 'No Status Text Available';

	if (statusCode != '') {
		for (var s=0;s<statusArray.length;s++) {
			if (statusCode == statusArray[s]) {
				statusText = statusArray[s+1];
				break;
			}
			s+=1;	
		}
	}
	
	return statusText;
}

/*
 * Displays the scripts and forms for a page.
 */
function showElements(url, type, index) {
	var elemArray = new Array();

	if (type != '') {
		if ((type == 'Script') || (type == 'Form')) {
			
			if (type == 'Script') {
				var regEx = /<script?[\s\w\W]*?<\/script>/ig;
			} else if (type == 'Form') {
				var regEx = /<form?[\s\w\W]*?<\/form>/ig;
			}
	
			// Identify all of the scripts or forms.
			if(regEx.test(document.RESPONSE.resBody.value)) { 
				elemArray = document.RESPONSE.resBody.value.match(regEx);
			} else {
				clearResField('resElements',false);
				displayMessage('No instances of that element');
				return false;
			}
		} else {
			var headerArray = '';
			
			if (reqHttp_request) {
				headerArray = reqHttp_request.getResponseHeader('Set-Cookie'); 
			}
			
			if (headerArray) {
				elemArray = headerArray.split('\n');
			} else {
				clearResField('resElements',false);
				displayMessage('No Cookies To Display (May need to Reload)');
				return false;
			}			
		}

	} else {
		displayMessage('Select an element type');
		return false;
	}
	
	var elemLen = elemArray.length;
	var i = index;

	if (i < 0) {
		displayMessage('Going to last element');
		i = elemLen-1;
	} else if (i >= elemLen) {
		displayMessage('Going to first element');
		i = 0;			
	}
	
	if (elemArray[i] != null) {
		var id = 'code' + (i+1);

		var element = 
			type + " " + (i+1) + " of " + elemLen + ":&nbsp;&nbsp;" +
			"<input type='button' class='button' value='Previous' onclick='showElements(\""+url+"\",\""+type+"\","+(i-1)+")'>" +
			"<input type='button' class='button' value='Next' onclick='showElements(\""+url+"\",\""+type+"\","+(i+1)+")'>" +
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			"<input type='button' class='button' value='Select All' onClick='selectAllText(\"" + id + "\")'>";
			
		if (type != 'Cookie') {
			element += "<input type='button' class='button' value='Delete' onclick='deleteElement(\"" +url+"\",\""+type+"\","+i+",\""+id + "\")'>";
		}
		
		element += setScriptPath(elemArray[i], url) + "<BR>" +
			"<CENTER><textarea cols='50' rows='4' id='"+ id +"'" +
			" onSelect='setSelectedText(this.id)' onChange='setSelectedText(this.id)'></textarea></CENTER>";

		document.getElementById('myDiv').innerHTML = element;
		document.getElementById(id).value = elemArray[i];
	}
	goToAnchor('#httpResponses');
	return true;
}

/*
 * Sets path to script so user can view the source for that script.
 */
function setScriptPath(contents, url) {
	var raw = new Array();
	var linkArray1 = new Array();
	var hashPos = '';
	var linkArray2 = new Array();		
	var sourceResult = '';
	
	var regexp1=/src(.*).js/ig;
	var regexp2=/http(.*).js/ig;
	var regexp3=/((\/)*[\w]*\/(.)*\/(.*)\.js)+?/ig;

	// Determines path to remote script source and adds "View Source" button.
	if (regexp1.test(contents)) {
		raw = contents.match(regexp1);
		var rawLen = raw.length;
		
		for (var z = 0; z < rawLen; z++) { 	
	
			// If absolute path to script.
			if (regexp2.test(raw[z])) {			
				linkArray1 = raw[z].match(regexp2);
				var la1Len = linkArray1.length;
				
				if (la1Len > 0) {
					for (var i = 0; i < la1Len; i++) { 
						if (linkArray1[i] != null) { 				
							sourceResult = "<input type=button class='button' value='View Source' onclick=showSource(" + "'" + linkArray1[i] + "'" + ")>";
						}
					}
				}
			// If relative path to script.
			} else if (regexp3.test(raw[z])) {

				// reduce path to directory level.
				hashPos = url.lastIndexOf("/");					
				if ((hashPos != -1) && (hashPos > 7)) {
					url = url.substring(0,hashPos + 1);
				}
				
				linkArray2 = raw[z].match(regexp3);
				var la2Len = linkArray2.length;
				
				if (la2Len > 0) {
					for (var i = 0; i < la2Len; i++) { 
						if (linkArray2[i] != null) {
							sourceResult = "<input type=button class='button' value='View Source' onclick=showSource(" + "'" + url + linkArray2[i] + "'" + ")>";
						}
					}
				}
			}
		}
	}
	return sourceResult;
}

/*
 * Takes a url as input and retrieves its source code.
 */
function showSource(sourceUrl) {		
	reqHttp_request = '';

	// Process Valid URLs.
	if (validateUrl(sourceUrl)) {

		try {
			if (netscape.security.PrivilegeManager.enablePrivilege) {
				netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
			}
		} catch(ex) {
		}

		createHttpRequest(0);

		// Execute XMLHttpRequest.
		try {		
			reqHttp_request.onreadystatechange = function() {
			
				try {
					if (reqHttp_request.readyState == 4) {
						var new_window = window.open('files/test/scriptTest.html','ScriptSource','scrollbars=yes,resizable=yes,width=600,height=400');
						new_window.document.writeln('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 TRANSITIONAL//EN">' +
							'<html><head><title>Source Display</title></head><body><P STYLE="font-size: small">\n' +
							safeDisplay(reqHttp_request.responseText) + '</p></body></html>');
						new_window.document.close();	
					} else {
						displayMessage('Processing...'); 		       
					}
				} catch (e) {
					alert('Source Retrieval Error:\n' + e);
					return false;
				}
				return true;			
			}
			
			reqHttp_request.open('GET', sourceUrl, true);
			reqHttp_request.send(null);		
		} catch (e) {
			alert('showSource Error:\n' + e);
		}    
	// Invalid URL.
	} else {
		displayMessage('Invalid Path to Source Code');
		return false;
	}
	return(true);
}
/*
 * Deletes chosen Script or Form element from the Response Body.
 */
function deleteElement(inUrl, inType, inIndex, inID) {
	var bodyEdit = document.RESPONSE.resBody.value;
	var elem = '';
	
	elem = document.getElementById(inID).value;
	document.RESPONSE.resBody.value = bodyEdit.replace(elem, '');
	
	showElements(inUrl, inType, inIndex);
}

/*
 * Validate incoming URL(not very strict).
 */
function validateUrl(url) {
	var regexp = /^(http|https|file|ftp|ldap|ldaps):\/\/(\/|\w+:{0,1}\w*@)?(\/|\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
	
	if (!regexp.test(url)) {
		displayMessage('Invalid Url');
		document.RESPONSE.resTargetUrl.focus();
		return false;
	} else {
		return url;
	}
}

/*
 * Opens HTTP Response in new window for graphical display.
 */
function browserView(url, httpResponse) {
	var new_window = ''; 
	var urlPath = '';
	
	if (url != '') {
		// Remove Excess Path Info
		var urlPos = url.lastIndexOf('/');	
	
		if ((urlPos != -1) && (urlPos > 10)) {
			urlPath = url.substring(0,urlPos);
		} else {
			urlPath = url;
		}	
	
		var regHref = /href\=(\'|\")(\/|\#)[^\s\>]+/i;
		var hrefArray = httpResponse.match(regHref);

		while (hrefArray) {		
			var stripHref = '';
			stripHref = hrefArray[0].substring(6,hrefArray[0].length);

			stripHref = stripHref.replace('//','/');
			
			httpResponse = httpResponse.replace(hrefArray[0], 'href="'+(urlPath + stripHref));
			hrefArray = httpResponse.match(regHref);
		}
	}

	if (httpResponse != '') {
		new_window = window.open('files/test/scriptTest.html','ScriptTest','scrollbars=yes,resizable=yes,width=600,height=400');
		
		new_window.document.writeln(httpResponse.valueOf());
		new_window.document.close();	
	} else {
		displayMessage('Nothing To display');
	}	
}

/*
 * Clear fields associated with the Response function.
 */
function clearResField(resID, focus, loadState) {

	if (resID != '') {
		if (resID == 'resClearAll') {
			var crfLen = resClearValueArray.length;
			for (var i=5; i<crfLen; i++) {
				clearField(resClearValueArray[i], false);
				i+=1;
			}
			document.getElementById('myDiv').innerHTML = ('');
			if (document.RESPONSE.myDiv) {
				document.RESPONSE.myDiv.value = ('');
			}
			if (focus) {
				goToAnchor('#httpResponses');
			}
			
		} else if (resID == 'resElements') {
			document.getElementById('myDiv').innerHTML = ('');
			if (document.RESPONSE.myDiv) {
				document.RESPONSE.myDiv.value = ('');
			}
			if (!loadState) {
				goToAnchor('#httpResponses');
			}
		} else {
			clearField(resID);
			document.getElementById(resID).focus();
		}	
	} else {
		displayMessage('Select a field to clear');
	}
}
