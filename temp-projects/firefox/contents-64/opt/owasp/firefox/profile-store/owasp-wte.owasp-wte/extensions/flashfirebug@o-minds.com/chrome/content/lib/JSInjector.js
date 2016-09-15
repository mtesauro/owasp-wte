function JSInjector()
{
    this.addJsFile = function(docRef, src)
    {
        var injectedScript = this.getResource(src);
        var element = this.addScript(docRef, "___ASConnector", injectedScript);
        if (element && element.parentNode)
            element.parentNode.removeChild(element);  // we don't need the script element, result is in DOM object
    }
    this.runScript = function(docRef, injectedScript){
        var element = this.addScript(docRef,"__ASConnectorInWebPage", injectedScript);
        if (element && element.parentNode)
            element.parentNode.removeChild(element);
    }
    this.runFunction = function(docRef, funName){
    	if(docRef && docRef.body){
    		var element = docRef.body;
	    	element.setAttribute("flashFirebug_runFunction_function", funName);
	    	var args = [];
	    	for(var i = 2; i<arguments.length; i++){
	    		args.push(uneval(arguments[i]));
	    	}
	    	element.setAttribute("flashFirebug_runFunction_arguments", "[" + args + "]");
	    	
	    	var evt = docRef.createEvent("Events");
	    	evt.initEvent("flashfirebug_RunScriptEvent", true, false);
	    	docRef.body.dispatchEvent(evt);
    	}else{
    		//alert("doc或doc.body为空, doc: " + docRef + ", body: " + docRef.body);
    	}
    }
    this.addScript = function(docRef, id, scriptResource)
    {
        var scriptableUnescapeHTML = Components.classes["@mozilla.org/feed-unescapehtml;1"]
                             .getService(Components.interfaces.nsIScriptableUnescapeHTML);
        var element = docRef.createElementNS("http://www.w3.org/1999/xhtml", "html:script");
        element.setAttribute("type", "text/javascript");
        element.setAttribute("id", id);
        element.firebugIgnore = true;
        element.textContent = "try{"+scriptResource+"}catch(e){}";
        
        if (docRef.documentElement){
            docRef.documentElement.appendChild(element);
        }
        return element;
    }
	
    this.getResource = function(aURL)
    {
        try
        {
            var ioService=FBL.CCSV("@mozilla.org/network/io-service;1", "nsIIOService");
            var channel=ioService.newChannel(aURL, null, null);
            var input=channel.open();
            return this.readFromStream(input);
        }
        catch (e)
        {
            alert("Error thrown in getResource, JSInjector.js");
        }
    }
		
    this.readFromStream = function(stream, charset, noClose)
    {
        var sis = FBL.CCSV("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        sis.setInputStream(stream);
	
        var segments = [];
        for (var count = stream.available(); count; count = stream.available())
            segments.push(sis.readBytes(count));
	
        if (!noClose)
            sis.close();
	
        var text = segments.join("");
	
        try
        {
            return this.convertToUnicode(text, charset);
        }
        catch (err)
        {
        }
        return text;
    }
		
    this.convertToUnicode = function(text, charset)
    {
        if (!text)
            return "";
		
        try
        {
            var conv = FBL.CCSV("@mozilla.org/intl/scriptableunicodeconverter", "nsIScriptableUnicodeConverter");
            conv.charset = charset ? charset : "UTF-8";
            var selectedCharset = conv.charset;
            return conv.ConvertToUnicode(text);
        }
        catch (exc)
        {
            throw new Error("Firebug failed to convert to unicode using charset: "+conv.charset+" in @mozilla.org/intl/scriptableunicodeconverter");
        }
    }
}
