FBL.ns(function() {
    with (FBL) {

        // Constants ************************************************************************************************

        const panelName         = "ffbugoutput";
        const panelTitle        = "Output";
        const parentPanelName   = "flashfirebug";

        // Module ***************************************************************************************************

        Firebug.FlashModuleOutput = extend(Firebug.Module,
        {
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
                if ($("flashfirebugStylesOutput", doc)) return;
                var styleSheet = createStyleSheet(doc, "chrome://flashfirebug/content/themes/default/output.css");
                styleSheet.setAttribute("id", "flashfirebugStylesOutput");
                addStyleSheet(doc, styleSheet);
            },
            shutdown: function()
            {
                Firebug.Module.shutdown.apply(this, arguments);
            },

        	showSidePanel:function(){
                  return;
        		if(panelName == this.panelBar2.selectedPanel.name){
        			//如果当前不是decompile tool,则切换到decompile tool
        			var ffbPanel = Flashbug.getContext().getPanel("flashfirebug");
        			if(ffbPanel){
        				if(ffbPanel.currTool != "ffbug"){
        					ffbPanel.switchToTool("ffbug");
        				}
        			}
        		}
        	}
        });

        // Panel ****************************************************************************************************

        Firebug.FlashPanelOutput = function() {};

        Firebug.FlashPanelOutput.prototype = extend(Firebug.Panel,
        {
            name: panelName,
            title: panelTitle,
            parentPanel:parentPanelName,
            order:22,
            delay:300,
            logFile:null, // flashlog.txt file
            lastModified:null,
            timer: null, // timer for reading log file
            initialize: function(context,doc)
            {
                Firebug.Panel.initialize.apply(this, arguments);
                this.panelName = panelName;
                
                // file reader
                this.logFile = FlashFirebugFileIO.open(Firebug.FlashModule.getFlashLogPath());
                this.timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
                Firebug.FlashModuleOutput.addStyleSheet(this);
            },
            initializeUI:function(){
                Firebug.FlashModuleOutput.setBehaviors();
            },            
            show: function(){                
                //output interval
                this.delay = Number(Firebug.FlashModule.getPrefValue("ffbug.outputInterval"))*1000;
                
                this.timer.init(this, this.delay, Components.interfaces.nsITimer.TYPE_REPEATING_PRECISE);
            },
            hide:function(){
                this.timer.cancel();
            },
            observe:function(){
                if (this.logFile.exists() && this.logFile.lastModifiedTime != this.lastModified){
                    $FQuery(this.panelNode,this.panelNode).html("");
                    var flashlog = FlashFirebugFileIO.read(this.logFile, "UTF-8");
                    var lines = flashlog.split("\n");
                    for (var i=0 ;i<lines.length;i++){
                        var text = lines[i].trim();
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
                            $FQuery(this.panelNode,this.panelNode).prepend(line);
                        }
                    }
                    this.lastModified = this.logFile.lastModifiedTime;
                }
            },
            clear: function(){
                FlashFirebugFileIO.write(this.logFile,"");
                $FQuery(this.panelNode,this.panelNode).html("");
            },
            destroy: function(state)
            {
                Firebug.Panel.destroy.apply(this, arguments);
            },
            getOptionsMenuItems: function()
            {
                return [{
                    label: "Clear",
                    nol10n: true,
                    command: function() {
                        var panel = Firebug.FlashModule.getPanel(panelName);
                        panel.clear();
                    }
                }];
            }
        });

        // Registration ***********************************************************************************************

        Firebug.registerModule(Firebug.FlashModuleOutput);
        Firebug.registerPanel(Firebug.FlashPanelOutput);

        // ************************************************************************************************
        }
    });
