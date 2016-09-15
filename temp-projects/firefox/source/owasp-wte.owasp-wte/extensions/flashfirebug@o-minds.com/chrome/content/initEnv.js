Components.utils.import("resource://flashfirebuglibs/prepare.js");

flashfirebugInit = {
  cleanup: function() {
    flashfirebugPrepare.cleanup();
  },
  addScript: function(docRef, id, scriptString) {
      var scriptableUnescapeHTML = Components.classes["@mozilla.org/feed-unescapehtml;1"]
                           .getService(Components.interfaces.nsIScriptableUnescapeHTML);
      var element = docRef.createElementNS("http://www.w3.org/1999/xhtml", "html:script");
      element.setAttribute("type", "text/javascript");
      element.setAttribute("id", id);
      element.firebugIgnore = true;
      element.textContent = "try{"+scriptString+"}catch(e){}";

      if (docRef.documentElement){
          docRef.documentElement.appendChild(element);
      }
      if (element && element.parentNode)
        element.parentNode.removeChild(element);
  }
};

//if FlashBlock is installed, we won't register flashfirebug.css, 
//but listen and handle "flashblockCheckLoad" event
//in "flashblockCheckLoad" eventhandler, we make the swf accessiable by Flashfirebug.
try {
  Application.getExtensions(function(extensions) {
        var fbid = "{3d7eb24f-2740-49df-8937-200b1cc08f8a}";
      var ext = extensions.get(fbid);
      if(!ext || !ext.enabled){
                  flashfirebugPrepare.registerCSS();
      }
  })
} catch (ex) { // Firefox 3.x
          flashfirebugPrepare.registerCSS();
}

window.addEventListener("flashblockCheckLoad", function(e) {
                var swf = e.target;
                if(swf.getAttribute("src") && swf.getAttribute("src").indexOf('chrome:') >= 0){
                        e.preventDefault();
                        e.stopPropagation();
                }else{
                        try{
                                if(!swf.getAttribute("id")){
                                        swf.setAttribute("id", "flashfirebug_" + (new Date()).getTime());
                                }

                                        function nativeMethod(untrustedObject, methodName)
                                {
                                  // happier stack traces and faster multiple calls
                                  var fun = Components.lookupMethod(untrustedObject, methodName);

                                  return function()
                                  {
                                    return fun.apply(untrustedObject, arguments);
                                  }
                                }

                                document.QueryInterface(Components.interfaces.nsIDOMDocument);
                                var createElement = nativeMethod(document, "createElementNS");

                                if (swf.tagName.toUpperCase() == 'OBJECT') {
                                                // 判断是不是有<param name="allowScriptAccess" value="always" /> 和
                                                // <param name="allowFullScreen" value="true" />

                                                //var childs = swf.childNodes;
                                                var childs = swf.getElementsByTagName("param");
                                                var needAppendScriptAccess = true;
                                                var needAppendFullScreen = true;
                                                var needAppendNetWorking = true;
                                                for ( var i = 0; i < childs.length; i++) {
                                                        var param = childs[i];
                                                        if (param.hasAttribute("name") && param.getAttribute("name").toUpperCase() == "ALLOWSCRIPTACCESS") {
                                                                swf.appendChild(param);
                                                                param.value = "always";
                                                                needAppendScriptAccess = false;
                                                        }
                                                        if (param.hasAttribute("name") && param.getAttribute("name").toUpperCase() == "ALLOWFULLSCREEN") {
                                                                param.value = "true";
                                                                needAppendFullScreen = false;
                                                        }
                                                        if (param.hasAttribute("name") && param.getAttribute("name").toUpperCase() == "ALLOWNETWORKING") {
                                                                param.value = "all";
                                                                needAppendNetWorking = false;
                                                        }
                                                }

                                                if (needAppendFullScreen) {
                                                        param = createElement("http://www.w3.org/1999/xhtml", "param");
                                                        param.name = "allowFullScreen";
                                                        param.value = "true";
                                                        swf.appendChild(param);
                                                }
                                                if (needAppendScriptAccess) {
                                                        param = createElement("http://www.w3.org/1999/xhtml", "param");
                                                        param.name = "allowScriptAccess";
                                                        param.value = "always";
                                                        swf.appendChild(param);
                                                }
                                                if (needAppendNetWorking) {
                                                        param = createElement("http://www.w3.org/1999/xhtml", "param");
                                                        param.name = "AllowNetworking";
                                                        param.value = "all";
                                                        swf.appendChild(param);
                                                }

                                        } else if (swf.tagName.toUpperCase() == 'EMBED') {
                                                if(swf.getAttribute("name")){
                                                }else{
                                                        swf.setAttribute("name", swf.getAttribute("id"));
                                                }
                                                swf.setAttribute("allowscriptaccess", "always");
                                                swf.setAttribute("allowfullscreen", "true");
                                                swf.setAttribute("allownetworking", "all");
                                        }

                        }catch(error){
                        }
                }
        }, true, true);

