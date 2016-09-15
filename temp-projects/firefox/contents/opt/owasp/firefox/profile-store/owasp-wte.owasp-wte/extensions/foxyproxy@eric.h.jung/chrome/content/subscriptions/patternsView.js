/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

"use strict";

function onLoad() {
  var patternsViewTree = document.getElementById("patternsViewTree");
  var patterns = window.arguments[0].inn.patterns;
  patternsViewTree.view = makePatternsViewTree(patterns);
}

function makePatternsViewTree(patterns) {
  return {
    rowCount : patterns.length,
    getCellText : function(row, column) {
      return getTextForCell(patterns[row], column.id ? column.id : column);
    },
    setCellValue: function(row, col, val) {patterns[row].enabled = val;},
    getCellValue: function(row, col) {return patterns[row].enabled;},
    isSeparator: function(aIndex) {return false;},
    isSorted: function() {return false;},
    isEditable: function(row, col) {return false;},
    isContainer: function(aIndex) {return false;},
    setTree: function(aTree){},
    getImageSrc: function(aRow, aColumn) {return null;},
    getProgressMode: function(aRow, aColumn) {},
    cycleHeader: function(aColId, aElt) {},
    getRowProperties: function(aRow, aColumn, aProperty) {},
    getColumnProperties: function(aColumn, aColumnElement, aProperty) {},
    getCellProperties: function(aRow, aProperty) {},
    getLevel: function(row){return 0;}
  };
}

function getTextForCell(pat, col) {
  var foxyproxy = Components.classes["@leahscape.org/foxyproxy/service;1"].
    getService().wrappedJSObject;
  switch (col) {
    case "name" : return pat.name;
    case "pattern" : return pat.pattern;
    case "isRegEx" : return foxyproxy.getMessage(pat.isRegEx ?
                            "foxyproxy.regex.label" :
                            "foxyproxy.wildcard.label");
    case "isBlackList" : return foxyproxy.getMessage(pat.blackList ?
                                "foxyproxy.blacklist.label" :
                                "foxyproxy.whitelist.label");
  };
}
