/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license, available in the LICENSE
  file at the root of this installation and also online at
  http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

"use strict";

var Ci = Components.interfaces, Cu = Components.utils, Cc = Components.classes;

var EXPORTED_SYMBOLS = ["patternSubscriptions", "proxySubscriptions"];

// Object.create() is only available starting with ECMAScript 5 but we want to
// use parts of its functionality already in earlier versions.
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
}

var subscriptions = {
  fp : null,
  fpc : null,

  // See: http://stackoverflow.com/questions/475074/regex-to-parse-or-validate-base64-data
  base64RegExp : /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/,

  subscriptionsTree : null,

  // We count here the amount of load failures during startup in order to
  // show a dialog with the proper amount in overlay.js
  failureOnStartup : 0,

  // We save subscriptions in this array which could only be loaded partially
  // after startup (or refresh) due to errors in the JSON. The idea is to show
  // the user a respective dialog (see: showPatternLoadFailures() in options.js)
  // asking her to refresh the corrupted subscription immediately.
  // (TODO: Change 'showPatternLoadFailures()' to something like
  // 'showSubscriptionLoadFailures()'.
  //partialLoadFailure : [],

  init: function() {
    this.fp = Cc["@leahscape.org/foxyproxy/service;1"].getService().
      wrappedJSObject;
    this.fpc = Cc["@leahscape.org/foxyproxy/common;1"].getService().
      wrappedJSObject;
    if (this.type === "pattern") {
      this.autoproxy.init();
    }
  },

  // TODO: Find a way to load the file efficiently using our XMLHttpRequest
  // method below...
  loadSavedSubscriptions: function(savedSubscriptionsFile) {
    try {
      var line = {};
      var i;
      var errorMessages;
      var hasmore;
      var loadedSubscription;
      var metaIdx;
      var parseString;
      var istream = Cc["@mozilla.org/network/file-input-stream;1"].
        createInstance(Ci.nsIFileInputStream);
      // -1 has the same effect as 0664.
      istream.init(savedSubscriptionsFile, 0x01, -1, 0);
      var conStream = Cc["@mozilla.org/intl/converter-input-stream;1"].
        createInstance(Ci.nsIConverterInputStream);
      conStream.init(istream, "UTF-8", 0, 0);
      conStream.QueryInterface(Ci.nsIUnicharLineInputStream);
      do {
        // Every subscription should just get its related error messages,
        // therefore resetting errorMessages here.
	errorMessages = [];
        hasmore = conStream.readLine(line);
        // Proxy subscriptions are already saved into JSON even though they
        // are in a IP:Port format originally. Thus, we need no special method
        // if we load an already saved one.
        loadedSubscription = this.getObjectFromJSON(line.value, errorMessages);
	if (loadedSubscription && loadedSubscription.length === undefined) {
	  this.subscriptionsList.push(loadedSubscription);
	} else {
          // Parsing the whole subscription failed but maybe we can parse at
          // least the metadata to show the user the problematic subscription
          // in the subscriptionsTree. Thus, looking for "metadata" first.
          // If we do not find it (because the problem occurred there) then
	  // obviously we are not able to display anything in the tree.
          metaIdx = line.value.indexOf('"metadata"');
          if (metaIdx > -1) {
            // As we cannot be sure that the JSON starts with "{"metadata""
            // (e.g. if the pattern subscription had not had one) we prepend one
            // "{" to our string to parse. We append one as well in order to be
            // sure that our metadata string is valid JSON regardless where
            // its position in the saved subscription is.
	    parseString = "{" + line.value.slice(metaIdx, line.value.
              indexOf("}", metaIdx) + 1) + "}";
            loadedSubscription = this.getObjectFromJSON(parseString,
              errorMessages);
	    if (loadedSubscription && loadedSubscription.length === undefined) {
              // At least we could parse the metadata. Now, we can show the
              // subscription in the tree after setting the last status
              // properly. Afterwards we ask the user if she wants to refresh
              // her subscription immediately in order to solve the issue
	      // with the corrupt subscription part.
	      errorMessages.push(this.fp.
                getMessage(this.type + "subscription.error.content",
                [loadedSubscription.metadata.name]));
	      loadedSubscription.metadata.lastStatus = this.fp.
                getMessage("error");
	      loadedSubscription.metadata.errorMessages = errorMessages;
	      this.subscriptionsList.push(loadedSubscription);
	      this.partialLoadFailure.push(loadedSubscription);
            } else {
	      this.failureOnStartup++;
            }
	  } else {
	    this.failureOnStartup++;
	  }
	}
      } while(hasmore);
      try {
        // We could not do this in the while loop above as every time the timer
        // needs to be refreshed the subscriptions are written to disk. Thus, if
        // that happens to the first loaded subscription there may occur a loss
        // of the other subscriptions as the subscriptions list would not be
        // populated with them yet.
        for (i = 0; i < this.subscriptionsList.length; i++) {
          if (this.subscriptionsList[i].metadata &&
              this.subscriptionsList[i].metadata.refresh != 0) {
            delete this.subscriptionsList[i].metadata.timer;
            this.setSubscriptionTimer(this.subscriptionsList[i], false, true);
	  }
        }
      } catch (ex) {
        dump("Error while resetting the " + this.type + "subscription timer: " +
          ex + "\n");
      }
      conStream.close();
    } catch (e) {
      dump("Error while loading the saved " + this.type + "subscriptions: " + e
        + "\n");
    }
  },

  loadSubscription: function(values, bBase64, callback) {
    try {
      var that = this;
      var errorMessages = [];
      var subscriptionText;
      var parsedSubscription;
      var subscriptionContent = null;
      var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].
        createInstance(Ci.nsIXMLHttpRequest);
      req.onload = function(aEvent) {
        subscriptionText = req.responseText;
        // Stripping of all unnecessary whitespaces and newlines etc. before
        // testing.
        let base64TestString = subscriptionText.replace(/\s*/g, '');
        let isBase64 = that.base64RegExp.test(base64TestString);
        if (isBase64) {
          // Decoding the Base64.
          subscriptionText = atob(base64TestString);
        }
        // TODO: A more fine grained error handling. I.e. 200 is okay but
        // (everything?) else errorMessages.push().
        callback(that.parseSubscription(subscriptionText, errorMessages,
          isBase64, bBase64), values);
      };
      req.onerror = function(aEvent) {
        if (req.status === 0) {
          // We did get nothing at all, not even response headers.
          errorMessages.push(that.fp.
            getMessage("patternsubscription.error.network.noresponse"));
        } else {
          // Showing the status to the user.
          errorMessages.push(that.fp.
            getMessage("patternsubscription.error.network.response", [req.
              statusText]));
        }
        callback(that.parseSubscription(req.responseText, errorMessages, null,
          null), values);
      }
      req.open("GET", values.url, true);
      if (this.type === "pattern") {
        // We do need the following line of code. Otherwise we would get
        // an error that our JSON is not well formed if we load it from a local
        // drive. See:
        // http://stackoverflow.com/questions/677902/not-well-formed-error-in-
        // firefox-when-loading-json-file-with-xmlhttprequest
        req.overrideMimeType("application/json");
      } else {
        // To avoid a syntax error in the Error Console...
        req.overrideMimeType("text/plain");
      }
      req.send(null);
      // No exceptions, returning false indicating there were no such errors.
      return false;
    } catch(e) {
      // We are reporting these errors back immediately.
      if (e.name === "NS_ERROR_FILE_NOT_FOUND") {
        // We do not discriminate between "patternsubscription.error.network"
        // and "proxysubscription.error.network" as the message is not dependent
        // on the subscription type.
        errorMessages.push(this.fp.
          getMessage("patternsubscription.error.network"));
        return errorMessages;
      } else {
        errorMessages.push(this.fp.
          getMessage(this.type + "subscription.error.network.unspecified"));
        return errorMessages;
      }
    }
  },

  base64Match: function(type, isBase64, userBase64, errorMessages,
    parsedSubscription) {
    if (isBase64 && !userBase64 && !this.fp.warnings.showWarningIfDesired(null,
        [type + "subscription.warning.base64"], type + "EncodingWarning",
        false)) {
      errorMessages.push(this.fp.
        getMessage(type + "subscription.error.cancel64"));
      return errorMessages;
    } else if (!isBase64 && userBase64 && !this.fp.warnings.
        showWarningIfDesired(null, [type + "subscription.warning.not.base64"],
        type + "EncodingWarning", false)) {
      errorMessages.push(this.fp.getMessage(type +
        "subscription.error.cancel64"));
      return errorMessages;
    } else {
      if (isBase64) {
        parsedSubscription.metadata.obfuscation = "Base64";
      } else {
        parsedSubscription.metadata.obfuscation = this.fp.getMessage("none");
      }
      return parsedSubscription;
    }
  },

  addSubscription: function(aSubscription, userValues) {
    var userValue, d, subLength;
    // We need this to respect the user's wishes concerning the name and other
    // metadata properties. If we would not do this the default values that
    // may be delivered with the subscription itself (i.e. its metadata) would
    // overwrite the users' choices.
    // We exclude obfuscation and format as these are already detected while
    // loading the subscription. The user may nevertheless change them later on
    // if she wants that but at least after the initial import these values are
    // correct.
    for (userValue in userValues) {
      if (userValue !== "obfuscation" && userValue !== "format") {
        aSubscription.metadata[userValue] = userValues[userValue];
      }
    }
    // If the name is empty take the URL.
    if (aSubscription.metadata.name === "") {
      aSubscription.metadata.name = aSubscription.metadata.url;
    }
    aSubscription.metadata.lastUpdate = this.fp.logg.format(Date.now());
    aSubscription.metadata.lastStatus = this.fp.getMessage("okay");
    aSubscription.metadata.errorMessages = null;
    if (aSubscription.metadata.refresh > 0) {
      this.setSubscriptionTimer(aSubscription, false, false);
    }
    this.subscriptionsList.push(aSubscription);
    this.fp.alert(null, this.fp.
      getMessage(this.type + "subscription.initial.import.success"));
    this.writeSubscriptions();
    // Importing patterns does not mean someone wants to get added them to a
    // proxy automatically. That does not hold for importing a proxy list.
    if (this.type === "proxy") {
      this.addProxies(aSubscription.proxies, userValues);
    }
  },

  editSubscription: function(aSubscription, userValues, index) {
    // TODO: What shall we do if the user changed the URL?
    var userValue;
    var oldRefresh = aSubscription.metadata.refresh;
    for (userValue in userValues) {
      aSubscription.metadata[userValue] = userValues[userValue];
    }
    // If the name is empty take the URL.
    if (aSubscription.metadata.name === "") {
      aSubscription.metadata.name = aSubscription.metadata.url;
    }
    if (oldRefresh !== aSubscription.metadata.refresh) {
      // TODO: We should not use type coercion here, rather just "!".
      // We need type coercion here, hence "==" instead of "===".
      if (aSubscription.metadata.refresh == 0) {
        aSubscription.metadata.timer.cancel();
        delete aSubscription.metadata.timer;
        // There is no next update as refresh got set to zero. Therefore,
        // deleting this property as well.
        delete aSubscription.metadata.nextUpdate;
        // Again, we need type coercion...
      } else if (oldRefresh == 0) {
        this.setSubscriptionTimer(aSubscription, false, false);
      } else {
        // We already had a timer just resetting it to the new refresh value.
        this.setSubscriptionTimer(aSubscription, true, false);
      }
    }
    this.subscriptionsList[index] = aSubscription;
    this.writeSubscriptions();
  },

  generateError: function(type, error, currentSubscription) {
    let errorText = "";
    for (let i = 0; i < error.length; i++) {
      errorText = errorText + "\n" + error[i];
    }
    this.fp.alert(null, this.fp.getMessage(this.type +
      "subscription.update.failure") + "\n" + errorText);
    currentSubscription.metadata.lastStatus = this.fp.getMessage("error");
    // So, we really did not get a proper subscription but error
    // messages. Make sure they are shown in the lastStatus dialog.
    currentSubscription.metadata.errorMessages = error;
  },

  refreshSubscription: function(aSubscription, showResponse) {
    var that = this;
    var errorText = "";
    var error, i, j;
    // We are calculating the index in this method in order to be able to
    // use it with the nsITimer instances as well. If we would get the
    // index from our caller it could happen that the index is wrong due
    // to changes in the subscription list while the timer was "sleeping".
    var aIndex = null, proxyList = [];
    for (i = 0; i < this.subscriptionsList.length; i++) {
      if (this.subscriptionsList[i] === aSubscription) {
	aIndex = i;
      }
    }
    if (aIndex === null) return;
    // Estimating whether the user wants to have the subscription base64
    // encoded. We use this as a parameter to show the proper dialog if there
    // is a mismatch between the users choice and the subscription's
    // encoding.  
    var base64Encoded = aSubscription.metadata.obfuscation === "Base64";
    error = this.loadSubscription(aSubscription.metadata, base64Encoded,
      function(refreshedSubscription, userValues) {
        if (refreshedSubscription) {
          if (refreshedSubscription.length !== undefined) {
            that.generateError(that.type, refreshedSubscription, aSubscription);
          } else {
            // We do not want to lose our metadata here as the user just
            // refreshed the subscription to get up-to-date patterns/proxies.
            if (that.type === "pattern") {
              aSubscription.patterns = refreshedSubscription.patterns;
              // And it means above all refreshing the patterns... But first we
              // generate the proxy list.
              if (aSubscription.metadata.proxies.length > 0) {
                proxyList = that.fp.proxies.getProxiesFromId(aSubscription.
                  metadata.proxies);
                // TODO: We are not distinguishing between different pattern
                // subsciptions yet. Thus, if we refresh one all patterns get
                // deleted and only the new ones get added afterwards. First,
                // deleting the old subscription patterns.
                that.deletePatterns(proxyList);
                // Now, we add the refreshed ones...
                that.addPatterns(null, proxyList, aIndex);
              }
              that.fp.utils.broadcast(true, "foxyproxy-tree-update");
            } else {
              // Okay, we have a proxy subscription.
              aSubscription.proxies = refreshedSubscription.proxies;
              // Adding the proxy/proxies back to the pattern subscription if
              // it/they was/were. How do we know we have the same proxies after
              // a refresh? -> IP:Port! But we need to cycle through all
              // subscriptions, right? And safe not only the IP:Port but the
              // pattern subscriptions that had the proxy/proxies attached to it
              // as well in order to add both the proxy/proxies to them AND add
              // the patterns of the subscription to the former as well. Duh.
              let length = patternSubscriptions.subscriptionsList.length;
              let savedProxies = [];
              let patSub, patProxyList, patProxy, proxySub;
              for (let i = 0; i < length; ++i) {
                patSub = patternSubscriptions.subscriptionsList[i];
                if (patSub.metadata.proxies.length > 0) {
                  // Okay that particular pattern subscription is indeed used by
                  // at least one proxy. Let's check whether it is one from a
                  // proxy subscription.
                  patProxyList = that.fp.proxies.getProxiesFromId(patSub.
                    metadata.proxies);
                  for (let j = 0, pLength = patProxyList.length; j < pLength;
                       ++j) {
                    patProxy = patProxyList[j];
                    if (patProxy.fromSubscription) {
                      // We know that this proxy is from a proxy list, save it
                      // together with its subscription.
                      proxySub = [];
                      proxySub.push(patProxy.manualconf.host + ":" + patProxy.
                        manualconf.port);
                      proxySub.push(patSub);
                      savedProxies.push(proxySub);
                    }
                  }
                }
              }
              that.deleteProxies(that.fp.proxies);
              let addedProxies = that.addProxies(refreshedSubscription.proxies,
                userValues);
              // Let's add the proxies back to the respective pattern
              // subscriptions and then the patterns of the latter back to them.
              // But only if the old proxies are among the refreshed ones.
              that.addProxiesBack(savedProxies, addedProxies);
              // Redrawing all the trees involved...
              // TODO: The color string of refreshed proxies is "nmbado" (= the
              // default value) but restarting e.g. Firefox gives "ggmmem" as
              // default value while the color value (#0055E5) is the same in
              // both case. Not sure about the reason and whether it is an
              // issue... And the mode menu needs to get updated, too. Otherwise
              // we could get some strange unkown-proxy-mode-errors while trying
              // to switch the proxy used as the mode menu is still populated
              // with the old proxy ids.
              that.fp.utils.broadcast(true, "foxyproxy-proxy-change");
            }
            // Maybe the obfuscation changed. We should update this...
            aSubscription.metadata.obfuscation = refreshedSubscription.
              metadata.obfuscation;
            aSubscription.metadata.lastStatus = that.fp.getMessage("okay");
            // We did not get any errors. Therefore, resetting the errorMessages
            // array to null.
            aSubscription.metadata.errorMessages = null;
            // If we have a timer-based update of subscriptions we deactive the
            // success popup as it can be quite annoying to get such kinds of
            // popups while surfing. TODO: Think about doing the same for failed
            // updates.
            if (showResponse) {
              that.fp.alert(null, that.fp.getMessage(that.type +
                "subscription.update.success"));
            }
            // Refreshing a subscription means refreshing the timer as well if
            // there is any...
            if (aSubscription.metadata.refresh > 0) {
              that.setSubscriptionTimer(aSubscription, true, false);
            }
            that.subscriptionsList[aIndex] = aSubscription;
            that.writeSubscriptions();
          }
        } else {
          // We show an error at least...
          that.fp.alert(null, that.fp.getMessage(that.type +
            "subscription.update.failure"));
        }
        aSubscription.metadata.lastUpdate = that.fp.logg.format(Date.now());
      }
    );
    if (error) {
      this.generateError(this.type, error, aSubscription);
      aSubscription.metadata.lastUpdate = this.fp.logg.format(Date.now());
      // Refreshing a subscription means refreshing the timer as well if there
      // is any...
      if (aSubscription.metadata.refresh > 0) {
        this.setSubscriptionTimer(aSubscription, true, false);
      }
      // TODO: Should we delete the patterns if an update failed?
      this.subscriptionsList[aIndex] = aSubscription;
      this.writeSubscriptions();
    }
  },

  setSubscriptionTimer: function(aSubscription, bRefresh, bStartup) {
    var timer, d, that, event;
    // Now calculating the next time to refresh the subscription and setting
    // a respective timer just in case the user wants to have an automatic
    // update of her subscription.
    if (!aSubscription.metadata.timer) {
      timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
      aSubscription.metadata.timer = timer;
    } else {
      timer = aSubscription.metadata.timer;
    }
    d = new Date().getTime();
    if (bStartup) {
      if (aSubscription.metadata.nextUpdate <= d) {
        this.refreshSubscription(aSubscription, false);
        return;
      }
    } else {
      // TODO: Investigate whether there is an easy way to use
      // metadata.lastUpdate here in order to calculate the next update time in
      // ms since 1969/01/01. By this we would not need metadata.nextUpdate.
      aSubscription.metadata.nextUpdate = d + aSubscription.metadata.
        refresh * 60 * 1000;
    }
    that = this;
    var event = {
      notify : function(timer) {
        that.refreshSubscription(aSubscription, false);
	// We just need the notification to redraw the tree...
	that.fp.broadcast(null, "foxyproxy-tree-update", null);
      }
    };
    if (bRefresh) {
      timer.cancel();
      aSubscription.metadata.timer.cancel();
    }
    if (bStartup) {
      // Just a TYPE_ONE_SHOT on startup to come into the regular update cycle.
      timer.initWithCallback(event, aSubscription.metadata.nextUpdate - d, Ci.
        nsITimer.TYPE_ONE_SHOT);
    } else {
      timer.initWithCallback(event, aSubscription.metadata.refresh * 60 * 1000,
        Ci.nsITimer.TYPE_REPEATING_SLACK);
    }
  },

  getSubscriptionsFile: function() {
    var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    var subDir = this.fp.getSettingsURI(Ci.nsIFile).parent;
    file.initWithPath(subDir.path);
    file.appendRelativePath(this.subscriptionsFile);
    if ((!file.exists() || !file.isFile())) {
      // Owners may do everthing with the file, the group and others are
      // only allowed to read it. 0x1E4 is the same as 0744 but we use it here
      // as octal literals and escape sequences are deprecated and the
      // respective constants are not available yet, see: bug 433295.
      file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0x1E4);
    }
    return file;
  },

  writeSubscriptions: function() {
    try {
      var subscriptionsData = "";
      var foStream;
      var converter;
      var subFile = this.getSubscriptionsFile();
      for (var i = 0; i < this.subscriptionsList.length; i++) {
        subscriptionsData = subscriptionsData + this.getJSONFromObject(this.
	  subscriptionsList[i]) + "\n";
      }
      foStream = Cc["@mozilla.org/network/file-output-stream;1"].
        createInstance(Ci.nsIFileOutputStream);
      // We should set it to the hex equivalent of 0644
      foStream.init(subFile, 0x02 | 0x08 | 0x20, -1, 0);
      converter = Cc["@mozilla.org/intl/converter-output-stream;1"].
        createInstance(Ci.nsIConverterOutputStream);
      converter.init(foStream, "UTF-8", 0, 0);
      converter.writeString(subscriptionsData);
      converter.close();
    } catch (e) {
      dump("Error while writing the " + this.type + " subscriptions to disc: " +
        e + "\n");
    }
  },

  getObjectFromJSON : function(aString, errorMessages) {
    try {
      let json;
      // Should never happen...
      if (!aString) {
        errorMessages.push(this.fp.
          getMessage("patternsubscription.error.JSONString"));
        return errorMessages;
      }
      // As FoxyProxy shall be usable with FF < 3.5 we use nsIJSON. But
      // Thunderbird does not support nsIJSON. Thus, we check for the proper
      // method to use here. Checking for nsIJSON is not enough here due to bug
      // 645922.
      if (typeof Ci.nsIJSON !== "undefined" && typeof Ci.nsIJSON.decode ===
          "function") {
        json = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
        return json.decode(aString);
      } else {
        return JSON.parse(aString);
      }
    } catch (e) {
      errorMessages.push(this.fp.getMessage("patternsubscription.error.JSON"));
      return errorMessages;
    }
  },

  getJSONFromObject: function(aObject) {
    try {
      let json;
      // As FoxyProxy shall be usable with FF < 3.5 we use nsIJSON. But
      // Thunderbird does not support nsIJSON. Thus, we check for the proper
      // method to use here. Checking for nsIJSON is not enough here due to bug
      // 645922.
      if (typeof Ci.nsIJSON !== "undefined" && typeof Ci.nsIJSON.encode ===
          "function") {
        json = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
        return json.encode(aObject);
      } else {
        return JSON.stringify(aObject);
      }
    } catch (e) {
      dump("Error while parsing the JSON: " + e + "\n");
    }
  },

  handleImportExport: function(aType, bImport, bPreparation) {
    var subElement;
    var f = this.fp.getSettingsURI(Ci.nsIFile);
    var s = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.
      nsIFileInputStream);
    s.init(f, -1, -1, Ci.nsIFileInputStream.CLOSE_ON_EOF);
    var p = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.
      nsIDOMParser);
    var doc = p.parseFromStream(s, null, f.fileSize, "text/xml");
    if (bPreparation) {
      // Now we are adding the subscriptions.
      doc.documentElement.appendChild(this.toDOM(aType, doc));
    }
    if (bImport) {
      // Importing old settings means removing the current ones first including
      // subscriptions. Therefore...
      this.subscriptionsList = [];
      // Convert the subscriptions (if there are any) to objects and put them
      // (back) to the susbcriptionsList.
      subElement = doc.getElementsByTagName(aType + "Subscriptions").item(0);
      if (subElement) {
        this.fromDOM(aType, subElement);
      } else {
        // Although it is not a preparation we set the flag to "true" as we do
        // not need to execute the respective if-path as there are no
        // susbcriptions to erase.
        bPreparation = true;
      }
    }
    if (!bPreparation) {
      // As we only want to export these subscriptions and have a separate file
      // to store them locally, we remove them after the file was exported in
      // order to avoid messing unnecessarily with the settings file.
      // The same holds for the import case.
      subElement = doc.getElementsByTagName(aType + "Subscriptions").
        item(0);
      doc.documentElement.removeChild(subElement);
    }
    var foStream = Cc["@mozilla.org/network/file-output-stream;1"].
        createInstance(Ci.nsIFileOutputStream);
    foStream.init(f, 0x02 | 0x08 | 0x20, -1, 0); // write, create, truncate
    // In foxyproxy.js is a call to gFP.toDOM() used instead of doc but that is
    // not available here as the patternSubscriptions are not written there.
    // The result is two missing newlines, one before and one after the DOCTYPE
    // declaration. But that does not matter for parsing the settings.
    Cc["@mozilla.org/xmlextras/xmlserializer;1"].
      createInstance(Ci.nsIDOMSerializer).serializeToStream(doc, foStream, "UTF-8");
    foStream.close();
  },

  fromDOM: function(aType, patElem) {
    var subscription, metaNode, subNode, attrib, name, value;
    var subs = patElem.getElementsByTagName("subscription");
    for (var i = 0; i < subs.length; i++) {
      subscription = {};
      metaNode = subs[i].getElementsByTagName("metadata").item(0);
      if (metaNode) {
        subscription.metadata = {};
        attrib = metaNode.attributes;
        for (var j = 0; j < attrib.length; j++) {
          name = attrib.item(j).name;
	  value = attrib.item(j).value;
          subscription.metadata[name] = value;
        }
      }
      // The proxy id's are saved as a string but we need them as an array.
      if (subscription.metadata.proxies) {
        subscription.metadata.proxies = subscription.metadata.proxies.
          split(",");
      }
      let subNode;
      if (aType === "pattern") {
        subNode = subs[i].getElementsByTagName("patterns").item(0);
      } else {
        subNode = subs[i].getElementsByTagName("proxies").item(0);
      }
      if (subNode) {
        let helper = [];
	let content = subNode.getElementsByTagName(aType);
	for (var k = 0; k < content.length; k++) {
          helper[k] = {};
	  attrib = content[k].attributes;
	  for (var l = 0; l < attrib.length; l++) {
	    name = attrib.item(l).name;
	    value = attrib.item(l).value;
            helper[k][name] = value;
          }
        }
        if (aType === "pattern") {
          subscription.patterns = helper;
        } else {
          subscription.proxies = helper;
        }
      }
      this.subscriptionsList.push(subscription);
    }
    // Add now save the pattern subscriptions to disk...
    this.writeSubscriptions();
  },

  toDOM: function(aType, doc) {
    var sub, meta, sub2, pat2, content, contents;
    var e = doc.createElement(aType + "Subscriptions");
    for (var i = 0; i < this.subscriptionsList.length; i++) {
      if (aType === "pattern") {
        contents = this.subscriptionsList[i].patterns;
        content = doc.createElement("patterns");
      } else {
        contents = this.subscriptionsList[i].proxies;
        content = doc.createElement("proxies");
      }
      sub = doc.createElement("subscription");
      meta = doc.createElement("metadata");
      for (var a in this.subscriptionsList[i].metadata) {
        meta.setAttribute(a, this.subscriptionsList[i].metadata[a])
      }
      sub.appendChild(meta);
      for (var j = 0; j < contents.length; j++) {
        pat2 = doc.createElement(aType);
        for (var a in contents[j]) {
          pat2.setAttribute(a, contents[j][a]);
        }
        content.appendChild(pat2);
      }
      sub.appendChild(content);
      e.appendChild(sub);
    }
    return e;
  },

  changeSubStatus: function(aProxyList, bNewStatus) {
    for (var i = 0; i < aProxyList.length; i++) {
      for (var j = 0; j < aProxyList[i].matches.length; j++) {
        // We know already that the status has changed. Thus, we only need to
        // apply the new one to the subscription patterns.
        if (aProxyList[i].matches[j].fromSubscription) {
	  aProxyList[i].matches[j].enabled = bNewStatus;
        }
      }
    }
  },

  makeSubscriptionsTreeView: function() {
    var that = this;
    var ret = {
      rowCount : that.subscriptionsList.length,
      getCellText : function(row, column) {
        var i = that.subscriptionsList[row];
        var type = that.type;
        switch(column.id) {
          case type + "SubscriptionsEnabled" : return i.metadata.enabled;
	  case type + "SubscriptionsName" : return i.metadata.name;
          case type + "SubscriptionsNotes" : return i.metadata.notes;
          case type + "SubscriptionsUri" : return i.metadata.url;
	  // We are doing here a similar thing as in addeditsubscription.js
	  // in the onLoad() function described: As we only saved the id's
	  // and the id's are not really helpful for users, we just use them to
	  // get the respective name of a proxy out of the proxies object
	  // belonging to the foxyproxy service. These names are then displayed
	  // in the subscriptions tree comma separated in the proxy column.
          case type + "SubscriptionsProxy":
	    let proxyString = "";
            let proxies = that.fp.proxies.getProxiesFromId(i.metadata.proxies);
	    for (let j = 0; j < proxies.length; j++) {
              proxyString = proxyString + proxies[j].name;
	      if (j < proxies.length - 1) {
                proxyString = proxyString + ", ";
              }
            }
	    return proxyString;
          case type + "SubscriptionsRefresh" : return i.metadata.refresh;
          case type + "SubscriptionsStatus" : return i.metadata.lastStatus;
          case type + "SubscriptionsLastUpdate" : return i.metadata.lastUpdate;
          case type + "SubscriptionsFormat" : return i.metadata.format;
          case type + "SubscriptionsObfuscation" : return i.metadata.
            obfuscation;
        }
      },
      setCellValue: function(row, col, val) {
		      that.subscriptionsList[row].metadata.enabled = val;
		    },
      getCellValue: function(row, col) {
		      return that.subscriptionsList[row].metadata.enabled;
		    },
      isSeparator: function(aIndex) { return false; },
      isSorted: function() { return false; },
      isEditable: function(row, col) { return false; },
      isContainer: function(aIndex) { return false; },
      setTree: function(aTree){},
      getImageSrc: function(aRow, aColumn) {return null;},
      getProgressMode: function(aRow, aColumn) {},
      cycleHeader: function(aColId, aElt) {},
      getRowProperties: function(aRow, aColumn, aProperty) {},
      getColumnProperties: function(aColumn, aColumnElement, aProperty) {},
      getCellProperties: function(row, col, props) {},
      getLevel: function(row){ return 0; }
    };
    return ret;
  }
};

