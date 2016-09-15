#! /usr/bin/make
#?
#? NAME
#?      Makefile        - makefile for EnDe project
#?
# HACKER's INFO
#       Macro names for lists
#           All lists for source filenames are named  SRC_xxx, and this list
#           is assigned to the macro name  SRC.xxx  which is used  elsewhere
#           in this Makefile.
#           This is done for simply moving source files to other directories.
#               SRC_xxx - list of primary filenames
#               SRC.xxx - list of primary filenames with path
#               GEN.xxx - list of generated filenames with path
#               ALL.xxx - summary of SRC.xxx and GEN.xxx
#               DIR.xxx - macro for path names
#
#? VERSION
#?      @(#) Makefile 3.37 12/06/10 16:17:20
#?
#? AUTHOR
#?      31-may-07 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
# -----------------------------------------------------------------------------
first-target-is-default:: default

PROJECT = EnDe
VERMAJOR= 1

#include /c/bin/makefile.inc

PROJECT_DB=

# --------------------------------------------------------------------- sources
SRC.func = \
	aes.js \
	crc.js \
	md4.js \
	md5.js \
	rmd.js \
	sha.js \
	sha512.js \
	blowfish.js \
        EnDeB64.js \
	EnDeHTTP.js \
	EnDeCheck.js \
	EnDeIP.js \
	EnDeTS.js \
        EnDe.js
SRC_lib = \
	$(SRC.func) \
        EnDeMaps.js \
	EnDeMaps.txt
SRC.lib = $(SRC_lib)
GEN.lib = EnDeFunc.js
ALL.lib = $(SRC.lib) $(GEN.lib)

SRC.html= \
	EnDe.html \
	home.html
GEN.html= index.html
ALL.html= $(SRC.html) $(GEN.html)

SRC_gui = \
	EnDe.css \
	EnDeRE.html \
	EnDeMenu.txt \
	EnDeFile.txt \
	EnDeOpts.txt \
	EnDeGUI.js \
	EnDeGUIx.js \
	EnDeFile.js \
	EnDeForm.js \
	EnDeRE.js \
	EnDeREGUI.js \
	EnDeREMap.js \
	EnDeTest.js \
	EnDeText.js \
	EnDeUser.js \
	EnDeUser.xml \
	EnDeVersion.js \
	EnDeCheck.txt
SRC.gui = $(SRC_gui)
GEN.gui = EnDeFunc.txt
othergui= JsColorizer.js JsDecoder.js JSReg.js
ALL.gui = $(SRC.gui) $(GEN.gui) $(othergui)

SRC_src = \
	core-rules.xml \
	core-rules-2.0.xml \
	core-rules-2.0-part1.xml \
	core-rules-2.0-part2.xml \
	sqlPattern.txt \
	xssAttacks.xml \
	xss.h4k.xml \
	xss.mario.xml \
	default_filter.xml \
	xss-evation.txt

SRC.SQL = sqlPattern.txt
SRC.REX = 3rd/OWASP-ValidationRegexRepository.xml
GEN.SQL = sqlPattern.xml
GEN.REX = OWASP-regex.xml
SRC.src = $(SRC_src)
GEN.src = $(GEN.SQL) $(GEN.REX)
ALL.src = $(SRC.src) $(GEN.src)

SRC_tst	= \
	EnDeTest.txt \
	EnDeTest-Base.txt \
	EnDeTest-Euro.txt \
	EnDeTest-Fuzz.txt \
	EnDeTest-UCS2.txt \
	EnDeTest-UTF8.txt \
	EnDeTest-UTF8-UCS2.txt \
	EnDeTest-Sample.txt \
	EnDeCheck-Test.html \
	EnDeHTTP-Test.html \
	EnDeTest-JSReg.xml
SRC.tst	= $(SRC_tst)
GEN.tst	=
ALL.tst = $(SRC.tst) $(GEN.tst)

SRC_img	= \
	EnDe.ico \
	ende-128x128.png \
	sicsec-87x26.png \
	owasp-125x125.gif \
	owasp.ico \
	edit.png \
	fish.png \
	fold.png \
	h_bg.gif \
	help.png \
	haus.gif \
	info.gif \
	larr.png \
	open.png \
	rarr.png \
	swap.png \
	time.png \
	table.bmp \
	loading.gif \
	overlay.png \
	red-up.png \
	red-left.png \
	roter-haken.gif \
	stern.gif \
	22x22/edit.png \
	22x22/fish.png \
	22x22/fold.png \
	22x22/help.png \
	22x22/larr.png \
	22x22/open.png \
	22x22/rarr.png \
	22x22/swap.png \
	22x22/time.png
