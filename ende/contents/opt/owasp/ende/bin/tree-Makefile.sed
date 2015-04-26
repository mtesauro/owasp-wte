
/^SRC.lib.*SRC_lib/s/\(SRC_lib\)/&:%=lib\/%/
/^GEN.lib/s#\(EnDeFunc\.\(js|html\)\)#lib/&#g
/^GEN.lib/s#\(EnDeFunc\.js\)#lib/&#g
/^GEN.lib/s#\(EnDeFunc\.html\)#lib/&#g
/^SRC.gui.*SRC_gui/s/\(SRC_gui\)/&:%=gui\/%/
/^GEN.gui/s#\(EnDeFunc\.txt\)#gui/&#g
/^othergui=/s#\(JsColorizer\.js\)#gui/&#
/^othergui=/s#\(JsDecoder\.js\)#gui/&#
/^othergui=/s#\(JSReg\.js\)#gui/&#
/^SRC.doc.*SRC_doc/s/\(SRC_doc\)/&:%=doc\/%/
/^GEN.doc/s#\(EnDeFunc\.xml\)#doc/&#g
/^SRC.tst.*SRC_tst/s/\(SRC_tst\)/&:%=tst\/%/
/^SRC.src.*SRC_src/s/\(SRC_src\)/&:%=src\/%/
/^SRC.txt.*SRC_txt/s#\(sqlPattern\.txt\)#src/&#g
/^SRC.xml.*SRC_xml/s#\(sqlPattern\.xml\)#src/&#g
/^SRC.SQL/s#\(sqlPattern\.txt\)#src/&#g
/^GEN.SQL/s#\(sqlPattern\.xml\)#src/&#g
/^GEN.REX/s#\(OWASP-regex\.xml\)#src/&#g
/@$(ende2xml)/s#\([A-Za-z-]*\.js\)# lib/&#
/^EnDeFunc.xml:/s#\(EnDeFunc\.xml\)#doc/&#
/^EnDeFunc.txt:/s#\(crc\.js\)#lib/&#
/^EnDeFunc.txt:/s#\(EnDe\.js\)#lib/&#
/^EnDeFunc.txt:/s#\(EnDeFunc\.txt\)#gui/&#
/^EnDeFunc.js:/s#\(EnDe\.js\)#lib/&#
/^EnDeFunc.js:/s#\(EnDeFunc\.js\)#gui/&#
/^EnDeFunc.html:/s#\(EnDe\.js\)#lib/&#
/^EnDeFunc.html:/s#\(EnDeFunc\.html\)#doc/&#