var patternSubscriptions = Object.create(subscriptions);
patternSubscriptions.type = "pattern";
patternSubscriptions.partialLoadFailure = [];
patternSubscriptions.subscriptionsList = [];
patternSubscriptions.subscriptionsFile = "patternSubscriptions.json";

// TODO: Where do we need the specific values? Wouldn't it not be enough to
// have just the properties in an array?
// TODO: If we use it put it in the constructor directly or better try to 
// reuse it in ProxySubscriptions and put it therefore into subproto.
patternSubscriptions.defaultMetaValues = {
  formatVersion : 1,
  checksum : "",
  algorithm : "",
  url : "",
  format : "FoxyProxy",
  obfuscation : "none",
  name : "",
  notes : "",
  enabled : true,
  refresh : 60,
  nextUpdate : 0,
  timer : null
};

patternSubscriptions.parseSubscription = function(subscriptionText,
  errorMessages, isBase64, userBase64) {
  if (errorMessages.length !== 0) {
    // We've already got error messages. Let's return them immediately.
    return errorMessages;
  }
  try {
    // No Base64 (anymore), thus we guess we have a plain FoxyProxy
    // subscription first. If that is not true we check the AutoProxy format.
    // And if that fails as well we give up.
    let parsedSubscription;
    let subscriptionContent = this.getObjectFromJSON(subscriptionText,
      errorMessages);
    if (subscriptionContent && subscriptionContent.length !== undefined) {
      let lines = this.autoproxy.isAutoProxySubscription(subscriptionText);
      if (lines) {
        parsedSubscription = this.autoproxy.processAutoProxySubscription(lines,
          errorMessages);
      } else {
        // No AutoProxy either.
        return errorMessages;
      }
    } else {
      parsedSubscription = this.parseSubscriptionDetails(subscriptionContent,
        errorMessages);
      // Did we get the errorMessages back? If so return them immediately.
      if (parsedSubscription && parsedSubscription.length !== undefined) {
        return parsedSubscription;
      }
      if (!parsedSubscription.metadata) {
        parsedSubscription.metadata = {};
      }
      // We've got a FoxyProxy subscription...
      parsedSubscription.metadata.format = "FoxyProxy";
      // Setting the name of the patterns if there is none set yet.
      let pats = parsedSubscription.patterns;
      for (let i = 0, length = pats.length; i < length; i++) {
        let pat = pats[i];
        if (!pat.name) {
          pat.name = pat.pattern;
        }
      }
    }
    return this.base64Match(this.type, isBase64, userBase64, errorMessages,
      parsedSubscription);
  } catch (e) {
    // TODO: Recheck proper error messages after rewriting the module!
    errorMessages.push(this.fp.
      getMessage("patternsubscription.error.network.unspecified"));
    return errorMessages;
  }
};

