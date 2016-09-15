function CCIN(cName, ifaceName)
{
    return Components.classes[cName].createInstance(Components.interfaces[ifaceName]);
}

// --------------------------------------------- http tracing listener
function FlashTraceListener(){}

FlashTraceListener.prototype = {

    originalListener: null,

    onDataAvailable: function(request, context, inputStream, offset, count)
    {
        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1","nsIBinaryInputStream");

        var storageStream = CCIN("@mozilla.org/storagestream;1","nsIStorageStream");

        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1","nsIBinaryOutputStream");

        binaryInputStream.setInputStream(inputStream);

        // read input stream to string
        var data = binaryInputStream.readBytes(count);
        if(Firebug.FlashModule.enabled && Firebug.FlashModule.activated){
            data = data.replace(/<\/head>/gi,"<script type='text/javascript'>window.addEventListener('load', function() {document.addEventListener('DOMNodeInserted', function(e) {if(e.target.tagName.toLowerCase() == 'object' || e.target.tagName.toLowerCase() == 'embed'){try{FlashFirebug_init();}catch(e){}}}, false);try{FlashFirebug_init();}catch(e){}},false);</script></head>");
        }
        var newcount = data.length;
        storageStream.init(8192, newcount, null);
        // initializes new storage stream
        
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

        binaryOutputStream.writeBytes(data, newcount);

        this.originalListener.onDataAvailable(request, context, storageStream.newInputStream(0), offset, newcount);
    },

    onStartRequest: function(request, context){
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode){
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function(aIID){
        if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports)){
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    },
    trace:function(msg){
            	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
    			.getService(Components.interfaces.nsIConsoleService);
            	consoleService.logStringMessage(msg);
            }
};
