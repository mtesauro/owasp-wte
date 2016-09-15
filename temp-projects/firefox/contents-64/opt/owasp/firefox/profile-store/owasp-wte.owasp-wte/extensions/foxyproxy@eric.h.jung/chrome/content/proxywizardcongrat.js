/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

let intervalId, angle = 4, iconRotater, inn;

function openLocationURL() {
  Components.classes["@leahscape.org/foxyproxy/common;1"].getService().
    wrappedJSObject.openAndReuseOneTabPerURL("https://getfoxyproxy.org/" +
    "proxyservice/geoip/whatsmyip.html");
}

function onLoad() {
  let msg, inn = window.arguments[0].inn,
    fp = Components.classes["@leahscape.org/foxyproxy/service;1"].getService()
      .wrappedJSObject;
  if (inn && inn.country) {
    msg = fp.getMessage("proxy.wizard.getfoxyproxy", [inn.country, inn.username,
      // The password may not be present. If not, use empty string. Otherwise,
      // use e.g., "(secret)"
      inn.password ? ("(" + inn.password + ")") : ""]);
  } else {
    msg = fp.getMessage("proxy.wizard.getfoxyproxy", ["?", "?", "?"]);
  }
  let msg2 = document.createTextNode(msg);
  document.getElementById("msg").appendChild(msg2);
  document.documentElement.getButton("accept").focus();
  sizeToContent();
  iconRotater = document.getElementById("fp-statusbar-icon-rotater");
  intervalId = window.setInterval(function() {animate()}, 10);
}

function animate() {
  iconRotater.setAttribute("transform", "rotate("+(angle)+", 9, 9)");
  if ((angle += 10) > 720) {
    iconRotater.setAttribute("transform", "rotate(0, 9, 9)");
    window.clearInterval(intervalId);
  }
}
