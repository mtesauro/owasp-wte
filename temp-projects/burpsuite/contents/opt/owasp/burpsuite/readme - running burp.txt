Burp Suite v1.4  by PortSwigger (mail@portswigger.net)
===============


Installation instructions
=========================

The Burp Suite program is an executable JAR (Java archive) file called burpsuite_v1.4.jar

Burp Suite requires a Java Runtime Environment, and will run on any platform for which a JRE is implemented. It requires Java version 1.5 or later, and it is recommended that the latest available JRE is used. JREs for Windows, Linux and Solaris can be obtained for free from http://java.sun.com/j2se/downloads.html

Burp Suite can be launched using the command "java -jar burpsuite_v1.4.jar". On some platforms, it can be launched simply by double-clicking on the JAR file.

Note that the default settings of the JRE Virtual Machine may limit the amount of system resources available to the Burp Suite process. If Burp Suite is to be used for tasks that require large amounts of memory, the VM memory settings should be changed. The file suite.bat launches Surp Suite with up to 1Gb of available memory. This file can be edited to specify a different memory size.



Troubleshooting
===============

If Burp Suite fails to start, or generates the error "Exception in thread main", check that the correct JRE version has been installed. If so, check that the "java" command is launching the most recent JRE, and not an earlier installed version. If necessary, modify the startup command to contain absolute paths to both the JRE and the JAR file, e.g. "/usr/bin/java -jar /usr/tools/burpsuite_v1.4.jar".



Burp Suite is copyright (c) PortSwigger Ltd 2011. All rights reserved.
Java is a Trade Mark of Oracle.


