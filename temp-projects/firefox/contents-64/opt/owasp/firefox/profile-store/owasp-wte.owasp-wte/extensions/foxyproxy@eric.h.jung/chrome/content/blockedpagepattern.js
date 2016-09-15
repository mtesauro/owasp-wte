/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

/* very similar to pattern.js */
function onLoad() {
  var inn = window.arguments[0].inn;
  document.getElementById("pattern").value = inn.pattern;
  document.getElementById("matchtype").selectedIndex = inn.regex ? 1 : 0;
  document.getElementById("caseSensitive").checked = inn.caseSensitive;
  var foxyproxy = Components.classes["@leahscape.org/foxyproxy/service;1"].getService().wrappedJSObject; 
  document.getElementById("wildcardExample").value = foxyproxy.getMessage("foxyproxy.autoadd.wildcard.example.label");
  document.getElementById("regexExample").value = foxyproxy.getMessage("foxyproxy.autoadd.regex.example.label");
  sizeToContent();
}

function onOK() {
  var r = document.getElementById("matchtype").value == "r";
  var pattern = document.getElementById("pattern").value;
  var p = Components.classes["@leahscape.org/foxyproxy/common;1"].getService()
      .wrappedJSObject.validatePattern(window, r, pattern);
  if (p) {
    window.arguments[0].out = {pattern:pattern, isRegEx:r,
      caseSensitive:document.getElementById("caseSensitive").checked};
    return true;
  }
  return false;
}
