/*
 * jQuery Autocomplete plugin 1.1
 *
 * Copyright (c) 2009 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.autocomplete.js 15 2009-08-22 10:30:27Z joern.zaefferer $
 */
(function($){
    var panelDocument = document;
    $.fn.extend({
        autocomplete:function(urlOrData,options){
            var isUrl=typeof urlOrData=="string";
            options=$.extend({},$.Autocompleter.defaults,{
                url:isUrl?urlOrData:null,
                data:isUrl?null:urlOrData,
                delay:isUrl?$.Autocompleter.defaults.delay:10,
                max:options&&!options.scroll?10:150
            },options);
            options.highlight=options.highlight||function(value){
                return value;
            };
            
            options.formatMatch=options.formatMatch||options.formatItem;
            return this.each(function(){
                panelDocument = $(this).parents(".panelNode").get(0);
                new $.Autocompleter(this,options);
            });
        },
        result:function(handler){
            return this.bind("result",handler);
        },
        search:function(handler){
            return this.trigger("search",[handler]);
        },
        flushCache:function(){
            return this.trigger("flushCache");
        },
        setOptions:function(options){
            return this.trigger("setOptions",[options]);
        },
        unautocomplete:function(){
            return this.trigger("unautocomplete");
        }
    });
    $.Autocompleter=function(input,options){
        var KEY={
            UP:38,
            DOWN:40,
            DEL:46,
            TAB:9,
            RETURN:13,
            ESC:27,
            COMMA:188,
            PAGEUP:33,
            PAGEDOWN:34,
            BACKSPACE:8
        };
    
        var $input=$(input).attr("autocomplete","off").addClass(options.inputClass);
        var timeout;
        var previousValue="";
        var cache=$.Autocompleter.Cache(options);
        var hasFocus=0;
        var lastKey = {};
        var config={
            mouseDownOnSelect:false
        };
    
        var select=$.Autocompleter.Select(options,input,selectCurrent,config);
        var blockSubmit;
        $.browser.opera&&$(input.form).bind("submit.autocomplete",function(){
            if(blockSubmit){
                blockSubmit=false;
                return false;
            }
        });
        $input.bind(($.browser.opera?"keypress":"keydown")+".autocomplete",function(event){
            hasFocus = 1;
            lastKey = event;
            switch(lastKey.keyCode){
                case KEY.UP:
                    if(select.visible()){
                        select.prev();
                        event.preventDefault();                        
                    }else{
                        onChange(0,true);
                    }
                    break;
                case KEY.DOWN:
                    if(select.visible()){
                        select.next();
                        event.preventDefault();                        
                    }else{
                        onChange(0,true);
                    }
                    break;
                case KEY.PAGEUP:
                    if(select.visible()){
                        select.pageUp();
                        event.preventDefault();                        
                    }else{
                        onChange(0,true);
                    }
                    break;
                case KEY.PAGEDOWN:
                    if(select.visible()){
                        select.pageDown();
                        event.preventDefault();                        
                    }else{
                        onChange(0,true);
                    }
                    break;
                case options.multiple && $.trim(options.multipleSeparator)==","&&KEY.COMMA:case KEY.TAB:case KEY.RETURN:
                    if( select.visible() && selectCurrent()){
                        event.preventDefault();
                        blockSubmit=true;
                        return false;
                    }
                    break;
                case KEY.ESC:
                    select.hide();
                    event.preventDefault();
                    break;
                default:
                    if (!select.visible() && event.keyCode == 32 && event.ctrlKey){
                        var currentValue = $input.val();
                        previousValue=currentValue;
                        currentValue=lastWord(currentValue);
                        $input.addClass(options.loadingClass);
                        if(!options.matchCase)currentValue=currentValue;
                        request(currentValue,receiveData,hideResultsNow);
                    }else{
                        if (lastKey.keyCode){
                            clearTimeout(timeout);
                            timeout=setTimeout(onChange,options.delay);
                        }
                    }
                    break;                    
            }
        }).focus(function(){
            hasFocus++;
        }).blur(function(){
            hasFocus=0;
            if(!config.mouseDownOnSelect){
                hideResults();
            }
        }).click(function(){
            if(hasFocus++>1&&!select.visible()){
                onChange(0,true);
            }
        }).bind("search",function(){
            var fn=(arguments.length>1)?arguments[1]:null;
            function findValueCallback(q,data){
                var result;
                if(data&&data.length){
                    for(var i=0;i<data.length;i++){
                        if(data[i].result == q || !q){
                            result=data[i];
                            break;
                        }
                    }
                }
                if(typeof fn=="function")fn(result);else $input.trigger("result",result&&[result.data,result.value]);
            }
            $.each(trimWords($input.val()),function(i,value){
                request(value,findValueCallback,findValueCallback);
            });
        }).bind("flushCache",function(){
            cache.flush();
        }).bind("setOptions",function(){
            $.extend(options,arguments[1]);
            if("data"in arguments[1])cache.populate();
        }).bind("unautocomplete",function(){
            select.unbind();
            $input.unbind();
            $(input.form).unbind(".autocomplete");
        });
        function selectCurrent(){
            var selected=select.selected();
            if(!selected)return false;
            var v = selected.result;
            var cursorAt = $input.selection().start;
            var stringA = $input.val().substring(0, $input.selection().start);
            var stringB = $input.val().substring($input.selection().end);
            var newVal  = v.substring(lastWord(previousValue).length);
            $input.val(stringA + newVal +stringB);
            hideResultsNow();
            $input.trigger("result",[selected.data,selected.value]);
            previousValue = v;
            $input.selection(stringA.length+newVal.length,stringA.length+newVal.length);
            return true;
        }
        function onChange(crap,skipPrevCheck){            
            if(lastKey.keyCode == KEY.DEL){
                select.hide();
                return;
            }
            var currentValue=$input.val();
            if(!skipPrevCheck&&currentValue==previousValue)return;
            previousValue=currentValue;
            currentValue=lastWord(currentValue);
            if(currentValue.length>=options.minChars){
                $input.addClass(options.loadingClass);
                if(!options.matchCase)currentValue=currentValue;
                request(currentValue,receiveData,hideResultsNow);
            }else{
                stopLoading();
                select.hide();
            }
        };

        function trimWords(value){
            if(!value)return[""];
            if(!options.multiple)return[$.trim(value)];
            return $.map(value.split(options.multipleSeparator),function(word){
                return $.trim(value).length?$.trim(word):null;
            });
        }
        
        function lastWord(value){
            if(!options.multiple)return value;
            var words=trimWords(value);
            if(words.length==1)return words[0];
            var cursorAt=$(input).selection().start;
            if(cursorAt==value.length){
                words = trimWords(value);
            }else{
                words = trimWords(value.replace(value.substring(cursorAt),""));
            }
            return words[words.length-1];
        }
        
        function autoFill(q,sValue){
            if ( options.autoFill && (lastWord($input.val()) == q) && lastKey.keyCode != KEY.BACKSPACE ){
                var stringA = $input.val().substring(0, $input.selection().start);
                var stringB = $input.val().substring($input.selection().start);
                var newVal  = sValue.substring(lastWord(previousValue).length);
                $input.val(stringA + newVal +stringB);
                $input.selection(stringA.length,stringA.length + newVal.length);
            }
        };

        function hideResults(){
            clearTimeout(timeout);
            timeout=setTimeout(hideResultsNow,200);
        };

        function hideResultsNow(){
            var wasVisible=select.visible();
            select.hide();
            clearTimeout(timeout);
            stopLoading();
            if(options.mustMatch){
                $input.search(function(result){
                    if(!result){
                        if(options.multiple){
                            var words=trimWords($input.val()).slice(0,-1);
                            $input.val(words.join(options.multipleSeparator)+(words.length?options.multipleSeparator:""));
                        }else{
                            $input.val("");
                            $input.trigger("result",null);
                        }
                    }
                });
            }
        };

        function receiveData(q,data){
            if(data&&data.length&&hasFocus){
                stopLoading();
                select.display(data,q);
                autoFill(q,data[0].value);
                select.show();
            }else{
                hideResultsNow();
            }
        };

        function request(term,success,failure){
            if(!options.matchCase)term=term;
            var data=cache.load(term);
            if(data&&data.length){
                success(term,data);
            }else if((typeof options.url=="string")&&(options.url.length>0)){
                var extraParams={
                    timestamp:+new Date()
                };
            
                $.each(options.extraParams,function(key,param){
                    extraParams[key]=typeof param=="function"?param():param;
                });
                $.ajax({
                    mode:"abort",
                    port:"autocomplete"+input.name,
                    dataType:options.dataType,
                    url:options.url,
                    data:$.extend({
                        q:lastWord(term),
                        limit:options.max
                    },extraParams),
                    success:function(data){
                        var parsed=options.parse&&options.parse(data)||parse(data);
                        cache.add(term,parsed);
                        success(term,parsed);
                    }
                });
            }else{
                select.emptyList();
                failure(term);
            }
        };

        function parse(data){
            var parsed=[];
            var rows=data.split("\n");
            for(var i=0;i<rows.length;i++){
                var row=$.trim(rows[i]);
                if(row){
                    row=row.split("|");
                    parsed[parsed.length]={
                        data:row,
                        value:row[0],
                        result:options.formatResult&&options.formatResult(row,row[0])||row[0]
                    };
            
                }
            }
            return parsed;
        };

        function stopLoading(){
            $input.removeClass(options.loadingClass);
        };

    };

    $.Autocompleter.defaults={
        inputClass:"ac_input",
        resultsClass:"ac_results",
        loadingClass:"ac_loading",
        minChars:1,
        delay:400,
        matchCase:true,
        matchSubset:true,
        matchContains:false,
        cacheLength:10,
        max:100,
        mustMatch:false,
        extraParams:{},
        selectFirst:true,
        formatItem:function(row){
            return row[0];
        },
        formatMatch:null,
        autoFill:true,
        width:0,
        multiple:true,
        multipleSeparator:" ",
        highlight:function(value,term){
            return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")+")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>");
        },
        scroll:true,
        scrollHeight:140
    };

    $.Autocompleter.Cache=function(options){
        var data={};
    
        var length=0;
        function matchSubset(s,sub){
            if(!options.matchCase)s=s;
            var i=s.indexOf(sub);
            if(options.matchContains=="word"){
                i=s.search("\\b"+sub);
            }
            if(i==-1)return false;
            return i==0||options.matchContains;
        };
    
        function add(q,value){
            if(length>options.cacheLength){
                flush();
            }
            if(!data[q]){
                length++;
            }
            data[q]=value;
        }
        function populate(){
            if(!options.data)return false;
            var stMatchSets={},nullData=0;
            if(!options.url)options.cacheLength=1;
            stMatchSets[""]=[];
            for(var i=0,ol=options.data.length;i<ol;i++){
                var rawValue=options.data[i];
                rawValue=(typeof rawValue=="string")?[rawValue]:rawValue;
                var value=options.formatMatch(rawValue,i+1,options.data.length);
                if(value===false)continue;
                var firstChar=value.charAt(0);
                if(!stMatchSets[firstChar])stMatchSets[firstChar]=[];
                var row={
                    value:value,
                    data:rawValue,
                    result:options.formatResult&&options.formatResult(rawValue)||value
                };
                
                stMatchSets[firstChar].push(row);
                if(nullData++<options.max){
                    stMatchSets[""].push(row);
                }
            };
        
            $.each(stMatchSets,function(i,value){
                options.cacheLength++;
                add(i,value);
            });
        }
        setTimeout(populate,25);
        function flush(){
            data={};
    
            length=0;
        }
        return{
            flush:flush,
            add:add,
            populate:populate,
            load:function(q){
                if(!options.cacheLength||!length)return null;
                if(!options.url&&options.matchContains){
                    var csub=[];
                    for(var k in data){
                        if(k.length>0){
                            var c=data[k];
                            $.each(c,function(i,x){
                                if(matchSubset(x.value,q)){
                                    csub.push(x);
                                }
                            });
                        }
                    }
                    return csub;
                }else
                if(data[q]){
                    return data[q];
                }else
                if(options.matchSubset){
                    for(var i=q.length-1;i>=options.minChars;i--){
                        var c=data[q.substr(0,i)];
                        if(c){
                            var csub=[];
                            $.each(c,function(i,x){
                                if(matchSubset(x.value,q)){
                                    csub[csub.length]=x;
                                }
                            });
                            return csub;
                        }
                    }
                }
                return null;
            }
        };

    };

    $.Autocompleter.Select=function(options,input,select,config){
        var CLASSES={
            ACTIVE:"ac_over"
        };
    
        var listItems,active=-1,data,term="",needsInit=true,element,list;
        function init(){
            if(!needsInit)return;
            element=$("<div/>").hide().addClass(options.resultsClass).css("position","absolute").appendTo(panelDocument);
            list=$("<ul/>").appendTo(element).mouseover(function(event){
                if(target(event).nodeName&&target(event).nodeName.toLowerCase()=='li'){
                    active=$("li",list).removeClass(CLASSES.ACTIVE).index(target(event));
                    $(target(event)).addClass(CLASSES.ACTIVE);
                }
            }).click(function(event){
                $(target(event)).addClass(CLASSES.ACTIVE);
                select();
                input.focus();
                return false;
            }).mousedown(function(){
                config.mouseDownOnSelect=true;
            }).mouseup(function(){
                config.mouseDownOnSelect=false;
            });
            if(options.width>0)element.css("width",options.width);
            needsInit=false;
        }
        function target(event){
            var element=event.target;
            while(element&&element.tagName!="LI")element=element.parentNode;
            if(!element)return[];
            return element;
        }
        function moveSelect(step){
            listItems.slice(active,active+1).removeClass(CLASSES.ACTIVE);
            movePosition(step);
            var activeItem = listItems.slice(active,active+1).addClass(CLASSES.ACTIVE);
            if(options.scroll){
                var scrollTo = 0;
                if(active > 6){                  
                    scrollTo =(active)*20 - 120;
                }
                list.scrollTop(scrollTo);                    
            }
        };

        function movePosition(step){
            active+=step;
            if(active<0){
                active=listItems.size()-1;
            }else if(active>=listItems.size()){
                active=0;
            }
        }
        function limitNumberOfItems(available){
            return options.max&&options.max<available?options.max:available;
        }
        function fillList(){
            list.empty();
            var max=limitNumberOfItems(data.length);
            for(var i=0;i<max;i++){
                if(!data[i])continue;
                var formatted=options.formatItem(data[i].data,i+1,max,data[i].value,term);
                if(formatted===false)continue;
                var li=$("<li/>").text(formatted).addClass(i%2==0?"ac_even":"ac_odd").appendTo(list)[0];
                $.data(li,"ac_data",data[i]);
            }
            listItems=list.find("li");
            if(options.selectFirst){
                listItems.slice(0,1).addClass(CLASSES.ACTIVE);
                active=0;
            }
            if($.fn.bgiframe)list.bgiframe();
        }
        return{
            display:function(d,q){
                init();
                data=d;
                term=q;
                fillList();
            },
            next:function(){
                moveSelect(1);
            },
            prev:function(){
                moveSelect(-1);
            },
            pageUp:function(){
                if(active!=0&&active-8<0){
                    moveSelect(-active);
                }else{
                    moveSelect(-8);
                }
            },
            pageDown:function(){
                if(active!=listItems.size()-1&&active+8>listItems.size()){
                    moveSelect(listItems.size()-1-active);
                }else{
                    moveSelect(8);
                }
            },
            hide:function(){
                element&&element.hide();
                listItems&&listItems.removeClass(CLASSES.ACTIVE);
                active=-1;
            },
            visible:function(){
                return element&&element.is(":visible");
            },
            current:function(){
                return this.visible()&&(listItems.filter("."+CLASSES.ACTIVE)[0]||options.selectFirst&&listItems[0]);
            },
            show:function(){
                var offset=$(input).offset();
                element.css({
                    width:typeof options.width=="string"||options.width>0?options.width:$(input).width(),
                    top:offset.top - ((element.find("li").length>7)?7:element.find("li").length) * 20 - 5,
                    left:offset.left + 3
                }).show();
                if(options.scroll){
                    list.scrollTop(0);
                    list.css({
                        maxHeight:options.scrollHeight,
                        overflow:'auto'
                    });
                }
            },
            selected:function(){
                var selected=listItems&&listItems.filter("."+CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);
                return selected&&selected.length&&$.data(selected[0],"ac_data");
            },
            emptyList:function(){
                list&&list.empty();
            },
            unbind:function(){
                element&&element.remove();
            }
        };

    };

    $.fn.selection=function(start,end){
        if(start!==undefined){
            return this.each(function(){
                if(this.createTextRange){
                    var selRange=this.createTextRange();
                    if(end===undefined||start==end){
                        selRange.move("character",start);
                        selRange.select();
                    }else{
                        selRange.collapse(true);
                        selRange.moveStart("character",start);
                        selRange.moveEnd("character",end);
                        selRange.select();
                    }
                }else if(this.setSelectionRange){
                    this.setSelectionRange(start,end);
                }else if(this.selectionStart){
                    this.selectionStart=start;
                    this.selectionEnd=end;
                }
            });
        }
        var field=this[0];
        if(field.createTextRange){
            var range=document.selection.createRange(),orig=field.value,teststring="<->",textLength=range.text.length;
            range.text=teststring;
            var caretAt=field.value.indexOf(teststring);
            field.value=orig;
            this.selection(caretAt,caretAt+textLength);
            return{
                start:caretAt,
                end:caretAt+textLength
            }
        }else if(field.selectionStart!==undefined){
            return{
                start:field.selectionStart,
                end:field.selectionEnd
            }
        }
    };

})(jQuery);