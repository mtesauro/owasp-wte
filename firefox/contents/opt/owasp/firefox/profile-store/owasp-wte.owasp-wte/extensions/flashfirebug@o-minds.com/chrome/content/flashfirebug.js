FBL.ns(function() {
	with (FBL) {

                Components.utils.import("resource://flashfirebuglibs/prepare.js");


		// Localization
		//-----------------------------------------------------------------------------

		// Extend string bundle with new strings for this extension.
		// This must be done yet before domplate definitions.
		Firebug.registerStringBundle("chrome://flashbug/locale/flashbug.properties");

		var $FL_STR = Flashbug.$FL_STR,
			$FL_STRF = Flashbug.$FL_STRF;
		
		
		const panelName = "flashfirebug";
		
		//工具名称常量
		const TOOL_DECOMPILE 	= "flashDecompiler";
		const TOOL_SOL 			= "flashSharedObjects";
		const TOOL_INSPECT 		= "ffbug";
		const TOOL_OUTPUT		= "flashConsole";
		
		//网站相关常量
        const panelHomePage		= "http://www.o-minds.com/products/flashfirebug";
        const uninstallFlashbugPage = "http://www.o-minds.com/products/flashfirebug";
        const ffbugPayment		= "http://www.o-minds.com/payment/flashfirebug?m=1";
		
		/////////////////////////
		////////Model的实现//////
		/////////////////////////
		Firebug.FlashfirebugModel = extend(Firebug.ActivableModule, {
			trace:function(msg, obj) {
				if (FBTrace.DBG_FLASH_FFB) FBTrace.sysout('FlashfirebugModel: - ' + msg, obj);
			},
			ERROR:function(e) {
				 if (FBTrace.DBG_FLASH_ERRORS) FBTrace.sysout('FlashfirebugModel: ERROR ' + e);
			},
			ffbID:0,

            onResponse: function(context, file) {
                // this.trace("onResponse");
//                alert('onResponse');
            },

            onCachedResponse: function(context, file) {
                // this.trace("onCachedResponse");
//                alert('onCachedResponse');
            },

            onExamineResponse: function(context, request) {
                // this.trace("onExamineResponse");
//                alert('onExamineResponse')
            },

            onExamineCachedResponse: function(context, request) {
                // this.trace("onExamineCachedResponse");
//                alert('onExamineCachedResponse');
            },
			
			/////////////////////////////
			///////Panel的实现///////////
			initialize:function(){
		        Firebug.NetMonitor.addListener(this);
			},
			
			internationalizeUI: function(doc) {
				this.trace("internationalizeUI");
		        var elements = ["flbPlay", "flbPause", "ffbUpgradeButton", "ffbInspectToolButton", "ffbDecompileToolButton", "ffbSOLToolButton", "ffbOutputToolButton"];
		        var attributes = ["label", "tooltiptext", "value"];
				
				Flashbug.internationalizeElements(doc, elements, attributes);
			},
			
			onWindowLoad:function(){

			},
			
			shutdown:function(){
				this.trace("shutdown");
			},
            loadedContext: function(context) {
              var ffbPanel = context.getPanel(panelName);
            },
			initContext:function(context, persistedState){
				this.trace("initContext");
			},
			
			destroyContext:function(context){
				this.trace("destroyContext");
			},
			
			showPanel:function(browser, panel){
				this.trace("showPanel");
				var isFFBPanel = panel && panel.name == panelName;
				var buttons = Firebug.chrome.$("fbFlashfirebugButtons");
				collapse(buttons, !isFFBPanel);
			},
			
			showSidePanel:function(){
				this.trace("showSidePanel: ", this.context);
				
				var ffbPanel = Flashbug.getContext().getPanel(panelName);
				ffbPanel.onShowSidePanel();
			},
			
			onObserverChange: function(observer) {
				if (this.hasObservers()) {
					//There are observers (panels) using this model,
					// let's activate necessary service/server hooks.
				} else {
					// There are no observer using this model, let's clean up
					// registered hooks.
				}
			},
			
			////////////////////////////
			///////一些自定义方法////////
			/**
			 * 切换到一个工具, "inspect", "sol", "decompile"
			 */
			switchToTool:function(toolName) {
				var ffbPanel = Flashbug.getContext().getPanel(panelName);
				ffbPanel.switchToTool(toolName);
			},
			activatePro:function(data){
				var ffbPanel = Flashbug.getContext().getPanel(panelName);
				ffbPanel.onActivatePro(data);
			},
			upgrade: function() {
                                flashfirebugPrepare.openTab(ffbugPayment);
			}
		});

		/////////////////////////
		////////View的实现///////
		/////////////////////////
		Firebug.FlashfirebugPanel = function() {this.ffbID = Firebug.FlashfirebugModel.ffbID++;};
		Firebug.FlashfirebugPanel.prototype = extend(Firebug.ActivablePanel, {
			name:panelName,
			title:"Flash",
			editable:false,
			toolNodeMap:{},
			tools:[],
            persistContent: true,
            panelNode: '',
			currTool:TOOL_INSPECT,
            searchable:true,
			//last selected inspector tool 's child panel.
			lsITChildPanel:"ffbuginfo",
			//记录各个tool的滚动位置(scrolltop)
			toolScrollMap:{},
			//is panel showing?
			_visible:false,

			trace:function(msg, obj) {
				if (FBTrace.DBG_FLASH_FFB) FBTrace.sysout('FlashfirebugPanel('+ this.ffbID +'): ' + msg, obj);
			},
                        
            savePersistedContent: function(state) {
              Firebug.ActivablePanel.savePersistedContent.apply(this, arguments);
              state.currTool = this.currTool;
              state.lsITChildPanel = this.lsITChildPanel;
            },
            loadPersistedContent: function(persistedState) {
                Firebug.ActivablePanel.loadPersistedContent.apply(this, arguments);
                this.currTool = persistedState.currTool;
                this.lsITChildPanel = persistedState.lsITChildPanel;
            },
	
			ERROR:function(e) {
				 if (FBTrace.DBG_FLASH_ERRORS) FBTrace.sysout('FlashfirebugPanel('+this.ffbID +'): ERROR ' + e);
			},
			
			initialize:function(context, doc){
				this.trace("initialize");
				this.tools = [];
				this.registerTool(TOOL_INSPECT);
				this.registerTool(TOOL_SOL);
				this.registerTool(TOOL_DECOMPILE);
				this.registerTool(TOOL_OUTPUT);
                this.getOptionsMenuItemsCopy = this.getOptionsMenuItems;
				this.trace("initialize " + this.tools.length);
				

				Firebug.Panel.initialize.apply(this, arguments);
				
				if(!this.context.toolScrollMap){
					this.context.toolScrollMap = {};
				}
				this.toolScrollMap = this.context.toolScrollMap;

				for(var i=0; i<this.tools.length; i++){
					var tool = this.tools[i];
					var node = this.buildToolPanelNode(tool.name);
					this.tools[i].initialize(context, doc, node);
				}

			},
			
			initializeNode:function(panelNode){
				this.trace("initializeNode");
			},	
			
			reattach:function(doc){
				this.trace("reattach");
				//TODO:测试各个tool的reattach.
				Firebug.Panel.reattach.apply(this, arguments);

				for(var i=0; i<this.tools.length; i++){
					var _tool = this.tools[i];
					_tool.document = doc;
			        if (_tool.panelNode)
			        {
			        	_tool.panelNode = doc.importNode(_tool.panelNode, true);
			            if(this.panelNode && this.currTool == _tool.name)
			            	this.panelNode.appendChild(_tool.panelNode);
			            _tool.panelNode.scrollTop = _tool.lastScrollTop;
			            delete _tool.lastScrollTop;
			            
			            this.toolNodeMap[_tool.name] = _tool.panelNode;
			        }
			        
			        _tool.reattach(doc);
				}

				this.refreshSearch();
			},
			
			show:function(state){
				this._visible = true;
				
				this.trace("show " + this.currTool + ", " + this.context.selectedSidePanel + ", " + this.lsITChildPanel, this.context);
				this.showTool(this.currTool);
				this.syncToolButtons();
				this.syncSidePanel(true);
                                this.setSubProperties(this.currTool);
				this.refreshSearch();
			},
			
			hide:function(state){
				this._visible = false;
				
				this.trace("hide");
				var panel = this.getTool(this.currTool);
				if (panel) {
					if (this.panelNode) this.toolScrollMap[this.currTool] = this.panelNode.scrollTop;
					panel.hide(state);
					if (this.panelNode && panel.panelNode && this.panelNode.contains(panel.panelNode)) this.panelNode.removeChild(panel.panelNode);
				}
			},
			
			refreshSearch:function() {
				this.trace("refreshSearch");
				// Manually refresh searchbox, normally this is only done on selecting a new panel
				Firebug.Search.showPanel(this.context.browser, this);
				Firebug.Search.update(Firebug.currentContext);
			},
			
			refresh:function(){
				this.trace("refresh");
				Firebug.Panel.refresh.apply(this, arguments);
				
				for(var i=0; i<this.tools.length; i++){
					this.tools[i].refresh();
				}
			},

            search:function(text, reverse){
				var panel = this.getTool(this.currTool);
                return panel.search(text, reverse);
            },
			
			onActivationChanged: function(enable)
			{
				this.trace("onActivationChanged");
				if (enable)
					Firebug.FlashfirebugModel.addObserver(this);
				else
					Firebug.FlashfirebugModel.removeObserver(this);
			},
			
			getOptionsMenuItems: function(context){
                return [{
                    label: $FL_STR("flashbug.tool.homePage"),
                    nol10n: true,
                    command: function() {
                        flashfirebugPrepare.openTab(panelHomePage);
                    }
                },"-",{
                    label:Flashbug.$FL_STR("flashbug.options.pref"),
                    nol10n: true,
                    type:"button",
                    command: function() {
						context.chrome.window.openDialog("chrome://flashbug/content/preferences.xul", "flashbugPreferences", "chrome,titlebar,toolbar,centerscreen,modal");
                    }
                },"-",{
                    label: $FL_STR("flashbug.tool.unlockPro"),
                    nol10n: true,
                    command: function() {
                        var args = {
                            FlashModule: Firebug.FlashModule,
                            $FQuery:$FQuery
                        };
                        // Open unlockPro dialog. Pass FlashModule,$FQuery into the XUL window ;)
                        window.openDialog("chrome://flashbug/content/unlockPro.xul", "flashFirebugUnlockPro","chrome,centerscreen,dialog,modal,resizable=no", args);
                    }
                }                    
                ];

            },

			//////////////////////////////
			//////////////////////////////
			buildToolPanelNode:function(toolName){
				this.toolNodeMap[toolName] = this.document.createElement("div");
				this.toolNodeMap[toolName].ownerPanel = this;
				//初始化时不显示出各个tool
				//this.panelNode.appendChild(this.toolNodeMap[toolName]);
				return this.toolNodeMap[toolName];
			},
			
			/**
			 * 注册一个工具
			 */
			registerTool:function(toolName){
				this.trace("registerTool ", toolName);
				var tool = Flashbug.buildToolInstance(toolName);
				this.tools.push(tool);
				
				//初始化工具的滚动位置
				this.toolScrollMap[toolName] = 0;
			},
			
			/**
			 * 隐藏一个工具, "inspect", "sol", "decompile"
			 */
			hideTool:function(toolName) {
				this.trace("hideTool " + toolName);
				var panel = this.getTool(toolName);
				if (panel) {
					if (this.panelNode) this.toolScrollMap[toolName] = this.panelNode.scrollTop;
					panel.hide(Firebug.getPanelState(Flashbug.getContext().getPanel(panelName)));
					if (this.panelNode && panel.panelNode && this.panelNode.contains(panel.panelNode)) this.panelNode.removeChild(panel.panelNode);
				}
			},
			/**
			 * 显示一个工具
			 */
			showTool:function(toolName){
                            try {
                              if (flashfirebugPrepare.getPrefValue("ffbug.analytics." + toolName) == 0) {
                               flashfirebugPrepare.setPrefValue("ffbug.analytics." + toolName, 1);
                               flashfirebugPrepare.track("UA-2368735-5", "extension.o-minds.com", "/tracking/tool/" + toolName, flashfirebugPrepare, $FQuery); 
                              }
                            } catch(e) {
                              this.trace(e.toString() + "\n");
                            }
                            
				this.trace("showTool " + toolName);
				// Sets prop, then deletes
				// name, type
				var arrTemporaryProps = [
					['getContextMenuItems', 'function'],
					['searchable', 'boolean'],
					['search', 'function'],
					['getSearchOptionsMenuItems', 'function']
				];

				// Overwrites default prop
				// name, type, default
				var arrOverwriteProps = [
				//	['getOptionsMenuItems', 'function', 'getOptionsMenuItemsCopy']
				];

				var toolObj = this.getTool(toolName);

				for (var i in arrTemporaryProps) {
					var prop = arrTemporaryProps[i];
					if (typeof toolObj[prop[0]] == prop[1]) {
						this[prop[0]] = toolObj[prop[0]];
					} else {
						delete this[prop[0]];
					}
				}

				for (var i in arrOverwriteProps) {
					var prop = arrOverwriteProps[i];
					if (typeof toolObj[prop[0]] == prop[1]) {
						this[prop[0]] = toolObj[prop[0]];
					} else {
						this[prop[0]] = this[prop[2]];
					}
				}
	
				var panel = this.getTool(toolName);
				if(panel){
	                  panel.show(Firebug.getPanelState(Flashbug.getContext().getPanel(panelName)));
	                  if (this.panelNode && !panel.panelNode.parentNode) {
	                    this.panelNode.appendChild(panel.panelNode);
	                    this.panelNode.scrollTop = this.toolScrollMap[toolName];
	                  }
	
	                  this.refreshSearch();
				}
			},
			
			/**
			 * 提供工具类型的名称, 返回工具实例
			 */
			getTool:function(toolName){
				for(var i=0; i<this.tools.length; i++){
					if(this.tools[i].name == toolName)return this.tools[i];
				}
			},
			
			getToolChromeID:function(toolName){
				switch(toolName){
					case TOOL_SOL:	
						return "ffbSOLToolButton";
						break;
					case TOOL_INSPECT:
						return "ffbInspectToolButton";
						break;
					case TOOL_DECOMPILE:
						return "ffbDecompileToolButton";
						break;
					case TOOL_OUTPUT:
						return "ffbOutputToolButton";
						break;
				}
			},
            setSubProperties: function(toolName) {
				// Sets prop, then deletes
				// name, type
				var arrTemporaryProps = [
					['getContextMenuItems', 'function'],
					['searchable', 'boolean'],
					['getSearchOptionsMenuItems', 'function'],
					['search', 'function'],
					['showInfoTip', 'function']
				];
			
				// Overwrites default prop
				// name, type, default
				var arrOverwriteProps = [
				//	['getOptionsMenuItems', 'function', 'getOptionsMenuItemsCopy']
				];
                    
				var toolObj = this.getTool(toolName);
				
				for (var i in arrTemporaryProps) {
				        var prop = arrTemporaryProps[i];
				        if (typeof toolObj[prop[0]] == prop[1]) {
				                this[prop[0]] = toolObj[prop[0]];
				        } else {
				                delete this[prop[0]];
				        }
				}
				
				for (var i in arrOverwriteProps) {
				        var prop = arrOverwriteProps[i];
				        if (typeof toolObj[prop[0]] == prop[1]) {
				                this[prop[0]] = toolObj[prop[0]];
				        } else {
				                this[prop[0]] = this[prop[2]];
				        }
				}
              
            },

			/**
			 * 切换到一个工具, "inspect", "sol", "decompile"
			 */
			switchToTool:function(toolName){
				this.trace("switchToTool: " + this.currTool + ' =? ' + toolName);

				if (this.currTool != toolName) {
                    this.setSubProperties(toolName);

					this.hideTool(this.currTool);
					this.currTool = toolName;
					this.showTool(this.currTool);
					this.syncToolButtons();
					this.syncSidePanel();
				}
			},
			
			/**
			 * 工具栏按钮同步体现当前状态,比如:当前选择的是decompile工具
			 * 那么decompile按钮应该是按下状态的,其它按钮为释放状态.
			 */
			syncToolButtons:function(){
				this.trace("syncToolButtons");
				for(var i=0; i<this.tools.length; i++){
					if(this.tools[i].name == this.currTool){
						Firebug.chrome.$(this.getToolChromeID(this.tools[i].name)).checked = true;		
					}else{
						Firebug.chrome.$(this.getToolChromeID(this.tools[i].name)).checked = false;		
					}
				}
			},
			
			syncSidePanel:function(fromContext){
				var toolName = this.currTool;
				
				if(fromContext && (toolName == TOOL_DECOMPILE || toolName == TOOL_INSPECT)){
					if(this.context.selectedSidePanel){
						Firebug.chrome.$("fbPanelBar2").selectPanel(this.context.selectedSidePanel);
					}else{
						if(toolName == TOOL_DECOMPILE){
							Firebug.chrome.$("fbPanelBar2").selectPanel("flashDecompilerTree");
						}else{
							Firebug.chrome.$("fbPanelBar2").selectPanel(this.lsITChildPanel);
						}
					}
					return;
				}
				
				var selectedSidePanel = Firebug.chrome.$("fbPanelBar2").selectedPanel;
				if(toolName == TOOL_DECOMPILE){
					//把侧面板切换到DecompileTree面板
					if(selectedSidePanel.name != "flashDecompilerTree"){
						Firebug.chrome.$("fbPanelBar2").selectPanel("flashDecompilerTree");
					}
				}else if(toolName == TOOL_INSPECT){
					//把侧面板切换到general
					if(selectedSidePanel.name == "flashDecompilerTree"){
						Firebug.chrome.$("fbPanelBar2").selectPanel(this.lsITChildPanel);
					}
				}
			},
			
			/**
			 * 当显示侧面板时,记录下
			 */
			onShowSidePanel:function(){
				if(this._visible){
					var selectedSidePanel = Firebug.chrome.$("fbPanelBar2").selectedPanel;
                                        try {
                                          if (flashfirebugPrepare.getPrefValue("ffbug.analytics." + selectedSidePanel.name) == 0) {
                                            flashfirebugPrepare.setPrefValue("ffbug.analytics." + selectedSidePanel.name, 1);
                                            flashfirebugPrepare.track("UA-2368735-5", "extension.o-minds.com", "/tracking/sidepanel/" + selectedSidePanel.name, flashfirebugPrepare, $FQuery);
                                          }
                                        } catch(e) {
                                          this.trace(e.toString() + "\n");
                                        }

					this.trace("onShowSidePanel: " + this.context.selectedSidePanel + ", " + selectedSidePanel.name);
					this.context.selectedSidePanel = selectedSidePanel.name;
					if(selectedSidePanel){
						switch(selectedSidePanel.name){
							case "ffbuginfo":
							case "ffbugconsole":
							case "ffbugoutput":
							case "ffbugprop":
							case "flashDecompilerTree":
								this.syncToolWithSidePanel(selectedSidePanel.name);
								break;
						}
					}
				}
			},
			/**
			 * sync selected tool with selected side panel
			 */
			syncToolWithSidePanel:function(panelName){
				this.trace("syncToolWithSidePanel " + panelName);			
				switch (panelName) {
				case "flashDecompilerTree":
					if(this.currTool != TOOL_DECOMPILE){
						this.switchToTool(TOOL_DECOMPILE);
					}
					break;
				case "ffbuginfo":
				case "ffbugconsole":
				case "ffbugprop":
					if(this.currTool != TOOL_INSPECT){
						this.switchToTool(TOOL_INSPECT);
					}
					break;
				default:
					break;
				}
			},
			
			onActivatePro:function(data){
				var treePanel = Flashbug.getContext().getPanel("flashDecompilerTree");
				treePanel.onActivatePro(data);
			}
		});


		///////////////////////////
		///////注册Firebug插件/////
		///////////////////////////
		Firebug.registerActivableModule(Firebug.FlashfirebugModel);
		Firebug.registerPanel(Firebug.FlashfirebugPanel);
	}
});