patternSubscriptions.parseSubscriptionDetails = function(aSubscription,
  errorMessages) {
  try {
    let subProperty, ok;
    // Maybe someone cluttered the subscription in other ways...
    for (subProperty in aSubscription) {
      if (subProperty !== "metadata" && subProperty !== "patterns") {
        delete aSubscription[subProperty];
      }
    }
    // And maybe someone cluttered the metadata or mistyped a property...
    for (subProperty in aSubscription.metadata) {
      if (!this.defaultMetaValues.hasOwnProperty(subProperty)) {
        delete aSubscription.metadata[subProperty];
      }
    }
    // We are quite permissive here. All we need is a checksum. If somebody
    // forgot to add that the subscription is MD5 encoded (using the
    // algorithm property of the metadata object) we try that though. But we
    // only check the subscription object for several reasons: 1) It is this
    // object that contains data that we want to have error free. The
    // metadata is not so important as the user can overwrite a lot of its
    // properties and it contains only additional information 2) We cannot
    // hash the whole a whole subscription as this would include hashing the
    // hash itself, a thing that would not lead to the desired result
    // without introducing other means of transporting this hash (e.g. using
    // a special HTTP header). But the latter would have drawbacks we want to
    // avoid 3) To cope with 2) we could exclude the checksum property from
    // getting hashed and hash just all the other parts of the subscription.
    // However, that would require a more sophisticated implementation which
    // currently seems not worth the effort. Thus, sticking to a hashed
    // subscription object.
    if (aSubscription.metadata && aSubscription.metadata.checksum) {
      ok = this.checksumVerification(aSubscription.metadata.checksum,
        aSubscription);
      if (!ok) {
        if (!this.fp.warnings.showWarningIfDesired(null,
            ["patternsubscription.warning.md5"], "md5Warning", true)) {
          errorMessages.push(this.fp.
            getMessage("patternsubscription.error.cancel5"));
          return errorMessages;
        }
      } else {
        // Getting the metadata right...
        if (!aSubscription.metadata.algorithm.toLowerCase() !== "md5") {
          aSubscription.metadata.algorithm = "md5";
        }
      }
    }
    return aSubscription;
  } catch(e) {
    this.fp.alert(null, this.fp.getMessage("patternsubscription.error.parse"));
    errorMessages.push(this.fp.getMessage("patternsubscription.error.parse"));
    return errorMessages;
  }
};