SRC.img	= $(SRC_img:%=img/%)
GEN.img	=
ALL.img = $(SRC.img) $(GEN.img)

SRC_doc	= \
	EnDe.man.html \
	EnDe.man.txt \
	EnDe.bug.txt \
	EnDe.changes.txt \
	EnDeRE.man.txt \
	EnDe.TS.html \
	EnDeSamp.xml \
	EnDe.FAQ.txt \
	EnDe.code.txt \
	EnDe.survey.txt \
	license.txt \
	gpl-license.txt \
	EnDe.odg
SRC.doc	= $(SRC_doc)
GEN.doc	= EnDeFunc.html EnDeFunc.xml
ALL.doc = $(SRC.doc) $(GEN.doc)

GEN.SID = EnDeSIDs.js

DIR.bin	= bin
SRC_bin	= \
	csv2xml.pl \
	EnDe2js.pl \
	tags.awk
csv2xml	= bin/csv2xml.pl
ende2js	= bin/EnDe2js.pl
ende2html=bin/EnDe2html.pl
ende2txt= bin/EnDe2txt.pl
ende2xml= bin/EnDe2xml.pl
SRC.bin	= $(SRC_bin:%=$(DIR.bin)/%)
GEN.bin	= $(ende2html) $(ende2js) $(ende2txt) $(ende2xml)
ALL.bin = $(SRC.bin) $(GEN.bin)

SRC.rel	= $(PROJECT).rel

# -----------------------------------------------------------3'rd party sources
SRC_3rd	= \
	aes.html \
	md4.js \
	md5.js \
	rmd160.html \
	sha1.js \
	sha2.js \
	sha512.js \
	modsecurity-core-rules_2.0.tar.gz \
	CoreRules2Html.jar \
	JsDecoder.html \
	JsDecoder.js \
	JsColorizer.js \
	JSReg.js-3.6.6.1 \
	JSReg.js-3.8.0.12 \
	OWASP-ValidationRegexRepository.xml \
	h4k.in-encoding.html
SRC.3rd	= $(SRC_3rd:%=3rd/%)
ALL.3rd = $(SRC.3rd)

# ----------------------------------------------- packer for JavaScript sources
pack.dir	= $(bin.bin)

# all packers, last one wins
pack.use	= yui
pack.use	= packer

# all packer options, last one wins
pack.packer.OPT	= -e62
pack.packer.OPT	= -e10
pack.packer.OPT	= -e0
pack.packer.OPTo= -o
pack.packer.DIR	= $(pack.dir)/packer
pack.packer.BIN	= perl -I$(pack.packer.DIR) $(pack.packer.DIR)/jsPacker.pl $(pack.packer.OPT) -i 

pack.yui.DIR	= $(pack.dir)/yuicompressor/build
pack.yui.OPT	= --line-break 4242 
pack.yui.OPTo	=
pack.yui.BIN	= java -jar $(pack.yui.DIR)/yuicompressor-2.2.4.jar $(pack.yui.OPT)

pack.OPT	= $(pack.$(pack.use).OPT)
pack.OPTo	= $(pack.$(pack.use).OPTo)
pack.BIN	= $(pack.$(pack.use).BIN)

# not part of this project, just that we don't forget about it
SRC_pl	= jsPacker.pl Pack.pm ParseMaster.pm
SRC.pl	= $(SRC_pl:%=bin/packer/%)

# for EnDe's tree structure see "tree structure" below
SRC_tree= \
	tree-EnDeGUI.js.sed \
	tree-EnDe.html.sed \
	tree-EnDe.man.html.sed \
	tree-EnDe.man.txt.sed \
	tree-EnDeREGUI.js.sed \
	tree-index.html.sed \
	tree-Makefile.sed
SRC.tree= $(SRC_tree:%=$(DIR.bin)/%)

# -------------------------------------------------------------- summary macros
SCCS.SRC= $(SRC.lib) $(SRC.gui) $(SRC.src) $(SRC.html) $(SRC.tst) $(SRC.doc) $(SRC.bin) $(SRC.tree) Makefile .htaccess-sample
#SCCS.SRC += $(SRC.img)
GEN.ALL = $(GEN.lib) $(GEN.gui) $(GEN.src) $(GEN.html) $(GEN.tst) $(GEN.doc) $(GEN.SID)
TAG.src = $(SRC.lib) $(SRC.gui) $(SRC.html)
EnDe.SRC= $(SCCS.SRC) $(GEN.ALL) $(SRC.img) $(SRC.3rd) $(othergui)
# SCCS_SRC used in makefile.inc
SCCS_SRC= $(SCCS.SRC)

