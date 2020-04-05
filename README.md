## OWASP WTE - Web Testing Environment 

aka We Test Everything

[![OWASP Flagship](https://img.shields.io/badge/OWASP%20Foundation-Flagship%20Project-blue.svg)](https://www.owasp.org/index.php/OWASP_Web_Testing_Environment_Project)

TLDR install instructions for the impatient - just 3 easy steps:  
```
$ sudo echo "deb http://appseclive.org/apt/14.04 trusty main" > /etc/apt/sources.list.d/owasp-wte.list
$ wget -q -O - http://appseclive.org/apt/owasp-wte.gpg.key | apt-key add -
$ apt-get update && apt-get -y install owasp-wte-*

```

### So what is OWASP WTE anyway?

OWASP WTE is primarily a bunch of easy to install AppSec tools, apps and documentation.  Currently, there's a ready-to-use Debian/Ubuntu repository of .deb packages and some very beta RPMs (not tested as of 2015-05-13).  You can either install these packages ala carte on a Linux system of your choice or download an OWASP WTE VM which bundles all the packages together with some extra bling in a turn-key VM.  VMs are provided in VirtualBox (.vdi), VMware (.vmdk) and Open Virtual Appliance (.ova) formats compressed with 7zip.  VMs can be downloaded from [here](https://www.appsecpipeline.org/apt/downloads/) - **Don't forget to check the SHA sums**

A .deb repository of i386 and amd64 packages which were targeted at Ubuntu 14.04 LTS though they should also work on other Debian-based Linux systems like Debian, Linux Mint, Xubuntu, Ubuntu Gnome, Kubuntu, Lubuntu, ...

The current package provided by OWASP WTE are:
> owasp-wte-burpsuite 1.6-00  
> owasp-wte-cal9000 2.0-00  
> owasp-wte-dirbuster 1.0-RC1-00  
> owasp-wte-ende 1.0RC12-00  
> owasp-wte-fierce 0.9.11-Beta04162015-00  
> owasp-wte-firefox 37.0.2-00  
> owasp-wte-fuzzdb 2015-04-26-svn-00  
> owasp-wte-grendel-scan 1.0-00  
> owasp-wte-gruyere 1.0-00  
> owasp-wte-httprint 301-00  
> owasp-wte-jbrofuzz 2.5-00  
> owasp-wte-jerry-curl 1.1-00    
> owasp-wte-jq 1.4-00  
> owasp-wte-netcat 1.10-00  
> owasp-wte-nikto 2.1.5-00  
> owasp-wte-nmap 6.40-00  
> owasp-wte-paros 3.2.13-00  
> owasp-wte-ratproxy 1.58-00  
> owasp-wte-skipfish 2.10-00  
> owasp-wte-spikeproxy 1.4.8-00  
> owasp-wte-sqlbrute 1.0-00  
> owasp-wte-sqlmap 0-git-5ee7fd785a-00  
> owasp-wte-tcpdump 4.5.1-00  
> owasp-wte-w3af 1.1svn5547-00  
> owasp-wte-wapiti 2.3.0-00  
> owasp-wte-webgoat 6.0.1-00  
> owasp-wte-webscarab 20090122-00  
> owasp-wte-webslayer 0-svn-r5-00  
> owasp-wte-wireshark 1.10.6-00  
> owasp-wte-wpscan 0-git-22550ea55-00  
> owasp-wte-wsfuzzer 1.9.5-00  
> owasp-wte-wte-docs 20150503-00  
> owasp-wte-zap 2.4.0-00

####Other References

* [OWASP Wiki page](https://www.owasp.org/index.php/OWASP_Web_Testing_Environment_Project) 
* [Project Download Site](http://appseclive.org/) 
* [Twitter](https://twitter.com/owasp_wte)   
* [Mail list](https://lists.owasp.org/mailman/listinfo/web-testing-environment)

 
