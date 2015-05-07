var EXPORTED_SYMBOLS = ['flashfirebugPrepare'];

var flashfirebugPrepare = {
	mmFile : null,
	mmCustom : null,
        installedVersion:"4.68",
        profilerMode:false,
        panelHomePage: "http://www.o-minds.com/products/flashfirebug",
        FlashFirebugFileIO: null, 
        FlashFirebugDirIO: null,
        myWindow: null,
        oldUser: false,
        expDate: -1,
        track: null,
        scriptableUnescapeHTML : Components.classes["@mozilla.org/feed-unescapehtml;1"]
                             .getService(Components.interfaces.nsIScriptableUnescapeHTML),
	trace : function(msg, obj) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage(msg);
	},
        cleanup: function() {
            if (!flashfirebugPrepare.profilerMode) {
                var data = flashfirebugPrepare.FlashFirebugFileIO.read(flashfirebugPrepare.mmCustom);
                if (data.length > 0) {
                    flashfirebugPrepare.FlashFirebugFileIO.write(flashfirebugPrepare.mmFile,data);
                } else {
                    flashfirebugPrepare.FlashFirebugFileIO.unlink(flashfirebugPrepare.mmFile);
                }
                if (flashfirebugPrepare.getOSName() != 'darwin') { // keep it for MAC, cross fingers
                  var trustFile = flashfirebugPrepare.FlashFirebugFileIO.open(flashfirebugPrepare.getFlashTrustPath());
                  flashfirebugPrepare.FlashFirebugFileIO.unlink(trustFile);
                }
            }
        },
        replaceHTML: function(dom, newString) {
          dom.textContent = '';
          dom.appendChild(flashfirebugPrepare.scriptableUnescapeHTML.parseFragment(newString, false, null, dom));
        },
        setupPrefs: function(myWindow) {
          flashfirebugPrepare.myWindow = myWindow;
          /* try {
              Components.utils.import("resource://gre/modules/AddonManager.jsm");  
              AddonManager.getAddonByID("flashbug@coursevector.com", function (addon) {
                  if (addon != null) {
                      addon.uninstall();
                  }
              });
          } catch (ex) { // Firefox 3.x
            var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
            em.uninstallItem("flashbug@coursevector.com");
          } */
          
          if (parseFloat(flashfirebugPrepare.installedVersion) != parseFloat(flashfirebugPrepare.getPrefValue("ffbug.installedVersionStr"))){
              var mmBackupFile = flashfirebugPrepare.FlashFirebugFileIO.open(flashfirebugPrepare.getMMBackupPath());

              if (!mmBackupFile.exists()) {
                  flashfirebugPrepare.FlashFirebugFileIO.create(mmBackupFile); // create the file
                  
                  if (flashfirebugPrepare.profilerMode) { // write mm.cfg into the backup
                      flashfirebugPrepare.FlashFirebugFileIO.write(mmBackupFile, flashfirebugPrepare.FlashFirebugFileIO.read(flashfirebugPrepare.mmFile));
                  } else { // write the copy into the backup
                      var data = flashfirebugPrepare.FlashFirebugFileIO.read(flashfirebugPrepare.mmCustom);
                      if (data.length > 0) {
                          flashfirebugPrepare.FlashFirebugFileIO.write(mmBackupFile, data);
                          flashfirebugPrepare.FlashFirebugFileIO.write(flashfirebugPrepare.mmCustom, "");
                          flashfirebugPrepare.myWindow.alert('\'' + flashfirebugPrepare.getMMPath() + '\' has been backed up into \'' 
                              + flashfirebugPrepare.getMMBackupPath() + '\'');
                      }
                  }
              }

              // flashfirebugPrepare.openTab(flashfirebugPrepare.panelHomePage);
          }
          flashfirebugPrepare.setPrefValue("ffbug.installedVersionStr",flashfirebugPrepare.installedVersion+"");
        },
        getPrefValue: function(name){

                const PrefService = Components.classes["@mozilla.org/preferences-service;1"];
                const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
                const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
                const prefs = PrefService.getService(nsIPrefBranch2);
                const prefDomain = "extensions.firebug";

                // Check if this is global firefox preference.
                var prefName;
                if (name.indexOf("browser.") != -1)
                    prefName = name;
                else
                    prefName = prefDomain + "." + name;

                var type = prefs.getPrefType(prefName);
                if (type == nsIPrefBranch.PREF_STRING) {
                    return prefs.getCharPref(prefName);
                }
                else
                if (type == nsIPrefBranch.PREF_INT) {
                    return prefs.getIntPref(prefName);
                }
                else
                if (type == nsIPrefBranch.PREF_BOOL) {
                    return prefs.getBoolPref(prefName);
                }
                return "";
            },
            setPrefValue: function(name, value){
                const PrefService = Components.classes["@mozilla.org/preferences-service;1"];
                const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
                const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
                const prefs = PrefService.getService(nsIPrefBranch2);
                const prefDomain = "extensions.firebug";

                // Check if this is global firefox preference.
                var prefName;
                if (name.indexOf("browser.") != -1)
                    prefName = name;
                else
                    prefName = prefDomain + "." + name;

                var type = prefs.getPrefType(prefName);
                if (type == nsIPrefBranch.PREF_STRING) {
                    prefs.setCharPref(prefName, value);
                }
                else
                if (type == nsIPrefBranch.PREF_INT) {
                    prefs.setIntPref(prefName, value);
                }
                else
                if (type == nsIPrefBranch.PREF_BOOL) {
                    prefs.setBoolPref(prefName, value);
                }
                else
                if (type == nsIPrefBranch.PREF_INVALID) {
                    throw "Invalid preference: " + prefName;
                }
            },
        setupVars: function(myWindow) {
          flashfirebugPrepare.myWindow = myWindow;
        },
        setup: function(FlashFirebugFileIO, FlashFirebugDirIO, flashfirebug_gaTrack) {
          var currDate = new Date();
          var day = currDate.getUTCDate();
          
          // If the day has changed, reset all prefs to relog
          if (day != flashfirebugPrepare.getPrefValue("ffbug.analytics.lastLogged")) {
            flashfirebugPrepare.setPrefValue("ffbug.analytics.ffbuginfo", 0);
            flashfirebugPrepare.setPrefValue("ffbug.analytics.ffbugprop", 0);
            flashfirebugPrepare.setPrefValue("ffbug.analytics.ffbugconsole", 0);
            flashfirebugPrepare.setPrefValue("ffbug.analytics.flashDecompilerTree", 0);
            flashfirebugPrepare.setPrefValue("ffbug.analytics.ffbug", 0);
            flashfirebugPrepare.setPrefValue("ffbug.analytics.flashDecompiler", 0);
            flashfirebugPrepare.setPrefValue("ffbug.analytics.flashSharedObjects", 0);
            flashfirebugPrepare.setPrefValue("ffbug.analytics.flashConsole", 0);
          }
          
          // Set the day to today
          flashfirebugPrepare.setPrefValue("ffbug.analytics.lastLogged", day);

          flashfirebugPrepare.FlashFirebugFileIO = FlashFirebugFileIO;
          flashfirebugPrepare.FlashFirebugDirIO = FlashFirebugDirIO;
          flashfirebugPrepare.track = flashfirebug_gaTrack;
          
          if (Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS == 'WINNT') {
              flashfirebugPrepare.FlashFirebugDirIO.sep = '\\';
          }
          
          flashfirebugPrepare.mmCustom = flashfirebugPrepare.FlashFirebugFileIO.open(flashfirebugPrepare.getMMCustomPath());
          
          // set up mm.cfg
          var mmContent = ''; // this will store the content of mm.cfg
          
          flashfirebugPrepare.mmFile = flashfirebugPrepare.FlashFirebugFileIO.open(flashfirebugPrepare.getMMPath());
          if(flashfirebugPrepare.mmFile.exists()){
            mmContent = flashfirebugPrepare.FlashFirebugFileIO.read(flashfirebugPrepare.mmFile);
            if(mmContent.match(/PreloadSwf=.*com\.adobe\.flash\.profiler.*\.swf/gi) || mmContent.match(/ProfilerAgent.swf/gi)){
              flashfirebugPrepare.profilerMode = true;
              return;
            } else if (mmContent.match(/flashbug@coursevector\.com/gi) || mmContent.match(/flashfirebug\.swf/gi)) { //
              mmContent = '';
            }
            
            flashfirebugPrepare.FlashFirebugFileIO.unlink(flashfirebugPrepare.mmFile);
          }
          
          // we got here means there's no chance mm.cfg exists anymore
          flashfirebugPrepare.FlashFirebugFileIO.create(flashfirebugPrepare.mmFile);
          
          if(flashfirebugPrepare.mmCustom.exists()){
              flashfirebugPrepare.FlashFirebugFileIO.unlink(flashfirebugPrepare.mmCustom); // delete file
          }
          
          flashfirebugPrepare.FlashFirebugFileIO.create(flashfirebugPrepare.mmCustom); // create the file

          // backup mm.cfg file content
          flashfirebugPrepare.FlashFirebugFileIO.write(flashfirebugPrepare.mmCustom, mmContent);
          
          flashfirebugPrepare.FlashFirebugFileIO.write(flashfirebugPrepare.mmFile, flashfirebugPrepare.getMMFileContent(), 'ignore', 'UTF-8', true);

          // set up flashfirebug.cfg
          var trustFile = flashfirebugPrepare.FlashFirebugFileIO.open(flashfirebugPrepare.getFlashTrustPath());
          if (!trustFile.exists()){
              flashfirebugPrepare.FlashFirebugFileIO.create(trustFile); // create the
          }
          
          var trustContent = '';
          
          if (flashfirebugPrepare.getOSName() == 'winnt') { // handle for windows
            trustContent = "file:///" + flashfirebugPrepare.getMyPath() + "\r\n";
            trustContent += "chrome://flashbug/content";
          } else { // handle for linux and mac
            trustContent = "file://" + flashfirebugPrepare.getMyPath() + "\r\n";
            trustContent += "chrome://flashbug/content";
          }
          
          flashfirebugPrepare.FlashFirebugFileIO.write(trustFile, trustContent, 'ignore', 'UTF-8', true);
        },
        registerCSS:function(){
            var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                      .getService(Components.interfaces.nsIStyleSheetService);
            var ios = Components.classes["@mozilla.org/network/io-service;1"]
                      .getService(Components.interfaces.nsIIOService);
            var u = ios.newURI("chrome://flashbug/content/flashfirebug.css", null, null);
            if(!sss.sheetRegistered(u, sss.AGENT_SHEET)) {
              sss.loadAndRegisterSheet(u, sss.AGENT_SHEET);
            }
        },
        getLogFile: function() {
          var _logFile = flashfirebugPrepare.getFlashPlayerAppDir();
          _logFile.append('Logs');
          if(!_logFile.exists() || !_logFile.isDirectory()) {
            flashfirebugPrepare.FlashFirebugDirIO.create(_logFile);
          }
          _logFile.append('flashlog.txt');
          if(_logFile.exists()) {
            flashfirebugPrepare.FlashFirebugFileIO.unlink(_logFile);
          }
          
          flashfirebugPrepare.FlashFirebugFileIO.create(_logFile);
          
          return _logFile;
        },
        getMMProps: function () {
          var log_file = flashfirebugPrepare.FlashFirebugFileIO.open(flashfirebugPrepare.getLogFile());
          var mmProps = [
              {name:'AllowUserLocalTrust', 		type:'bool', def:true, documented:true},
              {name:'AS3AllocationTracking', 	type:'bool'},
              {name:'AS3AutoStartSampling', 		type:'bool'},
              {name:'AS3CSE', 					type:'bool'},
              {name:'AS3DCE', 					type:'bool'},
              {name:'AS3DynamicProfile', 		type:'bool'},
              {name:'AS3MIR', 					type:'bool'},
              {name:'AS3Sampling', 				type:'bool'},
              {name:'AS3SSE', 					type:'bool'},
              {name:'AS3StaticProfile', 			type:'bool'},
              {name:'AS3Trace', 					type:'bool'},
              {name:'AS3Turbo', 					type:'bool'},
              {name:'AS3Verbose', 				type:'bool'},
              {name:'AssetCacheSize', 			type:'int', def:20, documented:true},
              {name:'AutoUpdateDisable', 		type:'bool', def:false, documented:true}, 
              {name:'AutoUpdateInterval', 		type:'int', def:-1, documented:true},
              {name:'AutoUpdateVersionUrl', 		type:'string'},
              {name:'AVHardwareDisable', 		type:'bool', def:false, documented:true},
              {name:'AVHardwareEnabledDomain', 	type:'string', documented:true}, // can have multiple
              {name:'CodeSignLogFile', 			type:'string'},
              {name:'CodeSignRootCert', 			type:'bool'},
              {name:'Convert8kAnd16kAudio', 		type:'bool'},
              {name:'CrashLogEnable',			type:'bool'},
              {name:'DisableAVM1Loading', 		type:'bool'},
              {name:'DisableDeviceFontEnumeration', type:'bool', def:false, documented:true},
              {name:'DisableIncrementalGC', 		type:'bool'},
              {name:'DisableMulticoreRenderer', 	type:'bool'},
              {name:'DisableNetworkAndFilesystemInHostApp', type:'string', documented:true},
              {name:'DisableProductDownload', 	type:'bool', def:false, documented:true},
              {name:'DisableSockets', 			type:'bool', documented:true},
              {name:'DisplayGPUBlend', 			type:'bool'},
              {name:'EnableIncrementalValidation', type:'bool'},
              {name:'EnableLeakFile', 			type:'bool'},
              {name:'EnableSocketsTo', 			type:'string', documented:true}, // can have multiple
              {name:'EnforceLocalSecurityInActiveXHostApp', type:'string', documented:true},
              {name:'ErrorReportingEnable', 		type:'bool', def:false, documented:true},
              {name:'FileDownloadDisable', 		type:'bool', def:false, documented:true},
              {name:'FileDownloadEnabledDomain', type:'string', documented:true}, // can have multiple
              {name:'FileUploadDisable', 		type:'bool', def:false, documented:true},
              {name:'FileUploadEnabledDomain', 	type:'string', documented:true}, // can have multiple
              {name:'ForceGPUBlend', 			type:'bool'},
              {name:'FrameProfilingEnable', 		type:'bool'},
              {name:'FullScreenDisable', 		type:'bool', def:false, documented:true},
              {name:'GCStats', 					type:'bool'},
              {name:'GPULogOutputFileName', 		type:'string'},
              {name:'HeapProfilingAS3Enable', 	type:'bool'},
              {name:'LegacyDomainMatching',		type:'bool', documented:true},
              {name:'LocalFileLegacyAction', 	type:'bool', documented:true},
              {name:'LocalFileReadDisable', 		type:'bool', def:false, documented:true},
              {name:'LocalStorageLimit', 		type:'int', def:6, documented:true},
              {name:'LogGPU', 					type:'bool'},
              {name:'MaxWarnings', 				type:'int', def:500, documented:true},
              {name:'OverrideGPUValidation', 	type:'bool', documented:true},
              {name:'OverrideUserInvokedActions', type:'bool'},
              {name:'PolicyFileLog', 			type:'bool', def:true, documented:true}, // def is false
              {name:'PolicyFileLogAppend', 		type:'bool', def:true, documented:true}, // def is false
              {name:'PreloadSwf', 				type:'string'},
              {name:'ProductDisabled', 			type:'string', documented:true}, // can have multiple
              {name:'ProductDownloadBaseUrl', 	type:'string'},
              {name:'ProfileFunctionEnable', 	type:'bool'},
              {name:'ProfilingOutputDirectory', 	type:'string'},
              {name:'ProfilingOutputFileEnable', type:'bool'},
              {name:'RendererProfilingEnable', 	type:'bool'},
              {name:'RTMFPP2PDisable', 			type:'bool', documented:true},
              {name:'RTMFPTURNProxy', 			type:'string', documented:true},
              {name:'ScriptStuckTimeout', 		type:'int', documented:true},
              {name:'SecurityDialogReportingEnable', type:'bool'},
              {name:'SuppressDebuggerExceptionDialogs', type:'bool'},
              {name:'ThirdPartyStorage', 		type:'bool', documented:true}, // no def
              {name:'TraceOutputBuffered', 		type:'bool'},
              {name:'TraceOutputFileEnable', 	type:'bool', def:true, documented:true},// def is false
              {name:'TraceOutputFileName', 		type:'string', def:flashfirebugPrepare.getLogFile().path, documented:true},
              {name:'UseBrokerProcess', 			type:'bool'},
              {name:'WindowlessDisable', 		type:'bool'}
          ];

          return mmProps;
        },
        getMyPathObject:function(){
            var file = flashfirebugPrepare.FlashFirebugDirIO.get("ProfD");
            file.append("extensions");
            file.append("flashfirebug@o-minds.com");
            file.append("chrome");
            file.append("content");
            
            return file;
        },
        profilerPath: function () {
                var profDir = flashfirebugPrepare.getMyPathObject();

                profDir.append('flashfirebug.swf');
                
             	// TODO:发布版本时注释
//            	return "E:\\flash\\tamt2012\\flashfirebug\\flashfirebug@o-minds.com\\chrome\\content\\flashfirebug.swf";
 
                return profDir.path;
        },
        getMMFileContent: function() {
                      mm = {};
                      mm['PreloadSwf'] = flashfirebugPrepare.profilerPath();
                      //mm['MaxWarnings'] = flashfirebugPrepare.getPrefValue("flashbug.console.maxLines"); // maxLines was used to limit trace lines, not warnings
                      mm['ErrorReportingEnable'] = flashfirebugPrepare.getPrefValue('flashbug.console.enableWarnings');
                      mm['MaxWarnings'] = flashfirebugPrepare.getPrefValue('flashbug.console.maxWarnings');
                      
                      var mm_props = flashfirebugPrepare.getMMProps();

                      var str = '';

                      for (var i = 0; i < mm_props.length; i++) {
                              var prop = mm_props[i];
                              var value = null;
                              if (mm.hasOwnProperty(prop.name)) {
                                      value = mm[prop.name];
                              } else if (prop.hasOwnProperty('def')) {
                                      value = prop.def;
                              }

                              if (value == null) continue;
                              if (typeof value == 'boolean') {
                                      str += '\n' + prop.name + '=' + (value == true ? '1' : '0');
                              } else {
                                      if (prop.type == 'int') {
                                              str += '\n' + prop.name + '=' + parseInt(value);
                                      } else {
                                              // TODO if array, do prop multiple times
                                              str += '\n' + prop.name + '=' + value;
                                      }
                              }
                      }
                      return str + '\n' + flashfirebugPrepare.getPrefValue("flashbug.mm.concat");

          },
          getMMPath:function(){ // get mm.cfg file path
              var mm = flashfirebugPrepare.getUserHomeDir();
              mm.append("mm.cfg");
              return mm.path;
          },
          getMMBackupPath:function(){ // get mm.cfg file path
              var mm = flashfirebugPrepare.getUserHomeDir();
              mm.append("mm_backup.cfg");
              return mm.path;
          },
          getMMCustomPath:function(){ // get mm.cfg file path
              var file = flashfirebugPrepare.FlashFirebugDirIO.get("ProfD");
              file.append("mmcustom.cfg");

              return file.path;
          },
          getMyPath:function(){
            	var file = flashfirebugPrepare.FlashFirebugDirIO.get("ProfD");
            	file.append("extensions");
            	file.append("flashfirebug@o-minds.com");
            	file.append("chrome");
            	file.append("content");

             	// TODO:发布版本时注释
//            	return "E:\\flash\\tamt2012\\flashfirebug\\flashfirebug@o-minds.com\\chrome\\content\\";
            	
            	return file.path;
            },
            getOSName:function(){
                return Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS.toLowerCase();
            },
            getFlashTrustPath : function() {
                var file = flashfirebugPrepare.getFlashPlayerAppDir();
                file.append("#Security");
                if(!file.exists() || !file.isDirectory()) {
                  flashfirebugPrepare.FlashFirebugDirIO.create(file);
                }
                file.append("FlashPlayerTrust");
                if(!file.exists() || !file.isDirectory()) {
                  flashfirebugPrepare.FlashFirebugDirIO.create(file);
                }
                file.append("ffbug.cfg");
                
                return file.path;
            },
            getFlashPlayerAppDir:function(){
            	var file = flashfirebugPrepare.getAppDir();
                if(flashfirebugPrepare.getOSName() == "winnt") {
                	file.append("Macromedia");
                        if(!file.exists() || !file.isDirectory()) {
                          flashfirebugPrepare.FlashFirebugDirIO.create(file);
                        }
                	file.append("Flash Player");
                        if(!file.exists() || !file.isDirectory()) {
                          flashfirebugPrepare.FlashFirebugDirIO.create(file);
                        }
                }else if(flashfirebugPrepare.getOSName() == "darwin"){ // mac
                	file.append("Preferences");
                	file.append("Macromedia");
                        if(!file.exists() || !file.isDirectory()) {
                          flashfirebugPrepare.FlashFirebugDirIO.create(file);
                        }
                	file.append("Flash Player");
                        if(!file.exists() || !file.isDirectory()) {
                          flashfirebugPrepare.FlashFirebugDirIO.create(file);
                        }
                }else{ // linux
                	file.append(".macromedia");
                        if(!file.exists() || !file.isDirectory()) {
                          flashfirebugPrepare.FlashFirebugDirIO.create(file);
                        }
                	file.append("Flash_Player");
                        if(!file.exists() || !file.isDirectory()) {
                          flashfirebugPrepare.FlashFirebugDirIO.create(file);
                        }
                }
                
                return file;
            },
            getAppDir:function(){
                var dirName="";
                if(flashfirebugPrepare.getOSName() == 'winnt'){ // windows
                    dirName = "AppData";
                }else if(flashfirebugPrepare.getOSName() == "darwin"){ // mac
                    dirName = "ULibDir";
                }else{ // linux
                    dirName = "Home";
                }
                return flashfirebugPrepare.FlashFirebugDirIO.get(dirName);
            },
            getUserHomeDir:function(){
              if (flashfirebugPrepare.getOSName() == 'winnt') {
                var appDataPath = flashfirebugPrepare.FlashFirebugDirIO.get('AppData');
                if (appDataPath == false) { // just get home
                  return flashfirebugPrepare.FlashFirebugDirIO.get("Home");
                } else { // look for AppData
                  try {
                    if (appDataPath.path.indexOf('Roaming') != -1) { // Vista
                      appDataPath = appDataPath.parent;
                      appDataPath = appDataPath.parent;
                      return appDataPath;
                    } else { // Non-Vista, go back one level up
                      appDataPath = appDataPath.parent;
                      return appDataPath;
                    }
                  } catch (e) {
                    return flashfirebugPrepare.FlashFirebugDirIO.get("Home");
                  }
                }
              } else {
                return flashfirebugPrepare.FlashFirebugDirIO.get("Home");
              }
            },
            openTab:function(tabURL){
                var newTab = flashfirebugPrepare.myWindow.gBrowser.addTab(tabURL);
                flashfirebugPrepare.myWindow.gBrowser.selectedTab = newTab;
            },

            /**
             *
             * @param request   {url:String, id:String, onResponse:Function}
             */
            getBase64FromURL: function(request) {
              var url = request.url;
              // dump("START: " + new Date().getTime() + "\n");

              var xhr = new flashfirebugPrepare.myWindow.XMLHttpRequest();
              xhr.open('GET', url, true);

              xhr.responseType = 'arraybuffer';
              
              xhr.onload = function(e) {
                if (this.status == 200) {
                  
                  var uInt8Array = new Uint8Array(this.response);
                  var i = uInt8Array.length;
                  var binaryString = new Array(i);
                  while (i--)
                  {
                    binaryString[i] = String.fromCharCode(uInt8Array[i]);
                  }
                  var data = binaryString.join('');

                  var base64 = flashfirebugPrepare.myWindow.btoa(data);
                  request.onResponse.call(null, {url:url, id:request.id, base64:base64});
                }
              };

              xhr.send();
            }
}
