FBL.ns(function() {
    with (FBL) {

        // Constants ************************************************************************************************
        const panelName         = "ffbuginfo";
        const panelTitle        = "General";
        const parentPanelName   = "flashfirebug";

        // Module ***************************************************************************************************

        Firebug.FlashModuleInfo = extend(Firebug.Module,
        {
            panelBar2:{},
            activatePro: function() {
              var panel = Firebug.FlashModule.getPanel(panelName);
              
              if (flashfirebugPrepare.isPro) {
                $FQuery("#pro-main", panel.panelNode).remove();
                Firebug.FlashModule.setMessage(panelName, Firebug.FlashModule.SelectDpRep);
              } else {
                Firebug.FlashModuleConsole.NeedProRep.tag.append({}, panel.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
              }
            },
            initializeUI:function(){
                    this.panelBar2 = $("fbPanelBar2");
            },
            initialize: function() {
                this.panelName = panelName;
                Firebug.Module.initialize.apply(this, arguments);
            },
            addStyleSheet: function(panel) {
                var doc = panel.document;
                if ($("flashfirebugStylesInfo", doc)) return;
                var styleSheet = createStyleSheet(doc, "chrome://flashfirebug/content/themes/default/info.css");
                styleSheet.setAttribute("id", "flashfirebugStylesInfo");
                addStyleSheet(doc, styleSheet);
            },
            shutdown: function()
            {
                Firebug.Module.shutdown.apply(this, arguments);
            }
        });

        // Panel ****************************************************************************************************

        Firebug.FlashPanelInfo = function() {};

        Firebug.FlashPanelInfo.prototype = extend(Firebug.Panel,
        {
            name: panelName,
            title: panelTitle,
            parentPanel:parentPanelName,

            order:19,
            initialize: function(context,doc)
            {
                Firebug.Panel.initialize.apply(this, arguments);
            },
            initializeUI:function(data)
            {

            },
            show: function() {
                Firebug.FlashModuleInfo.addStyleSheet(this);
            },
            printInfo: function(data)
            {
                try{
                    var class_title    = "Class Information";
                    var class_name     = (data.classInfo.className)? data.classInfo.className:"" ;
                    var class_package  = data.classInfo.packageName;
                    var class_inherite = data.inheritInfo;
                    var class_type     = (data.classInfo.isDynamic) ? "dynamic ":"";
                    class_type    += (data.classInfo.isStatic) ? "static ":"";
                    class_type    += (data.classInfo.isFinal) ? "final ":"";
                    var class_block    = this.blockTemplate(class_title,{
                        Name:class_name,
                        Package:class_package,
                        Type:class_type,
                        Inheritance:class_inherite,
                        definedIn:(data.classInfo.definedIn=="null")?"Flash Player":data.classInfo.definedIn
                    });

                    var object_title = "Object Information";
                    var object_id = data.targetID;
                    var object_name  = data.targetName ;
                    var object_path  = data.targetPath ;
                    var object_block = this.blockTemplate(object_title,{
                        ID:object_id,
                        Name:object_name,
                        Path:object_path,
                        Class:class_name
                    });

                    $FQuery(this.panelNode,this.panelNode).html("");
                    $FQuery(this.panelNode,this.panelNode).append(object_block);
                    $FQuery(this.panelNode,this.panelNode).append(class_block);
                }catch(e){}
            },
            printSwfInfo: function(data)
            {
                try{
                    var swf_title 	= "SWF File Information";
                    var swf_name 	= data.swfName;
                    var swf_url 	= "<a target='_blank' href='"+data.swfUrl+"'>"+data.swfUrl+"</a>";
                    var swf_version     = data.swfVersion;
                    var swf_size        = data.swfSize;
                    var swf_block 	= this.blockTemplate(swf_title,{
                        "Name":swf_name,
                        "URL":swf_url,
                        "SWF Version":swf_version,
                        "File Size":swf_size
                    });
			
			
                    $FQuery(this.panelNode,this.panelNode).html("");
                    $FQuery(this.panelNode,this.panelNode).append(swf_block);
                }catch(e){}
            },
            blockTemplate: function(_title,_infoArray){
                var _info = this.document.createElement("div");
                var _header = this.document.createElement("div");
                var _body = this.document.createElement("div");
                var _table = this.document.createElement("table");
		
                for (var _inf in _infoArray) {
                    $FQuery(_table).append("<tr><td class='first'>"+_inf+"</td><td>"+_infoArray[_inf]+"</td><tr>");
                }
		
                $FQuery(_info).addClass("info");
                $FQuery(_header).addClass("header");
                $FQuery(_body).addClass("body");
		
                $FQuery(_header).html( _title);
                $FQuery(_body).append(_table);
                $FQuery(_info).append(_header);
                $FQuery(_info).append(_body);
		
                return _info;
            },
            destroy: function(state)
            {
                Firebug.Panel.destroy.apply(this, arguments);
            },
            getOptionsMenuItems: function()
            {
                return ;
            }
        });

        // Registration ***********************************************************************************************

        Firebug.registerModule(Firebug.FlashModuleInfo);
        Firebug.registerPanel(Firebug.FlashPanelInfo);

        // ************************************************************************************************
        }
    });