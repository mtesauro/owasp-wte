Home for the SPIKE Proxy.
Author: Dave Aitel (dave@immunitysec.com)
Webpage: www.immunitysec.com/spike.html
Version: 1.4.2

See CHANGES.txt for the changelog.

All Users:
Note: VulnXML is not finished. It does not work. Everything else
should work though. allwords and shortwords are useful for your
login form password bruteforcing needs!

Win32 users:
runme.bat uses some default configuration options. If you did
not unpack SPIKE Proxy into c:\SPIKEProxy then they may
be off by a bit. You can feel free to manual edit them to
change to where you actually did put them.


Type runme.bat to start up the proxy, then go into explorer: 
tools->Internet Options->Connections->LAN Settings
Click, "Usge a proxy server"
set the fields to say 127.0.0.1 and 8080
Click OK
Now go into explorer and browse to http://spike/
You will have to manually refresh that top level URL to reload the contents of
the right hand side.

To kill SPIKE Proxy, pull up the task manager and kill the python process. 
I know of no other way.


To Use:
python spkproxy.py [ optional port argument, 8080 is default ]
Then set up your browser to use that port for both HTTP and
HTTPS proxies.


Then watch the traffic go!

Browse to http://spike/ to use the UI!