patternSubscriptions.deletePatterns = function(aProxyList) {
  // This method deletes all the patterns belonging to a subscription.
  // That holds for all proxies that were tied to it and are contained in
  // the aProxyList argument.
  let i,j,k,matchesLength;
  for (i = 0; i < aProxyList.length; i++) {
    matchesLength = aProxyList[i].matches.length;
    j = k = 0;
    do {
      // That loop does the following: Check the pattern j of the proxy i
      // whether it is from a subscription. If so, delete it (splice()-call)
      // raise k and start at the same position again (now being the next)
      // pattern. If not, raise j (i.e. check the pattern at the next
      // position in the array at the next time running the loop) and k.
      // That goes until all the patterns are checked, i.e. until k equals
      // the patterns length.
      let currentMatch = aProxyList[i].matches[j];
      if (currentMatch && currentMatch.fromSubscription) {
          aProxyList[i].matches.splice(j, 1);
      } else {
        j++;
      }
      k++;
    } while (k < matchesLength);
  }
  this.fp.writeSettingsAsync();
};

patternSubscriptions.removeDeletedProxies = function(aProxyId) {
  for (let i = 0, sz = this.subscriptionsList.length; i < sz; i++) {
    let proxyList = this.subscriptionsList[i].metadata.proxies;
    for (let j = 0, psz = proxyList.length; j < psz; j++) {
      if (proxyList[j] === aProxyId) {
        proxyList.splice(j, 1);
        // As we know there is just one instance of a proxy tied to the
        // subscription we can leave the innermost for loop now.
        break;
      }
    }
  }
};

