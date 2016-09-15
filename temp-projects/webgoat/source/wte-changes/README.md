The following things have been changed during packaging of WebGoat 6.x for OWASP WTE.

1. Updated tomcat.standalone.properties to set useServerXml=true
2. Added a server.xml which specifies 127.0.0.1 as the IP address to bind to in ./conf in the upstream .jar file.

These changes are reflected in the WTE-WebGoat-6.0.1-war-exec.jar

Note: The server.xml file came from the Ubuntu/Debian Tomcat7 package at http://anonscm.debian.org/cgit/pkg-java/tomcat7.git/tree/conf/server.xml?h=wheezy and then was slightly modified to use 127.0.0.1.

Further information about how the embedded Tomcat works can be found at: https://svn.apache.org/repos/asf/tomcat/maven-plugin/trunk/tomcat7-war-runner/NOTES.TXT
