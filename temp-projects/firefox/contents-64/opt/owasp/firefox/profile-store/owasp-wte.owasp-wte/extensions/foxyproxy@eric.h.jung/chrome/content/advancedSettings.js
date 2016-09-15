/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

let fp, fpc;

function onLoad() {
  fp = Components.classes["@leahscape.org/foxyproxy/service;1"].getService().
    wrappedJSObject;
  fpc = Components.classes["@leahscape.org/foxyproxy/common;1"].getService().
    wrappedJSObject;
  document.getElementById("compatibilityCheckString").textContent =
    fp.getMessage("addon.compatibilitycheck.patternmode", [fpc.appInfo.name]);
  let menu = document.getElementById("proxyForCompatibilityCheckMenu");
  let popup = menu.firstChild;
  fpc.removeChildren(popup);
  for (let i = 0, p; i < fp.proxies.length && ((p=fp.proxies.item(i)) || 1);
       ++i) {
    popup.appendChild(fpc.createMenuItem({idVal:p.id, labelVal:p.name,
      name:"foxyproxy-enabled-type", document:document,
      style:"color: " + p.color}));
  }
  let proxy = fp.proxyForVersionCheck;
  menu.value = proxy;
  menu.setAttribute("style", "color:" + fp.proxies.getProxyById(proxy).color);
}

function onModeChanged(menu) {
  menu.setAttribute("style", "color:" + fp.proxies.getProxyById(menu.value).
    color);
}

function onOK() {
  fp.proxyForVersionCheck = document.
    getElementById("proxyForCompatibilityCheckMenu").value;
}

function onCancel() {
}
