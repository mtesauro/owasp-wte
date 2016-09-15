var Flashbug = (function() {

                const Cc = Components.classes;
                const Ci = Components.interfaces;
                var CCSV = function(cName, ifaceName) {
                        try {
                                return Cc[cName].getService(Ci[ifaceName]);  // if fbs fails to load, the error can be Cc[cName] has no properties
                        } catch(exc) {
                                Components.utils.reportError(cName+'@'+ifaceName+' FAILED '+exc);
                                if (!Cc[cName]) {
                                        Components.utils.reportError('No Components.classes entry for '+cName);
                                } else if (!Ci[ifaceName]) {
                                        Components.utils.reportError('No Components.interfaces entry for '+ifaceName);
                                }
                        }
                };

                var CCIN = function(cName, ifaceName) {
                        return Cc[cName].createInstance(Ci[ifaceName]);
                };

                var QI = function(obj, iface) {
                        return obj.QueryInterface(iface);
                };

                // Constants
                const SWF_MIME = "application/x-shockwave-flash";
                const SPL_MIME = "application/futuresplash";
                const AMF_MIME = "application/x-amf";
                const _prefSvc = CCSV('@mozilla.org/preferences-service;1', 'nsIPrefBranch2');
                const _htmlSvc = CCSV("@mozilla.org/feed-unescapehtml;1", "nsIScriptableUnescapeHTML");
                const _promptSvc = CCSV('@mozilla.org/embedcomp/prompt-service;1', 'nsIPromptService');
                const _ioSvc = CCSV('@mozilla.org/network/io-service;1', 'nsIIOService');
                const _alertSvc = CCSV('@mozilla.org/alerts-service;1', 'nsIAlertsService');
                const _toolTypes = new Array();
                const _toolTypeMap = {};
                const _toolMap = {};

                var _stringBundle,
                        _defaultStringBundle,
                        _playerVersion,
                        _os,
                        _flashPlayerDirPath,
                        _logFile,
                        _polFile,
                        _mmDirPath,
                        _mmFile,
                        _profilerMode = false,
                        _mmProps;

                // Trace Helpers
                //-----------------------------------------------------------------------------

                if (typeof FBTrace == 'undefined') FBTrace = { };

                var _alert = function(body, title) {
                        if(!title) title = 'Error';

                        // Toaster popup
                        //_alertSvc.showAlertNotification('chrome://flashbug/skin/icon32.png', title, body, false, '', null);

                        // Non-blocking alert popup
                        _promptSvc.alert(null, title, body);

                        // Information bar popup
                        /*var notificationBox = getTabBrowser().getNotificationBox();
                        var n = notificationBox.getNotificationWithValue('flashbug-notebox');
                        if (n) {
                                n.label = body;
                        } else {
                                notificationBox.appendNotification(body, 'flashbug-notebox', 'chrome://flashbug/skin/icon32.png', notificationBox.PRIORITY_WARNING_MEDIUM);
                        }*/
                };

                var trace = function(msg, obj) {
                        if (FBTrace.DBG_FLASH) {
                                if (typeof FBTrace.sysout == 'undefined') {
                                        _alert(msg + ' | ' + obj);
                                } else {
                                        FBTrace.sysout(msg, obj);
                                }
                        }
                };

                var getStringBundle = function() {
                        if (!_stringBundle) _stringBundle = document.getElementById('strings_flashbug');
                        return _stringBundle;
                };

                var getDefaultStringBundle = function() {
                        if (!_defaultStringBundle) {
                                var ioService = CCSV('@mozilla.org/network/io-service;1', 'nsIIOService');
                                var chromeRegistry = CCSV('@mozilla.org/chrome/chrome-registry;1', 'nsIChromeRegistry');
                                var stringBundleService = CCSV('@mozilla.org/intl/stringbundle;1', 'nsIStringBundleService');
                                var bundle = document.getElementById('strings_flashbug');
                                var uri = ioService.newURI(bundle.src, 'UTF-8', null);
                                var fileURI = chromeRegistry.convertChromeURL(uri).spec;
                                var parts = fileURI.split('/');
                                parts[parts.length - 2] = 'en-US';
                                _defaultStringBundle = stringBundleService.createBundle(parts.join('/'));
                        }

                        return _defaultStringBundle;
                };

                var $FL_STR = function(name) {
                        var strKey = name.replace(' ', '_', "g"),
                                useDefaultLocale = _prefSvc.getBoolPref('extensions.firebug.useDefaultLocale');
                        if (!useDefaultLocale) {
                                try {
                                        return getStringBundle().getString(strKey);
                                } catch (e) {
                                        trace("Flashbug Missing translation for: " + name + "\n");
                                        trace("Flashbug getString FAILS ", e);
                                }
                        } else {
                                try {
                                        // The en-US string should be always available.
                                        return getDefaultStringBundle().GetStringFromName(strKey);
                                } catch (e) {
                                        trace("Flashbug $FL_STR (default) FAILS '" + name + "'", e);
                                }
                        }
                };

                var $FL_STRF = function(name, args) {
                        var strKey = name.replace(' ', '_', "g"),
                                useDefaultLocale = _prefSvc.getBoolPref('extensions.firebug.useDefaultLocale');
                        if (!useDefaultLocale) {
                                try {
                                        return getStringBundle().getFormattedString(strKey, args);
                                } catch (e) {
                                        trace("Flashbug Missing translation for: " + name + "\n");
                                        trace("Flashbug getString FAILS ", e);
                                }
                        } else {
                                try {
                                        // The en-US string should be always available.
                                        return getDefaultStringBundle().formatStringFromName(strKey, args, args.length);
                                } catch (e) {
                                        trace("Flashbug $FL_STRF (default) FAILS '" + name + "'", e);
                                }
                        }
                }

                var getContext = function() {
                        if (typeof(FirebugContext) != "undefined") return FirebugContext;
                        return Firebug.currentContext;
                }

                return {
                        SWF_MIME: SWF_MIME,
                        SPL_MIME: SPL_MIME,
                        AMF_MIME: AMF_MIME,

                        QI: QI,

                        CCSV: CCSV,

                        CCIN: CCIN,

                        getContext: getContext,

                        trace: trace,

                        alert: _alert,

                        $FL_STR: $FL_STR,

                        $FL_STRF: $FL_STRF,

                        get playerVersion() {
                                if (!_playerVersion) {
                                        _playerVersion = $FL_STR('flashbug.noPlayer');

                                        var p = navigator.plugins['Shockwave Flash'];
                                        if (p) {
                                                if (!(typeof navigator.mimeTypes != 'undefined' && navigator.mimeTypes[SWF_MIME] && !navigator.mimeTypes[SWF_MIME].enabledPlugin)) {
                                                        _playerVersion = this.OS.toUpperCase();

                                                        // Linux does not seem to have a version number, use the description to grab it
                                                        var versionDesc = p.description.replace('Shockwave Flash ', '');
                                                        _playerVersion += ' ' + (p.version ? p.version : versionDesc);

                                                        // Debug Player
                                                        // Linux Beta: 'Shockwave Flash 11.2 d202' 'libflashplayer.so' 'Shockwave Flash' ''
                                                        // Windows Debug: 'Shockwave Flash 11.0 r1' 'NPSWF32.dll' 'Shockwave Flash' '11.0.1.152'
                                                        // Linux Debug: 'Shockwave Flash 11.0 r1' 'npwrapper.libflashplayer.so' 'Shockwave Flash' ''
                                                        // Shockwave Flash 10.3 d180 - Shockwave Flash 10.2 r154
                                                        if (p.description.match(' d') || p.description.match(' r')) _playerVersion += ' ' + $FL_STR('flashbug.debugVersion');
                                                }
                                        }
                                }

                                return _playerVersion;
                        },

                        // Get the running operating system
                        get OS() {
                                if(!_os) {
                                        var agt = navigator.userAgent.toLowerCase();
                                        // CCSV('@mozilla.org/xre/app-info;1', 'Ci.nsIXULRuntime').OS
                                        // Inaccurate, OSX = Darwin, XP AND Vista = WINNT
                                        if(agt.indexOf('win') != -1) {
                                                if(agt.indexOf('windows nt 6') != -1) {
                                                        _os = 'winVista';
                                                } else {
                                                        _os = 'win';
                                                }
                                        } else if(agt.indexOf('macintosh') != -1) {
                                                _os = 'mac';
                                        } else {
                                                _os = 'linux';
                                        }
                                }

                                return _os;
                        },

                        // Get the Flash Player directory depending on OS
                        get flashPlayerDirectory() {
                                var file, 
                                        dir = CCIN('@mozilla.org/file/directory_service;1', 'nsIProperties');
                                if(!_flashPlayerDirPath) {
                                        switch(this.OS) {
                                                case 'win' :
                                                case 'winVista' :
                                                        // C:\Documents and Settings\<user>\Application Data
                                                        // C:\Users\<user>\AppData\Roaming
                                                        file = dir.get('AppData', Ci.nsILocalFile);
                                                        file.append('Macromedia');
                                                        if(!file.exists() || !file.isDirectory()) file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                                        file.append('Flash Player');
                                                        if(!file.exists() || !file.isDirectory()) file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                                        break;
                                                case 'mac' :
                                                        // /User/<user>/Library/Preferences
                                                        file = dir.get('UsrPrfs', Ci.nsILocalFile);
                                                        file.append('Macromedia');
                                                        if(!file.exists() || !file.isDirectory()) file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                                        file.append('Flash Player');
                                                        if(!file.exists() || !file.isDirectory()) file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                                        break;
                                                case 'linux' :
                                                        // /home/<user>
                                                        file = dir.get('Home', Ci.nsILocalFile);
                                                        file.append('.macromedia');
                                                        if(!file.exists() || !file.isDirectory()) file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                                        //file.append('Macromedia');
                                                        file.append('Flash_Player');
                                                        if(!file.exists() || !file.isDirectory()) file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                                        break;
                                        }

                                        _flashPlayerDirPath = file.path;
                                } else {
                                        file = CCIN('@mozilla.org/file/local;1', 'nsILocalFile');
                                        file.initWithPath(_flashPlayerDirPath);
                                }

                                return file;
                        },

                        internationalize: function(element, attr) {
                                if (typeof element == 'string') element = document.getElementById(element);

                                if (element) {
                                        var xulString = element.getAttribute(attr);
                                        if (xulString) {
                                                var localized = $FL_STR(xulString);

                                                // Set localized value of the attribute.
                                                if(element.localName == 'p') {
                                                        element.removeAttribute(attr);

                                                        element.textContent = '';
                                                        element.appendChild(_htmlSvc.parseFragment(localized, false, null, element));
                                                } else {
                                                        element.setAttribute(attr, localized);
                                                }
                                        }
                                } else {
                                        trace('Failed to internationalize element with attr '+attr+' args:'+args);
                                }
                        },

                        internationalizeElements: function(doc, elements, attributes) {
                                for (var i = -1, len = elements.length; ++i < len;) {
                                        var element = doc.getElementById(elements[i]);
                                        if (!element) continue;

                                        // Do once
                                        if (!element.getAttribute('translated')) {
                                                element.setAttribute('translated', true);
                                        } else {
                                                continue;
                                        }

                                        for (var j = -1, len2 = attributes.length; ++j < len2;) {
                                                if (element.hasAttribute(attributes[j])) {
                                                        //this.internationalize(element, attributes[j]);
                                                        var attr = attributes[j];
                                                        if (typeof element == 'string') element = doc.getElementById(element);

                                                        if (element) {
                                                                var xulString = element.getAttribute(attr);
                                                                if (xulString) {
                                                                        var localized = $FL_STR(xulString);

                                                                        // Set localized value of the attribute.
                                                                        if(element.localName == 'p') {
                                                                                element.removeAttribute(attr);

                                                                                // throws errors in prefwindow
                                                                                element.textContent = '';
                                                                                element.appendChild(_htmlSvc.parseFragment(localized, false, null, element));
                                                                        } else {
                                                                                element.setAttribute(attr, localized);
                                                                        }
                                                                }
                                                        } else {
                                                                trace('Failed to internationalize element with attr '+attr+' args:'+args);
                                                        }
                                                }
                                        }
                                }
                        },

                        // Requests that the operating system attempt to open this file.
                        // This is not available on all operating systems;
                        launchFile: function(f) {
                                //trace("launchFile: " + f.path + ' ' + f.launch, f);
                                try {
                                        f.launch();
                                } catch (ex) {
                                        trace("launchFile err", ex);
                                        // If launch fails, try sending it through the system's external
                                        var uri = _ioSvc.newFileURI(f),
                                                _protocolSvc = CCSV('@mozilla.org/uriloader/external-protocol-service;1', 'nsIExternalProtocolService');
                                        _protocolSvc.loadUrl(uri);
                                }
                        },

                        // Clear and write file
                        writeFile: function(file, string, append) {
                                var success = true;
                                try {
                                        var fos = CCIN('@mozilla.org/network/file-output-stream;1', 'nsIFileOutputStream');
                                        // ioFlags
                                        // -1 defaults to PR_WRONLY 0x02 | PR_CREATE_FILE 0x08 | PR_TRUNCATE 0x20
                                        // Flashbug Old set to PR_RDWR 0x04 | PR_CREATE_FILE 0x08 | PR_TRUNCATE 0x20
                                        /*
                                        Name			Value	Description
                                        PR_RDONLY		0x01	Open for reading only.
                                        PR_WRONLY		0x02	Open for writing only.
                                        PR_RDWR			0x04	Open for reading and writing.
                                        PR_CREATE_FILE	0x08	If the file does not exist, the file is created. If the file exists, this flag has no effect.
                                        PR_APPEND		0x10	The file pointer is set to the end of the file prior to each write.
                                        PR_TRUNCATE		0x20	If the file exists, its length is truncated to 0.
                                        PR_SYNC			0x40	If set, each write will wait for both the file data and file status to be physically updated.
                                        PR_EXCL			0x80	With PR_CREATE_FILE, if the file does not exist, the file is created. If the file already exists, no action and NULL is returned.
                                        */

                                        // perm ?|Owner|Group|Other
                                        // -1 defaults to 0664
                                        // Flashbug Old set to 755
                                        /*
                                        0 --- no permission
                                        1 --x execute 
                                        2 -w- write 
                                        3 -wx write and execute
                                        4 r-- read
                                        5 r-x read and execute
                                        6 rw- read and write
                                        7 rwx read, write and execute
                                        */
                                        //is.init(file, -1, -1, 0);
                                        // Switched back to the old style, was a permissions issue. Maybe FlashTracer was to blame?
                                        if (append) {
                                                fos.init(file, 0x02|0x08|0x10, 0755, 0);
                                        } else {
                                                fos.init(file, 0x04|0x08|0x20, 0755, 0);
                                        }
                                        if(string && string.length > 0) {
                                                fos.write(string, string.length);
                                        } else {
                                                trace('writeFile Error: String is too short or empty', string);
                                        }
                                } catch (e) {
                                        trace('writeFile Error: ' + e.toString(), e);
                                        success = false;
                                } finally {
                                        if (fos) {
                                                if (fos instanceof Ci.nsISafeOutputStream) {
                                                        fos.finish();
                                                } else {
                                                        fos.close();
                                                }
                                        }
                                        return success;
                                }

                                return true;
                        },

                        ////////////////
                        // Trust File //
                        ////////////////
                        /*
                        Windows all users:
                        <system>\Macromed\Flash\FlashPlayerTrust (c:\WINDOWS\system32\Macromed\Flash\FlashPlayerTrust)

                        Windows single user:
                        <app data>\Macromedia\Flash Player\#Security\FlashPlayerTrust 
                        Win XP (c:\Documents and Settings\<user>\Application Data\Macromedia\Flash Player\#Security\FlashPlayerTrust)
                        Win Vista (c:\Users\<user>\AppData\Roaming\Macromedia\Flash Player\#Security\FlashPlayerTrust)

                        Mac OS all users:
                        <app support>/Macromedia/FlashPlayerTrust (/Library/Application Support/Macromedia/FlashPlayerTrust)

                        Mac OS single user:
                        <app data>/Macromedia/Flash Player/#Security/FlashPlayerTrust (/Users/<user>/Library/Preferences/Macromedia/Flash Player/#Security/FlashPlayerTrust)

                        Linux all users:
                        /etc/adobe/FlashPlayerTrust/

                        Linux single user:
                        /home/<user>/.macromedia/Flash_Player/#Security/FlashPlayerTrust
                        /home/<user>/.macromedia/Macromedia/Flash_Player/#Security/FlashPlayerTrust/
                        */

                        get trustFile() {
                                var file = this.flashPlayerDirectory;
                                file.append('#Security');
                                if(!file.exists() || !file.isDirectory()) file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                file.append('FlashPlayerTrust');
                                if(!file.exists() || !file.isDirectory()) file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                file.append('flashfirebug.cfg');
                                return file;
                        },

                        get flashfirebugPath(){
                        	var profDir = CCIN('@mozilla.org/file/directory_service;1', 'nsIProperties').get('ProfD', Ci.nsILocalFile);
                            profDir.append('extensions');
                            profDir.append('flashfirebug@o-minds.com');
                            profDir.append('chrome');
                            
			             	// TODO:发布版本时注释
//			            	return "E:\\flash\\tamt2012\\flashfirebug\\flashfirebug@o-minds.com\\chrome\\";

                            return profDir.path;
                        },

                        checkTrustFile: function() {
                                var file = this.trustFile;
                                var path = this.flashfirebugPath;
                                var hasPath = false;

                                try {
                                        if (file.exists && file.fileSize != 0) {
                                                // read lines into array
                                                var str = '',
                                                        fis = CCIN('@mozilla.org/network/file-input-stream;1', 'nsIFileInputStream'),
                                                        line = {}, 
                                                        lines = [], 
                                                        hasmore = null;
                                                fis.init(file, 0x01, 00004, null);
                                                QI(fis, Ci.nsILineInputStream); 
                                                do {
                                                        hasmore = fis.readLine(line);
                                                        lines.push(line.value); 
                                                } while(hasmore);
                                                fis.close();

                                                var i = lines.length;
                                                while (i--) {
                                                        var idx = lines[i].indexOf(path);
                                                        if (idx > -1) hasPath = true;
                                                        if (hasPath) break;
                                                }
                                        }
                                } catch(e) {
                                        trace('checkTrustFile Error: ' + e.toString(), e);
                                        return hasPath;
                                }

                                return hasPath;
                        },

                        saveTrustFile: function() {
                                var file = this.trustFile;
                                var path = this.flashfirebugPath;
                                if (file.exists() && file.fileSize != 0) path = '\n' + path;

                                // Work with multiple profiles
                                this.writeFile(file, path, true);
                        },

                        ///////////////
                        // Log Files //
                        ///////////////

                        /*
                         Windows XP: C:\Documents and Settings\<user>\Application Data\Macromedia\Flash Player\Logs\flashlog.txt
                         Windows Vista: C:\Users\<user>\AppData\Roaming\Macromedia\Flash Player\Logs\flashlog.txt
                         OSX: /Users/<user>/Library/Preferences/Macromedia/Flash Player/Logs/flashlog.txt
                         Linux: home/<user>/.macromedia/Flash_Player/Logs/flashlog.txt
                        */

                        get logFile() {
                                if(!_logFile || !_logFile.exists()) {
                                        _logFile = this.flashPlayerDirectory;
                                        _logFile.append('Logs');
                                        if(!_logFile.exists() || !_logFile.isDirectory()) _logFile.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                        _logFile.append('flashlog.txt');
                                        if(!_logFile.exists()) _logFile.create(Ci.nsILocalFile.NORMAL_FILE_TYPE, 0777);
                                }

                                return _logFile;
                        },

                        get policyFile() {
                                if(!_polFile || !_polFile.exists()) {
                                        _polFile = this.flashPlayerDirectory;
                                        _polFile.append('Logs');
                                        if(!_polFile.exists() || !_polFile.isDirectory()) _polFile.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
                                        _polFile.append('policyfiles.txt');
                                        if(!_polFile.exists()) _polFile.create(Ci.nsILocalFile.NORMAL_FILE_TYPE, 0777);
                                }

                                return _polFile;
                        },

                        //////////////////
                        // SWF Profiler //
                        //////////////////

                        get profilerPath() {
                                var profDir = CCIN('@mozilla.org/file/directory_service;1', 'nsIProperties').get('ProfD', Ci.nsILocalFile);
                                profDir.append('extensions');
                                profDir.append('flashfirebug@o-minds.com');
                                profDir.append('chrome');
                                profDir.append('content');
                                profDir.append('flashfirebug.swf');
                                
				             	// TODO:发布版本时注释
//				            	return "E:\\flash\\tamt2012\\flashfirebug\\flashfirebug@o-minds.com\\chrome\\content\\flashfirebug.swf";
                                
                                return profDir.path;
                        },

                        /////////////
                        // MM File //
                        /////////////

                        get MM_PROPS() {
                                var t = this;
                                if (!_mmProps) {
                                        _mmProps = [
                                                { name:'AllowUserLocalTrust', 		type:'bool', default:true, documented:true },
                                                { name:'AS3AllocationTracking', 	type:'bool' },
                                                { name:'AS3AutoStartSampling', 		type:'bool' },
                                                { name:'AS3CSE', 					type:'bool' },
                                                { name:'AS3DCE', 					type:'bool' },
                                                { name:'AS3DynamicProfile', 		type:'bool' },
                                                { name:'AS3MIR', 					type:'bool' },
                                                { name:'AS3Sampling', 				type:'bool' },
                                                { name:'AS3SSE', 					type:'bool' },
                                                { name:'AS3StaticProfile', 			type:'bool' },
                                                { name:'AS3Trace', 					type:'bool' },
                                                { name:'AS3Turbo', 					type:'bool' },
                                                { name:'AS3Verbose', 				type:'bool' },
                                                { name:'AssetCacheSize', 			type:'int', default:20, documented:true },
                                                { name:'AutoUpdateDisable', 		type:'bool', default:false, documented:true }, 
                                                { name:'AutoUpdateInterval', 		type:'int', default:-1, documented:true },
                                                { name:'AutoUpdateVersionUrl', 		type:'string' },
                                                { name:'AVHardwareDisable', 		type:'bool', default:false, documented:true },
                                                { name:'AVHardwareEnabledDomain', 	type:'string', documented:true }, // can have multiple
                                                { name:'CodeSignLogFile', 			type:'string' },
                                                { name:'CodeSignRootCert', 			type:'bool' },
                                                { name:'Convert8kAnd16kAudio', 		type:'bool' },
                                                { name:'CrashLogEnable',			type:'bool' },
                                                { name:'DisableAVM1Loading', 		type:'bool' },
                                                { name:'DisableDeviceFontEnumeration', type:'bool', default:false, documented:true },
                                                { name:'DisableIncrementalGC', 		type:'bool' },
                                                { name:'DisableMulticoreRenderer', 	type:'bool' },
                                                { name:'DisableNetworkAndFilesystemInHostApp', type:'string', documented:true },
                                                { name:'DisableProductDownload', 	type:'bool', default:false, documented:true },
                                                { name:'DisableSockets', 			type:'bool', documented:true },
                                                { name:'DisplayGPUBlend', 			type:'bool' },
                                                { name:'EnableIncrementalValidation', type:'bool' },
                                                { name:'EnableLeakFile', 			type:'bool' },
                                                { name:'EnableSocketsTo', 			type:'string', documented:true }, // can have multiple
                                                { name:'EnforceLocalSecurityInActiveXHostApp', type:'string', documented:true },
                                                { name:'ErrorReportingEnable', 		type:'bool', default:false, documented:true },
                                                { name:'FileDownloadDisable', 		type:'bool', default:false, documented:true },
                                                { name:'FileDownloadEnabledDomain', type:'string', documented:true }, // can have multiple
                                                { name:'FileUploadDisable', 		type:'bool', default:false, documented:true },
                                                { name:'FileUploadEnabledDomain', 	type:'string', documented:true }, // can have multiple
                                                { name:'ForceGPUBlend', 			type:'bool' },
                                                { name:'FrameProfilingEnable', 		type:'bool' },
                                                { name:'FullScreenDisable', 		type:'bool', default:false, documented:true },
                                                { name:'GCStats', 					type:'bool' },
                                                { name:'GPULogOutputFileName', 		type:'string' },
                                                { name:'HeapProfilingAS3Enable', 	type:'bool'},
                                                { name:'LegacyDomainMatching',		type:'bool', documented:true },
                                                { name:'LocalFileLegacyAction', 	type:'bool', documented:true },
                                                { name:'LocalFileReadDisable', 		type:'bool', default:false, documented:true },
                                                { name:'LocalStorageLimit', 		type:'int', default:6, documented:true },
                                                { name:'LogGPU', 					type:'bool' },
                                                { name:'MaxWarnings', 				type:'int', default:500, documented:true },
                                                { name:'OverrideGPUValidation', 	type:'bool', documented:true  },
                                                { name:'OverrideUserInvokedActions', type:'bool'  },
                                                { name:'PolicyFileLog', 			type:'bool', default:true, documented:true  }, // default is false
                                                { name:'PolicyFileLogAppend', 		type:'bool', default:true, documented:true }, // default is false
        					{ name:'PreloadSwf', 				type:'string' },
                                                { name:'ProductDisabled', 			type:'string', documented:true }, // can have multiple
                                                { name:'ProductDownloadBaseUrl', 	type:'string' },
                                                { name:'ProfileFunctionEnable', 	type:'bool' },
                                                { name:'ProfilingOutputDirectory', 	type:'string' },
                                                { name:'ProfilingOutputFileEnable', type:'bool' },
                                                { name:'RendererProfilingEnable', 	type:'bool' },
                                                { name:'RTMFPP2PDisable', 			type:'bool', documented:true },
                                                { name:'RTMFPTURNProxy', 			type:'string', documented:true },
                                                { name:'ScriptStuckTimeout', 		type:'int', documented:true },
                                                { name:'SecurityDialogReportingEnable', type:'bool' },
                                                { name:'SuppressDebuggerExceptionDialogs', type:'bool' },
                                                { name:'ThirdPartyStorage', 		type:'bool', documented:true }, // no default
                                                { name:'TraceOutputBuffered', 		type:'bool' },
                                                { name:'TraceOutputFileEnable', 	type:'bool', default:true, documented:true },// default is false
                                                { name:'TraceOutputFileName', 		type:'string', default:t.logFile.path, documented:true },
                                                { name:'UseBrokerProcess', 			type:'bool' },
                                                { name:'WindowlessDisable', 		type:'bool' }
                                        ];
                                }
                                return _mmProps;
                        },

                        get mmDirectory() {
                                var file = undefined,
                                        dir = CCIN('@mozilla.org/file/directory_service;1', 'nsIProperties');
                                if(!_mmDirPath) {
                                        switch(this.OS) {
                                                case 'win' :
                                                case 'winVista' :
                                                        file = dir.get('AppData', Ci.nsILocalFile);
                                                        if (file.path.indexOf('Roaming') != -1) {
                                                          file = file.parent.parent;
                                                        } else {
                                                          file = file.parent;
                                                        }
                                                        
                                                        break;                                                
                                                 default:
                                                        file = dir.get('Home', Ci.nsILocalFile);
                                        }

                                        _mmDirPath = file.path;
                                } else {
                                        file = CCIN('@mozilla.org/file/local;1', 'nsILocalFile');
                                        file.initWithPath(_mmDirPath);
                                }

                                return file;
                        },

                        get mmFile() {
                                if(!_mmFile || !_mmFile.exists()) {
                                        _mmFile = this.mmDirectory;
                                        _mmFile.append('mm.cfg');
                                        if(!_mmFile.exists()) _mmFile.create(Ci.nsILocalFile.NORMAL_FILE_TYPE, 0777);
                                }

                                return _mmFile;
                        },

                        initMMFile: function(force) {
                                var mm_exists = true,
                                        alertTimer = CCIN('@mozilla.org/timer;1', 'nsITimer'),
                                        alertDelay = 3000;

                                var settings = this.readMMFile();
                                if(this.mmFile.fileSize == 0 || force) {
                                        if(this.mmDirectory.isWritable()) {
                                                var result = this.saveMMFile(settings);
                                                if(result != true) {
                                                        // Cannot create the Flash Player Debugger config (mm.cfg) file in
                                                        alertTimer.initWithCallback({ notify:function(timer) { _alert($FL_STR("flashbug.logPanel.error.mm") + this.mmFile.path); } }, alertDelay, Ci.nsITimer.TYPE_ONE_SHOT);
                                                        mm_exists = false;
                                                } else {
                                                        mm_exists = true;
                                                        // Flash Player Debugger config (mm.cfg) file created for the first time.
                                                        //alertTimer.initWithCallback({ notify:function(timer) { _alert($FL_STR("flashbug.logPanel.mmCreate")); } }, alertDelay, Ci.nsITimer.TYPE_ONE_SHOT);
                                                }
                                        } else {
                                                // is not writeable, please check permissions
                                                alertTimer.initWithCallback({ notify:function(timer) { _alert(this.mmDirectory.path + $FL_STR("flashbug.logPanel.error.write")); } }, alertDelay, Ci.nsITimer.TYPE_ONE_SHOT);
                                                mm_exists = false;
                                        }
                                }

                                if(!mm_exists) {
                                        //Flash Player Debugger config (mm.cfg) file does not exist
                                        alertTimer.initWithCallback({ notify:function(timer) { _alert($FL_STR("flashbug.logPanel.error.mm2")); } }, alertDelay, Ci.nsITimer.TYPE_ONE_SHOT);
                                }

                                // Update settings based on whats actually in the mm.cfg file
                                settings = this.readMMFile();
                                for (var prop in settings) {
                                        var prefName = 'extensions.firebug.flashbug.' + prop,
                                                value = settings[prop],
                                                type = _prefSvc.getPrefType(prefName);
                                        if (type == Ci.nsIPrefBranch.PREF_STRING) {
                                                _prefSvc.setCharPref(prefName, value);
                                        } else if (type == Ci.nsIPrefBranch.PREF_INT) {
                                                _prefSvc.setIntPref(prefName, value);
                                        } else if (type == Ci.nsIPrefBranch.PREF_BOOL) {
                                                _prefSvc.setBoolPref(prefName, value);
                                        }
                                }
                        },

                        /*
                        Mac OSX: Flash Player first checks the user's home directory (~). If none is found, then Flash Player looks in /Library/Application Support/Macromedia
                        Windows 95/98/ME: %HOMEDRIVE%\%HOMEPATH%
                        Windows 2000/XP: C:\Documents and Settings\username
                        Windows Vista: C:\Users\username
                        Linux: /home/username
                        */
                        saveMMFile: function(mm) {
                                if (!mm) mm = {};

                                try {
				// Set preloadSWF based on Flash Panel being enabled
				//var path = 'D:\\SVN\\projects\\firefox\\flashbug\\profiler\\profiler.swf';
				//var path = 'C:\\Users\\Gabriel\\Documents\\SVN\\Coursevector\\projects\\firefox\\flashbug\\profiler\\profiler.swf';
                                
                                        mm['PreloadSwf'] = this.profilerPath;
                                        mm['ErrorReportingEnable'] = _prefSvc.getBoolPref('extensions.firebug.flashbug.console.enableWarnings');
                                        mm['MaxWarnings'] = _prefSvc.getIntPref('extensions.firebug.flashbug.console.maxWarnings');

                                        var str = '';
                                        for (var i = 0; i < this.MM_PROPS.length; i++) {
                                                var prop = this.MM_PROPS[i];
                                                var value = null;
                                                if (mm.hasOwnProperty(prop.name)) {
                                                        value = mm[prop.name];
                                                } else if (prop.hasOwnProperty('default')) {
                                                        value = prop.default;
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

                                        return this.writeFile(this.mmFile, str);
                                } catch (e) {
                                        trace('saveMMFile Error: ' + e.toString(), e);
                                        return false;
                                }
                        },

                        readMMFile: function() {
                                var file = this.mmFile,
                                        o = {};
                                try {
                                        if(file.exists && file.fileSize != 0) {
                                                var str = '',
                                                        fis = CCIN('@mozilla.org/network/file-input-stream;1', 'nsIFileInputStream'),
                                                        cis = CCIN('@mozilla.org/intl/converter-input-stream;1', 'nsIConverterInputStream');
                                                fis.init(file, 0x01, 00004, null);
                                                cis.init(fis, 'UTF-8', 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
                                                if(cis instanceof Ci.nsIUnicharLineInputStream) {
                                                        var data = {},
                                                        read = 0;
                                                        do { 
                                                                read = cis.readString(0xFFFFFFFF, data); // read as much as we can and put it in str.value
                                                                str += data.value;
                                                        } while (read != 0);

                                                        cis.close();
                                                }
                                                fis.close();

                                                for (var i = 0; i < this.MM_PROPS.length; i++) {
                                                        var prop = this.MM_PROPS[i], regex, result;
                                                        // { name:'ProductDisabled', type:'bool' }

                                                        switch(prop.type) {
                                                                case 'bool' :
                                                                        regex = new RegExp("^" + prop.name + "=([01])", "gm");
                                                                        result = regex.exec(str);
                                                                        if (result)	o[prop.name] = Boolean(result[1] == 1);
                                                                        break;
                                                                case 'int' :
                                                                        regex = new RegExp("^" + prop.name + "=(\\d+)", "gm");
                                                                        result = regex.exec(str);
                                                                        if (result)	o[prop.name] = +result[1];
                                                                        break;
                                                                case 'string' :
                                                                default :
                                                                        regex = new RegExp("^" + prop.name + "=([^#\\r\\n]+)", "gm");
                                                                        result = regex.exec(str);
                                                                        if (result)	o[prop.name] = result[1];
                                                                        break;
                                                        }
                                                }
                                        }
                                } catch(e) {
                                        trace('readMMFile Error: ' + e.toString(), e);
                                }

                                return o;
                        },
                        registerToolType:function(){
                                _toolTypes.push.apply(_toolTypes, arguments);

                                for(var i=0; i<arguments.length; i++)
                                        _toolTypeMap[arguments[i].prototype.name]=arguments[i];
                        },

                        getToolType:function(toolName){
                                return _toolTypeMap[toolName];
                        },

                        buildToolInstance:function(toolName){
                                var toolType = _toolTypeMap[toolName];
                                var tool = new toolType();
                                return tool;
                        },

                        get toolTypes(){
                                return _toolTypes;
                        },
                        
                        setProfilerMode:function(bool){
                        	_profilerMode = bool;
                        },
                        
                        getProfilerMode:function(){
                        	return _profilerMode;
                        }
                }   
        })();