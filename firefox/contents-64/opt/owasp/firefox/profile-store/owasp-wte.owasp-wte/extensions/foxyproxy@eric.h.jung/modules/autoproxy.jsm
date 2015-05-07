/**
 * This source code is released under the GPL license, available in the LICENSE
 * file at the root of this installation and also online at
 * http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * The Original Code is Adblock Plus.
 *
 * The Initial Developer of the Original Code is
 * Wladimir Palant.
 * Portions created by the Initial Developer are Copyright (C) 2006-2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Georg Koppen
 */

/* The modified code owes some inspiration from AutoProxy itself (version
   0.4b2.2011041023) */

var EXPORTED_SYMBOLS = ["autoproxy"];

var autoproxy = {

  fp: null,
  checksum: /!\s*checksum[\s\-:]+([\w\+\/]+)/i,  

  init: function() {
    this.fp = Components.classes["@leahscape.org/foxyproxy/service;1"].
      getService().wrappedJSObject;
  },

  isAutoProxySubscription: function(text) {
    let lines = text.split(/[\r\n]+/);
    if (/\[AutoProxy(?:\s+\d\.\d\.\d)?\]/i.test(lines[0])) {
      return lines;
    }
    return false;
  },

  processAutoProxySubscription: function(lines, errorMessages) {
    try {
    // Checking the checksum first, if there is any at all...
    let length = lines.length;
    for (let i = 0; i < length; i++) {
      if (this.checksum.test(lines[i])) {
        lines.splice(i, 1);
        length = length - 1;
        let checksumExpected = RegExp.$1;
        let checksum = this.generateAutoProxyChecksum(lines);
        if (checksum && checksum != checksumExpected) {
          if (!this.fp.warnings.showWarningIfDesired(null,
            ["patternsubscription.warning.md5"], "md5Warning", true)) {
	    errorMessages.push(this.fp.
            getMessage("patternsubscription.error.cancel5"));
            return errorMessages;
          }
        }
        break;
      }
    }
    // Now, after checking the MD5 sum let's convert the subscription into
    // FoxyProxy format. First, we remove the AutoProxy identifier as we do not
    // need it.
    lines.splice(0, 1);
    length = length - 1;
    let parsedSubscription = {};
    parsedSubscription.metadata = {};
    parsedSubscription.metadata.format = "AutoProxy";
    parsedSubscription.patterns = [];
    // We need a different counter here as the lines in the AutoProxy
    // subscription may still be comments or empty lines. We would have them
    // in the FoxyProxy format then as well, a thing we do not want.
    let j = 0;
    let noWhitespace = /\S/;
    for (let i = 0; i < length; i++) {
      // Do we have text and no comments at all?
      if (noWhitespace.test(lines[i]) && lines[i].indexOf("!") !== 0) {
        parsedSubscription.patterns[j] = {};
        let currentPat = parsedSubscription.patterns[j];
        // First, we convert all filters to RegExes. Therefore, we can already
        // safely set the related property.
        currentPat.isRegEx = true;
        if (lines[i].indexOf("@@") === 0) {
          // We have a blacklist item.
          lines[i] = lines[i].substr(2);
          currentPat.blackList = true;
        } else {
          currentPat.blackList = false;
        }
        // As the patterns in the AutoProxy format do not have names only the
        // pattern itself is missing yet.
        if (lines[i][0] === "/" && lines[i][lines[i].length - 1] === "/") {
          // We found already a RegEx
          currentPat.pattern = lines[i].substr(1,
            lines[i].length - 2);
        } else {
          if (lines[i].indexOf("http:") === 0) {
            lines[i] = "|" + lines[i];
          } else if (lines[i][0] !== "|") {
            lines[i] = "|http:*" + lines[i];
          }
          currentPat.pattern =
            // remove multiple wildcards
            lines[i].replace(/\*+/g, "*").
              // remove anchors following separator placeholder
              replace(/\^\|$/, "^").
              // escape special symbols
              replace(/(\W)/g, "\\$1").
              // replace wildcards by .*
              replace(/\\\*/g, ".*").
              // process separator placeholders
              replace(/\\\^/g, "(?:[^\\w\\-.%\\u0080-\\uFFFF]|$)").
              // process extended anchor at expression start
              replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?!\\/)(?:[^\\/]+\\.)?").
              // process anchor at expression start
              replace(/^\\\|/, "^").
              // process anchor at expression end
              replace(/\\\|$/, "$").
              // remove leading wildcards
              replace(/^(\.\*)/,"").
              // remove trailing wildcards
              replace(/(\.\*)$/,"");
          if (currentPat.pattern === "") {
            currentPat.pattern = ".*"
          }
        }
        // Setting the other properties to their proper values.
        currentPat.multiLine = false;
        currentPat.caseSensitive = false;
        // As the AutoProxy format does not have names for its patterns and we
        // prefer one over "" we use the pattern itself here.
        currentPat.name = currentPat.pattern;
        j = j + 1;
      }
    }
    return parsedSubscription;
    } catch (e) {
      dump("Error while parsing the AutoProxy list: " + e);
    }
  },

  generateAutoProxyChecksum: function(lines) {
    let stream = null;
    try {
      // Checksum is an MD5 checksum (base64-encoded without the trailing "=")
      // of all lines in UTF-8 without the checksum line, joined with "\n".
      let converter = Components.
        classes["@mozilla.org/intl/scriptableunicodeconverter"].
        createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      converter.charset = "UTF-8";
      stream = converter.convertToInputStream(lines.join("\n"));
      let hashEngine = Components.classes["@mozilla.org/security/hash;1"].
        createInstance(Components.interfaces.nsICryptoHash);
      hashEngine.init(hashEngine.MD5);
      hashEngine.updateFromStream(stream, stream.available());
      return hashEngine.finish(true).replace(/=+$/, "");
    } catch (e) {
      return null;
    } finally {
      if (stream)
        stream.close();
    }
  }

}
