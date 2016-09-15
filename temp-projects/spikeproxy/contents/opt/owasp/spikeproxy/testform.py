#!/usr/bin/python

form="""
<form action="http://cnn.looksmart.com/r_search" method="get" name="seek_nav" onSubmit="return CNN_validateSearchForm(this)" style="margin: 0px;">
<input type="hidden" name="sites" value="cnn">
<input type="hidden" name="qp" value="">
<input type="hidden" name="comefrom" value="izch">

<input type="hidden" name="isp" value="zch">
<input type="hidden" name="key" value="">
<input type="hidden" name="search" value="0">
<div class="cnnNavText" style="color: #c00">SEARCH CNN.COM:<br clear="left"></div>
<table border="0" cellpadding="0" cellspacing="4">
	<tr>
		<td><input title="Enter text to search for and click 'GO'" type="text" name="qt" size="7" maxlength="40" class="cnnMenuText" style="width: 80px"></td>
		<td><input type="submit" value="GO" class="cnnNavButton"></td>
	</tr>
</table>


</td></form>


<form action="http://cnn.looksmart.com/r_search" method="get" name="seek_nav" onSubmit="return CNN_validateSearchForm(this)" style="margin: 0px;">
<input type="hidden" name="sites" value="cnn">
<input type="hidden" name="qp" value="">
<input type="hidden" name="comefrom" value="izch">

<input type="hidden" name="isp" value="zch">
<input type="hidden" name="key" value="">
<input type="hidden" name="search" value="0">
<div class="cnnNavText" style="color: #c00">SEARCH CNN.COM:<br clear="left"></div>
<table border="0" cellpadding="0" cellspacing="4">
	<tr>
		<td><input title="Enter text to search for and click 'GO'" type="text" name="qt" size="7" maxlength="40" class="cnnMenuText" style="width: 80px"></td>
		<td><input type="submit" value="GO" class="cnnNavButton"></td>
	</tr>
</table>


</td></form>
"""

import daveutil

print daveutil.daveFormParse(form)
