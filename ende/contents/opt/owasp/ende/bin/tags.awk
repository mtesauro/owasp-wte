#! /usr/bin/gawk -f
# vi:  ts=4:
# vim: ts=4:
#?
#? NAME
#?      $0 - generate tags file for vi from JavaScript sources
#?
#? SYNOPSIS
#?      gawk -f $0 [options] file file ...
#?      $0 [options] file file ...
#?
#? DESCRIPTION
#?      Extracts function and variable definitions for tags file.
#?
#? OPTIONS
#?      lineno=1        - print current line number as "kind" flag
#?      simple=1        - strip line starting left to first (
#?
#? SEE ALSO
#?      ctags(1)
#?
#? LIMITATIONS
#?      gawk mandatory, does not work with traditional AT&T awk.
#?
#? VERSION
#?      @(#) tags.awk 3.2 10/12/19 09:22:03
#?
#? AUTHOR
#?      30-may-09 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
# =========================================================================
($1 ~ /^\//)  {next;}           # ignore comment lines
($1 ~ /^#\?/) {next;}           # ignore special comment lines
#/= *(new *)*function/{
(($0 ~ /= *(new *)*function/)||($0 ~ /this\.[a-zA-Z0-9_]* *=/)){
	# we expect lines like:
	#   this.name=function(foo,bar) {
	#   this.zz = function(foo,bar) {
	lno = "";
	art = "f";
	lin = $0;
	len = split($1, arr, /\./);
	nam = arr[len];
	idx = index(nam,"=") - 1;   # handle missing spaces around =
	if (idx > 0) { nam = substr(nam,0,idx); }
	idx = index(nam,"{") - 1;   # remove anything behind first {
	if (idx > 0) { nam = substr(nam,0,idx); }
	idx = index(lin,"(");       # simple match: remove anything behind first (
	if ((idx > 0) && (simple == 1)) { lin = substr(lin,0,idx);}
	lin = gensub("[.*?|[]","\\\\&","g",lin);  # escape regex meta chars
	#      most vi implementations do not need these escapes
	if (lineno == 1) { lno = sprintf("\tline:%s", FNR); }
	if ($0 !~ /function/) { art = "a"; }
	printf("%s\t%s\t/^%s/;\"\t%s%s\n",nam,FILENAME,lin,art,lno)
	next;
}
