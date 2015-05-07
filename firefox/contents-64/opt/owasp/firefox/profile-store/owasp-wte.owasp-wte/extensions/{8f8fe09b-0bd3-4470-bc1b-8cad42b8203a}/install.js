const X_MSG = 	   "Install Live HTTP Header";
const X_NAME =     "/livehttpheaders";
const X_NAME_COM = "/livehttpheaders_com";
const X_VER  =     "0.17";
const X_JAR_FILE = "livehttpheaders.jar";
const X_COM_FILE = "nsHeaderInfo.js";

const X_CONTENT =  "content/";
const X_SKIN = 	   "skin/";
const X_LOCALES =  ["en-US", "fr-FR", "de-AT", "es-ES", "cs-CZ", "nl-NL",
      "ru-RU", "ru-RU", "da-DK", "ja-JP", "hu-HU"];

var err = initInstall(X_MSG, X_NAME, X_VER);
logComment("initInstall: " + err);
logComment("Installation started...");
resetError();

if (confirm("Do you wish to install LiveHTTPHeaders to your profile ?\n\n"+
            "Click OK to install in your profile.\n\n"+
            "Click Cancel to install it globally.")) {
  var chromeBase = PROFILE_CHROME;
  var chromeFolder = getFolder("Profile", "chrome");
} else {
  var chromeBase = DELAYED_CHROME;
  var chromeFolder = getFolder("Chrome");
}
var componentDir = getFolder("Components");
var iconFolder = getFolder(getFolder("Chrome", "icons"), "default");
var prefFolder = getFolder(getFolder("Program", "defaults"), "pref");

addFile(X_NAME, "chrome/" + X_JAR_FILE, chromeFolder, "");
// It's okay if this fails; the component and icons aren't critical to the
// functioning of most of the extension
err = getLastError();
if (err == SUCCESS || err == REBOOT_NEEDED) {
  addFile(X_NAME_COM, "components/" + X_COM_FILE, componentDir, "");
  addFile(X_NAME, "chrome/icons/default/LiveHTTPHeaders.xpm", iconFolder, "");
  addFile(X_NAME, "chrome/icons/default/LiveHTTPHeaders.ico", iconFolder, "");
  addFile(X_NAME, "defaults/preferences/prefs.js", prefFolder, "livehttpheaders.js");
  resetError();
}

err = getLastError();
if (err == SUCCESS || err == REBOOT_NEEDED) {
  registerChrome(chromeBase | CONTENT, getFolder(chromeFolder, X_JAR_FILE), X_CONTENT);
  registerChrome(chromeBase | SKIN, getFolder(chromeFolder, X_JAR_FILE), X_SKIN);
  for(var i = 0; i < X_LOCALES.length; i++) {
    registerChrome(chromeBase | LOCALE, getFolder(chromeFolder, X_JAR_FILE),
    "locale/" + X_LOCALES[i] + "/livehttpheaders/");
  }
}
err = getLastError();
if (err == SUCCESS || err == REBOOT_NEEDED) {
  performInstall();
  err = getLastError();
  if (err == SUCCESS || err == REBOOT_NEEDED) {
    alert("LiveHTTPHeaders version " + X_VER + " is now installed.\n\nPlease restart mozilla.");
  } else {
    // Nothing to do, Mozilla will display an error message himself
  }
} else {
  cancelInstall();
  if (err == -202) {
    alert("You need to have write permissions to the chrome directory and subfolders:\n" + 
          chromeFolder);
  } else if (err == -210) {
    alert("Installation cancelled by user");
  }else {
    alert("An unknown error occured.  Error code: " + err + "\n" + 
          "Look at the following URL for a description of the error code:\n" +
          "http://developer.mozilla.org/en/docs/XPInstall_API_Reference:Return_Codes");
  }
}

