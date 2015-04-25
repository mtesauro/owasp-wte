/*
 * Handles miscellaneous application functions.
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

function mainInit() {
	setAttributes();
	loadDropDowns();
	loadXmlFiles();
}	

/*
 * Sets attribute to keep focus on same href if browser window is resized.
 * Sets autocomplete=off for all input fields. This is a workaround for a Firefox bug
 * that can't handle focus() requests properly.
 */
function setAttributes() {

	var body = document.getElementsByTagName("BODY");

	body[0].setAttribute('onresize', 'window.location.href=window.location.href');


	var inputs = document.getElementsByTagName("INPUT");

	for (var i=0; i<inputs.length; i++) {
		if (inputs[i].type == 'text') {
			inputs[i].setAttribute('autocomplete', 'off');
			inputs[i].setAttribute('onchange', 'setSelectedText(this.id)');
			inputs[i].setAttribute('onselect', 'setSelectedText(this.id)');
		}
	}

	var textareas = document.getElementsByTagName("textarea");

	for (var j=0; j<textareas.length; j++) {
		textareas[j].setAttribute('autocomplete', 'off');
		textareas[j].setAttribute('onchange', 'setSelectedText(this.id)');
		textareas[j].setAttribute('onselect', 'setSelectedText(this.id)');
	}
}

/*
 * Replaces regex match, then tries to execute the filtered script.
 */
function processRegex(regAction) {
	
	var regexExpr = document.XSS.regExpr.value;
	var regexFlag = document.XSS.regFlag.value;
	var regexReplace = document.XSS.regReplace.value;
	var textToTest = document.getElementById('attackCode').value;
	var regexMatch = new Array();	
	var regFlags = /[g|i|m]/;
	var validFlag = false;
	
	var regexFlagLen = regexFlag.length;
	
	for (var f=0;f<regexFlagLen;f++) {
		if (regexFlag.charAt(f).match(regFlags)) {
			validFlag = true;
		} else {
			validFlag = false;
			document.XSS.regFlag.focus();
			document.XSS.regFlag.select();
			break;
		}
	}
	
	if ((regexFlag == '') || (validFlag)) {
		var regFull = new RegExp(regexExpr, regexFlag);
	} else {
		displayMessage('Invalid Flag');
		return;
	}
	
	document.getElementById('xssTitle').innerHTML = 'Regex&nbsp;Result:';

	if (regexExpr != '') {
		switch (regAction) {
			case 'regMatch':
				document.getElementById('description').value = '';
				document.getElementById('description').value = 'Matches:\n';

				regexMatch = textToTest.match(regFull);
	
				try {
					if (regexMatch.length > 1) {
						for (var i=0;i<regexMatch.length;i++) {
							document.getElementById('description').value += regexMatch[i] + "\n";
						}
					} else {
						document.getElementById('description').value += regexMatch;
					}
					displayMessage('Number of Matches: ' + regexMatch.length);
				} catch(ex) {
					displayMessage('Number of Matches: 0');
				}	
				break;
			case 'regReplace': 
				document.getElementById('description').value = '';
				document.getElementById('description').value = 'Replaced Result:\n';

				textToTest = textToTest.replace(regFull,regexReplace);
				document.getElementById('description').value += textToTest;
				break;
			case 'regSplit': 
				document.getElementById('description').value = '';
				document.getElementById('description').value = 'Splits:\n';

				var regArray = textToTest.split(regFull);
				
				for (j in regArray) {
					document.getElementById('description').value += regArray[j] + '\n';
				}
				break;
			case 'regNewW':
				textToTest = textToTest.replace(regFull,regexReplace);
				executeScript(unescape(textToTest));
				break;
			default:
				displayMessage('Please Select a Regex Action');
		}
	} else {
		displayMessage('Please Supply a Regex Expression');
		document.XSS.regExpr.focus();
		document.XSS.regExpr.select();
	}	
}

/*
 * Builds and executes the Scroogle search.
 */
function buildSearch(searchTerm, searchType) {
	var term = '';
	var type = '';
	var target = '';

	term = searchTerm;
	type = searchType;
	
	if (document.SEARCH.siteText.value) {
		term += '+site:' + document.SEARCH.siteText.value;
	}
	if (document.SEARCH.inurlText.value) {
		term += '+inurl:' + document.SEARCH.inurlText.value;
	}
	if (document.SEARCH.filetypeText.value) {
		term += '+filetype:' + document.SEARCH.filetypeText.value;
	}
	if (document.SEARCH.allinurlText.value) {
		term += '+allinurl:' + document.SEARCH.allinurlText.value;
	}
	if (document.SEARCH.cacheText.value) {
		term += '+cache:' + document.SEARCH.cacheText.value;
	}
	if (document.SEARCH.intitleText.value) {
		term += '+intitle:' + document.SEARCH.intitleText.value;
	}
	if (document.SEARCH.linkText.value) {
		term += '+link:' + document.SEARCH.linkText.value;
	}
	if (document.SEARCH.allintitleText.value) {
		term += '+allintitle:' + document.SEARCH.allintitleText.value;
	}
	if (document.SEARCH.defineText.value) {
		term += '+define ' + document.SEARCH.defineText.value;
	}
	if (document.SEARCH.intextText.value) {
		term += '+intext:' + document.SEARCH.intextText.value;
	}
	if (document.SEARCH.relatedText.value) {
		term += '+related:' + document.SEARCH.relatedText.value;
	}
	if (document.SEARCH.allintextText.value) {
		term += '+allintext:' + document.SEARCH.allintextText.value;
	}
	
	window.open('http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=' + term + '&n=2&d=' + type); target='blank';

}