patternSubscriptions.addPatterns = function(selectedSubscription, proxyList,
  aIndex) {
  // Now are we going to implement the crucial part of the pattern
  // subscription feature: Adding the patterns to the proxies.
  // We probably need no valiatePattern()-call as in pattern.js as the user
  // is not entering a custom pattern itself but imports a list assuming
  // the latter is less error prone.
  var currentSub;
  var currentMet;
  var currentPat;
  var pattern;
  if (selectedSubscription) {
    currentMet = selectedSubscription.metadata;
    currentPat = selectedSubscription.patterns;
  } else {
    if (aIndex) {
      currentSub = this.subscriptionsList[aIndex];
    } else {
      // Adding patterns to a subscription just added to the subscripions list.
      currentSub = this.subscriptionsList[this.subscriptionsList.length - 1];
    }
    currentMet = currentSub.metadata;
    currentPat = currentSub.patterns;
  }
  for (let i = 0; i < proxyList.length; i++) {
    // TODO: Maybe we could find a way to blend an old subscription or
    // old patterns with a new one!?
    if (currentPat) {
      let patLength;
      for (let j = 0, patLength = currentPat.length; j < patLength; j++) {
        pattern = Cc["@leahscape.org/foxyproxy/match;1"].createInstance().
                  wrappedJSObject;
        pattern.init({enabled: currentMet.enabled, name: currentPat[j].name,
          pattern: currentPat[j].pattern, isRegEx: currentPat[j].isRegEx,
          caseSensitive: currentPat[j].caseSensitive, isBlackList:
          currentPat[j].blackList, isMultiLine: currentPat[j].multiLine,
          fromSubscription: true});
        proxyList[i].matches.push(pattern);
      }
    }
  }
};

