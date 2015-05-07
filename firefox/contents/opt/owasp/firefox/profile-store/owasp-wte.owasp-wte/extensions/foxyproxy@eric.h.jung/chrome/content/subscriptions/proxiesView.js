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
  var proxiesViewTree = document.getElementById("proxiesViewTree");
  var proxies = window.arguments[0].inn.proxies;
  proxiesViewTree.view = makeProxiesViewTree(proxies);
}

function makeProxiesViewTree(proxies) {
  return {
    rowCount : proxies.length,
    getCellText : function(row, column) {
      return getTextForCell(proxies[row], column.id ? column.id : column);
    },
    setCellValue: function(row, col, val) {proxies[row].enabled = val;},
    getCellValue: function(row, col) {return proxies[row].enabled;},
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

function getTextForCell(proxy, col) {
  switch (col) {
    case "ip" : return proxy.ip;
    case "port" : return proxy.port;
  };
}
