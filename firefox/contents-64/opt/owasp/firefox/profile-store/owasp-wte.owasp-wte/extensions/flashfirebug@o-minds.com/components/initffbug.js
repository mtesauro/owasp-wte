    var Cu = Components.utils;
    var Ci = Components.interfaces;
    var Cc = Components.classes;
    
    Cu.import("resource://gre/modules/XPCOMUtils.jsm");
    Cu.import("resource://flashfirebuglibs/lib/io.js");
    Cu.import("resource://flashfirebuglibs/gajs.js");
    Cu.import("resource://flashfirebuglibs/prepare.js");
    
    // category   content-policy InitFFBug  @o-minds.com/initffbug;1
    // nsIConentPolicy
    // nsiEventService    

    function InitFFBug() { }  
      
    InitFFBug.prototype = {  
      classDescription: "Setup environment for FlashFirebug",  
      classID:          Components.ID("{e9426b10-8436-4867-b272-8ed82c794597}"),  
      contractID:       "@o-minds.com/initffbug;1",  
      QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),  
      observerService:Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService),
      observe: function(subject, topic, data)
      {
        if (topic == 'content-document-global-created') {
          this.observerService.removeObserver(this, "content-document-global-created");
            var myWindow = Cc["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Ci.nsIWindowMediator).getMostRecentWindow('navigator:browser');
            flashfirebugPrepare.setupVars(myWindow);
        } else if (topic == 'profile-after-change') {
          this.observerService.addObserver(this,"sessionstore-windows-restored", false);
          this.observerService.addObserver(this,"content-document-global-created", false);
          flashfirebugPrepare.setup(FlashFirebugFileIO, FlashFirebugDirIO, flashfirebug_gaTrack);
        } else if (topic == 'sessionstore-windows-restored') {
            this.observerService.removeObserver(this, "sessionstore-windows-restored");
            var myWindow = Cc["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Ci.nsIWindowMediator).getMostRecentWindow('navigator:browser');
            flashfirebugPrepare.setupPrefs(myWindow);
        }
      }
    };  
    const NSGetFactory = XPCOMUtils.generateNSGetFactory([InitFFBug]);
    