patternSubscriptions.checksumVerification = function(aChecksum, aSubscription) {
  var result, data, ch, hash, finalHash, i;
  // First getting the subscription object in a proper stringified form.
  // That means just to stringify the Object. JSON allows (additional)
  // whitespace (see: http://www.ietf.org/rfc/rfc4627.txt section 2)
  // but we got rid of it while creating the JSON object the first time.
  var subscriptionContent = this.getJSONFromObject(aSubscription.patterns);

  // Following https://developer.mozilla.org/En/NsICryptoHash
  var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
    createInstance(Ci.nsIScriptableUnicodeConverter);
  converter.charset = "UTF-8";
  var result = {};
  data  = converter.convertToByteArray(subscriptionContent, result);
  ch = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
  // We just have the checksum here (maybe the user forgot to specify MD5) in
  // the metadata. But we can safely assume MD5 as we are currently
  // supporting just this hash algorithm.
  ch.init(ch.MD5);
  ch.update(data, data.length);
  hash = ch.finish(false);
  finalHash = [this.toHexString(hash.charCodeAt(i)) for (i in hash)].
    join("");
  if (finalHash === aChecksum) {
    return true;
  }
  return false;
};

patternSubscriptions.toHexString = function(charCode) {
  return ("0" + charCode.toString(16)).slice(-2);
};