/*
 * Clears the Scroogle Search fields.
 */
function clearSearch() {
	document.SEARCH.Gw.value = ('');
	document.SEARCH.d.value = ('*');
	document.SEARCH.siteText.value = ('');
	document.SEARCH.inurlText.value = ('');
	document.SEARCH.filetypeText.value = ('');
	document.SEARCH.allinurlText.value = ('');
	document.SEARCH.cacheText.value = ('');
	document.SEARCH.intitleText.value = ('');
	document.SEARCH.linkText.value = ('');
	document.SEARCH.allintitleText.value = ('');
	document.SEARCH.defineText.value = ('');
	document.SEARCH.intextText.value = ('');
	document.SEARCH.relatedText.value = ('');
	document.SEARCH.allintextText.value = ('');

	document.SEARCH.Gw.focus();
}

/*
 * Generates strings of user-defined length for buffer overflow testing.
 */
function generateString(len,inChar) {
	var strLength = 0;
	var strChar = '';
	var strOut = '';
	var regexp = new RegExp(/^[0-9]*$/);
	
	strLength = len;
	strChar = inChar;

	if ((!regexp.test(strLength)) || (strLength < 1)) {
		displayMessage('Invalid String Length');
		document.STRGEN.len.focus();
		document.STRGEN.len.select();
		return;
	}
	
	if (strChar.length > 1) {
		displayMessage('One Character Only');
		document.STRGEN.type.focus();
		document.STRGEN.type.select();
		return;
	}
	
	if (strChar != '') {
		for (var i=0;i < strLength;i++) { 
			strOut += strChar;
		}
	} else {
		displayMessage('Character Cannot be Null');
		document.STRGEN.type.focus();
		document.STRGEN.type.select();
		return;
	}
	
	document.STRGEN.out.value = ('');
	document.STRGEN.out.value = strOut;			
}

/*
 * Clears the String Generator fields.
 */
function clearString() {
	document.STRGEN.len.value = ('');
	document.STRGEN.type.value = ('');
	document.STRGEN.out.value = ('');
	document.STRGEN.len.focus();
}

/*
 * Shows the Temporary Store display.
 */
function showStore(divName, holdField, displayLen, windowWidth) {
	var displayField = '';
	var displayLength = 0;
	var stored = '';	

	displayField = document.getElementById(divName);
	displayField.style.display = "inline";
	displayField.style.width = windowWidth + 'px';

	if (document.getElementById(holdField).value != '') {
		stored = safeDisplay(document.getElementById(holdField).value);	
		stored = stored.replace(/\n/g, ' ');
	}
	
	displayLength = displayLen;

	// Checks that amount of data in stored field does not overflow display box.
	if (stored.length > displayLength) {
		displayField.innerHTML = '<p>Stored: '+ stored.substring(0,displayLength) + ' ...</p>';
	} else if (stored.length > 0) {
		displayField.innerHTML = '<p>Stored: '+ stored + '</p>';
	} else {
		displayField.innerHTML = '<p>Stored:</p>';
	}
}

/*
 * Hides the Temporary Store display.
 */
function hideStore(divName) {
	document.getElementById(divName).style.display = "none";
}

/*
 * Converts plaintext to Decimal Encoded text to make safe for display.
 */
