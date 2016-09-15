FBL.ns(function() {
    with (FBL) {
        Components.utils.import("resource://flashfirebuglibs/prepare.js");
    	
    	var $FL_STR = Flashbug.$FL_STR,
    	$FL_STRF = Flashbug.$FL_STRF;
    	
        // Constants
		// ************************************************************************************************
        // this panel
        const panelName         = "ffbug";
        const panelTitle        = "Flash";
        // side panels
        const infoPanel         = "ffbuginfo";
        const propPanel         = "ffbugprop";
        const outputPanel       = "ffbugoutput";
        const consolePanel      = "ffbugconsole";
        // others
        const panelHomePage     = "http://www.o-minds.com/products/flashfirebug";
        const panelPaymentPage   = "http://www.o-minds.com/payment/flashfirebug?m=1";
        const ffbFAQPage		=	"http://redmine.o-minds.com/news/2";
        const flashPlayerPage		=	"http://www.adobe.com/support/flashplayer/downloads.html";
        // Module
		// ***************************************************************************************************
        Firebug.FlashModule = extend(Firebug.ActivableModule,
        {
            messagepane: null,
            injector: new JSInjector(),
            inspecting:false,
            transforming:false,
            watching:false,
            data:"",
            isDebug:true,
            version:null,
            enabled:false,
            activated:false,
            infoTipContent:null,
            selectedSWF: null,

            // override --------------------------
            trace:function(msg, obj) {
                    if (FBTrace.DBG_FLASH_INSPECTOR) FBTrace.sysout('InspectorModule - ' + msg, obj);
            },
            ERROR:function(e) {
                     if (FBTrace.DBG_FLASH_ERRORS) FBTrace.sysout('InspectorModule ERROR ' + e);
            },
			
            internationalizeUI: function(doc) {
              this.trace("internationalizeUI");
              
              var elements = ["flashInspector", "flashProfiler", "flashTransformer", "flashWatcher", "flashConnect", "flashActivate"];
              var attributes = ["label", "tooltiptext", "value"];

              Flashbug.internationalizeElements(doc, elements, attributes);              
            },
            addversionswf: function(sender) {
              var email = flashfirebugPrepare.getPrefValue("ffbug.email");
              var key = flashfirebugPrepare.getPrefValue("ffbug.key");
              
              var versionSWF = Firebug.chrome.$("flashfirebug_version_swf");
              if (versionSWF != null) {
                versionSWF.parentNode.removeChild(versionSWF);
              }
              var tmp = document.createElementNS("http://www.w3.org/1999/xhtml","embed");
              tmp.id = "flashfirebug_version_swf";
              tmp.name = "flashfirebug_version_swf";
              tmp.src = "chrome://flashbug/content/version.swf?email=" + encodeURIComponent(encodeURIComponent(email)) + "&key=" + encodeURIComponent(encodeURIComponent(key)) + "&sender=" + sender + "&callFlashPlayerReady=true";
              tmp.allowscriptaccess = "always";
              Firebug.chrome.$("ffbugversion").appendChild(tmp);
            },
        	
            initialize: function() {
            	this.trace("initialize");
            	
                Firebug.ActivableModule.initialize.apply(this, arguments);
                                
                // set enable value
                this.enabled = flashfirebugPrepare.getPrefValue("ffbug.enableSites");
            },
            showPanel: function(browser, panel) {
            	this.trace("showPanel");
            	// var thisPanel = panel && panel.name == panelName;
				var thisPanel = panel && (panel.name == "flashfirebug" && panel.currTool == panelName);
//                collapse(Firebug.chrome.$("fbFlashbugInspectButtons"), !thisPanel);
                if (thisPanel){
                    $FQuery(Firebug.chrome.$("fbToolbox")).attr("style","-moz-appearance: none;-moz-user-focus: normal;border-top: 1px solid threedshadow;border-bottom: 1px solid threedshadow;background-color: #F0F0F0;");
                }else{
                    $FQuery(Firebug.chrome.$("fbToolbox")).attr("style","");
                }
            },
            initContext: function(context, persistedState){
            	this.trace("initContext");
                Firebug.ActivableModule.initContext.apply(this, arguments);

                try{                  
                  if (Firebug.chrome.$("flashfirebug_version_swf") == null) {
                    this.addversionswf("main");
                  }
                }catch(e){
                    Firebug.FlashModule.trace("error when setting flashfirebug_version_swf: " + e + ", " + $('ffbugversion'));
                }
            },
            destroyContext: function(context, persistedState){
            	this.trace("destroyContext");
                this.activated = false;
                Firebug.ActivableModule.destroyContext.apply(this, arguments);
            },
            loadedContext: function(context){
            	this.trace("loadedContext");
                Firebug.ActivableModule.loadedContext.apply(this, arguments);
            },
            shutdown: function(){
            	this.trace("shutdown");
                Firebug.ActivableModule.shutdown.apply(this, arguments);
            },
            showContext: function(browser, context){
            	this.trace("showContext");
            	this.activated = true;
                Firebug.ActivableModule.showContext.apply(this, arguments);

            },
            reattachContext: function(browser, context){
            	this.trace("reattachContext");
                Firebug.ActivableModule.reattachContext.apply(this, arguments);
            },
            // end override --------------------------
            getFlashPluginVersion : function() {
                var version = {
                    major : 0,
                    minor : 0,
                    installed : false,
                    scriptable : false,
                    debug :false
                };

                var plugin = navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin;
                if (!plugin) {
                    return version;
                }

                version.installed = true;

                var description = plugin.description;

                var versionArray = description.match(/[\d.]+/g);

                if (!versionArray) {
                    return version;
                }

                if (versionArray.length >= 1 && !isNaN(versionArray[0])) {
                    version.major = versionArray[0];
                }

                if (versionArray.length >= 2 && !isNaN(versionArray[1])) {
                    version.minor = versionArray[1];
                }

                if (version.major < 6 || navigator.product != 'Gecko') {
                    return version;
                }

                if (version.major > 6 || version.minor >= 47) {
                    version.scriptable = true;
                }

                if(description.match(" r")){
                    version.debug = true;
                }
                return version;
            },
            getFlashPlayerVersion:function(){
                var minor = Firebug.FlashModule.version.minor;
                var major = Firebug.FlashModule.version.major;
                var debug = (Firebug.FlashModule.isDebug)?"debugger":"not debugger";
                return  major+"."+minor+" "+debug;
            },
            isValidFlashPlayer:function(){
                Firebug.FlashModule.version  = Firebug.FlashModule.getFlashPluginVersion();
                this.trace("isValidFlashPlayer", Firebug.FlashModule.version);
                return (Number(Firebug.FlashModule.version.major) >= 10.2 && Firebug.FlashModule.isDebug);
            },
            getConnectMessage:function(){
            	if(flashfirebugPrepare.profilerMode){
            		return Firebug.FlashModule.UsingProfilerRep;
            	}else{
            		return Firebug.FlashModule.ConnectMessageRep;
            	}
            },
            // en: Connect FlashFirebug to swf
            connectFlash:function(currentDoc){
            	if(flashfirebugPrepare.profilerMode)return;
            	if($FQuery("ul",Firebug.FlashModule.getThisPanel().panelNode).length == 0){
            		Firebug.FlashModule.setMessage(panelName, Firebug.FlashModule.NoSwfFoundRep);
            	}
            	Firebug.FlashModule.connectDocFlash(currentDoc);
            },
            connectDocFlash:function(currentDoc){
            	Firebug.FlashModule.trace("FlashFirebug:connectDocFlash");
            	Firebug.FlashModule.injector.runFunction(currentDoc,"FlashFirebug_start");
                currentDoc['ffbugIsConnected'] = true;
                var iframes = currentDoc.getElementsByTagName("iframe");
                for (var i=0; i < iframes.length; i++) {
                    iframeDoc = iframes[i].contentDocument;
                    Firebug.FlashModule.connectDocFlash(iframeDoc);
                }
            },
            enableFlashFirebug:function(currentDoc){
            	Firebug.FlashModule.trace("FlashFirebug:::enableFlashFirebug, profilerMode: " + flashfirebugPrepare.profilerMode);
            	if(flashfirebugPrepare.profilerMode)return;
                if (this.activated){
                    if (currentDoc['ffbugIsInjected']){
                        if(currentDoc['ffbugIsConnected'])this.injector.runFunction(currentDoc,"FlashFirebug_start");
                    }else{
                        currentDoc.addEventListener("ASEvent", Firebug.FlashModule.get, false, true);
                        this.injector.addJsFile(currentDoc,"chrome://flashfirebug/content/lib/ASConnector.js");
                        currentDoc['ffbugIsInjected'] = true;
                        currentDoc['ffbugIsConnected'] = false;
                    }

                    var iframes = currentDoc.getElementsByTagName("iframe");
                    for (var i=0; i < iframes.length; i++) {
                        iframeDoc = iframes[i].contentDocument;
                        Firebug.FlashModule.enableFlashFirebug(iframeDoc);
                    }
                    this.enabled = true;
                }
               
            },
            disableFlashFirebug:function(currentDoc){
            	Firebug.FlashModule.trace("FlashFirebug:::disableFlashFirebug, profilerMode: " + flashfirebugPrepare.profilerMode);
            	if(flashfirebugPrepare.profilerMode)return;
                this.injector.runFunction(currentDoc,"FlashFirebug_stop");
                currentDoc['ffbugIsConnected'] = false;
                var iframes = currentDoc.getElementsByTagName("iframe");
                for (var i=0; i < iframes.length; i++) {
                    iframeDoc = iframes[i].contentDocument;
                    Firebug.FlashModule.disableFlashFirebug(iframeDoc);
                }
                this.enabled = false;
            },
            toggleInspector:function(){
            	this.trace("toggleInspector, inspecting:" + Firebug.FlashModule.inspecting);
                if (Firebug.FlashModule.inspecting)
                    Firebug.FlashModule.stopInspect();
                else
                    Firebug.FlashModule.startInspect();
            },
            toggleProfiler: function() {
              if(flashfirebugPrepare.isPro)
              {
                if (Firebug.FlashModule.selectedSWF != null) { // something's gotta be selected
                  var email = flashfirebugPrepare.getPrefValue("ffbug.email");
                  var key = flashfirebugPrepare.getPrefValue("ffbug.key");

                  Firebug.FlashModule.send({
                      command:"toggleProfiling",
                      email:email,
                      key:key,
                      id:Firebug.FlashModule.selectedSWF
                  });
                } else {
                  alert('You must choose some SWF first.')
                }
              } else { // he's not Pro
                var args = {
                    FlashModule: Firebug.FlashModule,
                    $FQuery:$FQuery
                };
                // Open unlockPro dialog. Pass FlashModule,$FQuery into the
                                    // XUL window ;)
                window.openDialog("chrome://flashbug/content/unlockPro.xul", "flashFirebugUnlockPro","chrome,centerscreen,dialog,modal,resizable=no", args);                
              }
            },
            toggleTransformer:function(){
            	if(flashfirebugPrepare.isPro)
            	{
                    if (Firebug.FlashModule.transforming)
                        Firebug.FlashModule.stopTransform();
                    else
                        Firebug.FlashModule.startTransform();	
            	}else{
                    var args = {
                        FlashModule: Firebug.FlashModule,
                        $FQuery:$FQuery
                    };
                    // Open unlockPro dialog. Pass FlashModule,$FQuery into the
					// XUL window ;)
                    window.openDialog("chrome://flashbug/content/unlockPro.xul", "flashFirebugUnlockPro","chrome,centerscreen,dialog,modal,resizable=no", args);
            	}
            },
            unlockPro: function() {
                    var args = {
                        FlashModule: Firebug.FlashModule,
                        $FQuery:$FQuery
                    };
                    // Open unlockPro dialog. Pass FlashModule,$FQuery into the
					// XUL window ;)
                    window.openDialog("chrome://flashbug/content/unlockPro.xul", "flashFirebugUnlockPro","chrome,centerscreen,dialog,modal,resizable=no", args);
            },
            toggleWatch:function(){
                if (Firebug.FlashModule.watching)
                    Firebug.FlashModule.stopWatch();
                else
                    Firebug.FlashModule.startWatch();
            },            
            inspectButtonChecked:function(data){
            	this.trace("inspectButtonChecked", data);
                $("flashInspector").setAttribute("checked", data.checked);
                Firebug.FlashModule.inspecting = (data.checked == "true");
                Firebug.FlashModule.send({
                    command:"toggleInspect",
                    toggle:Firebug.FlashModule.inspecting
                });
            },
            inspectButtonDisabled:function(data){
                if ($("flashInspector").getAttribute("disabled") == data.disabled) return;
                $("flashInspector").setAttribute("disabled", data.disabled);
                Firebug.FlashModule.inspectButtonChecked({
                    checked:"false"
                });
                if (data.disabled == "true"){
                    $("flashInspector").setAttribute("image", "chrome://flashbug/content/themes/default/images/inspectordis.png");
                }else{
                    $("flashInspector").setAttribute("image", "chrome://flashbug/content/themes/default/images/inspector.png");
                }
            },
            transformButtonChecked:function(data){
                $("flashTransformer").setAttribute("checked", data.checked);
                Firebug.FlashModule.transforming = (data.checked == "true");
                
                var email = flashfirebugPrepare.getPrefValue("ffbug.email");
                var key   = flashfirebugPrepare.getPrefValue("ffbug.key");
                Firebug.FlashModule.send({
                    command:"toggleTransform",
                    email:email,
                    key:key,
                    toggle:Firebug.FlashModule.transforming
                });
            },
            profilerButtonDisabled: function(data) {
              if (data.disabled != 'ignore') {
                if ($("flashProfiler").getAttribute("disabled") == data.disabled) return;
                $("flashProfiler").setAttribute("disabled", data.disabled);
              }
              if(!flashfirebugPrepare.isPro){
                if($("flashProfiler").getAttribute("disabled") == 'true'){
                        $("flashProfiler").setAttribute("image", "chrome://flashbug/content/themes/default/images/profiler_tool_dis_pro.png");
                }else{
                        $("flashProfiler").setAttribute("image", "chrome://flashbug/content/themes/default/images/profiler_tool_pro.png");
                }
                $("flashProfiler").setAttribute("tooltiptext", $FL_STR("flashbug.tool.needPro"));
              } else {
                if($("flashProfiler").getAttribute("disabled") == 'true'){
                        $("flashProfiler").setAttribute("image", "chrome://flashbug/content/themes/default/images/profiler_tool_dis.png");
                }else{
                        $("flashProfiler").setAttribute("image", "chrome://flashbug/content/themes/default/images/profiler_tool.png");
                }
                $("flashProfiler").setAttribute("tooltiptext", $FL_STR("flashbug.tool.inspector.profile.tooltip"));
              }             
            },
            transformButtonDisabled:function(data){
              if (data.disabled != 'ignore') {
                if ($("flashTransformer").getAttribute("disabled") == data.disabled) return;
                $("flashTransformer").setAttribute("disabled", data.disabled);
              }

              // 设置Transofrm的外观
              if(!flashfirebugPrepare.isPro){

                  Firebug.FlashModule.transformButtonChecked({
                      checked:"false"
                  });

                  if($("flashTransformer").getAttribute("disabled") == 'true'){
                          $("flashTransformer").setAttribute("image", "chrome://flashbug/content/themes/default/images/transform_tool_prodis.png");
                  }else{
                          $("flashTransformer").setAttribute("image", "chrome://flashbug/content/themes/default/images/transform_tool_pro.png");
                  }
                  $("flashTransformer").setAttribute("tooltiptext", $FL_STR("flashbug.tool.needPro"));
              }else{
                  if($("flashTransformer").getAttribute("disabled") == 'true'){
                          $("flashTransformer").setAttribute("image", "chrome://flashbug/content/themes/default/images/transform_tooldis.png");
                  }else{
                          $("flashTransformer").setAttribute("image", "chrome://flashbug/content/themes/default/images/transform_tool.png");
                  }
                  $("flashTransformer").setAttribute("tooltiptext", $FL_STR("flashbug.tool.inspector.transform.tooltip"));
                }
            },            
            watchButtonChecked:function(data){
                $("flashWatcher").setAttribute("checked", data.checked);
                Firebug.FlashModule.watching = (data.checked == "true");
                Firebug.FlashModule.send({
                    command:"toggleWatch",
                    toggle:Firebug.FlashModule.watching
                });
            },
            watchButtonDisabled:function(data){
                if ($("flashWatcher").getAttribute("disabled") == data.disabled) return;
                $("flashWatcher").setAttribute("disabled", data.disabled);
                Firebug.FlashModule.watchButtonChecked({
                    checked:"false"
                });
                if (data.disabled == "true"){
                    $("flashWatcher").setAttribute("image", "chrome://flashbug/content/themes/default/images/flash_watchdis.png");
                }else{
                    $("flashWatcher").setAttribute("image", "chrome://flashbug/content/themes/default/images/flash_watch.png");
                }
            },                        
            connectButtonDisabled:function(data){
                if ($("flashConnect").getAttribute("disabled") == data.disabled) return;
            	$("flashConnect").setAttribute("disabled", data.disabled);
            	if(data.disabled){
            		$("flashConnect").setAttribute("image", "chrome://flashbug/content/themes/default/images/flash_connectdis.png");
            	}else{
            		$("flashConnect").setAttribute("image", "chrome://flashbug/content/themes/default/images/flash_connect.png");
            	}
            },
            startInspect: function(){
                Firebug.FlashModule.inspectButtonChecked({
                    checked:"true"
                });
            },
            stopInspect:function(){
                Firebug.FlashModule.inspectButtonChecked({
                    checked:"false"
                });
            },
            startTransform: function(){
                Firebug.FlashModule.transformButtonChecked({
                    checked:"true"
                });
            },
            stopTransform:function(){
                Firebug.FlashModule.transformButtonChecked({
                    checked:"false"
                });
            },
            startWatch: function(){
                Firebug.FlashModule.watchButtonChecked({
                    checked:"true"
                });
            },
            stopWatch:function(){
                Firebug.FlashModule.watchButtonChecked({
                    checked:"false"
                });
            },
            activatePro:function(data){
                Firebug.FlashModule.isDebug = data.isDebug;    
                flashfirebugPrepare.isPro = data.isPro;
                flashfirebugPrepare.oldUser = data.oldUser;
                flashfirebugPrepare.expDate = data.expDate;
                
                if (data.callOrder == 0 && data.sender == "main") {
                  if (!flashfirebugPrepare.isPro) { // Not Pro?
                    var wasPro = flashfirebugPrepare.getPrefValue("ffbug.isPro");
                    if (wasPro) { // this guy was pro, but no longer is (i.e. expired)
                      flashfirebugPrepare.setPrefValue("ffbug.isPro", false);
                      var args = {
                          FlashModule: Firebug.FlashModule,
                          $FQuery:$FQuery
                      };

                      window.openDialog("chrome://flashbug/content/reminder.xul", "flashFirebugUpgradeReminder","chrome,centerscreen,dialog,modal,resizable=no", args);
                    }
                    if (flashfirebugPrepare.oldUser) { // handling old users
                      flashfirebugPrepare.openTab("http://www.o-minds.com/payment-gateway/upgrade/" + encodeURIComponent(data.email) + "/" + encodeURIComponent(data.key));
                    }
                  }
                }
                
                collapse(Firebug.chrome.$("ffbUpgradeButton"), flashfirebugPrepare.isPro);
                collapse(Firebug.chrome.$("flashActivate"), flashfirebugPrepare.isPro);
                try {
                  Firebug.FlashModuleConsole.activatePro();
                  Firebug.FlashfirebugModel.activatePro(data);
                  Flashbug.ConsoleModule.activatePro();
                  Flashbug.SharedObjectModule.activatePro();
                  Firebug.FlashModuleInfo.activatePro();
                  Firebug.FlashModuleProp.activatePro();
                } catch(e) {
                  dump(e.toString());
                }

                if (flashfirebugPrepare.isPro){
                    flashfirebugPrepare.setPrefValue("ffbug.isPro", true);
                    if (data.sender == "dialog") {
                        alert($FL_STR("flashbug.tool.activateSuccess"));
                    }
                }else{
                    if (data.sender == "dialog") {
                        alert($FL_STR("flashbug.tool.invalidKey"));
                    }
                }
                
                // 设置Transofrm的外观
                Firebug.FlashModule.profilerButtonDisabled({
                    disabled:"ignore"
                });
                Firebug.FlashModule.transformButtonDisabled({
                    disabled:"ignore"
                });
            },            
            get: function(event){
                if(event.target.ownerDocument.defaultView.top.document == FBL.getTabBrowser().contentDocument){
                    var data = event.target.getAttribute("flashfirebugdata");
                    data = JSON.parse(data);
                    var command = data.command;
                    var panel = Firebug.FlashModule.getThisPanel();
                    if(panel[command]){
                        panel[command](data, event.target.ownerDocument);
                    }
                }
            },
            send: function(data){
            	this.trace("send, enabled:"+this.enabled+", activated:" + this.activated, data);
                if(!this.enabled || !this.activated) return;
                
                var id = data.id;
                data = JSON.stringify(data);
                
                this.sendDataToDoc(FBL.getTabBrowser().contentDocument, id, data);
            },
            
            sendDataToDoc:function(doc, id, data){
            	Firebug.FlashModule.trace(doc + "id:" + id + ",data:" + data);
            	if (id){
            		Firebug.FlashModule.injector.runFunction(doc,"FlashFirebug_send", data, id);
                }else{
                	Firebug.FlashModule.injector.runFunction(doc,"FlashFirebug_send", data);
                }
                // sub iframes
                var iframes = doc.getElementsByTagName("iframe");
                for (var i=0; i < iframes.length; i++) {
                	Firebug.FlashModule.sendDataToDoc(iframes[i].contentDocument, id, data);
                }
            },
            
            targetSelector:function(id,displayId){
            	// 转义id中的特殊字符, 例如:":", "#"等, 这些符号在jQuery是特殊字符
                function replaceReg(reg,str){ 
              	  return str.replace(reg,function(m){return '\\' + m;});
              	}
                var reg = /[:#.$/]/g;
                id = replaceReg(reg, id);

                //it’s technically invalid to have a space in an ID attribute value in HTML
                //but people may do this.
                id = id.replace(" ", "\\ ");

                var selector = "#"+id;
                selector +=(displayId!=0)?" #"+displayId:"";
//                selector +=" #"+displayId;
                return selector;
            },
            targetSWFId: function(target){
                var targetSWF; 
                if($FQuery(target).hasClass("swf")) 
                    targetSWF = target;
                else 
                    targetSWF = $FQuery(target).parents("ul#base > li.swf");
                return $FQuery(targetSWF).attr("id");
            },
            encodeHTML:function(str,target){
                var newVal = $FQuery(target).text(str).html();
                newVal = newVal.replace(/\"/gi, "&quot;");
                newVal = newVal.replace(/\'/gi, "&#039;");
                newVal = newVal.replace(/\\/gi, "&#92;");
                return newVal;
            },
            decodeHTML:function(str,target){
                var newVal = $FQuery(target).html(str).text();
                newVal = newVal.replace(/&quot;/gi, "\"");
                newVal = newVal.replace(/&#039;/gi, "\'");
                newVal = newVal.replace(/&#92;/gi, "\\");
                return newVal;
            },
            setMessage: function(panel_name,messageRep,args){
            	this.trace("setMessage: " + panel_name + ", " + messageRep, messageRep);
                var panel;
                if(panel_name == panelName){
                	panel = Firebug.FlashModule.getThisPanel();
                }else{
                	panel = Firebug.FlashModule.getPanel(panel_name);
                }
                if(panel){
                	this.trace("setMessage, args", args);
                	messageRep.tag.replace(args, panel.panelNode, null);
                	this.trace("setMessage: success!!", panel.panelNode);
                }else{
                	this.ERROR("can't find panel: " + panel_name);
                }
            },
            addStyleSheet: function(panel) {
                var doc = panel.document;
                if ($("flashfirebugStyles", doc)) return;
                var styleSheet = createStyleSheet(doc, "chrome://flashbug/content/themes/default/style.css");
                styleSheet.setAttribute("id", "flashfirebugStyles");
                addStyleSheet(doc, styleSheet);
                this.setBehaviors();
            },            
            setBehaviors:function(){
                // set panel behaviors
                var li = "ul#base li:not(.byffbug)";
                var liName = "ul#base li:not(.byffbug) > a";
                    
                $FQuery(li,this.panelNode).live("click",function(event){
                    if(event.target != this) return true;
                    var id = Firebug.FlashModule.targetSWFId(this);
                    var displayId = $FQuery(this).attr("id");
                    if (displayId == id) displayId = 0;
                    Firebug.FlashModule.selectedSWF = id;
                    
                    if($FQuery(this).hasClass("isOpened")){                    
                        $FQuery(this).removeClass("isOpened");                        
                        $FQuery(this).children("ul").slideUp("fast",function(){
                            $FQuery(this).remove();
                        });                        
                        Firebug.FlashModule.send({
                            command:"nodeClosed",
                            displayId:displayId,
                            id:id
                        });                        
                    }else{
                        $FQuery(this).addClass("wait");                        
                        Firebug.FlashModule.send({
                            command:"nodeOpened",
                            displayId:displayId,
                            id:id
                        });
                    }
                    return false;
                });
                
                $FQuery(liName,this.panelNode).live("click",function(event){
                    var liThis =  $FQuery(this).parent('li').get(0);                    
                    
                    var id = Firebug.FlashModule.targetSWFId(liThis);
                    var displayId = $FQuery(liThis).attr("id");
                    if (displayId == id) displayId = 0;
                    Firebug.FlashModule.selectedSWF = id;
                    
                    Firebug.FlashModule.send({
                        command:"selectObject",
                        displayId:displayId,
                        id:id,
                        email:flashfirebugPrepare.getPrefValue("ffbug.email"),
                        key:flashfirebugPrepare.getPrefValue("ffbug.key")
                    });
                    
                    $FQuery("#base a",this.ownerDocument).removeClass("selected");                    
                    $FQuery(this).addClass("selected");
                    return false;
                });

                // this is fix live-hover bug in jquery
                $FQuery(liName,this.panelNode).live("mouseenter", function(event){ 
                    var liThis =  $FQuery(this).parent('li').get(0);                        
                    var id = Firebug.FlashModule.targetSWFId(liThis);
                    var displayId = $FQuery(liThis).attr("id");
                    if (displayId == id) displayId = 0; 
                    if (Firebug.FlashModule.inspecting){
                        $FQuery("#base a.hover",this.ownerDocument).removeClass("hover");
                    }
                    Firebug.FlashModule.send({
                        command:"overlayObject",
                        displayId:displayId,
                        id:id
                    });
                    return false;
                }).live("mouseleave",function(event){                                     
                    Firebug.FlashModule.send({
                        command:"removeOverlay"
                    });
                    return false;
                });
                
                $FQuery("#downloadflashplayer",this.panelNode).live("click",function(event){                
                    flashfirebugPrepare.openTab(flashPlayerPage);
                });

                $FQuery("#pro-about",this.panelNode).live("click",function(event){
                    prepareFFB.openTab(panelHomePage);
                });

                $FQuery("#pro-link",this.panelNode).live("click",function(event){
                    flashfirebugPrepare.openTab(panelPaymentPage);
                });

                $FQuery("#connect-flash",this.panelNode).live("click",function(event){                
                    Firebug.FlashModule.connectFlash(FBL.getTabBrowser().contentDocument);
                });
                
                $FQuery("#in-profiler-mode",this.panelNode).live("click",function(event){                
                	flashfirebugPrepare.openTab(ffbFAQPage);
                });
                
                $FQuery("#flash-player-page",this.panelNode).live("click",function(event){                
                	flashfirebugPrepare.openTab(flashPlayerPage);
                });
                
            },
            getPanel: function(name) {
                try{
                    var FbContext = this.FirebugContext?this.FirebugContext:Firebug.currentContext; 
                    // backward compatibilty Firebug 1.7 <
                    return FbContext.getPanel(name);
                }catch(e){
                    return null;
                }
            },
            getThisPanel:function(){
            	var panel = this.getPanel("flashfirebug");
            	if(panel){
            		return panel.getTool(panelName);
            	}
            },
            setupStreamListener: function(httpChannel, aSubject)
            {
            	Firebug.FlashModule.trace("setupStreamListener");
                var newListener = new FlashTraceListener();
                aSubject.QueryInterface(Components.interfaces.nsITraceableChannel);
                newListener.originalListener = aSubject.setNewListener(newListener);
            }
        });
        
        //提示用戶連接flash
        Firebug.FlashModule.ConnectMessageRep = domplate(Firebug.Rep,{
        	inspectable:false,
        	tag:DIV({class:"panel-msg"},P($FL_STR("flashbug.tool.noFlashFilesLoaded"),
        			A({id:"connect-flash"}, $FL_STR("flashbug.tool.clickToScan")))
        		)
        });
        
        //網頁上沒有檢測到swf文件
        Firebug.FlashModule.NoSwfFoundRep = domplate(Firebug.Rep,{
        	inspectable:false,
        	tag:DIV({class:"panel-msg"},
        			P($FL_STR("flashbug.tool.noSwfDetected"))
        		)
        });
        
        //提示用戶正在使用profiler工具
        Firebug.FlashModule.UsingProfilerRep = domplate(Firebug.Rep,{
        	inspectable:false,
        	tag:DIV({class:"panel-msg"},
        			P($FL_STR("flashbug.tool.inProfilerMode")
        			)
        		)
        });
        
        //提示用戶當前沒有被選擇的DisplayObject
        Firebug.FlashModule.SelectDpRep = domplate(Firebug.Rep,{
        	inspectable:false,
        	tag:DIV({class:"panel-msg"},
        			P($FL_STR("flashbug.tool.noObjectSelected"))
        		)
        });
        
        //提示用戶升級FlashPlayer
        Firebug.FlashModule.InvalidFpRep = domplate(Firebug.Rep,{
        	inspectable:false,
        	tag:DIV({class:"panel-msg"},
        			DIV({id:"flashplayererror"},
        					$FL_STR("flashbug.tool.invalidPlayer")
	        		)
        		)
        });
        
        //Bitmap element infotip in tree panel(on mouse over...)
        Firebug.FlashModule.BitmapInfoTipRep = domplate(Firebug.Rep,{
        	inspectable:false,
        	tag:DIV(
        			IMG({src:"$src"}),
        			DIV("$width * $height")
        		)
        });

        // Panel
		// ****************************************************************************************************

        Firebug.FlashPanel = function(){};
        Firebug.FlashPanel.prototype = extend(Firebug.ActivablePanel,
        {
            name: panelName,
            title: panelTitle,
            breakable: false,
            editable: true,
            searchable:true,

            trace:function(msg, obj) {
        		if (FBTrace.DBG_FLASH_INSPECTOR) FBTrace.sysout('InspectorPanel - ' + msg, obj);
        	},
        	ERROR:function(e) {
       		 if (FBTrace.DBG_FLASH_ERRORS) FBTrace.sysout('InspectorPanel ERROR ' + e);
        	},
            search:function(text, reverse){
                if (!text) {
                    delete this.currentSearch;
                    return false;
                }

                Firebug.FlashModule.send({
                    command:"findDisplayObject",
                    pattern:text,
                    isCaseSensitive:Firebug.Search.isCaseSensitive(text),
                    reverse:reverse
                });

                var _this = this.getTool(panel.currTool);
                return _this.isFound;
            },
        	initialize: function(context,doc, node){
        		this.trace("initialize");
                if (!context.browser)
                {
                    if (FBTrace.DBG_ERRORS)
                        FBTrace.sysout("attempt to create panel with dud context!");
                    return false;
                }

                this.context = context;
                this.document = doc;
                this.panelNode = node;

                // Load persistent content if any.
                var persistedState = Firebug.getPanelState(this);
                if (persistedState)
                {
                    this.persistContent = persistedState.persistContent;
                    if (this.persistContent && persistedState.panelNode)
                        this.loadPersistedContent(persistedState);
                }

                
                this.initializeNode(this.panelNode);     
            },
            show:function(state){
        		this.trace("show");
        		
        		this.showToolbarButtons("fbFlashbugInspectButtons", true);
//		        collapse(Firebug.chrome.$("fbFlashbugVersion"), false);
//        		Firebug.chrome.clearPanels();
//        		Flashbug.getPanel("flashDecompilerTree").visible = false;

        		//显示右侧子面板
        		collapse(Firebug.chrome.$("fbSidePanelDeck"), false);
        		collapse(Firebug.chrome.$("fbPanelSplitter"), false);
        		
                // initialize UI
                Firebug.FlashModule.addStyleSheet(this);
                
                if (Firebug.FlashModule.isValidFlashPlayer()){
                    if($FQuery("ul",this.panelNode).length == 0){
                        Firebug.FlashModule.inspectButtonDisabled({
                            disabled:"true"
                        });
                        Firebug.FlashModule.profilerButtonDisabled({
                            disabled:"true"
                        });
                        Firebug.FlashModule.transformButtonDisabled({
                            disabled:"true"
                        });                        
                        Firebug.FlashModule.watchButtonDisabled({
                            disabled:"true"
                        });
                       
                        Firebug.FlashModule.connectButtonDisabled({
                        	disabled:flashfirebugPrepare.profilerMode
                        });
                        Firebug.FlashModule.setMessage(panelName, Firebug.FlashModule.getConnectMessage());
                        Firebug.FlashModule.getPanel(consolePanel).initializeUI(null);
                        Firebug.FlashModule.getPanel(infoPanel).initializeUI(null);
                        Firebug.FlashModule.getPanel(propPanel).initializeUI(null);
                        
                        if (flashfirebugPrepare.isPro){
                          Firebug.FlashModule.setMessage(consolePanel, Firebug.FlashModule.SelectDpRep);
                          Firebug.FlashModule.setMessage(infoPanel, Firebug.FlashModule.SelectDpRep);
                          Firebug.FlashModule.setMessage(propPanel, Firebug.FlashModule.SelectDpRep);
                        }
                        
                        this.trace("show");
                        if(FBL.getTabBrowser().contentDocument['ffbugIsInjected'])
                            Firebug.FlashModule.disableFlashFirebug(FBL.getTabBrowser().contentDocument);
                        Firebug.FlashModule.enableFlashFirebug(FBL.getTabBrowser().contentDocument);                        
                    }else{
                        Firebug.FlashModule.inspectButtonDisabled({
                            disabled:"false"
                        });
                        Firebug.FlashModule.profilerButtonDisabled({
                            disabled:"false"
                        });
                        Firebug.FlashModule.watchButtonDisabled({
                            disabled:"false"
                        });                        
                        Firebug.FlashModule.transformButtonDisabled({
                            disabled:"false"
                        }); 
                        Firebug.FlashModule.connectButtonDisabled({
                        	disabled:flashfirebugPrepare.profilerMode
                        });
                       
                    }
                }else{
                    Firebug.FlashModule.setMessage(panelName, Firebug.FlashModule.InvalidFpRep, {fpVersion:Firebug.FlashModule.getFlashPlayerVersion()});
                }
                this.trace("show:success!");
            },
            hide:function(state){
            	this.trace("hide");

        		this.showToolbarButtons("fbFlashbugInspectButtons", false);
		        
        		//隱藏版本
        		//collapse(Firebug.chrome.$("fbFlashbugVersion"), true);
        		//隐藏右侧子面板
        		collapse(Firebug.chrome.$("fbSidePanelDeck"), true);
        		collapse(Firebug.chrome.$("fbPanelSplitter"), true);	            	
            },
            showInfoTip:function(infoTip, target, x, y){
            	if(hasClass(target, "obj-name")){
        			var dp = $FQuery(target).parents("li").get(0);
        			if(dp){
        				if(hasClass(dp, "Bitmap")){
	                        var id = Firebug.FlashModule.targetSWFId(dp);
	                        var displayId = $FQuery(dp).attr("id");
	                        
	                        if(this.infoTipClass == (id+"."+displayId))
	                        	return true;
	                        
	                        Firebug.FlashModule.infoTipContent = infoTip;
	                        this.infoTipClass = (id+"."+displayId);
	                        
	                        Firebug.FlashModule.send({
	                            command:"retrieveDisplayObjectProperties",
	                            displayId:displayId,
	                            id:id,
	                            properties:"width,height,___ffb_snapshot_200_200",
	                            caller:"showInfoTip",
	                            todo:"displayBitmapInfoTip"
	                        });
	            			return true;
	        			}	
    				}
            	}
            	
            	delete this.infoTipClass;
            	Firebug.FlashModule.infoTipContent = null;
            	return false;
            },
            //called by AS, when has retrieved DisplayObject info from swf. 
            onRetrieveDisplayObjectProperties:function(data){
            	//data: {info:Object, id:String}
            	if(data.todo){
            		this[data.todo](data);
            	}
            },
            displayBitmapInfoTip:function(data){
            	if(Firebug.FlashModule.infoTipContent)
            	{
            		var infoStr = '';
            		var imgSrc = '';
            		for(var prop in data.info){
            			if(prop.indexOf("___ffb_snapshot") == 0){
            				imgSrc = 'data:image/png;base64,' + data.info[prop];
            				break;
            			}
            		}
            		
            		Firebug.FlashModule.BitmapInfoTipRep.tag.replace(
            				{
            					src:imgSrc, 
            					width:data.info.width, 
            					height:data.info.height
            				}, 
            			Firebug.FlashModule.infoTipContent);
            	}
            },
            //called by AS, when retrieved DisplayObject info from swf failed.
            onGetInfoTipError:function(data){
            	//data: {error:String}
                        flashfirebugPrepare.replaceHTML(Firebug.FlashModule.infoTipContent, data.error);
            },
            destroy: function(state){
        		this.trace("destroy");
                Firebug.ActivablePanel.destroy.apply(this, arguments);
            },
            ready: function(data){
            	this.trace("ready");
                // if tree is already found skip
                if($FQuery("#base li#"+(data.id),this.panelNode).length != 0){
                	if($FQuery("#base li#"+(data.id),this.panelNode).hasClass("swfdis")){
                		$FQuery("#base li#"+(data.id),this.panelNode).remove();
                	}else{
                		return;
                	}
                }

                // add the base ul tree if not found
                if($FQuery("ul",this.panelNode).length == 0){
                    var base = this.document.createElement("ul");
                    $FQuery(base).attr("id","base");
                    $FQuery(this.panelNode,this.panelNode).html(base);
                    Firebug.FlashModule.inspectButtonDisabled({
                        disabled:"false"
                    });
                    Firebug.FlashModule.profilerButtonDisabled({
                        disabled:"false"
                    });
                    Firebug.FlashModule.watchButtonDisabled({
                        disabled:"false"
                    });                    
                    Firebug.FlashModule.transformButtonDisabled({
                        disabled:"false"
                    });
                }
		
                // add the swf li to the base ul
                var swf = this.document.createElement("li");
                var swfIcon = this.document.createElement("ins");
                var swfName = this.document.createElement("a");
		
                $FQuery(swf).attr("id",data.id);
                $FQuery(swfIcon).html("&nbsp;");
                $FQuery(swfName).attr("title",data.url);
                $FQuery(swfName).text((data.name.split(".swf")[0])+".swf");
                $FQuery(swfName).prepend(swfIcon);
                $FQuery(swf).append(swfName);
                $FQuery(swf).addClass("swf");
                $FQuery("#base",this.panelNode).append(swf);

                /**
                //创建所有显示对象的容器
                var rootul = this.document.createElement("ul");
                $FQuery(swf).append(rootul);

                //创建Stage
                var stage = this.createNode({
                    name:"stage",
                    displayId:0,
                    className:"Stage",
                    hasChildren:true
                });
                $FQuery(rootul).append(stage);
                 */
            },
            removeNode: function(data){
                var targetSelector = Firebug.FlashModule.targetSelector(data.id,data.displayId);
                var target = $FQuery(targetSelector,this.panelNode);
                if (!data.isSimpleButtonState && $FQuery(target).parent("ul:first").children("li").length == 1){
                    $FQuery(target).children("ul").remove();
                    $FQuery(target).removeClass("hasChildren isOpened");                    
                }else{
                    $FQuery(target).remove();
                }                
            },         
            addNode: function(data){
                var targetSelector = Firebug.FlashModule.targetSelector(data.id,data.fatherId);
                var target = $FQuery(targetSelector,this.panelNode);
                if (target){
                    var li = this.createNode(data);
                    if ($FQuery(target).children("ul").length == 0){
                        $FQuery(target).append("<ul></ul>");
                    }
                    if (Number(data.index) >= $FQuery(target).children("ul:first").children("li").length)
                        $FQuery(target).children("ul").append(li);
                    else
                        $FQuery(target).children("ul:first").children("li:nth-child("+(Number(data.index)+1)+")").before(li);
                    
                    $FQuery(target).addClass("hasChildren");
                }
            },
            openNode: function(data){
                var targetSelector = Firebug.FlashModule.targetSelector(data.id,data.displayId);
                var target = $FQuery(targetSelector,this.panelNode);
                if (target){
                    if (data.childs.length > 0){
                        $FQuery(target).children("ul").remove();
                        var ul = this.document.createElement("ul");
                        for(var i=0;i<data.childs.length;i++){
                            var obj = data.childs[i];
                            var li = this.createNode(obj);
                            $FQuery(ul).append(li);                        
                        }
                        $FQuery(target).append(ul);
                        $FQuery(target).children("ul").slideDown("fast");
                        $FQuery(target).addClass("isOpened hasChildren");
                    }else{
                        $FQuery(target).removeClass("isOpened hasChildren");
                    }
                    $FQuery(target).removeClass("wait");
                }
            },
            updateNode:function(data){
                var targetSelector = Firebug.FlashModule.targetSelector(data.id,data.displayId);
                var target = $FQuery(targetSelector,this.panelNode);
                if ($FQuery(target).index() != Number(data.index)){
                    var targetObject = $FQuery(target).parent().children("li:nth-child("+(Number(data.index)+1)+")");
                    if ($FQuery(targetObject).length) $FQuery(targetObject).before(target);
                }
                $FQuery(target).children("a:first").children("span.obj-name").text(data.name);
            },
            createNode:function(obj){
                var li = this.document.createElement("li");
                var liIcon = this.document.createElement("ins");
                var liName = this.document.createElement("a");
                
                var span1 = this.document.createElement("span");
                $FQuery(span1).attr('class', 'obj-name');
                $FQuery(span1).text(obj.name);
                
                var span2 = this.document.createElement("span");
                $FQuery(span2).attr('class', 'obj-class');
                $FQuery(span2).text(' [' + obj.className + ']');
			                
                $FQuery(liIcon).html("&nbsp;");
                $FQuery(liName).append(liIcon);
                $FQuery(liName).append(span1).
                  append(span2);
                if (obj.byffbug) {
                    $FQuery(liName).children("span.obj-class").append(' * Added by Flashfirebug');
                    $FQuery(li).addClass('byffbug');                    
                }

                var styledCustomClasses = ["Button", "CheckBox", "Label", "ColorPicker", "ComboBox", "DataGrid",
                    "NumericStepper","ProgressBar", "VolumeBar", "RadioButton", "ScrollPane", "Slider", "TextArea",
                    "TextInput", "TileList", "List",
                    "UILoader", "UIScrollBar", "PauseButton", "PlayButton", "PlayPauseButton", "StopButton",
                    "BackButton", "ForwardButton", "MuteButton", "CaptionButton", "FullScreenButton", "BufferingBar",
                    "SeekBar", "FLVPlayback", "FLVPlaybackCaptioning"];
                if(styledCustomClasses.indexOf(obj.className)>=0){
                    $FQuery(li).addClass(obj.className);
                }else{
                    $FQuery(li).addClass(obj.nativeClassName);
                }
                if (obj.selected) $FQuery(liName).addClass("selected");
                if (obj.hasChildren) $FQuery(li).addClass("hasChildren");
                $FQuery(li).append(liName);
                
                $FQuery(li).attr("id",obj.displayId);
                return li;
            },
            addPlus: function(data){
                var targetSelector = Firebug.FlashModule.targetSelector(data.id,data.displayId);
                var target = $FQuery(targetSelector,this.panelNode);
                $FQuery(target).addClass("hasChildren");
            },
            removePlus: function(data){
                var targetSelector = Firebug.FlashModule.targetSelector(data.id,data.displayId);
                var target = $FQuery(targetSelector,this.panelNode);
                $FQuery(target).removeClass("hasChildren isOpened");
            },            
            inspectOver: function(data){
                for (var i=0;i<data.tree.length;i++){
                    data.tree[i].id = data.id;
                    this.openNode(data.tree[i]);
                }
                var targetSelector = Firebug.FlashModule.targetSelector(data.id,data.displayId);
                
                $FQuery("#base a.hover",this.panelNode).removeClass("hover");
                if ($FQuery(targetSelector,this.panelNode).length){
                    var selected = $FQuery(targetSelector,this.panelNode);
                    $FQuery(selected,this.panelNode).children("a").addClass("hover");
                }
            },
            inspectSelect: function(data){
                $FQuery("#base a.hover",this.panelNode).removeClass("hover");
                $FQuery("#base a.selected",this.panelNode).removeClass("selected");
                
                var targetSelector = Firebug.FlashModule.targetSelector(data.id,data.displayId);
                var selected = $FQuery(targetSelector,this.panelNode);
                $FQuery(selected,this.panelNode).children("a").focus();
                $FQuery(selected,this.panelNode).children("a").addClass("selected");
                
                var selectedOffset = $FQuery(selected).offset().top;
                // only animate scroll to the node if it's not in current display area.
                var rootTop = $FQuery(this.panelNode).offset().top;
                if((selectedOffset < 0) || (selectedOffset > this.panelNode.parentNode.clientHeight)){
                    $FQuery(this.panelNode.parentNode).stop().animate({
                        scrollTop:(selectedOffset - rootTop)
                    },500);
                }
            },
            inspectStop: function(data){
                $FQuery("#base a.hover",this.panelNode).removeClass("hover");
            },
            displayGeneralInfo:function(data){
                if(flashfirebugPrepare.isPro) {
                  var panel = Firebug.FlashModule.getPanel(infoPanel);
                  panel.printInfo(data);
                }
            },
            displaySwfGeneralInfo:function(data){
                if(flashfirebugPrepare.isPro) {
                  var panel = Firebug.FlashModule.getPanel(infoPanel);
                  panel.printSwfInfo(data);
                }
            },
            setObjectMembers:function(data){
                if(flashfirebugPrepare.isPro) {
                  Firebug.FlashModule.getPanel(propPanel).printProperties(data);
                  Firebug.FlashModule.getPanel(consolePanel).initializeUI(data);
                }
            },
            onInspectProperty:function(data){
                if(flashfirebugPrepare.isPro) {
                  Firebug.FlashModule.getPanel(propPanel).onInspectProperty(data);
                }
            },
            updateProperties:function(data){
                if(flashfirebugPrepare.isPro) {
                  var panel = Firebug.FlashModule.getPanel(propPanel);
                  panel.updateProperties(data);
                }
            },        
            onEvalOutput:function(data){
                Firebug.FlashModuleConsole.onEvalOutput(data);
            },
            traceOut:function(data){
                var panel = Firebug.FlashModule.getPanel(outputPanel);
                panel.traceOut(data);
            },
            clearOut:function(data){
                var panel = Firebug.FlashModule.getPanel(outputPanel);
                panel.clearOut();
            },
            inspectButtonChecked:function(data){
                Firebug.FlashModule.inspectButtonChecked(data);
            },
            inspectButtonDisabled:function(data){
                Firebug.FlashModule.inspectButtonDisabled(data);
            },
            transformButtonChecked:function(data){
                Firebug.FlashModule.transformButtonChecked(data);
            },
            transformButtonDisabled:function(data){
                Firebug.FlashModule.transformButtonDisabled(data);
            },
            watchButtonChecked:function(data){
                Firebug.FlashModule.watchButtonChecked(data);
            },
            watchButtonDisabled:function(data){
                Firebug.FlashModule.watchButtonDisabled(data);
            },
            connectButtonDisabled:function(data){
            	Firebug.FlashModule.connectButtonDisabled(data);
            },
            onDetectFail:function(data, doc){
            	//TODO:show message tell user detect fail
            },
            onDisplayObjectFound:function (data) {
                this.isFound = data.success;
                this.trace("onDisplayObjectFound result: " + data.success + ", this.isFound: " + this.isFound)
            },

            /**
             * retrieve raw bytes(encoded as Base 64 string) of an Url file.
             * @param data  {url:String, id:String}
             */
            getBase64FromURL:function(data){
                data.onResponse = this.onGetBaseBase64FromURL;
                flashfirebugPrepare.getBase64FromURL(data);
            },

            /**
             * retrieve the raw bytes successfully!
             * @param data {url:String, base64:String, id:String}
             */
            onGetBaseBase64FromURL:function(data){
                  Firebug.FlashModule.send({
                      command:"onGetBaseBase64FromURL",
                      id:data.id,
                      base64:data.base64,
                      url:data.url
                  });

            }
        });

        // Registration
		// ***********************************************************************************************
        Flashbug.registerToolType(Firebug.FlashPanel);
        Firebug.registerActivableModule(Firebug.FlashModule);
        // ************************************************************************************************
        }
});