Cu.import("resource://foxyproxy/autoproxy.jsm", patternSubscriptions);

var proxySubscriptions = Object.create(subscriptions);
proxySubscriptions.type = "proxy";
proxySubscriptions.partialLoadFailure = [];
proxySubscriptions.subscriptionsList = [];
proxySubscriptions.subscriptionsFile = "proxySubscriptions.json";
// See: http://answers.oreilly.com/topic/318-how-to-match-ipv4-addresses-with-
// regular-expressions/
proxySubscriptions.ipRegExpSimple = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

proxySubscriptions.parseSubscription = function(subscriptionText,
  errorMessages, isBase64, userBase64) {
  if (errorMessages.length !== 0) {
    // We've already got errorMessages. Let's return them immediately.
    return errorMessages;
  }
  try {
    let parsedSubscription = this.getObjectFromText(subscriptionText,
      errorMessages);
    // Did we get the errorMessages back? If so return them immediately.
    if (parsedSubscription.length !== undefined) {
      return parsedSubscription;
    }
    if (!parsedSubscription.metadata) {
      parsedSubscription.metadata = {};
    }
    // We've got a normal proxy subscription...
    parsedSubscription.metadata.format = "IP:Port";
    // Setting the name of the proxies if there is none set yet.
    let proxies = parsedSubscription.proxies;
    for (let i = 0, length = proxies.length; i < length; i++) {
      let proxy = proxies[i];
      if (!proxy.name) {
        proxy.name = proxy.ip + ":" + proxy.port;
      }
    }
    return this.base64Match(this.type, isBase64, userBase64, errorMessages,
      parsedSubscription);
  } catch (e) {
    // TODO: Recheck proper error messages after rewriting the module!
    errorMessages.push(this.fp.
      getMessage("proxysubscription.error.network.unspecified"));
    return errorMessages;
  }
};

