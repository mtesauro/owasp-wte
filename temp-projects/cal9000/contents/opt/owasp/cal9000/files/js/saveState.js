/*
 * Handles all of the processing for the Save State / Load State feature.
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
 * Driver for saving application state.
 */
function saveData(folder, nameSuffix, extension, inContent) {	
	var content = '';
	var contentEnc = '';

	if (nameSuffix == 'State') {
		content = getStateContent();			
	} else {
		content = inContent;
	}
	
	// For some reason, during the Save State and subsequent Load State, some of
	// the higher char code characters would get lost in the translation. The following 
	// identifies those characters and encodes them in Unicode so they are 
	// processed correctly.
	
	contentEnc = content.toString();
	
	// Loop through data and replace all charCode > 255 characters with %uUUUU!@. 
	// We cant just Unicode encode without including the '!@' at the end, as it causes 
	// issues when we want to decode during Load State.

	var dcLen = contentEnc.length;
	
	for (var k=0; k<dcLen; k++) {
		if (contentEnc.charCodeAt(k) > 255) {
			if ((nameSuffix == 'State') || (nameSuffix == 'responseBody')) {
				contentEnc = contentEnc.replace(contentEnc.charAt(k), plainToUnicode(contentEnc.charAt(k),'unicode',false,'','') + '!@');
			} else {
				contentEnc = contentEnc.replace(contentEnc.charAt(k), plainToDecimal(contentEnc.charAt(k),'entityDec','',';'));
			}
			dcLen = contentEnc.length;
		}	
	}

	var backupPath = getBackupPath(folder, nameSuffix, extension);
	var backup = saveFile(backupPath, contentEnc);

	if (backupPath && backup) {
		displayMessage('Save Successful');
	} else {
		displayMessage('Save Not Successful');
	}
}

/*
 * Retrieves all of the text field and textarea information.
 */
function getStateContent() {

	var input = new Array();
	var textarea = new Array();
	
	input = document.getElementsByTagName('input');
	textarea = document.getElementsByTagName('textarea');

	var strippedText = new Array();
	var strippedArea = new Array();
	var data = new Array();

	// Get text field info.
	var inLength = input.length;
	
	for (var i=0; i<inLength; i++) {
		if (input[i].type == 'text') {			
			strippedText.push(input[i]);
		}
	}
	
	input = strippedText;
	
	// Exclude "code" elements from PageInfo page.
	var texLength = textarea.length;

	for (var i=0; i<texLength; i++) {
		// Skip 'code' Elements.
		if (textarea[i].getAttribute('id').substr(0,4) == 'code') {
		} else {
			strippedArea.push(textarea[i]);
		}
	}
	textarea = strippedArea;

	// Add text field and delimiter to text field data string.
	inLength = input.length;

	if (inLength > 0) {
		for (var i=0; i<inLength; i++) {
			data.push(input[i].value.toString() + '+*-');
		}
	}
	// Add textarea and delimiter to textarea field data string.
	texLength = textarea.length;

	for (var j=0; j<texLength; j++) {

		if (j == (texLength - 1)) {
			data.push(textarea[j].value.toString());
		} else {
			data.push(textarea[j].value.toString() + '+*-');
		}	
	}

	return(data);
}

/*
 * Get path to the save file.
 */
function getBackupPath(backupFolder, nameSuffix, extension) {
	var pagePath = '';
	var hashPos = '';
	var systemPath = '';
	var backupPath = '';	
	var regexSlash = new RegExp("/","g");	
	var dirPathLoc = '';
	var backSlash = true;
	
	// Get the URL of the Document
	pagePath = document.location.toString();

	// Remove Anchors
	hashPos = pagePath.indexOf("#");	
	if (hashPos != -1) {
		pagePath = pagePath.substring(0,hashPos);
	}

	// PC Local File
	if (pagePath.charAt(9) == ":") { 
		systemPath = unescape(pagePath.substr(8)).replace(regexSlash,"\\");
	

	// Mac/Unix Local Files
	} else if (pagePath.substr(0,17) == "file://localhost/") { 
		systemPath = unescape(pagePath.substr(16));

	} else if (pagePath.substr(0,8) == "file:///") { 
		systemPath = unescape(pagePath.substr(7));

	} else if (pagePath.substr(0,7) == "file://") { 
		systemPath = unescape(pagePath.substr(6));

	} else if (pagePath.substr(0,5) == "file:/") { 
		systemPath = unescape(pagePath.substr(5));

	// PC Network File
	} else { 
		systemPath = "\\\\" + unescape(pagePath.substr(7)).replace(regexSlash,"\\");
	}

	dirPathLoc = systemPath.lastIndexOf("\\");
	if (dirPathLoc == -1) {
		dirPathLoc = systemPath.lastIndexOf("/");
		backSlash = false;
	}
	
	// Get backup filename.
	backupPath = systemPath.substr(0,dirPathLoc) + "/" + backupFolder + "/" + nameSuffix + "." + extension;

	if (backSlash) {
		backupPath = backupPath.replace(regexSlash,"\\");
	}

	return backupPath;
}