# -------------------------------------------------------------- default target
ECHO	= /bin/echo
LINE	= ========================================
default::
	@$(ECHO) -e "Targets herein:\n\
$(LINE)\n\
    doc          - show project documentation	\n\
    tar          - generate $(Project).tgz	\n\
    lib          - generate $(Project).lib.tgz	\n\
    tst          - generate $(Project).tst.tgz	\n\
    tree         - try to convert plain structure into a directory structure	\n\
    tree.doc     - show documentation about directory structure	for tree target	\n\
    dirs.doc     - show required and/or used directories 	\n\
    index.html   - generate index.html with license from EnDe.html	\n\
    $(SRC.rel)     - generate release file (simple version)	\n\
    release      - generate release file (simple version)	\n\
    debian       - generate debian-style $(debian-deb) file	\n\
    clear.gen    - remove all generated files	\n\
    clean        - alias for clear.gen	\n\
    gen.xml      - generate all .xml files	\n\
    gen.html     - generate all .html files	\n\
    gen.js       - generate all .js files: $(GEN.lib)	\n\
    gen.lib      - generate all files for $(Project).lib.tgz: $(GEN.lib)	\n\
    gen.html     - generate all files for $(Project).lib.tgz: $(GEN.lib)	\n\
    gen.gui      - generate all files necessary for GUI: $(GEN.gui)	\n\
    gen.txt      - same as gen.gui	\n\
    gen.xml      - generate all .xml files: $(GEN.src)	\n\
    gen.all      - generate all files necessary for EnDe: $(GEN.ALL)	\n\
    gen.tar      - generate $(Project).lib.tgz and $(Project).tgz	\n\
    tags         - generate tags file from $(TAG.src)	\n\
    tags-simple  - generate tags file using simple match	\n\
    docs         - list documentation files	\n\
"
# -------------------------------------------------------------------------- doc
doc::
	@$(ECHO) -e "\n\
 Targets:\n\
 $(LINE)\n\
  for project maintanance and building files please use 'make' \n\
\n\
 Directories:\n\
 $(LINE)\
"
	@make -i -s dirs.doc
	@$(ECHO) -e "\n\
 Documentation:\n\
 $(LINE)\n\
  Complete user documentation found in EnDe.man.txt \n\
  FAQ for users found in EnDe.FAQ.txt , all documentation files: \
"
	@make -i -s docs
	@$(ECHO) -e "\n\
 Documentation of Generated Files:\n\
 $(LINE)\n\
`echo $(GEN.ALL)| tr -s ' ' '\012' | sed -e 's/^/    /'` \
\n\n\
 Generated tarballs:\n\
 $(LINE)\n\
    $(PROJECT).tgz \n\
    $(PROJECT).lib.tgz \n\
    $(PROJECT).tst.tgz \n\
"

docs::
	@echo $(SRC.doc)| tr -s ' ' '\012' | sed -e 's/^/    /'

dirs: dirs.doc
dirs.doc::
	@$(ECHO) -e "\
    bin     - tools used for build and maintainance	\n\
    img     - pictures and icons used in GUI	\n\
    usr     - files modified by user (should be empty at development)	\n\
    3rd     - original 3'rd party files	\
"

# tree.doc:   -see below-

# -------------------------------------------------------------- internal tools
# dummys to avoid SCCS get
$(SRC.src)::
$(SRC.bin)::
	@echo "#nix $@"
# above dummy target to avoid "Circular ... dependency dropped."

# following may produces:
#	make: Circular bin/EnDe2js.pl <- bin/EnDe2js.pl dependency dropped.
# which can be silently ignored
# other possible workaround/fix: rename EnDe2js.pl to not match the target
bin/EnDe2%: $(ende2js)
	ln -s EnDe2js.pl $@

# a PHONY target to avoid sccs GET
bin/tags.awk::
# we use perl's sort as most unix's sort are too stupid for dictionary order
tags: tags-perl
tags-simple: tags-perl-simple
# lazy approach to generate tags file
tags-sort: $(TAG.src)
	(bin/tags.awk                         $(TAG.src); ctags --fields=+n -f - $(TAG.src)) | sort > tags
