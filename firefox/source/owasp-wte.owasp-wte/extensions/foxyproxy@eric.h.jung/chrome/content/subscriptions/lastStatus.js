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
  var errorMessages = [], status, i, treeChildren = [];
  status = window.arguments[0].inn.status;
  if (window.arguments[0].inn.errorMessages) {
    errorMessages = window.arguments[0].inn.errorMessages;
  }
  // Preparing the treeChildren to simplify the logic needed in the view 
  // itself.
  treeChildren.push(status);
  if (errorMessages) {
    treeChildren.push("");
    for (i = 0; i < errorMessages.length; i++) {
      treeChildren.push(errorMessages[i].replace(/\n/g, " "));
    }
  }
  var statusTree = document.getElementById("lastStatusTree");
  statusTree.view = {
    get rowCount() {
      if (errorMessages.length === 0) {
        return 1;
      } else {
        // One additional line for the status message and one is an empty line
        // that separates the status message from the error messages.
        return errorMessages.length + 2;
      }
    },
    getCellText : function(row,column){
      return treeChildren[row];
    },
    setTree: function(treebox){},
    getColumnProperties: function(col, elem, prop){},
    isSorted: function(){},
    isContainer: function(index){return false},
    isSeparator: function(index){return false},
    getRowProperties: function(index, prop){},
    getCellProperties: function(row, col, prop){},
    getImageSrc: function(row, col){},
    cycleHeader: function(col){}
  };
}

function copyLastStatus() {
  var clipboardString = "";
  var statusTree = document.getElementById("lastStatusTree");
  var treeRows = statusTree.view.rowCount;
  for (var i = 0; i < treeRows; i++) {
    // We have just one column, thus getting the first is sufficient here.
    clipboardString += statusTree.view.getCellText(i, statusTree.columns.
      getFirstColumn());
    // We want to have an empty line if we have error messages. But only one
    // after the general status message (timestamp and status).
    if (i === 0 && i+1 !== treeRows) {
      clipboardString += "\n\n";
    }
  }
  Components.classes["@mozilla.org/widget/clipboardhelper;1"].
    getService(Components.interfaces.nsIClipboardHelper).
    copyString(clipboardString);
}

function onOK() {
  return;
}
