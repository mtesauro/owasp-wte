<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  version="1.0"
  >
  <xsl:output method="html"/> 
 
  <xsl:template match="/report">
<html>
<head>
<title>Paros Latset Scanning Report</title>

</head>

<body text="#000000">
<p><strong>Paros Latest Scanning Report</strong></p>

<p>
<xsl:apply-templates select="text()"/>
</p>
<p><strong>Summary of Alerts</strong></p>
<table width="45%" border="0">
  <tr bgcolor="#666666"> 
    <td width="45%" height="24"><strong><font color="#FFFFFF" size="2" face="Arial, Helvetica, sans-serif">Risk 
      Level</font></strong></td>
    <td width="55%" align="center"><strong><font color="#FFFFFF" size="2" face="Arial, Helvetica, sans-serif">Number 
      of Alerts</font></strong></td>
  </tr>
  <tr bgcolor="#e8e8e8"> 
    <td><font size="2" face="Arial, Helvetica, sans-serif"><a href="#high">High</a></font></td>
    <td align="center"><font size="2" face="Arial, Helvetica, sans-serif">
    <xsl:value-of select="count(/report/alertitem[riskcode='3'])"/>
    </font></td>
  </tr>
  <tr bgcolor="#e8e8e8"> 
    <td><font size="2" face="Arial, Helvetica, sans-serif"><a href="#medium">Medium</a></font></td>
    <td align="center"><font size="2" face="Arial, Helvetica, sans-serif">
    <xsl:value-of select="count(/report/alertitem[riskcode='2'])"/>
    </font></td>
  </tr>
    <tr bgcolor="#e8e8e8"> 
    <td><font size="2" face="Arial, Helvetica, sans-serif"><a href="#low">Low</a></font></td>
    <td align="center"><font size="2" face="Arial, Helvetica, sans-serif">
    <xsl:value-of select="count(/report/alertitem[riskcode='1'])"/>
    </font></td>
  </tr>
    <tr bgcolor="#e8e8e8"> 
    <td><font size="2" face="Arial, Helvetica, sans-serif"><a href="#info">Informational</a></font></td>
    <td align="center"><font size="2" face="Arial, Helvetica, sans-serif">
    <xsl:value-of select="count(/report/alertitem[riskcode='0'])"/>
    </font></td>
  </tr>
</table>
<p></p>
<p><strong>Alert Detail</strong></p>


<xsl:apply-templates select="alertitem">
  <xsl:sort order="descending" data-type="number" select="riskcode"/>
  <xsl:sort order="descending" data-type="number" select="reliability"/>
</xsl:apply-templates>
</body>
</html>
</xsl:template>

  <!-- Top Level Heading -->
  <xsl:template match="alertitem">
<table width="100%" border="0">
<xsl:apply-templates select="text()|alert|desc|uri|param|otherinfo|solution|reference|p|br"/>
</table>
  </xsl:template>

  <xsl:template match="alert[following::riskcode='3']">
  <tr bgcolor="red">	
    <td width="20%" valign="top"><strong><font color="#FFFFFF" size="2" face="Arial, Helvetica, sans-serif">
    <a name="high"/>
    <xsl:value-of select="following::riskdesc"/>
    </font></strong></td>
    <td width="80%"><strong><font color="#FFFFFF" size="2" face="Arial, Helvetica, sans-serif">
      <xsl:apply-templates select="text()"/>
</font></strong></td>
  </tr>
  </xsl:template>

  <xsl:template match="alert[following::riskcode='2']">
  <tr bgcolor="yellow">	
    <td width="20%" valign="top"><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif">
    <a name="medium"/>
    <xsl:value-of select="following::riskdesc"/>
	</font></strong></td>
    <td width="80%"><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif">
      <xsl:apply-templates select="text()"/>
</font></strong></td>
  </tr>

  </xsl:template>
  <xsl:template match="alert[following::riskcode='1']">
  <tr bgcolor="green">
    <a name="low"/>
    <td width="20%" valign="top"><strong><font color="#FFFFFF" size="2" face="Arial, Helvetica, sans-serif">
    <xsl:value-of select="following::riskdesc"/>
	</font></strong></td>
    <td width="80%"><strong><font color="#FFFFFF" size="2" face="Arial, Helvetica, sans-serif">
      <xsl:apply-templates select="text()"/>