tags-perl: $(TAG.src)
	(bin/tags.awk -v lineno=1             $(TAG.src); ctags --fields=+n -f - $(TAG.src)) | perl -le 'print sort <>' > tags
tags-perl-simple: $(TAG.src)
	(bin/tags.awk -v lineno=1 -v simple=1 $(TAG.src); ctags --fields=+n -f - $(TAG.src)) | perl -le 'print sort <>' > tags

# ------------------------------------------------------------- generated files
# generated files with list of all function definitions

gen.func::
	echo "## "$(gen.func)
	@$(gen.func)          -nofoot aes.js \
		      -nohead -nofoot blowfish.js \
		      -nohead -nofoot crc.js \
		      -nohead -nofoot md4.js \
		      -nohead -nofoot md5.js \
		      -nohead -nofoot rmd.js \
		      -nohead -nofoot sha.js \
		      -nohead -nofoot sha512.js \
		      -nohead -nofoot EnDeB64.js \
		      -nohead -nofoot EnDeIP.js \
		      -nohead -nofoot EnDeTS.js \
		      -nohead -nofoot EnDeHTTP.js \
		      -nohead         EnDe.js  > $(gen.file)

EnDeFunc.html:: $(ende2html) $(SRC.func) Makefile
	@$(MAKE) -s gen.func=$(ende2html) -s gen.file=$@ gen.func

EnDeFunc.js:: $(ende2js) $(SRC.func) Makefile
	@$(MAKE) -s gen.func=$(ende2js) -s gen.file=$@ gen.func

EnDeFunc.txt:: $(ende2txt) $(SRC.func) Makefile
	@$(MAKE) -s gen.func=$(ende2txt) -s gen.file=$@ gen.func

EnDeFunc.xml:: $(ende2xml) $(SRC.func) Makefile
	@$(MAKE) -s gen.func=$(ende2xml) -s gen.file=$@ gen.func

# convert tabular data to xml
$(GEN.SQL): $(SRC.SQL)
	$(csv2xml) $< > $@

# convert OWASP's xml keys to EnDe keys
$(GEN.REX): $(SRC.REX)
	( sed -e 's/regex>/attack><label>OWASP Validation Regex<\/label>/g' -e 's/<pattern>/<code>/g' -e 's/<\/pattern>/<\/code>/g' -e 's/description>/desc>/g' $< | sed -e '/<?xml/s/>/ encoding="utf-8"><xss>/' ; echo '</xss>') > $@
# //ToDo: need to ensure that it is a UTF-8 file

poor-mans-release--if-we-have-no-SCCS: release
# if we have no SCCS, try a simple solution
# NOTE that it misses entries for all files without a proper '@(#)' tag
# it may also contain duplicate and/or illegal entries
release: $(SRC.rel)
$(SRC.rel): $(SCCS_SRC)
	@(\
	  echo "# $(PROJECT) release file version "`sed -ne "/VERSION/ s/.*'\(.*\)'.*/\1/p" EnDeVersion.js`; \
	  echo "# created at " `date`  by Makefile 3.37; \
	  echo "#"; \
	  echo "# filename                       SID"; \
	  echo "# ------------------------------+-----------"; \
	  perl -ne 'printf("%-33s%s\n",$$1,$$2) if m/(?:\s+|content=")@\(#\)\s*([^ ]*)\s*([^ ]*)/;' $(SCCS_SRC) ; \
	) > $@

$(GEN.SID): $(SCCS_SRC)
	@(\
	  echo ""; \
	  echo "EnDeGUI.SIDs = {"; \
	  perl -ne 'printf("  \"%s\" : \"%s\",\n",$$1,$$2) if m/(?:\s+|content=")@\(#\)\s*([^ ]*)\s*([^ ]*)/;' $(SCCS_SRC) ; \
	  echo ''; \
	  echo '  "SID" : "EnDeGUI.SIDs generated by Makefile 3.37 : make $@"\n};'; \
	) > $@

