FBL.ns(function() {
    with (FBL) {

        // Constants ************************************************************************************************
        const panelName         = "ffbugprop";
        const panelTitle        = "Properties";
        const parentPanelName   = "flashfirebug";

        // Module ***************************************************************************************************

        Firebug.FlashModuleProp = extend(Firebug.Module,
        {
            data:null,
        	panelBar2:{},
            trace:function(msg, obj) {
                if (FBTrace.DBG_FLASH_INSPECTOR) FBTrace.sysout('FlashPanelProp - ' + msg, obj);
            },
        	initializeUI:function(){
        		this.panelBar2 = $("fbPanelBar2");
        	},
            activatePro: function() {
              var panel = Firebug.FlashModule.getPanel(panelName);

              if (flashfirebugPrepare.isPro) {
                $FQuery("#pro-main", panel.panelNode).remove();
                Firebug.FlashModule.setMessage(panelName, Firebug.FlashModule.SelectDpRep);
              } else {
                Firebug.FlashModuleConsole.NeedProRep.tag.append({}, panel.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
              }
            },
            initialize: function(){
                this.panelName = panelName;
                Firebug.Module.initialize.apply(this, arguments);
            },
            addStyleSheet: function(panel){
                var doc = panel.document;
                if ($("flashfirebugStylesProp", doc)) return;
                var styleSheet = createStyleSheet(doc, "chrome://flashfirebug/content/themes/default/prop.css");
                styleSheet.setAttribute("id", "flashfirebugStylesProp");
                addStyleSheet(doc, styleSheet);
                this.setBehaviors();
            },
            setBehaviors:function(){
                // set panel behaviors
                $FQuery("span.val.isAS3NativeType",this.panelNode).live("click",function(){
                    if(!($FQuery(this).parent().parent("li").hasClass("selected") ||  $FQuery(this).parent().parent("li").hasClass("readonly"))){
                        var allowed = $FQuery(this).attr("allowed").split(",");
                        var value = $FQuery(this).text();
                        if (allowed.length>1){
                            var select = "<select>";
                            for (var key in allowed){
                                var val      = allowed[key].split(":");
                                var selected = (value == val[0])?"selected":"";
                                var option   = "<option value='"+val[0]+"' "+selected+">"+val[1]+"</option>";
                                select += option;
                            }
                            select += "</select>";
                            $FQuery(this).html(select);
                            $FQuery(this).children("select").focus();
                        }else{
                            var input = "<input type='text' value='' />";
                            $FQuery(this).html(input);
                            $FQuery(this).children("input").focus();
                            $FQuery(this).children("input").val(value);
                        }
                        $FQuery(this).parent().parent("li").addClass("selected");
                    }
                });
                // <input><select> behaviors
                $FQuery("span.val input ,span.val select",this.panelNode).live("blur",function(){
                    dataType = $FQuery(this).parent().parent().parent("li.selected").attr("__ffb_proptype")
                    dataProp = $FQuery(this).parent().parent().parent("li.selected").attr("__ffb_propchain");
                    newVal = $FQuery(this).val();

                    //seems like user input a Number value for an Object property
                    //we need convert input string to Number value.
                    if(dataType == "Object")
                    {
                        var regExp = /^[-+]?[0-9]*\.?[0-9]+$/;
                        newVal = parseFloat(newVal);
                    }

                    $FQuery(this).parent("span").attr("rel",newVal);
//                    Firebug.FlashModuleProp.trace(dataProp + ", " + newVal);
                    Firebug.FlashModule.send({
                        command:"setPropertyValue",
                        propName:dataProp,
                        propValue:newVal,
                        propType:dataType,
                        id:(Firebug.FlashModuleProp.data.id)
                    });
                    $FQuery(this).parent().parent().parent("li.selected").removeClass("selected");
                    $FQuery(this).parent("span.val").text($FQuery(this).val());
                });
                $FQuery("span.val input ,span.val select",this.panelNode).live("keydown",function (e) {
                    newVal   = $FQuery(this).val();
                    dataType = $FQuery(this).parent().parent().parent("li.selected").attr("__ffb_proptype");
                    dataProp = $FQuery(this).parent().parent().parent("li.selected").attr("__ffb_propchain");

                    switch (e.keyCode){
                        case 27: // <esc>
                            oldVal   = $FQuery(this).parent("span").attr("rel");
                            $FQuery(this).val(oldVal);
                            $FQuery(this).blur();
                            break;
                        case 13: // <enter>
                            $FQuery(this).blur();
                            break;
                        case 38: // <up>
                        case 40: // <down>
                            if (!isNaN(new Number(newVal))){
                                valStr    = new String(newVal);
                                decPoint  = (valStr.indexOf(".") != -1)? (valStr.length - valStr.indexOf(".")-1):0;
                                valDec    = Math.pow(10, decPoint);
                                newVal    = new Number(newVal);
                                newVal   += ((e.keyCode == 38)? 1 : -1 )/valDec;
                                newVal    = newVal.toFixed(decPoint)
                            }
                            break;
                    }
                    $FQuery(this).val(newVal);
                    if(this.tagName != "SELECT"){
                        newVal = Firebug.FlashModule.encodeHTML(newVal,this);
                    }
                    //seems like user input a Number value for an Object property
                    //we need convert inputed string to Number.
                    if(dataType == "Object")
                    {
                        var regExp = /^[-+]?[0-9]*\.?[0-9]+$/;
                        newVal = parseFloat(newVal);
                    }

//                    Firebug.FlashModuleProp.trace(dataProp + ", " + newVal);

                    Firebug.FlashModule.send({
                        command:"setPropertyValue",
                        propName:dataProp,
                        propValue:newVal,
                        propType:dataType,
                        id:(Firebug.FlashModuleProp.data.id)
                    });
                })
                $FQuery("span.val input, span.val select",this.panelNode).live("keyup click",function (e) {
                    dataType = $FQuery(this).parent().parent().parent("li.selected").attr("__ffb_proptype");
                    dataProp = $FQuery(this).parent().parent().parent("li.selected").attr("__ffb_propchain");
                    newVal = $FQuery(this).val();
                    if(this.tagName != "SELECT"){
                        newVal = Firebug.FlashModule.encodeHTML(newVal,this);
                    }

                    //seems like user input a Number value for an Object property
                    //we need convert inputed string to Number.
                    if(dataType == "Object")
                    {
                        var regExp = /^[-+]?[0-9]*\.?[0-9]+$/;
                        newVal = parseFloat(newVal);
                    }

//                    Firebug.FlashModuleProp.trace(dataProp + ", " + newVal);


                    Firebug.FlashModule.send({
                        command:"setPropertyValue",
                        propName:dataProp,
                        propValue:newVal,
                        propType:dataType,
                        id:(Firebug.FlashModuleProp.data.id)
                    });
                })
                $FQuery("span.val select option",this.panelNode).live("mouseover",function (e) {
                    dataType = $FQuery(this).parent().parent().parent().parent("li.selected").attr("__ffb_proptype");
                    dataProp = $FQuery(this).parent().parent().parent().parent("li.selected").attr("__ffb_propchain");
                    newVal = $FQuery(this).attr("value");

                    //seems like user input a Number value for an Object property
                    //we need convert inputed string to Number.
                    if(dataType == "Object")
                    {
                        var regExp = /^[-+]?[0-9]*\.?[0-9]+$/;
                        newVal = parseFloat(newVal);
                    }

//                    Firebug.FlashModuleProp.trace(dataProp + ", " + newVal);

                    Firebug.FlashModule.send({
                        command:"setPropertyValue",
                        propName:dataProp,
                        propValue:newVal,
                        propType:dataType,
                        id:(Firebug.FlashModuleProp.data.id)
                    });
                })
            },
            shutdown: function(){
                Firebug.Module.shutdown.apply(this, arguments);
            }
        });

        // Panel ****************************************************************************************************

        Firebug.FlashPanelProp = function() {};

        Firebug.FlashPanelProp.prototype = extend(Firebug.Panel,
        {
            name: panelName,
            title: panelTitle,
            parentPanel:parentPanelName,
            order:20,
            searchable:true,
            currSubPropertiesTarget:null,
            trace:function(msg, obj) {
                if (FBTrace.DBG_FLASH_INSPECTOR) FBTrace.sysout('FlashPanelProp - ' + msg, obj);
            },
            initialize: function(context,doc){
                this.panelName = panelName;
                Firebug.Panel.initialize.apply(this, arguments);

                //UI initialize
                Firebug.FlashModuleProp.addStyleSheet(this);
            },

            search: function(text, reverse) {
                this.trace("search - text:" + text + " reverse:" + reverse);

                if (!text) {
                    delete this.currentSearch;
                    return false;
                }

                var row;
                if (this.currentSearch && text == this.currentSearch.text) {
                    row = this.currentSearch.findNext(true, false, reverse, Firebug.Search.isCaseSensitive(text));
                } else {
                    this.currentSearch = new LogPanelSearch(this);
                    row = this.currentSearch.find(text, reverse, Firebug.Search.isCaseSensitive(text));
                }

                if (row) {
                    var sel = this.document.defaultView.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(this.currentSearch.range);

                    scrollIntoCenterView(row, this.panelNode);
                    setClassTimed(row, "jumpHighlight", this.context);
                    return true;
                } else {
                    return false;
                }
            },
            initializeUI:function(data)
            {

            },
            updateProperties:function(data){
                var props = data.targetProperties;
                for (var key in props){
                    var tr = $FQuery('li.'+key,this.panelNode).get(0);
                    $FQuery(tr).children('span.val').text(props[key]);
                }
            },
            printProperties: function(data){
//                this.trace('printProperties ', data);
                Firebug.FlashModuleProp.data = data;
                var table = this.document.createElement("ul");
                $FQuery(table).addClass("prop");
                $FQuery(table).attr("cellspacing","0");

                var props = Firebug.FlashModuleProp.data.targetProperties;
                for (var obj in props){
                    props[obj]["__ffb_propchain"] = props[obj].name;
                    $FQuery(table).append(this.createPropertyNode(props[obj]));
                }

                $FQuery(this.panelNode,this.panelNode).html(table);
            },
            onInspectProperty:function(data){
//                this.trace("onInspectProperty", data);
                var props = data.targetProperties;
                for (var obj in props){
                    props[obj]["__ffb_propchain"] = (data.property + "." + props[obj].name);

                    var property = this.createPropertyNode(props[obj]);
                    $FQuery(property).css("padding-left", "20px");
                    $FQuery(".SubProperties", Firebug.FlashPanelProp.currSubPropertiesTarget).append(property);
                }
            },
            createPropertyNode:function(obj){
//                this.trace("createPropertyNode", obj)
                var li = this.document.createElement("li");
                $FQuery(li).attr("__ffb_propchain", obj['__ffb_propchain']);
                $FQuery(li).attr("__ffb_proptype", obj.type);

                var propertySpan = this.document.createElement("span")
                $FQuery(propertySpan).attr('class', 'property');
                $FQuery(li).append(propertySpan);

                //显示名称
                var nameSpan = this.document.createElement("span");
                $FQuery(nameSpan).attr('class', 'name');
                $FQuery(nameSpan).text(obj.name);
                $FQuery(propertySpan).append(nameSpan);

                //属性前面的+/-按钮
                $FQuery(nameSpan).prepend("<div class='expand'></div>")
                if(this.hasChildrenProperty(obj)){
                    $FQuery(propertySpan).addClass("hasChildren");

                    $FQuery('.expand', propertySpan).click(function(event){
                        var target = event.target;
                        if($FQuery(target).hasClass("isOpened")){
                            $FQuery(target).removeClass("isOpened")
                            $FQuery(".SubProperties", target.parentNode.parentNode.parentNode).remove();
                        }else{
                            $FQuery(target).addClass("isOpened")

                            //显示子属性
                            Firebug.FlashPanelProp.currSubPropertiesTarget =
                                $FQuery(li).append("<ul class='SubProperties'></ul>");

                            //获取属性值
	                        Firebug.FlashModule.send({
	                            command:"inspectProperty",
	                            displayId:Firebug.FlashModuleProp.data.displayId,
	                            id:Firebug.FlashModuleProp.data.id,
	                            property:obj["__ffb_propchain"],
	                            caller:"printSubProperties",
	                            todo:"printSubProperties"
	                        });
                        }
                    })
                }

                //值
                var valueSpan = this.document.createElement("span");
                obj.value = $FQuery(valueSpan).html(obj.value).text();
                $FQuery(valueSpan).attr('class', 'val')
                if (!this.isAS3NativeType(obj)){
                    if(obj.value!='null' && obj.value!='undefined'){
                        obj.value = '[' + obj.type + ']';
                    }
                }else{
                    $FQuery(valueSpan).addClass('isAS3NativeType')
                }
                $FQuery(valueSpan).text(obj.value);
                $FQuery(propertySpan).append(valueSpan);

                var allowedArray = new Array();
                for (var key in obj.allowed) {
                    allowedArray.push((obj.allowed[key].value)+":"+(obj.allowed[key].name));
                }
                $FQuery(valueSpan).attr("allowed",allowedArray.join(","));

                //只读属性
                if(obj.access == "readonly" || obj.access == "N/A"){
                    $FQuery(li).addClass("readonly")
                }

                return li;
            },
            hasChildrenProperty:function(obj){
                if(this.isAS3NativeType(obj))return false;
                if(obj.access == "writeonly")return false;
                if(obj.value == "null")return false;
                return true;
            },
            isAS3NativeType:function(obj){
                return ["int", "uint", "Number", "Boolean", "String"].indexOf(obj.type)>=0;
            },
            destroy: function(state){
                Firebug.Panel.destroy.apply(this, arguments);
            },
            getOptionsMenuItems: function(){
                return ;
            }
        });

        // Registration ***********************************************************************************************
        FBTrace.DBG_FLASH_PROPERTIES = 	Firebug.getPref(Firebug.prefDomain, "DBG_FLASH_PROPERTIES");

        Firebug.registerModule(Firebug.FlashModuleProp);
        Firebug.registerPanel(Firebug.FlashPanelProp);
        // ************************************************************************************************
        }
});