/*
 * Driver for Firefox vs IE save.
 */
function saveFile(fileUrl, content) {

	var fileSave = false;

	fileSave = mozillaSaveFile(fileUrl, content);

	if (fileSave == false) {
		fileSave = ieSaveFile(fileUrl, content);
	}	

	if (fileSave) {
		return(fileSave);
	} else {
		displayMessage('Error trying to save file');
		return(false);
	}	
}

/*
 * Processing to save info using Firefox and other Mozilla browsers.
 */
function mozillaSaveFile(filePath, content) {
	var mozSave = '';
	var moz = '';

	if(window.Components) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			mozSave = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			mozSave.initWithPath(filePath);
			
			if (!mozSave.exists()) {
				mozSave.create(0, 0664);
			}	
			
			moz = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			moz.init(mozSave, 0x20 | 0x02, 00004, null);
			moz.write(content, content.toString().length);
			moz.flush();
			moz.close();
			
			return(true);

		} catch (e) {
			alert("Error while attempting to save\n" + e.toString());
			return(false);
		}
	} else {
		return(false);
	}
}

/*
 * Processing to save info using Internet Explorer browser.
 */
function ieSaveFile(filePath, content) {
	var ieSave = '';
	var ie = '';
	
	try	{
		if (typeof window.ActiveXObject != typeof undefined) {
			ieSave = new ActiveXObject("Scripting.FileSystemObject");
		} else {
			return(false);
		}	
	} catch (e) {
		alert("Error while attempting to save\n" + e.toString());
		return(false);
	}

	if (ieSave) {
		ie = ieSave.OpenTextFile(filePath,2,-1,0);
		ie.Write(content);
		ie.Close();
		
		return(true);
		
	} else {
		return(false);
	}	
}

/*
 * Driver for loading file contents.
 */
function loadData(folder, nameSuffix, extension) {

	var fileLoad = false;
	var filePath = getBackupPath(folder, nameSuffix, extension);
	var unReg = /\%\u(.){4}\!\@/gi;
	var regMatch = new Array();
	var regReplace = '';
	var info = new Array();
	
	// First try to load with Firefox.
	fileLoad = mozillaLoadFile(filePath);
	
	// Next, try to load with Internet Explorer.
	if (fileLoad == false) {
		fileLoad = ieLoadFile(filePath);
	}

	if (fileLoad != '') {

		// Look for matches of format %uUUUU!@.
		regMatch = fileLoad.match(unReg);
		
		// Cycle through matches and unescape back to plaintext.
		if (regMatch) {
			var regLen = regMatch.length;

			if(regLen > 0) {
				for (var x=0;x<regLen;x++) {
					regReplace = regMatch[x].replace('!@','');
					regReplace = unescape(regReplace);
		
					fileLoad = fileLoad.replace(regMatch[x], regReplace);
				}
			}
		}
		
		if (nameSuffix == 'State') {

			var input = document.getElementsByTagName('input');
			var textarea = document.getElementsByTagName('textarea');

			// Clear out info from PageInfo page if it exists.
			clearResField('resElements', false, true); 
		
			// Split the saved text on our +*-, delimiter.
			info = fileLoad.split('+*-,');

			// Load text field info.
			var inLength = input.length;
			
			for (var i=0; i<inLength; i++) {
				if (input[i].type == 'text') {
					input[i].value = info.shift();
				}	
			}
			
			// Load textarea info.
			var texLen = textarea.length;
	
			for (var j=0; j<texLen; j++) {
				if (textarea[j].getAttribute('id').substr(0,4) == 'code') {
				// Skip 'code' Elements
				} else {
					textarea[j].value = info.shift();
				}
			}
			displayMessage('Backup Retrieved');
			return '';
		} else {
			return fileLoad;
		}
			
	} else {
		displayMessage('No File To Load');
		return '';
	}
}

/*
 * Processing to load info using Firefox or other Mozilla browsers.
 */
function mozillaLoadFile(filePath) {
	var file = '';
	var inputStream = '';
	var mozInputStream = '';
	
	if (window.Components) {
		try {
 			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filePath);

			if (!file.exists()) {
				return(false);
			}	

			inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
			inputStream.init(file, 0x01, 00004, null);

			mozInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
			mozInputStream.init(inputStream);

			return(mozInputStream.read(mozInputStream.available()));

		} catch (e) {
			alert("Error while attempting to load\n" + e.toString());
			return(false);
		}
	} else {
		return(false);	
	}
}

/*
 * Processing to load info using Internet Explorer browser.
 */
function ieLoadFile(filePath) {
	var ieLoad = '';
	var file = '';
	var content = '';
	
	try	{
		if (typeof window.ActiveXObject != typeof undefined) {
			ieLoad = new ActiveXObject("Scripting.FileSystemObject");
		} else {
			return(false);
		}	
		file = ieLoad.OpenTextFile(filePath,1);
		content = file.ReadAll();
		file.Close();

		return(content);

	} catch (e) {
		alert("Error while attempting to load\n" + e.toString());
		return(false);
	}
}