# -------------------------------------------------------------- tree structure
tree.doc::
	@$(ECHO) -e "Notes about (directory) tree structure:\n\
$(LINE)\n\
 Starting with EnDe 1.0 all files belonging to the project can be organised in	\n\
 (sub) directories using the  'tree'  target. The directories are:	\
"
	@make -i -s dirs.doc
	@$(ECHO) -e "\
    lib     - all files need for the core en-/decoding functionality	\n\
    gui     - all files building the browser GUI	\n\
    doc     - all documentation (lib and GUI)	\n\
    src     - 3'rd party files used in GUI	\n\
\n\
 NOTES (some require ugly workarounds ..)	\n\
    - img/  makes some trouble. Using  gui/img/  instead would require	\n\
      src='../gui/img/ ....'  in some files.	\n\
      Using  img/  requires  src='../img ...'  in most files but	\n\
      src='img/...'  in  index.html. Ugly ..	\n\
\n\
    - some links in doc/EnDe.man.txt require a path like '../gui/'.	\n\
    - doc/EnDe.man.html requires to include src='../gui/*.js' to work.	\n\
    - doc/EnDe.man.html requires http:../EnDe.lib.tgz (or similar).	\n\
    - doc/EnDe.man.html requires http:../tst/EnDeCheck.test.htm .	\n\
    - doc/EnDe.man.html requires http:EnDe.man.html?forcetxt&../gui/EnDeMenu.txt \n\
    - doc/EnDe.man.html requires https://github.com/EnDe/EnDe/doc/license.txt .	\n\
    - lib/EnDe.js EnDe.initMaps() needs to read 'EnDeMaps.txt' if used in library \n\
      but needs to read 'lib/EnDeMaps.txt' if used in GUI. Very, very ugly ..	\n\
    - gui/EnDeREGUI.js EnDeRE.initHLP() needs to read '../gui/EnDeMenu.txt'	\n\
"

tree    = $(PROJECT)
DIR.tree= $(PROJECT)

TSRC_sed= \
	EnDe.man.html \
	EnDe.man.txt \
	EnDeREGUI.js \
	EnDeGUI.js \
	index.html \
	Makefile
TGEN.sed= $(TSRC_sed:%=$(DIR.tree)/%)

TDIR.doc= $(ALL.doc:%=$(DIR.tree)/doc/%)
TDIR.gui= $(ALL.gui:%=$(DIR.tree)/gui/%)
TDIR.lib= $(ALL.lib:%=$(DIR.tree)/lib/%)
TDIR.src= $(ALL.src:%=$(DIR.tree)/src/%)
TDIR.tst= $(ALL.tst:%=$(DIR.tree)/tst/%)
TDIR.GEN= $(GEN.lib:%=$(DIR.tree)/doc/%)
TDIR.3rd= $(ALL.3rd:%=$(DIR.tree)/gui/%)
TDIR.img= $(DIR.tree)/gui/img
TDIR.usr= $(DIR.tree)/usr
TDIR.bin= $(DIR.bin:%=$(DIR.tree)/bin)
# ...bin is special 'cause ALL.bin still contains bin/

TREE-mv	= cp -r

$(DIR.tree)::
	@echo "#: "$@
	@-mkdir  $@

tree-init::
	@echo "#: conversion to tree structure: "$(tree)/
	@rm -rf $(DIR.tree)
	@mkdir  $(DIR.tree)
	@mkdir  $(DIR.tree)/bin
	@mkdir  $(DIR.tree)/doc
	@mkdir  $(DIR.tree)/gui
	@mkdir  $(DIR.tree)/lib
	@mkdir  $(DIR.tree)/src
	@mkdir  $(DIR.tree)/tst
	@mkdir  $(DIR.tree)/usr
	@-mkdir  $(DIR.tree)/$(DIR.tree)
# last mkdir above is quick&dirty hack for $(DIR.tree)/% rule below
# tree-final needs to remove it again

tree-final::
	@mv -f $(DIR.tree)/EnDe.man.html $(DIR.tree)/doc/
	@mv -f $(DIR.tree)/EnDe.man.txt  $(DIR.tree)/doc/
	@mv -f $(DIR.tree)/EnDeREGUI.js  $(DIR.tree)/gui/
	@mv -f $(DIR.tree)/EnDeGUI.js    $(DIR.tree)/gui/
	@-rm -rf $(DIR.tree)/$(DIR.tree)
	@echo ""
	@echo "\
 Conversion to tree structure done.\
 You can now move the generated ./$(DIR.tree) directory to any other \
 place and point your browser to  $(DIR.tree)/index.html  \
"
	@echo ""

$(DIR.tree)/bin::
	@$(TREE-mv) bin $@
$(DIR.tree)/gui/img::
	@$(TREE-mv) img $@
$(DIR.tree)/usr::
	@$(TREE-mv) usr $@
$(DIR.tree)/.htaccess-sample::
	@$(TREE-mv) .htaccess-sample $@