proxySubscriptions.getObjectFromText = function(subscriptionText,
  errorMessages) {
  try {
    let ipPort = [];
    let proxySubscription = {};
    let proxyArray = proxySubscription.proxies = [];
    let proxies = subscriptionText.split(/\n/);
    for (let i = 0, length = proxies.length; i < length; ++i) {
      // TODO: Think about more tests to make sure we have an IP:Port format!?
      // Empty lines are useless. We do not add them to the proxy array.
      if (proxies[i]) {
        proxyArray[i] = {};
        ipPort = proxies[i].split(":");
        // We do the trimming here as we never know whether we have patterns
        // like "123.123.123.123 : 456" as well.
        proxyArray[i].ip = ipPort[0].replace(/^\s*|\s*$/g, "");
        proxyArray[i].port = ipPort[1].replace(/^\s*|\s*$/g, "");
        // TODO: Addapt this simple error checking to work with IPv6 addresses
        // as well.
        let isIP = this.ipRegExpSimple.test(proxyArray[i].ip);
        let isPort = /^\d+$/.test(proxyArray[i].port);
        if (!(isIP && isPort)) {
          errorMessages.push(this.fp.getMessage("proxysubscription.error.txt"));
          return errorMessages;
        }
      }
    }
    return proxySubscription;
  } catch (e) {
    errorMessages.push(this.fp.getMessage("proxysubscription.error.txt"));
    return errorMessages;
  }
};

proxySubscriptions.addProxies = function(proxies, userValues) {
  let proxy;
  let addedProxies = [];
  let socksProxies = false;
  if (userValues.proxyType === 2) {
    socksProxies = true;
  } 
  for (let i = 0, length = proxies.length; i < length; ++i) {
    proxy = Cc["@leahscape.org/foxyproxy/proxy;1"].createInstance().
      wrappedJSObject;
    proxy.name = proxies[i].ip + ":" + proxies[i].port;
    proxy.mode = "manual";
    proxy.manualconf.host = proxies[i].ip;
    proxy.manualconf.port = proxies[i].port;
    if (socksProxies) {
      proxy.manualconf.isSocks = true;
      proxy.manualconf.socksVersion = 5;
    }
    proxy.fromSubscription = true;
    this.fp.proxies.push(proxy);
    addedProxies.push(proxy);
  }
  return addedProxies;
};

proxySubscriptions.deleteProxies = function(proxies) {
  for (let i = proxies.length - 1; i >= 0; i--) {
    let proxy = proxies.item(i);
    if (proxy.fromSubscription) {
      // If a proxy from a proxy subscription got added to a pattern
      // subscription metadata remove it from there as well.
      if (patternSubscriptions.subscriptionsList.length > 0) {
        patternSubscriptions.removeDeletedProxies(proxy.id);
      }
      this.fp.proxies.remove(i);
    }
  }
};

// TODO: Think about that whole adding back logic again. I am not happy with it
// but I don't know why :-). I'd like to have it simpler... somehow...
proxySubscriptions.addProxiesBack = function(savedProxies, newProxies) {
  let newProxyIPPort, newProxy;
  let proxyAdded = false;
  for (let i = 0, length = newProxies.length; i < length; ++i) {
    newProxy = newProxies[i];
    newProxyIPPort = newProxy.manualconf.host + ":" + newProxy.manualconf.port;
    for (let j = 0, sLength = savedProxies.length; j < sLength; ++j) {
      if (newProxyIPPort === savedProxies[j][0]) {
        // We use the addPatterns() method to add the patterns of the
        // subscription the proxy belonged to before the refresh. aIndex as
        // paramter is not needed. We omit it therefore.
        // TODO: Optimize and call addPattern only once or only so many times as
        // different subscriptions involved!?
        // TODO: Can we avoid the slice() call and use newProxy instead somehow?
        patternSubscriptions.addPatterns(savedProxies[j][1], newProxies.
          slice(i, i + 1));
        savedProxies[j][1].metadata.proxies.push(newProxy.id);
        if (!proxyAdded) {
          proxyAdded = true;
        }
      }
    }
  }
  if (proxyAdded) {
    // Subscribed proxies got added back to the pattern subscription(s). Thus,
    // we need to save the latter as well.
    patternSubscriptions.writeSubscriptions();
  }
};
