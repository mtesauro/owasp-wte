FBL.ns(function() {
    with (FBL) {
      
        Components.utils.import("resource://flashfirebuglibs/prepare.js");


        // Constants ************************************************************************************************

        const panelName         = "ffbugconsole";
        const panelTitle        = "Console";
        const parentPanelName   = "flashfirebug";
        
        var $FL_STR = Flashbug.$FL_STR,
    	$FL_STRF = Flashbug.$FL_STRF;
        
        var anyTimestamp = Math.round(new Date().getTime() / 1000);

        // Module ***************************************************************************************************

        Firebug.FlashModuleConsole = extend(Firebug.Module,
        {
            data:null,
        	panelBar2:{},
        	initializeUI:function(){
        		this.panelBar2 = $("fbPanelBar2");
        	},
            initialize: function() {
                this.panelName = panelName;
                Firebug.Module.initialize.apply(this, arguments);
            },
            addStyleSheet: function(panel) {
                var doc = panel.document;
                if ($("flashfirebugStylesConsole", doc)) return;
                var styleSheet = createStyleSheet(doc, "chrome://flashfirebug/content/themes/default/console.css");
                styleSheet.setAttribute("id", "flashfirebugStylesConsole");
                addStyleSheet(doc, styleSheet);
                this.setBehaviors();
            },
            setBehaviors:function(){
                $FQuery("#AS-clear",this.panelNode).live("click",function(){
                    Firebug.FlashModuleConsole.clearInput();
                })

                $FQuery("#AS-copy",this.panelNode).live("click",function(){
                    Firebug.FlashModuleConsole.copyInput();
                })

                $FQuery("#AS-run",this.panelNode).live("click",function(){
                    Firebug.FlashModuleConsole.runEval();
                })

                $FQuery("#console-text",this.panelNode).live("contextmenu",function(event){
                    return;

                    //custom contextmenu
                    var popup = Firebug.chrome.$("ffbConsoleContextMenu");
                    popup.showPopup($FQuery("#console-text",this.panelNode).get(0),
                        event.screenX, event.screenY,
                        "popup", "bottomleft", "topleft");
                })

                $FQuery("#AS-info",this.panelNode).live("mouseenter",function(event){
                    Firebug.FlashModuleConsole.showASTip();
                }).live("mouseleave",function(event){
                    Firebug.FlashModuleConsole.hideASTip();
                })
            },
            showASTip:function(){
                var panel = Firebug.FlashModule.getPanel(panelName);
                $FQuery("#AS-tip",panel.panelNode).css("display","block");
            },
            hideASTip:function(){
                var panel = Firebug.FlashModule.getPanel(panelName);
                $FQuery("#AS-tip",panel.panelNode).css("display","none");
            },
            shutdown: function()
            {
                Firebug.Module.shutdown.apply(this, arguments);
            },
            clearInput:function(){
                var panel = Firebug.FlashModule.getPanel(panelName);
                $FQuery("#console-text",panel.panelNode).val("");
            },
            copyInput:function(){
                var panel = Firebug.FlashModule.getPanel(panelName);
                copyToClipboard($FQuery("#console-text",panel.panelNode).val());
            },
            onConsoleContextMenu:function(){
                //TODO: on console contextmenu popup
            },
            onSelectConsoleContextMenuItem:function(menuItemLabel){
                switch(menuItemLabel){
                    case "copy":
                        var panel = Firebug.FlashModule.getPanel(panelName);
                        copyToClipboard($FQuery("#console-text",panel.panelNode).val());
                        break;
                }
            },
            runEval:function(){
                var panel = Firebug.FlashModule.getPanel(panelName);
                var code  = $FQuery("#console-text",panel.panelNode).val();
                var email = flashfirebugPrepare.getPrefValue("ffbug.email");
                var key   = flashfirebugPrepare.getPrefValue("ffbug.key");
                
                $FQuery("#console-text-encoder",panel.panelNode).html(code);
                
                code = Firebug.FlashModule.encodeHTML(code,$FQuery("#console-text-encoder",panel.panelNode).get(0));
                Firebug.FlashModule.send({
                    command:"runEval",
                    code:code,
                    email:email,
                    key:key,
                    id:Firebug.FlashModuleConsole.data.id
                });
            },
            activatePro:function(){
              var panel = Firebug.FlashModule.getPanel(panelName);
              if (flashfirebugPrepare.isPro){
                  var infoPanel = Firebug.FlashModule.getPanel("ffbuginfo");

                  if($FQuery(".info",infoPanel.panelNode).length == 0){ // no selected object
                      Firebug.FlashModule.setMessage(panelName, Firebug.FlashModule.SelectDpRep);
                  }else{                    
                      $FQuery("#pro-main",panel.panelNode).remove();
                  }
                  Firebug.FlashModule.setMessage(panelName, Firebug.FlashModule.SelectDpRep);
              } else {
                Firebug.FlashModuleConsole.NeedProRep.tag.append({}, panel.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
              }
            },
            onEvalOutput:function(data){
                var panel = Firebug.FlashModule.getPanel(panelName);
                var text = data.params;
                if(text){
                    var line = document.createElement("div");
                    $FQuery(line).text(text);
                    $FQuery(line).addClass("out");
                    var textLower = text.toLowerCase();
                    if(textLower.indexOf("warning:") >= 0){
                        $FQuery(line).addClass("warning");
                    } else if(textLower.indexOf("error") >= 0 ){
                        $FQuery(line).addClass("error");
                    }
                    $FQuery("#console-output",panel.panelNode).append(line);

                    $FQuery("#console-output",panel.panelNode).attr("scrollTop",
                        $FQuery("#console-output",panel.panelNode).attr("scrollHeight"));
                }
            },
            clearOutput:function(){
                var panel = Firebug.FlashModule.getPanel(panelName);
                $FQuery("#console-output",panel.panelNode).text("");
            }
        });
        
        Firebug.FlashModuleConsole.NeedProRep = domplate(Firebug.Rep,{
        	inspectable:false,
        	tag:DIV({id:"pro-main"},
        			DIV({id:"pro-overlay"}),
        			DIV({id:"pro-msg"},
        				DIV({id:"pro-text"},$FL_STR("flashbug.tool.needPro2")),
        				DIV({id:"pro-link", class:"text-link"},
        					IMG({src:$FL_STR("flashbug.tool.buyProImg") + "?r=" + anyTimestamp}))
        				)
        			)
        });

        // Panel ****************************************************************************************************

        Firebug.FlashPanelConsole = function() {};

        Firebug.FlashPanelConsole.prototype = extend(Firebug.Panel,
        {
            name: panelName,
            title: panelTitle,
            parentPanel:parentPanelName,
            order:21,
            swf:"",//target swf id
            coreTags:new Array(),
            initialize: function(context,doc)
            {
                this.panelName = panelName;
                Firebug.Panel.initialize.apply(this, arguments);
                
                this.coreTags = [
                /*Global Functions*/
                "Array()","Boolean()","decodeURI()","decodeURIComponent()","encodeURI()","encodeURIComponent()","escape()","int()","isFinite()","isNaN()","isXMLName()","Number()","Object()","parseFloat()","parseInt()","String()","trace()","uint()","unescape()","Vector()","XML()","XMLList()",
                
                /*Global Constants*/
                "Infinity","-Infinity","NaN","undefined",
                
                /*Classes*/
                "ArgumentError","arguments","Array","Boolean","Class","Date","DefinitionError","Error","EvalError","Function","int","Math","Namespace","Number","Object","QName","RangeError","ReferenceError","RegExp","SecurityError","String","SyntaxError","TypeError","uint","URIError","Vector","VerifyError","XML","XMLList",
  
                /*Statements, Keywords & Directives */
                "break;","case","continue;","default","do","while","else","for","for each","if","label","return","super","switch","throw","try","catch","finally","with","dynamic","final","internal","native","override","private","protected","public","static","class","const","extends","function","get","implements","interface","namespace","package","set","var","import","include","use","AS3","flash_proxy","object_proxy","false","null","this","true",
                
                /*Extra*/
                '#include'
                ];
                
                //UI initialize
                Firebug.FlashModuleConsole.addStyleSheet(this);                
            },
            initializeUI:function(data)
            {
                Firebug.FlashModuleConsole.data = data;
                if($FQuery("#console-layout",this.panelNode).length <= 0){
                
                    // clear UI
                    $FQuery(this.panelNode,this.panelNode).html("");
                
                    //Create components
                    var consoleLayout       = document.createElement('vbox');
                    var consoleOutput       = document.createElement('html:div');
                    var consoleText         = document.createElement("textbox");
                    var consoleTextEncode   = document.createElement("html:div");
                    var consoleToolbar      = document.createElement('hbox');
                    var consoleTip          = document.createElement('html:div');

                    var consoleRun          = document.createElement('toolbarbutton');
                    var consoleClear        = document.createElement('toolbarbutton');
                    var consoleCopy         = document.createElement('toolbarbutton');
                    var consoleInfo         = document.createElement('image');
                    var consoleSpacer       = document.createElement('toolbarspacer');
                
                    //Set default attributes
                    $FQuery(consoleLayout).attr('id','console-layout');
                
                    $FQuery(consoleOutput).attr({
                        id:'console-output',
                        flex:'1'
                    });
                
                    $FQuery(consoleText).attr({
                        id:'console-text',
                        multiline:'true',
//                        context:"ffbConsoleContextMenu",
//                        value:'trace("hello world" + getTimer());',
                        emptytext:'Write your AS3 code here'
                    });

                    $FQuery(consoleToolbar).attr('id','console-toolbar');
                
                    $FQuery(consoleRun).attr({
                        id:'AS-run',
                        tooltiptext:"flashbug.tool.inspector.console.run",
                        label:$FL_STR("flashbug.tool.inspector.console.runLabel")
                    });
                
                    $FQuery(consoleClear).attr({
                        id:'AS-clear',
                        class:"toolbar-text-button",
                        tooltiptext:$FL_STR("flashbug.tool.inspector.console.clear"),
                        label:$FL_STR("flashbug.tool.inspector.console.clearLabel")
                    });
                
                    $FQuery(consoleCopy).attr({
                        id:'AS-copy',
                        class:"toolbar-text-button",
                        tooltiptext:$FL_STR("flashbug.tool.inspector.console.copy"),
                        label:$FL_STR("flashbug.tool.inspector.console.copyLabel")
                    });
                
                    $FQuery(consoleTip).attr({
                        id:'AS-tip',
                        class:"toolbar-text-button",
                        style:'font-size:12px;background-color:yellow;position: absolute; bottom: 30px; left: 150px; padding: 2px 3px; max-width: 40em; border: 1px solid; display:none; color: black;'
                    });

                    //info icon button
                    $FQuery(consoleInfo).attr({
                        id:'AS-info',
                        src:'chrome://flashfirebug/content/themes/default/images/Icons/info.png',
                        style:'margin-left: 12px;cursor: pointer; color: black;'
                    });

                    $FQuery(consoleSpacer).attr('flex','1');
                
                    $FQuery(consoleTextEncode).attr('id','console-text-encoder');

                    // Append to UI
                    $FQuery(consoleToolbar).append(consoleRun);
                    $FQuery(consoleToolbar).append(consoleClear);
                    $FQuery(consoleToolbar).append(consoleCopy);
                    $FQuery(consoleToolbar).append(consoleInfo);
                    $FQuery(consoleToolbar).append(consoleSpacer);       
                
                    $FQuery(consoleLayout).append(consoleOutput);
                    $FQuery(consoleLayout).append(consoleText);
                    $FQuery(consoleLayout).append(consoleToolbar);
                    $FQuery(consoleLayout).append(consoleTextEncode);
                
                    $FQuery(this.panelNode,this.panelNode).append(consoleTip);                
                    $FQuery(this.panelNode,this.panelNode).append(consoleLayout);             

                    var pfs = Components.classes["@mozilla.org/feed-unescapehtml;1"].getService(Components.interfaces.nsIScriptableUnescapeHTML);
                    var str = $FL_STR("flashbug.tool.inspector.console.tooltip");
                    var ele = pfs.parseFragment(str, false, null, this.panelNode);
                    consoleTip.appendChild(ele);
                    
                    // didn't use direct access ex:$FQuery(consoleTip).html() , due to bug in xul/html
                    $FQuery("#AS-tip",this.panelNode).append(ele);                    
                }
                
                /* autocomplete*/
                $FQuery("#console-text",this.panelNode).unautocomplete();                
                
                if(data){
	                var availableTags = new Array();//this.coreTags.sort();
	                var props   = data.targetProperties;
	                var methods = data.targetMethods;
	                for (var prop in props){
	                    var _prop = $FQuery.trim(props[prop].name);
	                    if (_prop && availableTags.indexOf(_prop) < 0) availableTags.push(_prop);
	                }
	                for (var method in methods){
	                    var _method = $FQuery.trim(methods[method].name+"("+methods[method].params.join(",")+")");
	                    if (_method && availableTags.indexOf(_method) < 0) availableTags.push(_method);
	                }
	                availableTags = availableTags.sort(function(x,y){  // Case-insensitive sort
	                    var a = String(x).toUpperCase(); 
	                    var b = String(y).toUpperCase(); 
	                    if (a > b) 
	                        return 1 
	                    if (a < b) 
	                        return -1 
	                    return 0; 
	                });
                }
                //$FQuery("#console-text",this.panelNode).autocomplete(availableTags);

            },
            disable:function(){
            	
            },
            destroy: function(state)
            {
                Firebug.Panel.destroy.apply(this, arguments);
            },

            /*
             * Called by chrome.onContextMenu to build the context menu when this panel has focus.
             * See also FirebugRep for a similar function also called by onContextMenu
             * Extensions may monkey patch and chain off this call
             * @param object: the 'realObject', a model value, eg a DOM property
             * @param target: the HTML element clicked on.
             * @return an array of menu items.
             */
            getContextMenuItems: function(object, target, context) {
                var items = [];
                items.push({
                    label:$FL_STR("flashbug.tool.inspector.console.copyItem"),
                    nol10n:true,
                    command:bindFixed(copyToClipboard, FBL, target.textContent)
                });
                items.push({
                    label:$FL_STR("flashbug.tool.inspector.console.clearOutput"),
                    nol10n:false,
                    command:bindFixed(Firebug.FlashModuleConsole.clearOutput, FBL, target.textContent)
                });
                return items;
            }
        });

        // Registration ***********************************************************************************************

        Firebug.registerModule(Firebug.FlashModuleConsole);
        Firebug.registerPanel(Firebug.FlashPanelConsole);

        // ************************************************************************************************
        }
});