$(DIR.tree)/doc/%: %
	@$(TREE-mv) $< $@
$(DIR.tree)/gui/%: %
	@$(TREE-mv) $< $@
$(DIR.tree)/lib/%: %
	@$(TREE-mv) $< $@
$(DIR.tree)/src/%: %
	@$(TREE-mv) $< $@
$(DIR.tree)/tst/%: %
	@$(TREE-mv) $< $@
$(DIR.tree)/%: %
	@sed -f $(DIR.bin)/tree-$*.sed $< > $@

# note that sequence of dependency in tree target is important
tree:: tree-init $(TDIR.usr) $(TDIR.img) $(TGEN.sed) $(TDIR.doc) $(TDIR.gui) $(TDIR.lib) $(TDIR.GEN) $(GEN.src) $(GEN.tst) $(TDIR.bin) $(DIR.tree)/.htaccess-sample $(DIR.tree)/Makefile tree-final

# --------------------------------------------------------------------- targets
# some timing issues with generated files, hence $(GEN.ALL) missing as dependency
$(PROJECT).tgz: $(EnDe.SRC) ./usr
	tar zcf $@ $(EnDe.SRC) ./usr
tar: $(PROJECT).tgz
tgz: tar
$(PROJECT).lib.tgz: $(ALL.lib)
	tar zcf $@ $(ALL.lib)
lib: $(PROJECT).lib.tgz

# --------------------------------------------------------------- debian package
debian-tmp	= D.tmp
debian-package	= owasp-wte-ende
debian-version	= $(shell awk -F"'" '/VERSION/{print $$2}' EnDeVersion.js)
debian-chef     = Matt Tesauro <matt.tesauro@owasp.org>
debian-arch	= all
debian-dir	= opt/owasp/ende
debian-control	= $(debian-tmp)/DEBIAN/control
debian-deb	= $(debian-package)-$(debian-version)-1_$(debian-arch).deb
debian: $(PROJECT).tgz
	@mkdir -p $(debian-tmp)
	@mkdir -p $(debian-tmp)/DEBIAN
	@mkdir -p $(debian-tmp)/$(debian-dir)
	@(\
	  echo "Package: $(debian-package)";\
	  echo 'Section: misc';\
	  echo 'Priority: extra';\
	  echo "Maintainer: $(debian-chef)";\
	  echo "Architecture: $(debian-arch)";\
	  echo "Version: $(debian-version)";\
	  echo 'Depends: firefox';\
	  echo 'Description: EnDe - Encoder, Decoder, Converter, Calculator, TU WAS DU WILLST ..';\
	  echo ' for various codings used in the wild wide web'\
	) > $(debian-control)
	@cd $(debian-tmp)/$(debian-dir) && tar zxf ../../../../$(PROJECT).tgz
	@cd $(debian-tmp) && dpkg --build . ../$(debian-deb)
	@rm -rf $(debian-tmp)
dpkg: debian

# ------------------------------------------------------------------- generation
gen.js:   $(GEN.lib) $(GEN.SID)
gen.lib:  $(GEN.lib)
gen.html: $(GEN.lib)
gen.gui:  $(GEN.gui) $(GEN.SID)
gen.txt:  $(GEN.gui)
gen.xml:  $(GEN.src)
gen.all:  $(GEN.ALL)
gen.tar:  lib tar
gen.deb:  debian
gen.tree: tree

# --------------------------------------------------------------------- ckean-up
clear.gen:: 
	rm $(GEN.ALL)
clean.gen: clear.gen
clear.%:: 
	rm $(GEN.$*)
# note that we only have one clrar.* target for now
clean:: clear.gen

# ----------------------------------------------------------------- installation
# index.html for distribution with license.txt
index.html: EnDe.html license.txt Makefile
	@perl -le 'undef $$\;open(C,"license.txt");@c=<C>;close(C);open(E,$$ARGV[0]);while(<E>){if(m/^<html>/){print "<!--\n",@c,"-->\n";} print;}' $< > $@
# above target cannot be written with \-escaped pretty printed lines in
# a here document 'cause some make on modern systems (like Ubuntu 10.x)
# will complain with a perl syntax error. Grrr :-(

# ------------------------------------------------------------------------- misc
# hack for SCCS/CSSC (works mainly on authors system:)
# if we don't have  `include /c/bin/makefile.inc'   but want a release file
sccs = sc
rel: $(SCCS_SRC)
	$(sccs) release $(SCCS_SRC)

