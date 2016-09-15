package burp;

/*
 * @(#)IBurpExtenderCallbacks.java
 *
 * Copyright 2008 PortSwigger Ltd. All rights reserved.
 * Use is subject to license terms - see http://portswigger.net/
 */

/**
 * This interface is used by Burp Suite to pass to implementations of the 
 * <code>IBurpExtender</code> interface a set of callback methods which can 
 * be used by implementations to perform various actions within Burp Suite.
 * 
 * If an implementation of <code>IBurpExtender</code> is loaded then on startup 
 * Burp Suite will invoke the implementation's 
 * <code>registerExtenderCallbacks</code> method (if present) and pass to 
 * the implementation an instance of the <code>IBurpExtenderCallbacks</code> 
 * interface. The implementation may then invoke the methods of this instance 
 * as it sees fit in order to extend Burp Suite's functionality.<p>
 */

public interface IBurpExtenderCallbacks
{
    /**
     * This method can be used to issue arbitrary HTTP requests and retrieve 
     * their responses.
     *
     * @param host The hostname of the remote HTTP server.
     * @param port The port of the remote HTTP server.
     * @param useHttps Flags whether the protocol is HTTPS or HTTP.
     * @param request The full HTTP request.
     * @return The full response retrieved from the remote server.
     */
    public byte[] makeHttpRequest(
            String host,
            int port,
            boolean useHttps,
            byte[] request) throws Exception;

    /**
     * This method can be used to send an HTTP request to the Burp Repeater 
     * tool. The request will be displayed in the user interface, but will not 
     * be issued until the user initiates this action.
     *
     * @param host The hostname of the remote HTTP server.
     * @param port The port of the remote HTTP server.
     * @param useHttps Flags whether the protocol is HTTPS or HTTP.
     * @param request The full HTTP request.
     * @param tabCaption An optional caption which will appear on the Repeater 
     * tab containing the request. If this value is <code>null</code> then a 
     * default tab index will be displayed.
     */
    public void sendToRepeater(
            String host,
            int port,
            boolean useHttps,
            byte[] request,
            String tabCaption) throws Exception;

    /**
     * This method can be used to send an HTTP request to the Burp Intruder 
     * tool. The request will be displayed in the user interface, and markers 
     * for attack payloads will be placed into default locations within the 
     * request.
     *
     * @param host The hostname of the remote HTTP server.
     * @param port The port of the remote HTTP server.
     * @param useHttps Flags whether the protocol is HTTPS or HTTP.
     * @param request The full HTTP request.
     */
    public void sendToIntruder(
            String host,
            int port,
            boolean useHttps,
            byte[] request) throws Exception;

    /**
     * This method can be used to send a seed URL to the Burp Spider tool. If 
     * the URL is not within the current Spider scope, the user will be asked 
     * if they wish to add the URL to the scope. If the Spider is not currently 
     * running, it will be started. The seed URL will be requested, and the 
     * Spider will process the application's response in the normal way.
     * 
     * @param url The new seed URL to begin spidering from.
     */
    public void sendToSpider(
            java.net.URL url) throws Exception;

    /**
     * This method can be used to send an HTTP request to the Burp Scanner 
     * tool to perform an active vulnerability scan. If the request is not 
     * within the current active scanning scope, the user will be asked if 
     * they wish to proceed with the scan.
     *
     * @param host The hostname of the remote HTTP server.
     * @param port The port of the remote HTTP server.
     * @param useHttps Flags whether the protocol is HTTPS or HTTP.
     * @param request The full HTTP request.
     */
    public void doActiveScan(
            String host,
            int port,
            boolean useHttps,
            byte[] request) throws Exception;
    
    /**
     * This method can be used to send an HTTP request to the Burp Scanner 
     * tool to perform a passive vulnerability scan.
     *
     * @param host The hostname of the remote HTTP server.
     * @param port The port of the remote HTTP server.
     * @param useHttps Flags whether the protocol is HTTPS or HTTP.
     * @param request The full HTTP request.
     * @param response The full HTTP response.
     */
    public void doPassiveScan(
            String host,
            int port,
            boolean useHttps,
            byte[] request,
            byte[] response) throws Exception;
    
    /**
     * This method can be used to query whether a specified URL is within 
     * the current Suite-wide scope.
     * 
     * @param url The URL to query.
     * @return Returns <code>true</code> if the URL is within the current 
     * Suite-wide scope.
     */
    boolean isInScope(java.net.URL url) throws Exception;
    
    /**
     * This method can be used to include the specified URL in the Suite-wide 
     * scope.
     * 
     * @param url The URL to include in the Suite-wide scope.
     */
    void includeInScope(java.net.URL url) throws Exception;
    
    /**
     * This method can be used to exclude the specified URL from the Suite-wide 
     * scope.
     * 
     * @param url The URL to exclude from the Suite-wide scope.
     */
    void excludeFromScope(java.net.URL url) throws Exception;

    /**
     * This method can be used to display a specified message in the Burp 
     * Suite alerts tab.
     * 
     * @param message The alert message to display.
     */
    public void issueAlert(String message);
}