function safeDisplay(source) {
	var safeResult = new stringBuffer();
	var strResult = '';
	var srcLength = 0;
	var safeReg = /[\w\s\.\,\-\;\!\@\#]/i;
	var lineBreak = /[\n]/g;
	var tabBreak = /[\t]/g;
	var otherSpace = /[\s]/g;

	// Cycle through each input character.
	if (source) {
		srcLength = source.length;

		for (var i=0; i<srcLength; i++) {

			if (safeReg.test(source.charAt(i))) {
				safeResult.sbAppend(source.charAt(i));
			} else {
				safeResult.sbAppend('&#0' + source.charCodeAt(i) + ';');
			}
		}		
	}
		
	strResult = safeResult.sbToString();
	safeResult.length = 0;
	
	strResult = strResult.replace(lineBreak,'<BR>');
	strResult = strResult.replace(tabBreak,'&nbsp;&nbsp;&nbsp;&nbsp;');
	strResult = strResult.replace(otherSpace,'&nbsp;');

	return strResult;
} 


/*
 * Create String Buffer for faster string concatenation.
 */
function stringBuffer() { 
   this.buffer = []; 
 } 

 stringBuffer.prototype.sbAppend = function sbAppend(string) { 
   this.buffer.push(string); 
   return this; 
 }; 

 stringBuffer.prototype.sbToString = function sbToString() { 
   return this.buffer.join(""); 
 }; 


/*
 * Displays informational and error messages.
 */
function displayMessage(messageText) {
	var displayMess = '';
	var storedMess = '';	

	displayMess = document.getElementById('message');
	displayMess.style.display = "inline";
	displayMess.style.overflow = "hidden";

	if (messageText != '') {
		storedMess = safeDisplay(messageText);
	}
	
	displayMess.innerHTML = '<p>'+ storedMess + '</p>';

	setTimeout("hideStore('message')",3000);
}

/*
 * Clears the field that has the supplied ID.
 */
function clearField(id, inFocus) {
	var setFocus = true;

	if (inFocus == false) {
		setFocus = false;
	}	
	
	if (id != '') {
		document.getElementById(id).value = ('');

		if (setFocus) {
			document.getElementById(id).focus();
		}
	}
}

/*
 * Selects all of the text in the field with the supplied ID.
 */
function selectAllText(id) {

	if (id != '') {
		document.getElementById(id).focus();
		document.getElementById(id).select();
	
		setSelectedText(id);
	}
}

var selectedText = '';
var who = '';
var srcField = '';

/*
 * Sets the selected text.
 */
function setSelectedText(sourceField) {

	selectedText = '';
	who = '';
	srcField = '';
	
	srcField = sourceField;
	who = document.getElementById(sourceField);

	if (window.getSelection) {
		if (who != '') {
			if (who.selectionStart == who.selectionEnd) {
				selectedText = who.value;
			} else {
				var allText = who.value;
				selectedText = allText.substring(who.selectionStart,who.selectionEnd);
			}
		} else {
			displayMessage('Invalid text selection');
			return(false);
		}
	} else if (document.selection) {
		selectedText = document.selection.createRange().text;
	} else if (document.getSelection) {
		selectedText = document.getSelection();
	} else {
		displayMessage('Invalid text selection');
		return(false);
	}
	
	if (selectedText == '') {
		selectedText = who.value;
	}
	
	return selectedText;
}

/*
 * Performs action based on selection from the Selected Text dropdown box.
 */
function processSelectedText(target, mode) {
	
	// Sets selected text for IE
	if (document.selection) {
		selectedText = document.selection.createRange().text;
		who = 'dummy';
	}

	if (target == 'clear') {
		who = '';
		srcField = '';
		selectedText = '';
		displayMessage('Selection Cleared');
		return;
	}	
	
	if (target == 'delete') {
		if (document.selection) {
			displayMessage('This option doesn\'t work in IE');
			return;
		} else {	
			keepUnselectedText(srcField, srcField, 'delSelection');
			who = '';
			srcField = '';
			selectedText = '';
			displayMessage('Selection Deleted');
			return;
		}
	}	
	
	if (who != '') {
		if (selectedText != '') {
			if (target != '') {
				switch (target) {
					case 'test': 
						executeScript(unescape(selectedText));
						break;
					case 'show': 
						alert(selectedText);
						break;
					default:
						switch (mode) {
							case 'replace':
								document.getElementById(target).value = selectedText;
								break;
							case 'prepend':
								document.getElementById(target).value = 
									selectedText + document.getElementById(target).value;
								break;
							case 'append':
								if (target == 'workArea') {
									document.getElementById(target).value += (selectedText + '\n');
								} else {
									document.getElementById(target).value += selectedText;
								}
								break;
							default:
								document.getElementById(target).value = selectedText;
						}		
				}
				displayMessage('Request Completed');

			} else {
				displayMessage('Please select an option');
			}	
		} else {
			displayMessage('Please select text for processing');
		}
	} else {
		displayMessage('Please select text for processing');
	}
	return;
}

/*
 * Opens selected text in a new window and tries to execute it.
 */
function executeScript(testScript) {
	
	var script = testScript;
	var new_window = ''; 
	
	new_window = window.open('files/test/scriptTest.html','ScriptTest','scrollbars=yes,resizable=yes,width=400,height=300');

	new_window.document.writeln('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 TRANSITIONAL//EN">' +
		'<html><head><title>Test Results</title></head><body>' +
		'<form><input type="button" value="Close Window" onClick="self.close();"</form><HR>Source Rendering:<BR><BR>' +
		safeDisplay(script.valueOf()) + '<BR><BR><HR>Script execution:<BR><BR>' + script.valueOf() + '<HR></body></html>');

	new_window.document.close();	
}

/*
 * Goes to the requested anchor.
 */
function goToAnchor(anchor) {

   this.location = anchor;
   return (false);
}

