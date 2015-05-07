/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

let req;

function onLoad() {
  sizeToContent();
}

function openLocationURL() {
  Components.classes["@leahscape.org/foxyproxy/common;1"].getService().
    wrappedJSObject.openAndReuseOneTabPerURL("https://getfoxyproxy.org/" +
    "proxyservice/");
}

function onCancel() {
  // Cancel any outstanding XHR calls to prevent memory leaks;
  // We don't want any references to the XHR callback functions
  // when this dialog closes.
  if (req) {
    // Do not show the load failure alert if the user presses the cancel button.
    req.cancel = true;
    req.abort();
  }
  return true;
}

function onOK() {
  let proxyURI;
  let fp = Components.classes["@leahscape.org/foxyproxy/service;1"].getService().
    wrappedJSObject;
  let url = "https://getfoxyproxy.org/proxyservice/get-details-fp.php?subscription="
  let subscriptionID = document.getElementById("subscriptionID").value;
  req = new XMLHttpRequest();
  req.onreadystatechange = function (oEvent) {
    if (req.readyState === 1) {
      // Let's show the user that we are fetching her proxy details.
      wait();
    } else if (req.readyState === 4) {
      unWait();
      if (req.status === 200) {
        let response = req.responseText;
        // We got something back. Let's try to create a proxy-URL and parse it
        // if it is not an "error" message.
        if (response !== "error") {
          let fpc = Components.classes["@leahscape.org/foxyproxy/common;1"].
            getService().wrappedJSObject;
          try {
            proxyURI = fpc._ios.newURI(req.responseText, null, null);
          } catch(e) {
            // We could not generate a URI. Thus, parsing of the proxy details
            // will fail...
            fp.alert(null, fp.getMessage("proxywiz.parse.failure"));
            window.close();
          }
          window.arguments[0].proxy = fpc.processProxyURI(proxyURI);
          window.close();
        } else {
          // The user entered an invalid subscription id
          fp.alert(null, fp.getMessage("proxywiz.id.failure"));
        }
      } else {
        if (!req.cancel) {
          fp.alert(null, fp.getMessage("proxywiz.load.failure"));
          window.close();
        }
      }
    }
  }
  req.open("GET", url + subscriptionID, true);
  req.send(null);
  // We want to have the option to let the dialog open (e.g. if the user
  // entered a wrong subscription ID).
  return false;
}

function wait() {
  document.getElementById("loadHint").collapsed = false;
  // Deactivate the OK btn
  document.documentElement.getButton("accept").disabled = true;
  sizeToContent();
}

function unWait() {
  document.getElementById("loadHint").collapsed = true;
  // Activate the OK btn
  document.documentElement.getButton("accept").disabled = false;
  sizeToContent();
}