</font></strong></td>
  </tr>
  </xsl:template>
  
  <xsl:template match="alert[following::riskcode='0']">
  <tr bgcolor="blue">	
    <td width="20%" valign="top"><strong><font color="#FFFFFF" size="2" face="Arial, Helvetica, sans-serif">
    <a name="info"/>
    <xsl:value-of select="following::riskdesc"/>
	</font></strong></td>
    <td width="80%"><strong><font color="#FFFFFF" size="2" face="Arial, Helvetica, sans-serif">
      <xsl:apply-templates select="text()"/>
</font></strong></td>
  </tr>
  </xsl:template>


<!--
  <xsl:template match="riskdesc">
  <tr valign="top"> 
    <td width="20%"><font size="2" face="Arial, Helvetica, sans-serif">Risk</font></td>
    <td width="20%"><font size="2" face="Arial, Helvetica, sans-serif">
    <p>
    <xsl:apply-templates select="text()|*"/>
    </p>
    </font></td>
  </tr>
  </xsl:template>
-->

  <xsl:template match="desc">
  <tr bgcolor="#e8e8e8" valign="top"> 
    <td width="20%"><font size="2" face="Arial, Helvetica, sans-serif">Description</font></td>
    <td width="80%">
   	<p align="justify">
    <font size="2" face="Arial, Helvetica, sans-serif">
    <xsl:apply-templates select="text()|*"/>
    </font></p></td>
  </tr>
  </xsl:template>

  <xsl:template match="uri">
  <tr bgcolor="#e8e8e8" valign="top"> 
    <td width="20%"><font size="2" face="Arial, Helvetica, sans-serif">URL</font></td>
    <td width="80%">
    <p align="justify">
    <font size="2" face="Arial, Helvetica, sans-serif">
    <xsl:apply-templates select="text()|*"/>
    </font></p></td>
  </tr>
  </xsl:template>

  <xsl:template match="param">
  <tr bgcolor="#e8e8e8" valign="top"> 
    <td width="20%"><font size="2" face="Arial, Helvetica, sans-serif">Parameter</font></td>
    <td width="80%">
    <p align="justify">
    <font size="2" face="Arial, Helvetica, sans-serif">
	<xsl:apply-templates select="text()|*"/>
    </font></p></td>
  </tr>
  </xsl:template>

  <xsl:template match="otherinfo">
  <tr bgcolor="#e8e8e8" valign="top"> 
    <td width="20%"><font size="2" face="Arial, Helvetica, sans-serif">Other information</font></td>
    <td width="80%">
    <p align="justify">
    <font size="2" face="Arial, Helvetica, sans-serif">
	<xsl:apply-templates select="text()|*"/>
    </font></p></td>
  </tr>
  </xsl:template>

  <xsl:template match="solution">
  <tr bgcolor="#e8e8e8" valign="top"> 
    <td width="20%"><font size="2" face="Arial, Helvetica, sans-serif">Solution</font></td>
    <td width="80%">
    <p align="justify">
    <font size="2" face="Arial, Helvetica, sans-serif">
	<xsl:apply-templates select="text()|*"/>
	</font></p></td>
  </tr>
  </xsl:template>

  <xsl:template match="reference">
  <tr bgcolor="#e8e8e8" valign="top"> 
    <td width="20%"><font size="2" face="Arial, Helvetica, sans-serif">Reference</font></td>
    <td width="80%">
    <p align="justify">
    <font size="2" face="Arial, Helvetica, sans-serif">
	<xsl:apply-templates select="text()|*"/>
    </font></p></td>
  </tr>
  </xsl:template>
  
  <xsl:template match="p">
  <p>
  <xsl:apply-templates select="text()|*"/>
  </p>
  </xsl:template> 

  <xsl:template match="br">
  <br/>
  <xsl:apply-templates/>
  </xsl:template> 

</xsl:stylesheet>