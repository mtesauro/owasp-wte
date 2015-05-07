if (!FlashFirebug) {
  var FlashFirebug = {
          ASEvent : null,
          init : function() {
                  this.ASEvent = document.createEvent("Events")
                  this.ASEvent.initEvent("ASEvent", true, false);
          },
          get : function(data, id) {
                  var ASElement = document.getElementById(id);
                  ASElement.setAttribute("flashfirebugdata", data);
                  ASElement.dispatchEvent(this.ASEvent);
          },
          send : function(data, id) {
                  var element;
                  if (id) {
                          element = document.getElementById(id);
                          if (element && element.flashfirebug_send) {
                                  element.flashfirebug_send(data);
                          }
                          return;
                  }

                  var elements = document.getElementsByTagName("embed");
                  for ( var i = 0; i < elements.length; i++) {
                          element = elements[i];
                          if (element.flashfirebug_send) {
                                  element.flashfirebug_send(data);
                          }
                  }

                  elements = document.getElementsByTagName("object");
                  for ( var j = 0; j < elements.length; j++) {
                          element = elements[j];
                          if (element.flashfirebug_send) {
                                  element.flashfirebug_send(data);
                          }
                  }

          },
          start : function() {
                  var element;
                  var eid;
                  var elements = document.getElementsByTagName("embed");
                  for ( var i = 0; i < elements.length; i++) {
                          element = elements[i];
                          eid = element.getAttribute("id");
  //			alert("embed: " + eid + ", " + element.start);
                          if (element.flashfirebug_start && eid) {
                                  try {
                                          element.flashfirebug_start(eid);
                                  } catch (e) {
                                          // alert(e);
                                  }
                          }
                  }

                  elements = document.getElementsByTagName("object");
                  for ( var j = 0; j < elements.length; j++) {
                          element = elements[j];
                          eid = element.getAttribute("id");
  //			alert("object: " + eid + ", " + element.start);
                          if (element.flashfirebug_start && eid) {
                                  try {
                                          element.flashfirebug_start(eid);
                                  } catch (e) {
  //					alert(e);
                                  }
                          }
                  }
          },
          stop : function() {
                  var element;
                  var elements = document.getElementsByTagName("embed");
                  for ( var i = 0; i < elements.length; i++) {
                          element = elements[i];
                          if (element.flashfirebug_stop) {
                                  element.flashfirebug_stop();
                          }
                  }

                  elements = document.getElementsByTagName("object");
                  for ( var j = 0; j < elements.length; j++) {
                          element = elements[j];
                          if (element.flashfirebug_stop) {
                                  element.flashfirebug_stop();
                          }
                  }
          }
  }
}

function FlashFirebug_init() { // to avoid flash from call flashfirebug before
								// initilize
	if (FlashFirebug && FlashFirebug.init) {
		FlashFirebug.init();
		// FlashFirebug_start();
	}
}

function FlashFirebug_start() { // to avoid flash from call flashfirebug before
								// initilize
	if (FlashFirebug && FlashFirebug.start)
		FlashFirebug.start();
}

function FlashFirebug_stop() {
	if (FlashFirebug && FlashFirebug.stop)
		FlashFirebug.stop();
}

function FlashFirebug_send(data, id) {
	if (FlashFirebug && FlashFirebug.send)
		FlashFirebug.send(data, id);
}

var flashfirebug_scope = this;
function flashfirebug_runScriptEventHandler(event) {
	var funName = event.target
			.getAttribute("flashFirebug_runFunction_function");
	var args = eval(event.target
			.getAttribute("flashFirebug_runFunction_arguments"));
	if (flashfirebug_scope[funName]
			&& typeof (flashfirebug_scope[funName]) == "function") {
		if (args.length) {
			flashfirebug_scope[funName].apply(flashfirebug_scope, args);
		} else {
			flashfirebug_scope[funName].apply(flashfirebug_scope);
		}
	}
}

document.addEventListener("flashfirebug_RunScriptEvent", function(e) {
	flashfirebug_runScriptEventHandler(e);
}, false, true);

FlashFirebug_init();
