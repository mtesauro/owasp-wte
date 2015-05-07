/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/
var fp, fpc, superadd, inn;
function onLoad() {
  inn = window.arguments[0].inn;
  superadd = inn.superadd;
  fp = Components.classes["@leahscape.org/foxyproxy/service;1"].getService().wrappedJSObject;
  fpc = Components.classes["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject;
  document.getElementById("reload").checked = superadd.reload;
  document.getElementById("prompt").checked = superadd.prompt;
  document.getElementById("notify").checked = superadd.notify;
  document.getElementById("notifyWhenCanceled").checked = superadd.notifyWhenCanceled;
  document.getElementById("url").value = inn.url;
  updateGeneratedPattern();
  var proxyMenu = document.getElementById("proxyMenu");
  superadd.updateProxyMenu(proxyMenu, document);
  if (superadd == fp.autoadd) {
    // Change QuickAdd references to AutoAdd
    window.document.title = fp.getMessage("foxyproxy.tab.autoadd.label");
    // Show AutoAdd specifics
    var e = document.getElementById("notify");
    e.label = fp.getMessage("foxyproxy.autoadd.notify.label");
    e.setAttribute("tooltiptext", fp.getMessage("foxyproxy.autoadd.notify.tooltip2"));
    document.getElementById("autoAddBroadcaster").setAttribute("hidden", true);
  }
  sizeToContent();
}

function onOK() {
  var pat = document.getElementById("generatedPattern").value;
  var p = fpc.validatePattern(window, superadd.match.isRegEx, pat);
  if (p) {
    // Use superadd.match as a template for a new Match object
    var m = superadd.match.clone();
    m.pattern = p; // Overwrite the templated pattern with the generated pattern (user may have modified it)
    m.temp = superadd.temp; // the cloned match object doesn't clone Match.temp because it's not deserialized from disk while SuperAdd.temp is. See notes in SuperAdd for more info.
    window.arguments[0].out = {
      reload:document.getElementById("reload").checked,
      notify:document.getElementById("notify").checked,
      prompt:document.getElementById("prompt").checked,
      notifyWhenCanceled:document.getElementById("notifyWhenCanceled").checked,
      proxyId:document.getElementById("proxyMenu").value,
      match:m};
    return true;
  }
}

function updateGeneratedPattern() {
	document.getElementById("generatedPattern").value =
    fpc.applyTemplate(document.getElementById("url").value, superadd.match.pattern, superadd.match.caseSensitive);
}

function onPattern() {
  var p = superadd.match.clone();
  p.temp = superadd.temp; // see notes in the .match setter in superadd.js as to why we do this
  var params = {inn:{pattern:p, superadd:true}, out:null};

  window.openDialog("chrome://foxyproxy/content/pattern.xul", "",
    "chrome, dialog, modal, resizable=yes", params).focus();

  if (params.out) {
    superadd.match = params.out.pattern;
    updateGeneratedPattern();
  }
}
