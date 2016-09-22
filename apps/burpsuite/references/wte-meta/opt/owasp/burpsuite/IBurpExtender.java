package burp;

/*
 * @(#)IBurpExtender.java
 *
 * Copyright 2008 PortSwigger Ltd. All rights reserved.
 * Use is subject to license terms - see http://portswigger.net/
 */

/**
 * This interface allows third-party code to extend Burp Suite's functionality.
 *
 * Implementations must be called BurpExtender, in the package burp, 
 * must be declared public, and must provide a default (public, no-argument) 
 * constructor. On startup, Burp Suite searches its classpath for the class 
 * burp.BurpExtender, and attempts to dynamically load and instantiate this 
 * class. The <code>IBurpExtender</code> methods implemented will then be 
 * dynamically invoked as appropriate.<p>
 *
 * Partial implementations are acceptable. The class will be used provided at
 * least one of the interface's methods is implemented.<p>
 *
 * To make use of the interface, create a class called BurpExtender, in the 
 * package burp, which implements one or more methods of the interface, and 
 * place this into the application's classpath at startup. For example, if 
 * Burp Suite is loaded from burp.jar, and BurpProxyExtender.jar contains the 
 * class burp.BurpExtender, use the following command to launch Burp Suite and 
 * load the IBurpExtender implementation:<p>
 *
 * <PRE>
 *    java -classpath burp.jar;BurpProxyExtender.jar burp.StartBurp
 * </PRE>
 */

public interface IBurpExtender
{
    /**
     * This method is invoked immediately after the implementation's constructor
     * to pass any command-line arguments that were passed to Burp Suite on
     * startup. It allows implementations to control aspects of their behaviour
     * at runtime by defining their own command-line arguments.
     *
     * @param args The command-line arguments passed to Burp Suite on startup.
     */
    public void setCommandLineArgs(String[] args);
    
    
    /**
     * This method is invoked by Burp Proxy whenever a client request or server
     * response is received. It allows implementations to perform logging 
     * functions, modify the message, specify an action (intercept, drop, etc.)
     * and perform any other arbitrary processing.
     *
     * @param messageReference An identifier which is unique to a single 
     * request/response pair. This can be used to correlate details of requests
     * and responses and perform processing on the response message accordingly.
     * @param messageIsRequest Flags whether the message is a client request or
     * a server response.
     * @param remoteHost The hostname of the remote HTTP server.
     * @param remotePort The port of the remote HTTP server.
     * @param serviceIsHttps Flags whether the protocol is HTTPS or HTTP.
     * @param httpMethod The method verb used in the client request.
     * @param url The requested URL.
     * @param resourceType The filetype of the requested resource, or a 
     * zero-length string if the resource has no filetype.
     * @param statusCode The HTTP status code returned by the server. This value
     * is <code>null</code> for request messages.
     * @param responseContentType The content-type string returned by the 
     * server. This value is <code>null</code> for request messages.
     * @param message The full HTTP message.
     * @param action An array containing a single integer, allowing the
     * implementation to communicate back to Burp Proxy a non-default 
     * interception action for the message. The default value is 
     * <code>ACTION_FOLLOW_RULES</code>. Set <code>action[0]</code> to one of 
     * the other possible values to perform a different action.
     * @return Implementations should return either (a) the same object received
     * in the <code>message</code> paramater, or (b) a different object 
     * containing a modified message.
     */
    public byte[] processProxyMessage(
            int messageReference,
            boolean messageIsRequest,
            String remoteHost,
            int remotePort,
            boolean serviceIsHttps,
            String httpMethod,
            String url,
            String resourceType,
            String statusCode,
            String responseContentType,
            byte[] message,
            int[] action);
    
    /** 
     * Causes Burp Proxy to follow the current interception rules to determine
     * the appropriate action to take for the message.
     */
    public final static int ACTION_FOLLOW_RULES = 0;
    /** 
     * Causes Burp Proxy to present the message to the user for manual
     * review or modification.
     */
    public final static int ACTION_DO_INTERCEPT = 1;
    /** 
     * Causes Burp Proxy to forward the message to the remote server or client.
     */
    public final static int ACTION_DONT_INTERCEPT = 2;
    /** 
     * Causes Burp Proxy to drop the message and close the client connection.
     */
    public final static int ACTION_DROP = 3;    
    
    
    
    /**
     * This method is invoked on startup. It registers an instance of the 
     * <code>IBurpExtenderCallbacks</code> interface, providing methods that 
     * may be invoked by the implementation to perform various actions.
     * 
     * The call to registerExtenderCallbacks need not return, and 
     * implementations may use the invoking thread for any purpose.<p>
     *
     * @param callbacks An implementation of the 
     * <code>IBurpExtenderCallbacks</code> interface.
     */
    public void registerExtenderCallbacks(burp.IBurpExtenderCallbacks callbacks);
    
    
    
    /**
     * This method is invoked immediately before Burp Suite exits. 
     * It allows implementations to carry out any clean-up actions necessary
     * (e.g. flushing log files or closing database resources).
     */
    public void applicationClosing();
}
