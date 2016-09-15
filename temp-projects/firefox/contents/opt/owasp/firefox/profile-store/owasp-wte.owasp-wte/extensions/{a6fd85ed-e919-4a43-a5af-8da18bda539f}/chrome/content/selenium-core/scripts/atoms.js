var COMPILED = !0, goog = goog || {};
goog.global = this;
goog.DEBUG = !0;
goog.LOCALE = "en";
goog.provide = function(a) {
  if(!COMPILED) {
    if(goog.isProvided_(a)) {
      throw Error('Namespace "' + a + '" already declared.');
    }
    delete goog.implicitNamespaces_[a];
    for(var b = a;(b = b.substring(0, b.lastIndexOf("."))) && !goog.getObjectByName(b);) {
      goog.implicitNamespaces_[b] = !0
    }
  }
  goog.exportPath_(a)
};
goog.setTestOnly = function(a) {
  if(COMPILED && !goog.DEBUG) {
    throw a = a || "", Error("Importing test-only code into non-debug environment" + a ? ": " + a : ".");
  }
};
COMPILED || (goog.isProvided_ = function(a) {
  return!goog.implicitNamespaces_[a] && !!goog.getObjectByName(a)
}, goog.implicitNamespaces_ = {});
goog.exportPath_ = function(a, b, c) {
  a = a.split(".");
  c = c || goog.global;
  !(a[0] in c) && c.execScript && c.execScript("var " + a[0]);
  for(var d;a.length && (d = a.shift());) {
    !a.length && goog.isDef(b) ? c[d] = b : c = c[d] ? c[d] : c[d] = {}
  }
};
goog.getObjectByName = function(a, b) {
  for(var c = a.split("."), d = b || goog.global, e;e = c.shift();) {
    if(goog.isDefAndNotNull(d[e])) {
      d = d[e]
    }else {
      return null
    }
  }
  return d
};
goog.globalize = function(a, b) {
  var c = b || goog.global, d;
  for(d in a) {
    c[d] = a[d]
  }
};
goog.addDependency = function(a, b, c) {
  if(!COMPILED) {
    for(var d, a = a.replace(/\\/g, "/"), e = goog.dependencies_, f = 0;d = b[f];f++) {
      e.nameToPath[d] = a;
      a in e.pathToNames || (e.pathToNames[a] = {});
      e.pathToNames[a][d] = true
    }
    for(d = 0;b = c[d];d++) {
      a in e.requires || (e.requires[a] = {});
      e.requires[a][b] = true
    }
  }
};
goog.ENABLE_DEBUG_LOADER = !0;
goog.require = function(a) {
  if(!COMPILED && !goog.isProvided_(a)) {
    if(goog.ENABLE_DEBUG_LOADER) {
      var b = goog.getPathFromDeps_(a);
      if(b) {
        goog.included_[b] = true;
        goog.writeScripts_();
        return
      }
    }
    a = "goog.require could not find: " + a;
    goog.global.console && goog.global.console.error(a);
    throw Error(a);
  }
};
goog.basePath = "";
goog.nullFunction = function() {
};
goog.identityFunction = function(a) {
  return a
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(a) {
  a.getInstance = function() {
    return a.instance_ || (a.instance_ = new a)
  }
};
!COMPILED && goog.ENABLE_DEBUG_LOADER && (goog.included_ = {}, goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}}, goog.inHtmlDocument_ = function() {
  var a = goog.global.document;
  return typeof a != "undefined" && "write" in a
}, goog.findBasePath_ = function() {
  if(goog.global.CLOSURE_BASE_PATH) {
    goog.basePath = goog.global.CLOSURE_BASE_PATH
  }else {
    if(goog.inHtmlDocument_()) {
      for(var a = goog.global.document.getElementsByTagName("script"), b = a.length - 1;b >= 0;--b) {
        var c = a[b].src, d = c.lastIndexOf("?"), d = d == -1 ? c.length : d;
        if(c.substr(d - 7, 7) == "base.js") {
          goog.basePath = c.substr(0, d - 7);
          break
        }
      }
    }
  }
}, goog.importScript_ = function(a) {
  var b = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
  !goog.dependencies_.written[a] && b(a) && (goog.dependencies_.written[a] = true)
}, goog.writeScriptTag_ = function(a) {
  if(goog.inHtmlDocument_()) {
    goog.global.document.write('<script type="text/javascript" src="' + a + '"><\/script>');
    return true
  }
  return false
}, goog.writeScripts_ = function() {
  function a(e) {
    if(!(e in d.written)) {
      if(!(e in d.visited)) {
        d.visited[e] = true;
        if(e in d.requires) {
          for(var g in d.requires[e]) {
            if(!goog.isProvided_(g)) {
              if(g in d.nameToPath) {
                a(d.nameToPath[g])
              }else {
                throw Error("Undefined nameToPath for " + g);
              }
            }
          }
        }
      }
      if(!(e in c)) {
        c[e] = true;
        b.push(e)
      }
    }
  }
  var b = [], c = {}, d = goog.dependencies_, e;
  for(e in goog.included_) {
    d.written[e] || a(e)
  }
  for(e = 0;e < b.length;e++) {
    if(b[e]) {
      goog.importScript_(goog.basePath + b[e])
    }else {
      throw Error("Undefined script input");
    }
  }
}, goog.getPathFromDeps_ = function(a) {
  return a in goog.dependencies_.nameToPath ? goog.dependencies_.nameToPath[a] : null
}, goog.findBasePath_(), goog.global.CLOSURE_NO_DEPS || goog.importScript_(goog.basePath + "deps.js"));
goog.typeOf = function(a) {
  var b = typeof a;
  if(b == "object") {
    if(a) {
      if(a instanceof Array) {
        return"array"
      }
      if(a instanceof Object) {
        return b
      }
      var c = Object.prototype.toString.call(a);
      if(c == "[object Window]") {
        return"object"
      }
      if(c == "[object Array]" || typeof a.length == "number" && typeof a.splice != "undefined" && typeof a.propertyIsEnumerable != "undefined" && !a.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(c == "[object Function]" || typeof a.call != "undefined" && typeof a.propertyIsEnumerable != "undefined" && !a.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(b == "function" && typeof a.call == "undefined") {
      return"object"
    }
  }
  return b
};
goog.propertyIsEnumerableCustom_ = function(a, b) {
  if(b in a) {
    for(var c in a) {
      if(c == b && Object.prototype.hasOwnProperty.call(a, b)) {
        return true
      }
    }
  }
  return false
};
goog.propertyIsEnumerable_ = function(a, b) {
  return a instanceof Object ? Object.prototype.propertyIsEnumerable.call(a, b) : goog.propertyIsEnumerableCustom_(a, b)
};
goog.isDef = function(a) {
  return a !== void 0
};
goog.isNull = function(a) {
  return a === null
};
goog.isDefAndNotNull = function(a) {
  return a != null
};
goog.isArray = function(a) {
  return goog.typeOf(a) == "array"
};
goog.isArrayLike = function(a) {
  var b = goog.typeOf(a);
  return b == "array" || b == "object" && typeof a.length == "number"
};
goog.isDateLike = function(a) {
  return goog.isObject(a) && typeof a.getFullYear == "function"
};
goog.isString = function(a) {
  return typeof a == "string"
};
goog.isBoolean = function(a) {
  return typeof a == "boolean"
};
goog.isNumber = function(a) {
  return typeof a == "number"
};
goog.isFunction = function(a) {
  return goog.typeOf(a) == "function"
};
goog.isObject = function(a) {
  a = goog.typeOf(a);
  return a == "object" || a == "array" || a == "function"
};
goog.getUid = function(a) {
  return a[goog.UID_PROPERTY_] || (a[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(a) {
  "removeAttribute" in a && a.removeAttribute(goog.UID_PROPERTY_);
  try {
    delete a[goog.UID_PROPERTY_]
  }catch(b) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(2147483648 * Math.random()).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(a) {
  var b = goog.typeOf(a);
  if(b == "object" || b == "array") {
    if(a.clone) {
      return a.clone()
    }
    var b = b == "array" ? [] : {}, c;
    for(c in a) {
      b[c] = goog.cloneObject(a[c])
    }
    return b
  }
  return a
};
goog.bindNative_ = function(a, b, c) {
  return a.call.apply(a.bind, arguments)
};
goog.bindJs_ = function(a, b, c) {
  if(!a) {
    throw Error();
  }
  if(arguments.length > 2) {
    var d = Array.prototype.slice.call(arguments, 2);
    return function() {
      var c = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(c, d);
      return a.apply(b, c)
    }
  }
  return function() {
    return a.apply(b, arguments)
  }
};
goog.bind = function(a, b, c) {
  goog.bind = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? goog.bindNative_ : goog.bindJs_;
  return goog.bind.apply(null, arguments)
};
goog.partial = function(a, b) {
  var c = Array.prototype.slice.call(arguments, 1);
  return function() {
    var b = Array.prototype.slice.call(arguments);
    b.unshift.apply(b, c);
    return a.apply(this, b)
  }
};
goog.mixin = function(a, b) {
  for(var c in b) {
    a[c] = b[c]
  }
};
goog.now = Date.now || function() {
  return+new Date
};
goog.globalEval = function(a) {
  if(goog.global.execScript) {
    goog.global.execScript(a, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global._et_ != "undefined") {
          delete goog.global._et_;
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(a)
      }else {
        var b = goog.global.document, c = b.createElement("script");
        c.type = "text/javascript";
        c.defer = false;
        c.appendChild(b.createTextNode(a));
        b.body.appendChild(c);
        b.body.removeChild(c)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.getCssName = function(a, b) {
  var c = function(a) {
    return goog.cssNameMapping_[a] || a
  }, d;
  d = goog.cssNameMapping_ ? goog.cssNameMappingStyle_ == "BY_WHOLE" ? c : function(a) {
    for(var a = a.split("-"), b = [], d = 0;d < a.length;d++) {
      b.push(c(a[d]))
    }
    return b.join("-")
  } : function(a) {
    return a
  };
  return b ? a + "-" + d(b) : d(a)
};
goog.setCssNameMapping = function(a, b) {
  goog.cssNameMapping_ = a;
  goog.cssNameMappingStyle_ = b
};
!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING && (goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING);
goog.getMsg = function(a, b) {
  var c = b || {}, d;
  for(d in c) {
    var e = ("" + c[d]).replace(/\$/g, "$$$$"), a = a.replace(RegExp("\\{\\$" + d + "\\}", "gi"), e)
  }
  return a
};
goog.exportSymbol = function(a, b, c) {
  goog.exportPath_(a, b, c)
};
goog.exportProperty = function(a, b, c) {
  a[b] = c
};
goog.inherits = function(a, b) {
  function c() {
  }
  c.prototype = b.prototype;
  a.superClass_ = b.prototype;
  a.prototype = new c;
  a.prototype.constructor = a
};
goog.base = function(a, b, c) {
  var d = arguments.callee.caller;
  if(d.superClass_) {
    return d.superClass_.constructor.apply(a, Array.prototype.slice.call(arguments, 1))
  }
  for(var e = Array.prototype.slice.call(arguments, 2), f = false, g = a.constructor;g;g = g.superClass_ && g.superClass_.constructor) {
    if(g.prototype[b] === d) {
      f = true
    }else {
      if(f) {
        return g.prototype[b].apply(a, e)
      }
    }
  }
  if(a[b] === d) {
    return a.constructor.prototype[b].apply(a, e)
  }
  throw Error("goog.base called from a method of one name to a method of a different name");
};
goog.scope = function(a) {
  a.call(goog.global)
};
goog.string = {};
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(a, b) {
  return 0 == a.lastIndexOf(b, 0)
};
goog.string.endsWith = function(a, b) {
  var c = a.length - b.length;
  return 0 <= c && a.indexOf(b, c) == c
};
goog.string.caseInsensitiveStartsWith = function(a, b) {
  return 0 == goog.string.caseInsensitiveCompare(b, a.substr(0, b.length))
};
goog.string.caseInsensitiveEndsWith = function(a, b) {
  return 0 == goog.string.caseInsensitiveCompare(b, a.substr(a.length - b.length, b.length))
};
goog.string.subs = function(a, b) {
  for(var c = 1;c < arguments.length;c++) {
    var d = ("" + arguments[c]).replace(/\$/g, "$$$$"), a = a.replace(/\%s/, d)
  }
  return a
};
goog.string.collapseWhitespace = function(a) {
  return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(a) {
  return/^[\s\xa0]*$/.test(a)
};
goog.string.isEmptySafe = function(a) {
  return goog.string.isEmpty(goog.string.makeSafe(a))
};
goog.string.isBreakingWhitespace = function(a) {
  return!/[^\t\n\r ]/.test(a)
};
goog.string.isAlpha = function(a) {
  return!/[^a-zA-Z]/.test(a)
};
goog.string.isNumeric = function(a) {
  return!/[^0-9]/.test(a)
};
goog.string.isAlphaNumeric = function(a) {
  return!/[^a-zA-Z0-9]/.test(a)
};
goog.string.isSpace = function(a) {
  return" " == a
};
goog.string.isUnicodeChar = function(a) {
  return 1 == a.length && " " <= a && "~" >= a || "\u0080" <= a && "\ufffd" >= a
};
goog.string.stripNewlines = function(a) {
  return a.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(a) {
  return a.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(a) {
  return a.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(a) {
  return a.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function(a) {
  return a.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function(a) {
  return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(a) {
  return a.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(a) {
  return a.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(a, b) {
  var c = ("" + a).toLowerCase(), d = ("" + b).toLowerCase();
  return c < d ? -1 : c == d ? 0 : 1
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(a, b) {
  if(a == b) {
    return 0
  }
  if(!a) {
    return-1
  }
  if(!b) {
    return 1
  }
  for(var c = a.toLowerCase().match(goog.string.numerateCompareRegExp_), d = b.toLowerCase().match(goog.string.numerateCompareRegExp_), e = Math.min(c.length, d.length), f = 0;f < e;f++) {
    var g = c[f], h = d[f];
    if(g != h) {
      return c = parseInt(g, 10), !isNaN(c) && (d = parseInt(h, 10), !isNaN(d) && c - d) ? c - d : g < h ? -1 : 1
    }
  }
  return c.length != d.length ? c.length - d.length : a < b ? -1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function(a) {
  a = "" + a;
  return!goog.string.encodeUriRegExp_.test(a) ? encodeURIComponent(a) : a
};
goog.string.urlDecode = function(a) {
  return decodeURIComponent(a.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(a, b) {
  return a.replace(/(\r\n|\r|\n)/g, b ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(a, b) {
  if(b) {
    return a.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
  }
  if(!goog.string.allRe_.test(a)) {
    return a
  }
  -1 != a.indexOf("&") && (a = a.replace(goog.string.amperRe_, "&amp;"));
  -1 != a.indexOf("<") && (a = a.replace(goog.string.ltRe_, "&lt;"));
  -1 != a.indexOf(">") && (a = a.replace(goog.string.gtRe_, "&gt;"));
  -1 != a.indexOf('"') && (a = a.replace(goog.string.quotRe_, "&quot;"));
  return a
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(a) {
  return goog.string.contains(a, "&") ? "document" in goog.global ? goog.string.unescapeEntitiesUsingDom_(a) : goog.string.unescapePureXmlEntities_(a) : a
};
goog.string.unescapeEntitiesUsingDom_ = function(a) {
  var b = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'}, c = document.createElement("div");
  return a.replace(goog.string.HTML_ENTITY_PATTERN_, function(a, e) {
    var f = b[a];
    if(f) {
      return f
    }
    if("#" == e.charAt(0)) {
      var g = Number("0" + e.substr(1));
      isNaN(g) || (f = String.fromCharCode(g))
    }
    f || (c.innerHTML = a + " ", f = c.firstChild.nodeValue.slice(0, -1));
    return b[a] = f
  })
};
goog.string.unescapePureXmlEntities_ = function(a) {
  return a.replace(/&([^;]+);/g, function(a, c) {
    switch(c) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if("#" == c.charAt(0)) {
          var d = Number("0" + c.substr(1));
          if(!isNaN(d)) {
            return String.fromCharCode(d)
          }
        }
        return a
    }
  })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(a, b) {
  return goog.string.newLineToBr(a.replace(/  /g, " &#160;"), b)
};
goog.string.stripQuotes = function(a, b) {
  for(var c = b.length, d = 0;d < c;d++) {
    var e = 1 == c ? b : b.charAt(d);
    if(a.charAt(0) == e && a.charAt(a.length - 1) == e) {
      return a.substring(1, a.length - 1)
    }
  }
  return a
};
goog.string.truncate = function(a, b, c) {
  c && (a = goog.string.unescapeEntities(a));
  a.length > b && (a = a.substring(0, b - 3) + "...");
  c && (a = goog.string.htmlEscape(a));
  return a
};
goog.string.truncateMiddle = function(a, b, c, d) {
  c && (a = goog.string.unescapeEntities(a));
  if(d && a.length > b) {
    d > b && (d = b);
    var e = a.length - d, a = a.substring(0, b - d) + "..." + a.substring(e)
  }else {
    a.length > b && (d = Math.floor(b / 2), e = a.length - d, a = a.substring(0, d + b % 2) + "..." + a.substring(e))
  }
  c && (a = goog.string.htmlEscape(a));
  return a
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(a) {
  a = "" + a;
  if(a.quote) {
    return a.quote()
  }
  for(var b = ['"'], c = 0;c < a.length;c++) {
    var d = a.charAt(c), e = d.charCodeAt(0);
    b[c + 1] = goog.string.specialEscapeChars_[d] || (31 < e && 127 > e ? d : goog.string.escapeChar(d))
  }
  b.push('"');
  return b.join("")
};
goog.string.escapeString = function(a) {
  for(var b = [], c = 0;c < a.length;c++) {
    b[c] = goog.string.escapeChar(a.charAt(c))
  }
  return b.join("")
};
goog.string.escapeChar = function(a) {
  if(a in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[a]
  }
  if(a in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[a] = goog.string.specialEscapeChars_[a]
  }
  var b = a, c = a.charCodeAt(0);
  if(31 < c && 127 > c) {
    b = a
  }else {
    if(256 > c) {
      if(b = "\\x", 16 > c || 256 < c) {
        b += "0"
      }
    }else {
      b = "\\u", 4096 > c && (b += "0")
    }
    b += c.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[a] = b
};
goog.string.toMap = function(a) {
  for(var b = {}, c = 0;c < a.length;c++) {
    b[a.charAt(c)] = !0
  }
  return b
};
goog.string.contains = function(a, b) {
  return-1 != a.indexOf(b)
};
goog.string.countOf = function(a, b) {
  return a && b ? a.split(b).length - 1 : 0
};
goog.string.removeAt = function(a, b, c) {
  var d = a;
  0 <= b && b < a.length && 0 < c && (d = a.substr(0, b) + a.substr(b + c, a.length - b - c));
  return d
};
goog.string.remove = function(a, b) {
  var c = RegExp(goog.string.regExpEscape(b), "");
  return a.replace(c, "")
};
goog.string.removeAll = function(a, b) {
  var c = RegExp(goog.string.regExpEscape(b), "g");
  return a.replace(c, "")
};
goog.string.regExpEscape = function(a) {
  return("" + a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(a, b) {
  return Array(b + 1).join(a)
};
goog.string.padNumber = function(a, b, c) {
  a = goog.isDef(c) ? a.toFixed(c) : "" + a;
  c = a.indexOf(".");
  -1 == c && (c = a.length);
  return goog.string.repeat("0", Math.max(0, b - c)) + a
};
goog.string.makeSafe = function(a) {
  return null == a ? "" : "" + a
};
goog.string.buildString = function(a) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(a, b) {
  for(var c = 0, d = goog.string.trim("" + a).split("."), e = goog.string.trim("" + b).split("."), f = Math.max(d.length, e.length), g = 0;0 == c && g < f;g++) {
    var h = d[g] || "", i = e[g] || "", j = RegExp("(\\d*)(\\D*)", "g"), k = RegExp("(\\d*)(\\D*)", "g");
    do {
      var m = j.exec(h) || ["", "", ""], l = k.exec(i) || ["", "", ""];
      if(0 == m[0].length && 0 == l[0].length) {
        break
      }
      var c = 0 == m[1].length ? 0 : parseInt(m[1], 10), n = 0 == l[1].length ? 0 : parseInt(l[1], 10), c = goog.string.compareElements_(c, n) || goog.string.compareElements_(0 == m[2].length, 0 == l[2].length) || goog.string.compareElements_(m[2], l[2])
    }while(0 == c)
  }
  return c
};
goog.string.compareElements_ = function(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(a) {
  for(var b = 0, c = 0;c < a.length;++c) {
    b = 31 * b + a.charCodeAt(c), b %= goog.string.HASHCODE_MAX_
  }
  return b
};
goog.string.uniqueStringCounter_ = 2147483648 * Math.random() | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(a) {
  var b = Number(a);
  return 0 == b && goog.string.isEmpty(a) ? NaN : b
};
goog.string.toCamelCaseCache_ = {};
goog.string.toCamelCase = function(a) {
  return goog.string.toCamelCaseCache_[a] || (goog.string.toCamelCaseCache_[a] = ("" + a).replace(/\-([a-z])/g, function(a, c) {
    return c.toUpperCase()
  }))
};
goog.string.toSelectorCaseCache_ = {};
goog.string.toSelectorCase = function(a) {
  return goog.string.toSelectorCaseCache_[a] || (goog.string.toSelectorCaseCache_[a] = ("" + a).replace(/([A-Z])/g, "-$1").toLowerCase())
};
goog.userAgent = {};
goog.userAgent.ASSUME_IE = !1;
goog.userAgent.ASSUME_GECKO = !1;
goog.userAgent.ASSUME_WEBKIT = !1;
goog.userAgent.ASSUME_MOBILE_WEBKIT = !1;
goog.userAgent.ASSUME_OPERA = !1;
goog.userAgent.ASSUME_ANY_VERSION = !1;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.global.navigator ? goog.global.navigator.userAgent : null
};
goog.userAgent.getNavigator = function() {
  return goog.global.navigator
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = !1;
  goog.userAgent.detectedIe_ = !1;
  goog.userAgent.detectedWebkit_ = !1;
  goog.userAgent.detectedMobile_ = !1;
  goog.userAgent.detectedGecko_ = !1;
  var a;
  if(!goog.userAgent.BROWSER_KNOWN_ && (a = goog.userAgent.getUserAgentString())) {
    var b = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = 0 == a.indexOf("Opera");
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && -1 != a.indexOf("MSIE");
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && -1 != a.indexOf("WebKit");
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && -1 != a.indexOf("Mobile");
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && !goog.userAgent.detectedWebkit_ && "Gecko" == b.product
  }
};
goog.userAgent.BROWSER_KNOWN_ || goog.userAgent.init_();
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var a = goog.userAgent.getNavigator();
  return a && a.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = !1;
goog.userAgent.ASSUME_WINDOWS = !1;
goog.userAgent.ASSUME_LINUX = !1;
goog.userAgent.ASSUME_X11 = !1;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11;
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator().appVersion || "", "X11")
};
goog.userAgent.PLATFORM_KNOWN_ || goog.userAgent.initPlatform_();
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.determineVersion_ = function() {
  var a = "", b;
  goog.userAgent.OPERA && goog.global.opera ? (a = goog.global.opera.version, a = "function" == typeof a ? a() : a) : (goog.userAgent.GECKO ? b = /rv\:([^\);]+)(\)|;)/ : goog.userAgent.IE ? b = /MSIE\s+([^\);]+)(\)|;)/ : goog.userAgent.WEBKIT && (b = /WebKit\/(\S+)/), b && (a = (a = b.exec(goog.userAgent.getUserAgentString())) ? a[1] : ""));
  return goog.userAgent.IE && (b = goog.userAgent.getDocumentMode_(), b > parseFloat(a)) ? "" + b : a
};
goog.userAgent.getDocumentMode_ = function() {
  var a = goog.global.document;
  return a ? a.documentMode : void 0
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(a, b) {
  return goog.string.compareVersions(a, b)
};
goog.userAgent.isVersionCache_ = {};
goog.userAgent.isVersion = function(a) {
  return goog.userAgent.ASSUME_ANY_VERSION || goog.userAgent.isVersionCache_[a] || (goog.userAgent.isVersionCache_[a] = 0 <= goog.string.compareVersions(goog.userAgent.VERSION, a))
};
goog.userAgent.isDocumentModeCache_ = {};
goog.userAgent.isDocumentMode = function(a) {
  return goog.userAgent.isDocumentModeCache_[a] || (goog.userAgent.isDocumentModeCache_[a] = goog.userAgent.IE && document.documentMode && document.documentMode >= a)
};
var bot = {};
try {
  bot.window_ = window
}catch(ignored) {
  bot.window_ = goog.global
}
bot.getWindow = function() {
  return bot.window_
};
bot.setWindow = function(a) {
  bot.window_ = a
};
bot.getDocument = function() {
  return bot.window_.document
};
goog.color = {};
goog.color.names = {aliceblue:"#f0f8ff", antiquewhite:"#faebd7", aqua:"#00ffff", aquamarine:"#7fffd4", azure:"#f0ffff", beige:"#f5f5dc", bisque:"#ffe4c4", black:"#000000", blanchedalmond:"#ffebcd", blue:"#0000ff", blueviolet:"#8a2be2", brown:"#a52a2a", burlywood:"#deb887", cadetblue:"#5f9ea0", chartreuse:"#7fff00", chocolate:"#d2691e", coral:"#ff7f50", cornflowerblue:"#6495ed", cornsilk:"#fff8dc", crimson:"#dc143c", cyan:"#00ffff", darkblue:"#00008b", darkcyan:"#008b8b", darkgoldenrod:"#b8860b", 
darkgray:"#a9a9a9", darkgreen:"#006400", darkgrey:"#a9a9a9", darkkhaki:"#bdb76b", darkmagenta:"#8b008b", darkolivegreen:"#556b2f", darkorange:"#ff8c00", darkorchid:"#9932cc", darkred:"#8b0000", darksalmon:"#e9967a", darkseagreen:"#8fbc8f", darkslateblue:"#483d8b", darkslategray:"#2f4f4f", darkslategrey:"#2f4f4f", darkturquoise:"#00ced1", darkviolet:"#9400d3", deeppink:"#ff1493", deepskyblue:"#00bfff", dimgray:"#696969", dimgrey:"#696969", dodgerblue:"#1e90ff", firebrick:"#b22222", floralwhite:"#fffaf0", 
forestgreen:"#228b22", fuchsia:"#ff00ff", gainsboro:"#dcdcdc", ghostwhite:"#f8f8ff", gold:"#ffd700", goldenrod:"#daa520", gray:"#808080", green:"#008000", greenyellow:"#adff2f", grey:"#808080", honeydew:"#f0fff0", hotpink:"#ff69b4", indianred:"#cd5c5c", indigo:"#4b0082", ivory:"#fffff0", khaki:"#f0e68c", lavender:"#e6e6fa", lavenderblush:"#fff0f5", lawngreen:"#7cfc00", lemonchiffon:"#fffacd", lightblue:"#add8e6", lightcoral:"#f08080", lightcyan:"#e0ffff", lightgoldenrodyellow:"#fafad2", lightgray:"#d3d3d3", 
lightgreen:"#90ee90", lightgrey:"#d3d3d3", lightpink:"#ffb6c1", lightsalmon:"#ffa07a", lightseagreen:"#20b2aa", lightskyblue:"#87cefa", lightslategray:"#778899", lightslategrey:"#778899", lightsteelblue:"#b0c4de", lightyellow:"#ffffe0", lime:"#00ff00", limegreen:"#32cd32", linen:"#faf0e6", magenta:"#ff00ff", maroon:"#800000", mediumaquamarine:"#66cdaa", mediumblue:"#0000cd", mediumorchid:"#ba55d3", mediumpurple:"#9370d8", mediumseagreen:"#3cb371", mediumslateblue:"#7b68ee", mediumspringgreen:"#00fa9a", 
mediumturquoise:"#48d1cc", mediumvioletred:"#c71585", midnightblue:"#191970", mintcream:"#f5fffa", mistyrose:"#ffe4e1", moccasin:"#ffe4b5", navajowhite:"#ffdead", navy:"#000080", oldlace:"#fdf5e6", olive:"#808000", olivedrab:"#6b8e23", orange:"#ffa500", orangered:"#ff4500", orchid:"#da70d6", palegoldenrod:"#eee8aa", palegreen:"#98fb98", paleturquoise:"#afeeee", palevioletred:"#d87093", papayawhip:"#ffefd5", peachpuff:"#ffdab9", peru:"#cd853f", pink:"#ffc0cb", plum:"#dda0dd", powderblue:"#b0e0e6", 
purple:"#800080", red:"#ff0000", rosybrown:"#bc8f8f", royalblue:"#4169e1", saddlebrown:"#8b4513", salmon:"#fa8072", sandybrown:"#f4a460", seagreen:"#2e8b57", seashell:"#fff5ee", sienna:"#a0522d", silver:"#c0c0c0", skyblue:"#87ceeb", slateblue:"#6a5acd", slategray:"#708090", slategrey:"#708090", snow:"#fffafa", springgreen:"#00ff7f", steelblue:"#4682b4", tan:"#d2b48c", teal:"#008080", thistle:"#d8bfd8", tomato:"#ff6347", turquoise:"#40e0d0", violet:"#ee82ee", wheat:"#f5deb3", white:"#ffffff", whitesmoke:"#f5f5f5", 
yellow:"#ffff00", yellowgreen:"#9acd32"};
goog.debug = {};
goog.debug.Error = function(a) {
  this.stack = Error().stack || "";
  a && (this.message = "" + a)
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.asserts = {};
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(a, b) {
  b.unshift(a);
  goog.debug.Error.call(this, goog.string.subs.apply(null, b));
  b.shift();
  this.messagePattern = a
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(a, b, c, d) {
  var e = "Assertion failed";
  if(c) {
    var e = e + (": " + c), f = d
  }else {
    a && (e += ": " + a, f = b)
  }
  throw new goog.asserts.AssertionError("" + e, f || []);
};
goog.asserts.assert = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !a && goog.asserts.doAssertFailure_("", null, b, Array.prototype.slice.call(arguments, 2));
  return a
};
goog.asserts.fail = function(a, b) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isNumber(a) && goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
goog.asserts.assertString = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isString(a) && goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
goog.asserts.assertFunction = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isFunction(a) && goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
goog.asserts.assertObject = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isObject(a) && goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
goog.asserts.assertArray = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isArray(a) && goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
goog.asserts.assertBoolean = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(a) && goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
goog.asserts.assertInstanceof = function(a, b, c, d) {
  goog.asserts.ENABLE_ASSERTS && !(a instanceof b) && goog.asserts.doAssertFailure_("instanceof check failed.", null, c, Array.prototype.slice.call(arguments, 3))
};
goog.array = {};
goog.NATIVE_ARRAY_PROTOTYPES = !1;
goog.array.peek = function(a) {
  return a[a.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(a, b, c)
} : function(a, b, c) {
  c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
  if(goog.isString(a)) {
    return!goog.isString(b) || 1 != b.length ? -1 : a.indexOf(b, c)
  }
  for(;c < a.length;c++) {
    if(c in a && a[c] === b) {
      return c
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(a, b, null == c ? a.length - 1 : c)
} : function(a, b, c) {
  c = null == c ? a.length - 1 : c;
  0 > c && (c = Math.max(0, a.length + c));
  if(goog.isString(a)) {
    return!goog.isString(b) || 1 != b.length ? -1 : a.lastIndexOf(b, c)
  }
  for(;0 <= c;c--) {
    if(c in a && a[c] === b) {
      return c
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(a, b, c)
} : function(a, b, c) {
  for(var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0;f < d;f++) {
    f in e && b.call(c, e[f], f, a)
  }
};
goog.array.forEachRight = function(a, b, c) {
  for(var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1;0 <= d;--d) {
    d in e && b.call(c, e[d], d, a)
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(a, b, c)
} : function(a, b, c) {
  for(var d = a.length, e = [], f = 0, g = goog.isString(a) ? a.split("") : a, h = 0;h < d;h++) {
    if(h in g) {
      var i = g[h];
      b.call(c, i, h, a) && (e[f++] = i)
    }
  }
  return e
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.map.call(a, b, c)
} : function(a, b, c) {
  for(var d = a.length, e = Array(d), f = goog.isString(a) ? a.split("") : a, g = 0;g < d;g++) {
    g in f && (e[g] = b.call(c, f[g], g, a))
  }
  return e
};
goog.array.reduce = function(a, b, c, d) {
  if(a.reduce) {
    return d ? a.reduce(goog.bind(b, d), c) : a.reduce(b, c)
  }
  var e = c;
  goog.array.forEach(a, function(c, g) {
    e = b.call(d, e, c, g, a)
  });
  return e
};
goog.array.reduceRight = function(a, b, c, d) {
  if(a.reduceRight) {
    return d ? a.reduceRight(goog.bind(b, d), c) : a.reduceRight(b, c)
  }
  var e = c;
  goog.array.forEachRight(a, function(c, g) {
    e = b.call(d, e, c, g, a)
  });
  return e
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.some.call(a, b, c)
} : function(a, b, c) {
  for(var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0;f < d;f++) {
    if(f in e && b.call(c, e[f], f, a)) {
      return!0
    }
  }
  return!1
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.every.call(a, b, c)
} : function(a, b, c) {
  for(var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0;f < d;f++) {
    if(f in e && !b.call(c, e[f], f, a)) {
      return!1
    }
  }
  return!0
};
goog.array.find = function(a, b, c) {
  b = goog.array.findIndex(a, b, c);
  return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndex = function(a, b, c) {
  for(var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0;f < d;f++) {
    if(f in e && b.call(c, e[f], f, a)) {
      return f
    }
  }
  return-1
};
goog.array.findRight = function(a, b, c) {
  b = goog.array.findIndexRight(a, b, c);
  return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndexRight = function(a, b, c) {
  for(var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1;0 <= d;d--) {
    if(d in e && b.call(c, e[d], d, a)) {
      return d
    }
  }
  return-1
};
goog.array.contains = function(a, b) {
  return 0 <= goog.array.indexOf(a, b)
};
goog.array.isEmpty = function(a) {
  return 0 == a.length
};
goog.array.clear = function(a) {
  if(!goog.isArray(a)) {
    for(var b = a.length - 1;0 <= b;b--) {
      delete a[b]
    }
  }
  a.length = 0
};
goog.array.insert = function(a, b) {
  goog.array.contains(a, b) || a.push(b)
};
goog.array.insertAt = function(a, b, c) {
  goog.array.splice(a, c, 0, b)
};
goog.array.insertArrayAt = function(a, b, c) {
  goog.partial(goog.array.splice, a, c, 0).apply(null, b)
};
goog.array.insertBefore = function(a, b, c) {
  var d;
  2 == arguments.length || 0 > (d = goog.array.indexOf(a, c)) ? a.push(b) : goog.array.insertAt(a, b, d)
};
goog.array.remove = function(a, b) {
  var c = goog.array.indexOf(a, b), d;
  (d = 0 <= c) && goog.array.removeAt(a, c);
  return d
};
goog.array.removeAt = function(a, b) {
  goog.asserts.assert(null != a.length);
  return 1 == goog.array.ARRAY_PROTOTYPE_.splice.call(a, b, 1).length
};
goog.array.removeIf = function(a, b, c) {
  b = goog.array.findIndex(a, b, c);
  return 0 <= b ? (goog.array.removeAt(a, b), !0) : !1
};
goog.array.concat = function(a) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function(a) {
  if(goog.isArray(a)) {
    return goog.array.concat(a)
  }
  for(var b = [], c = 0, d = a.length;c < d;c++) {
    b[c] = a[c]
  }
  return b
};
goog.array.toArray = function(a) {
  return goog.isArray(a) ? goog.array.concat(a) : goog.array.clone(a)
};
goog.array.extend = function(a, b) {
  for(var c = 1;c < arguments.length;c++) {
    var d = arguments[c], e;
    if(goog.isArray(d) || (e = goog.isArrayLike(d)) && d.hasOwnProperty("callee")) {
      a.push.apply(a, d)
    }else {
      if(e) {
        for(var f = a.length, g = d.length, h = 0;h < g;h++) {
          a[f + h] = d[h]
        }
      }else {
        a.push(d)
      }
    }
  }
};
goog.array.splice = function(a, b, c, d) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(a, goog.array.slice(arguments, 1))
};
goog.array.slice = function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return 2 >= arguments.length ? goog.array.ARRAY_PROTOTYPE_.slice.call(a, b) : goog.array.ARRAY_PROTOTYPE_.slice.call(a, b, c)
};
goog.array.removeDuplicates = function(a, b) {
  for(var c = b || a, d = {}, e = 0, f = 0;f < a.length;) {
    var g = a[f++], h = goog.isObject(g) ? "o" + goog.getUid(g) : (typeof g).charAt(0) + g;
    Object.prototype.hasOwnProperty.call(d, h) || (d[h] = !0, c[e++] = g)
  }
  c.length = e
};
goog.array.binarySearch = function(a, b, c) {
  return goog.array.binarySearch_(a, c || goog.array.defaultCompare, !1, b)
};
goog.array.binarySelect = function(a, b, c) {
  return goog.array.binarySearch_(a, b, !0, void 0, c)
};
goog.array.binarySearch_ = function(a, b, c, d, e) {
  for(var f = 0, g = a.length, h;f < g;) {
    var i = f + g >> 1, j;
    j = c ? b.call(e, a[i], i, a) : b(d, a[i]);
    0 < j ? f = i + 1 : (g = i, h = !j)
  }
  return h ? f : ~f
};
goog.array.sort = function(a, b) {
  goog.asserts.assert(null != a.length);
  goog.array.ARRAY_PROTOTYPE_.sort.call(a, b || goog.array.defaultCompare)
};
goog.array.stableSort = function(a, b) {
  for(var c = 0;c < a.length;c++) {
    a[c] = {index:c, value:a[c]}
  }
  var d = b || goog.array.defaultCompare;
  goog.array.sort(a, function(a, b) {
    return d(a.value, b.value) || a.index - b.index
  });
  for(c = 0;c < a.length;c++) {
    a[c] = a[c].value
  }
};
goog.array.sortObjectsByKey = function(a, b, c) {
  var d = c || goog.array.defaultCompare;
  goog.array.sort(a, function(a, c) {
    return d(a[b], c[b])
  })
};
goog.array.isSorted = function(a, b, c) {
  for(var b = b || goog.array.defaultCompare, d = 1;d < a.length;d++) {
    var e = b(a[d - 1], a[d]);
    if(0 < e || 0 == e && c) {
      return!1
    }
  }
  return!0
};
goog.array.equals = function(a, b, c) {
  if(!goog.isArrayLike(a) || !goog.isArrayLike(b) || a.length != b.length) {
    return!1
  }
  for(var d = a.length, c = c || goog.array.defaultCompareEquality, e = 0;e < d;e++) {
    if(!c(a[e], b[e])) {
      return!1
    }
  }
  return!0
};
goog.array.compare = function(a, b, c) {
  return goog.array.equals(a, b, c)
};
goog.array.compare3 = function(a, b, c) {
  for(var c = c || goog.array.defaultCompare, d = Math.min(a.length, b.length), e = 0;e < d;e++) {
    var f = c(a[e], b[e]);
    if(0 != f) {
      return f
    }
  }
  return goog.array.defaultCompare(a.length, b.length)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(a, b, c) {
  c = goog.array.binarySearch(a, b, c);
  return 0 > c ? (goog.array.insertAt(a, b, -(c + 1)), !0) : !1
};
goog.array.binaryRemove = function(a, b, c) {
  b = goog.array.binarySearch(a, b, c);
  return 0 <= b ? goog.array.removeAt(a, b) : !1
};
goog.array.bucket = function(a, b) {
  for(var c = {}, d = 0;d < a.length;d++) {
    var e = a[d], f = b(e, d, a);
    goog.isDef(f) && (c[f] || (c[f] = [])).push(e)
  }
  return c
};
goog.array.repeat = function(a, b) {
  for(var c = [], d = 0;d < b;d++) {
    c[d] = a
  }
  return c
};
goog.array.flatten = function(a) {
  for(var b = [], c = 0;c < arguments.length;c++) {
    var d = arguments[c];
    goog.isArray(d) ? b.push.apply(b, goog.array.flatten.apply(null, d)) : b.push(d)
  }
  return b
};
goog.array.rotate = function(a, b) {
  goog.asserts.assert(null != a.length);
  a.length && (b %= a.length, 0 < b ? goog.array.ARRAY_PROTOTYPE_.unshift.apply(a, a.splice(-b, b)) : 0 > b && goog.array.ARRAY_PROTOTYPE_.push.apply(a, a.splice(0, -b)));
  return a
};
goog.array.zip = function(a) {
  if(!arguments.length) {
    return[]
  }
  for(var b = [], c = 0;;c++) {
    for(var d = [], e = 0;e < arguments.length;e++) {
      var f = arguments[e];
      if(c >= f.length) {
        return b
      }
      d.push(f[c])
    }
    b.push(d)
  }
};
goog.array.shuffle = function(a, b) {
  for(var c = b || Math.random, d = a.length - 1;0 < d;d--) {
    var e = Math.floor(c() * (d + 1)), f = a[d];
    a[d] = a[e];
    a[e] = f
  }
};
goog.math = {};
goog.math.randomInt = function(a) {
  return Math.floor(Math.random() * a)
};
goog.math.uniformRandom = function(a, b) {
  return a + Math.random() * (b - a)
};
goog.math.clamp = function(a, b, c) {
  return Math.min(Math.max(a, b), c)
};
goog.math.modulo = function(a, b) {
  var c = a % b;
  return 0 > c * b ? c + b : c
};
goog.math.lerp = function(a, b, c) {
  return a + c * (b - a)
};
goog.math.nearlyEquals = function(a, b, c) {
  return Math.abs(a - b) <= (c || 1.0E-6)
};
goog.math.standardAngle = function(a) {
  return goog.math.modulo(a, 360)
};
goog.math.toRadians = function(a) {
  return a * Math.PI / 180
};
goog.math.toDegrees = function(a) {
  return 180 * a / Math.PI
};
goog.math.angleDx = function(a, b) {
  return b * Math.cos(goog.math.toRadians(a))
};
goog.math.angleDy = function(a, b) {
  return b * Math.sin(goog.math.toRadians(a))
};
goog.math.angle = function(a, b, c, d) {
  return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(d - b, c - a)))
};
goog.math.angleDifference = function(a, b) {
  var c = goog.math.standardAngle(b) - goog.math.standardAngle(a);
  180 < c ? c -= 360 : -180 >= c && (c = 360 + c);
  return c
};
goog.math.sign = function(a) {
  return 0 == a ? 0 : 0 > a ? -1 : 1
};
goog.math.longestCommonSubsequence = function(a, b, c, d) {
  for(var c = c || function(a, b) {
    return a == b
  }, d = d || function(b) {
    return a[b]
  }, e = a.length, f = b.length, g = [], h = 0;h < e + 1;h++) {
    g[h] = [], g[h][0] = 0
  }
  for(var i = 0;i < f + 1;i++) {
    g[0][i] = 0
  }
  for(h = 1;h <= e;h++) {
    for(i = 1;i <= e;i++) {
      g[h][i] = c(a[h - 1], b[i - 1]) ? g[h - 1][i - 1] + 1 : Math.max(g[h - 1][i], g[h][i - 1])
    }
  }
  for(var j = [], h = e, i = f;0 < h && 0 < i;) {
    c(a[h - 1], b[i - 1]) ? (j.unshift(d(h - 1, i - 1)), h--, i--) : g[h - 1][i] > g[h][i - 1] ? h-- : i--
  }
  return j
};
goog.math.sum = function(a) {
  return goog.array.reduce(arguments, function(a, c) {
    return a + c
  }, 0)
};
goog.math.average = function(a) {
  return goog.math.sum.apply(null, arguments) / arguments.length
};
goog.math.standardDeviation = function(a) {
  var b = arguments.length;
  if(2 > b) {
    return 0
  }
  var c = goog.math.average.apply(null, arguments), b = goog.math.sum.apply(null, goog.array.map(arguments, function(a) {
    return Math.pow(a - c, 2)
  })) / (b - 1);
  return Math.sqrt(b)
};
goog.math.isInt = function(a) {
  return isFinite(a) && 0 == a % 1
};
goog.math.isFiniteNumber = function(a) {
  return isFinite(a) && !isNaN(a)
};
bot.color = {};
bot.color.standardizeColor = function(a, b) {
  return bot.color.isColorProperty(a) && bot.color.isConvertibleColor(b) ? bot.color.standardizeToRgba_(b) : b
};
bot.color.standardizeToRgba_ = function(a) {
  var b = bot.color.parseRgbaColor(a);
  b.length || (b = bot.color.convertToRgba_(a), bot.color.addAlphaIfNecessary_(b));
  return 4 != b.length ? a : bot.color.toRgbaStyle_(b)
};
bot.color.convertToRgba_ = function(a) {
  var b = bot.color.parseRgbColor_(a);
  if(b.length) {
    return b
  }
  b = goog.color.names[a.toLowerCase()];
  b = !b ? bot.color.prependHashIfNecessary_(a) : b;
  return bot.color.isValidHexColor_(b) && (b = bot.color.hexToRgb(bot.color.normalizeHex(b)), b.length) ? b : []
};
bot.color.isConvertibleColor = function(a) {
  return!(!bot.color.isValidHexColor_(bot.color.prependHashIfNecessary_(a)) && !bot.color.parseRgbColor_(a).length && !(goog.color.names && goog.color.names[a.toLowerCase()] || bot.color.parseRgbaColor(a).length))
};
bot.color.COLOR_PROPERTIES_ = "background-color,border-top-color,border-right-color,border-bottom-color,border-left-color,color,outline-color".split(",");
bot.color.isColorProperty = function(a) {
  return goog.array.contains(bot.color.COLOR_PROPERTIES_, a)
};
bot.color.HEX_TRIPLET_RE_ = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/;
bot.color.normalizeHex = function(a) {
  if(!bot.color.isValidHexColor_(a)) {
    throw Error("'" + a + "' is not a valid hex color");
  }
  4 == a.length && (a = a.replace(bot.color.HEX_TRIPLET_RE_, "#$1$1$2$2$3$3"));
  return a.toLowerCase()
};
bot.color.hexToRgb = function(a) {
  var a = bot.color.normalizeHex(a), b = parseInt(a.substr(1, 2), 16), c = parseInt(a.substr(3, 2), 16), a = parseInt(a.substr(5, 2), 16);
  return[b, c, a]
};
bot.color.VALID_HEX_COLOR_RE_ = /^#(?:[0-9a-f]{3}){1,2}$/i;
bot.color.isValidHexColor_ = function(a) {
  return bot.color.VALID_HEX_COLOR_RE_.test(a)
};
bot.color.NORMALIZED_HEX_COLOR_RE_ = /^#[0-9a-f]{6}$/;
bot.color.isNormalizedHexColor_ = function(a) {
  return bot.color.NORMALIZED_HEX_COLOR_RE_.test(a)
};
bot.color.RGBA_COLOR_RE_ = /^(?:rgba)?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),\s?(0|1|0\.\d*)\)$/i;
bot.color.parseRgbaColor = function(a) {
  var b = a.match(bot.color.RGBA_COLOR_RE_);
  if(b) {
    var a = Number(b[1]), c = Number(b[2]), d = Number(b[3]), b = Number(b[4]);
    if(0 <= a && 255 >= a && 0 <= c && 255 >= c && 0 <= d && 255 >= d && 0 <= b && 1 >= b) {
      return[a, c, d, b]
    }
  }
  return[]
};
bot.color.RGB_COLOR_RE_ = /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;
bot.color.parseRgbColor_ = function(a) {
  var b = a.match(bot.color.RGB_COLOR_RE_);
  if(b) {
    var a = Number(b[1]), c = Number(b[2]), b = Number(b[3]);
    if(0 <= a && 255 >= a && 0 <= c && 255 >= c && 0 <= b && 255 >= b) {
      return[a, c, b]
    }
  }
  return[]
};
bot.color.prependHashIfNecessary_ = function(a) {
  return"#" == a.charAt(0) ? a : "#" + a
};
bot.color.addAlphaIfNecessary_ = function(a) {
  3 == a.length && a.push(1);
  return a
};
bot.color.toRgbaStyle_ = function(a) {
  return"rgba(" + a.join(", ") + ")"
};
goog.object = {};
goog.object.forEach = function(a, b, c) {
  for(var d in a) {
    b.call(c, a[d], d, a)
  }
};
goog.object.filter = function(a, b, c) {
  var d = {}, e;
  for(e in a) {
    b.call(c, a[e], e, a) && (d[e] = a[e])
  }
  return d
};
goog.object.map = function(a, b, c) {
  var d = {}, e;
  for(e in a) {
    d[e] = b.call(c, a[e], e, a)
  }
  return d
};
goog.object.some = function(a, b, c) {
  for(var d in a) {
    if(b.call(c, a[d], d, a)) {
      return!0
    }
  }
  return!1
};
goog.object.every = function(a, b, c) {
  for(var d in a) {
    if(!b.call(c, a[d], d, a)) {
      return!1
    }
  }
  return!0
};
goog.object.getCount = function(a) {
  var b = 0, c;
  for(c in a) {
    b++
  }
  return b
};
goog.object.getAnyKey = function(a) {
  for(var b in a) {
    return b
  }
};
goog.object.getAnyValue = function(a) {
  for(var b in a) {
    return a[b]
  }
};
goog.object.contains = function(a, b) {
  return goog.object.containsValue(a, b)
};
goog.object.getValues = function(a) {
  var b = [], c = 0, d;
  for(d in a) {
    b[c++] = a[d]
  }
  return b
};
goog.object.getKeys = function(a) {
  var b = [], c = 0, d;
  for(d in a) {
    b[c++] = d
  }
  return b
};
goog.object.getValueByKeys = function(a, b) {
  for(var c = goog.isArrayLike(b), d = c ? b : arguments, c = c ? 0 : 1;c < d.length && !(a = a[d[c]], !goog.isDef(a));c++) {
  }
  return a
};
goog.object.containsKey = function(a, b) {
  return b in a
};
goog.object.containsValue = function(a, b) {
  for(var c in a) {
    if(a[c] == b) {
      return!0
    }
  }
  return!1
};
goog.object.findKey = function(a, b, c) {
  for(var d in a) {
    if(b.call(c, a[d], d, a)) {
      return d
    }
  }
};
goog.object.findValue = function(a, b, c) {
  return(b = goog.object.findKey(a, b, c)) && a[b]
};
goog.object.isEmpty = function(a) {
  for(var b in a) {
    return!1
  }
  return!0
};
goog.object.clear = function(a) {
  for(var b in a) {
    delete a[b]
  }
};
goog.object.remove = function(a, b) {
  var c;
  (c = b in a) && delete a[b];
  return c
};
goog.object.add = function(a, b, c) {
  if(b in a) {
    throw Error('The object already contains the key "' + b + '"');
  }
  goog.object.set(a, b, c)
};
goog.object.get = function(a, b, c) {
  return b in a ? a[b] : c
};
goog.object.set = function(a, b, c) {
  a[b] = c
};
goog.object.setIfUndefined = function(a, b, c) {
  return b in a ? a[b] : a[b] = c
};
goog.object.clone = function(a) {
  var b = {}, c;
  for(c in a) {
    b[c] = a[c]
  }
  return b
};
goog.object.unsafeClone = function(a) {
  var b = goog.typeOf(a);
  if("object" == b || "array" == b) {
    if(a.clone) {
      return a.clone()
    }
    var b = "array" == b ? [] : {}, c;
    for(c in a) {
      b[c] = goog.object.unsafeClone(a[c])
    }
    return b
  }
  return a
};
goog.object.transpose = function(a) {
  var b = {}, c;
  for(c in a) {
    b[a[c]] = c
  }
  return b
};
goog.object.PROTOTYPE_FIELDS_ = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
goog.object.extend = function(a, b) {
  for(var c, d, e = 1;e < arguments.length;e++) {
    d = arguments[e];
    for(c in d) {
      a[c] = d[c]
    }
    for(var f = 0;f < goog.object.PROTOTYPE_FIELDS_.length;f++) {
      c = goog.object.PROTOTYPE_FIELDS_[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
    }
  }
};
goog.object.create = function(a) {
  var b = arguments.length;
  if(1 == b && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0])
  }
  if(b % 2) {
    throw Error("Uneven number of arguments");
  }
  for(var c = {}, d = 0;d < b;d += 2) {
    c[arguments[d]] = arguments[d + 1]
  }
  return c
};
goog.object.createSet = function(a) {
  var b = arguments.length;
  if(1 == b && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0])
  }
  for(var c = {}, d = 0;d < b;d++) {
    c[arguments[d]] = !0
  }
  return c
};
bot.ErrorCode = {SUCCESS:0, NO_SUCH_ELEMENT:7, NO_SUCH_FRAME:8, UNKNOWN_COMMAND:9, UNSUPPORTED_OPERATION:9, STALE_ELEMENT_REFERENCE:10, ELEMENT_NOT_VISIBLE:11, INVALID_ELEMENT_STATE:12, UNKNOWN_ERROR:13, ELEMENT_NOT_SELECTABLE:15, JAVASCRIPT_ERROR:17, XPATH_LOOKUP_ERROR:19, TIMEOUT:21, NO_SUCH_WINDOW:23, INVALID_COOKIE_DOMAIN:24, UNABLE_TO_SET_COOKIE:25, MODAL_DIALOG_OPENED:26, NO_MODAL_DIALOG_OPEN:27, SCRIPT_TIMEOUT:28, INVALID_ELEMENT_COORDINATES:29, IME_NOT_AVAILABLE:30, IME_ENGINE_ACTIVATION_FAILED:31, 
INVALID_SELECTOR_ERROR:32, SESSION_NOT_CREATED:33, MOVE_TARGET_OUT_OF_BOUNDS:34, SQL_DATABASE_ERROR:35};
bot.Error = function(a, b) {
  this.code = a;
  this.message = b || "";
  this.name = bot.Error.NAMES_[a] || bot.Error.NAMES_[bot.ErrorCode.UNKNOWN_ERROR];
  var c = Error(this.message);
  c.name = this.name;
  this.stack = c.stack || ""
};
goog.inherits(bot.Error, Error);
bot.Error.NAMES_ = goog.object.create(bot.ErrorCode.NO_SUCH_ELEMENT, "NoSuchElementError", bot.ErrorCode.NO_SUCH_FRAME, "NoSuchFrameError", bot.ErrorCode.UNKNOWN_COMMAND, "UnknownCommandError", bot.ErrorCode.STALE_ELEMENT_REFERENCE, "StaleElementReferenceError", bot.ErrorCode.ELEMENT_NOT_VISIBLE, "ElementNotVisibleError", bot.ErrorCode.INVALID_ELEMENT_STATE, "InvalidElementStateError", bot.ErrorCode.UNKNOWN_ERROR, "UnknownError", bot.ErrorCode.ELEMENT_NOT_SELECTABLE, "ElementNotSelectableError", 
bot.ErrorCode.XPATH_LOOKUP_ERROR, "XPathLookupError", bot.ErrorCode.NO_SUCH_WINDOW, "NoSuchWindowError", bot.ErrorCode.INVALID_COOKIE_DOMAIN, "InvalidCookieDomainError", bot.ErrorCode.UNABLE_TO_SET_COOKIE, "UnableToSetCookieError", bot.ErrorCode.MODAL_DIALOG_OPENED, "ModalDialogOpenedError", bot.ErrorCode.NO_MODAL_DIALOG_OPEN, "NoModalDialogOpenError", bot.ErrorCode.SCRIPT_TIMEOUT, "ScriptTimeoutError", bot.ErrorCode.INVALID_SELECTOR_ERROR, "InvalidSelectorError", bot.ErrorCode.SQL_DATABASE_ERROR, 
"SqlDatabaseError", bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS, "MoveTargetOutOfBoundsError");
bot.Error.prototype.isAutomationError = !0;
goog.DEBUG && (bot.Error.prototype.toString = function() {
  return"[" + this.name + "] " + this.message
});
goog.dom = {};
goog.dom.BrowserFeature = {CAN_ADD_NAME_OR_TYPE_ATTRIBUTES:!goog.userAgent.IE || goog.userAgent.isDocumentMode(9), CAN_USE_CHILDREN_ATTRIBUTE:!goog.userAgent.GECKO && !goog.userAgent.IE || goog.userAgent.IE && goog.userAgent.isDocumentMode(9) || goog.userAgent.GECKO && goog.userAgent.isVersion("1.9.1"), CAN_USE_INNER_TEXT:goog.userAgent.IE && !goog.userAgent.isVersion("9"), INNER_HTML_NEEDS_SCOPED_ELEMENT:goog.userAgent.IE};
goog.dom.TagName = {A:"A", ABBR:"ABBR", ACRONYM:"ACRONYM", ADDRESS:"ADDRESS", APPLET:"APPLET", AREA:"AREA", B:"B", BASE:"BASE", BASEFONT:"BASEFONT", BDO:"BDO", BIG:"BIG", BLOCKQUOTE:"BLOCKQUOTE", BODY:"BODY", BR:"BR", BUTTON:"BUTTON", CANVAS:"CANVAS", CAPTION:"CAPTION", CENTER:"CENTER", CITE:"CITE", CODE:"CODE", COL:"COL", COLGROUP:"COLGROUP", DD:"DD", DEL:"DEL", DFN:"DFN", DIR:"DIR", DIV:"DIV", DL:"DL", DT:"DT", EM:"EM", FIELDSET:"FIELDSET", FONT:"FONT", FORM:"FORM", FRAME:"FRAME", FRAMESET:"FRAMESET", 
H1:"H1", H2:"H2", H3:"H3", H4:"H4", H5:"H5", H6:"H6", HEAD:"HEAD", HR:"HR", HTML:"HTML", I:"I", IFRAME:"IFRAME", IMG:"IMG", INPUT:"INPUT", INS:"INS", ISINDEX:"ISINDEX", KBD:"KBD", LABEL:"LABEL", LEGEND:"LEGEND", LI:"LI", LINK:"LINK", MAP:"MAP", MENU:"MENU", META:"META", NOFRAMES:"NOFRAMES", NOSCRIPT:"NOSCRIPT", OBJECT:"OBJECT", OL:"OL", OPTGROUP:"OPTGROUP", OPTION:"OPTION", P:"P", PARAM:"PARAM", PRE:"PRE", Q:"Q", S:"S", SAMP:"SAMP", SCRIPT:"SCRIPT", SELECT:"SELECT", SMALL:"SMALL", SPAN:"SPAN", STRIKE:"STRIKE", 
STRONG:"STRONG", STYLE:"STYLE", SUB:"SUB", SUP:"SUP", TABLE:"TABLE", TBODY:"TBODY", TD:"TD", TEXTAREA:"TEXTAREA", TFOOT:"TFOOT", TH:"TH", THEAD:"THEAD", TITLE:"TITLE", TR:"TR", TT:"TT", U:"U", UL:"UL", VAR:"VAR"};
goog.dom.classes = {};
goog.dom.classes.set = function(a, b) {
  a.className = b
};
goog.dom.classes.get = function(a) {
  return(a = a.className) && "function" == typeof a.split ? a.split(/\s+/) : []
};
goog.dom.classes.add = function(a, b) {
  var c = goog.dom.classes.get(a), d = goog.array.slice(arguments, 1), d = goog.dom.classes.add_(c, d);
  a.className = c.join(" ");
  return d
};
goog.dom.classes.remove = function(a, b) {
  var c = goog.dom.classes.get(a), d = goog.array.slice(arguments, 1), d = goog.dom.classes.remove_(c, d);
  a.className = c.join(" ");
  return d
};
goog.dom.classes.add_ = function(a, b) {
  for(var c = 0, d = 0;d < b.length;d++) {
    goog.array.contains(a, b[d]) || (a.push(b[d]), c++)
  }
  return c == b.length
};
goog.dom.classes.remove_ = function(a, b) {
  for(var c = 0, d = 0;d < a.length;d++) {
    goog.array.contains(b, a[d]) && (goog.array.splice(a, d--, 1), c++)
  }
  return c == b.length
};
goog.dom.classes.swap = function(a, b, c) {
  for(var d = goog.dom.classes.get(a), e = !1, f = 0;f < d.length;f++) {
    d[f] == b && (goog.array.splice(d, f--, 1), e = !0)
  }
  e && (d.push(c), a.className = d.join(" "));
  return e
};
goog.dom.classes.addRemove = function(a, b, c) {
  var d = goog.dom.classes.get(a);
  goog.isString(b) ? goog.array.remove(d, b) : goog.isArray(b) && goog.dom.classes.remove_(d, b);
  goog.isString(c) && !goog.array.contains(d, c) ? d.push(c) : goog.isArray(c) && goog.dom.classes.add_(d, c);
  a.className = d.join(" ")
};
goog.dom.classes.has = function(a, b) {
  return goog.array.contains(goog.dom.classes.get(a), b)
};
goog.dom.classes.enable = function(a, b, c) {
  c ? goog.dom.classes.add(a, b) : goog.dom.classes.remove(a, b)
};
goog.dom.classes.toggle = function(a, b) {
  var c = !goog.dom.classes.has(a, b);
  goog.dom.classes.enable(a, b, c);
  return c
};
goog.math.Coordinate = function(a, b) {
  this.x = goog.isDef(a) ? a : 0;
  this.y = goog.isDef(b) ? b : 0
};
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y)
};
goog.DEBUG && (goog.math.Coordinate.prototype.toString = function() {
  return"(" + this.x + ", " + this.y + ")"
});
goog.math.Coordinate.equals = function(a, b) {
  return a == b ? true : !a || !b ? false : a.x == b.x && a.y == b.y
};
goog.math.Coordinate.distance = function(a, b) {
  var c = a.x - b.x, d = a.y - b.y;
  return Math.sqrt(c * c + d * d)
};
goog.math.Coordinate.squaredDistance = function(a, b) {
  var c = a.x - b.x, d = a.y - b.y;
  return c * c + d * d
};
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y)
};
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y)
};
goog.math.Size = function(a, b) {
  this.width = a;
  this.height = b
};
goog.math.Size.equals = function(a, b) {
  return a == b ? !0 : !a || !b ? !1 : a.width == b.width && a.height == b.height
};
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height)
};
goog.DEBUG && (goog.math.Size.prototype.toString = function() {
  return"(" + this.width + " x " + this.height + ")"
});
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height)
};
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height)
};
goog.math.Size.prototype.area = function() {
  return this.width * this.height
};
goog.math.Size.prototype.perimeter = function() {
  return(this.width + this.height) * 2
};
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height
};
goog.math.Size.prototype.isEmpty = function() {
  return!this.area()
};
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this
};
goog.math.Size.prototype.fitsInside = function(a) {
  return this.width <= a.width && this.height <= a.height
};
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this
};
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this
};
goog.math.Size.prototype.scale = function(a) {
  this.width = this.width * a;
  this.height = this.height * a;
  return this
};
goog.math.Size.prototype.scaleToFit = function(a) {
  return this.scale(this.aspectRatio() > a.aspectRatio() ? a.width / this.width : a.height / this.height)
};
goog.dom.ASSUME_QUIRKS_MODE = !1;
goog.dom.ASSUME_STANDARDS_MODE = !1;
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.dom.getDomHelper = function(a) {
  return a ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(a)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper)
};
goog.dom.getDocument = function() {
  return document
};
goog.dom.getElement = function(a) {
  return goog.isString(a) ? document.getElementById(a) : a
};
goog.dom.$ = goog.dom.getElement;
goog.dom.getElementsByTagNameAndClass = function(a, b, c) {
  return goog.dom.getElementsByTagNameAndClass_(document, a, b, c)
};
goog.dom.getElementsByClass = function(a, b) {
  var c = b || document;
  return goog.dom.canUseQuerySelector_(c) ? c.querySelectorAll("." + a) : c.getElementsByClassName ? c.getElementsByClassName(a) : goog.dom.getElementsByTagNameAndClass_(document, "*", a, b)
};
goog.dom.getElementByClass = function(a, b) {
  var c = b || document, d = null;
  return(d = goog.dom.canUseQuerySelector_(c) ? c.querySelector("." + a) : goog.dom.getElementsByClass(a, b)[0]) || null
};
goog.dom.canUseQuerySelector_ = function(a) {
  return a.querySelectorAll && a.querySelector && (!goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(document) || goog.userAgent.isVersion("528"))
};
goog.dom.getElementsByTagNameAndClass_ = function(a, b, c, d) {
  a = d || a;
  b = b && "*" != b ? b.toUpperCase() : "";
  if(goog.dom.canUseQuerySelector_(a) && (b || c)) {
    return a.querySelectorAll(b + (c ? "." + c : ""))
  }
  if(c && a.getElementsByClassName) {
    a = a.getElementsByClassName(c);
    if(b) {
      for(var d = {}, e = 0, f = 0, g;g = a[f];f++) {
        b == g.nodeName && (d[e++] = g)
      }
      d.length = e;
      return d
    }
    return a
  }
  a = a.getElementsByTagName(b || "*");
  if(c) {
    d = {};
    for(f = e = 0;g = a[f];f++) {
      b = g.className, "function" == typeof b.split && goog.array.contains(b.split(/\s+/), c) && (d[e++] = g)
    }
    d.length = e;
    return d
  }
  return a
};
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;
goog.dom.setProperties = function(a, b) {
  goog.object.forEach(b, function(b, d) {
    "style" == d ? a.style.cssText = b : "class" == d ? a.className = b : "for" == d ? a.htmlFor = b : d in goog.dom.DIRECT_ATTRIBUTE_MAP_ ? a.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[d], b) : goog.string.startsWith(d, "aria-") ? a.setAttribute(d, b) : a[d] = b
  })
};
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {cellpadding:"cellPadding", cellspacing:"cellSpacing", colspan:"colSpan", rowspan:"rowSpan", valign:"vAlign", height:"height", width:"width", usemap:"useMap", frameborder:"frameBorder", maxlength:"maxLength", type:"type"};
goog.dom.getViewportSize = function(a) {
  return goog.dom.getViewportSize_(a || window)
};
goog.dom.getViewportSize_ = function(a) {
  var b = a.document;
  if(goog.userAgent.WEBKIT && !goog.userAgent.isVersion("500") && !goog.userAgent.MOBILE) {
    "undefined" == typeof a.innerHeight && (a = window);
    var b = a.innerHeight, c = a.document.documentElement.scrollHeight;
    a == a.top && c < b && (b -= 15);
    return new goog.math.Size(a.innerWidth, b)
  }
  a = goog.dom.isCss1CompatMode_(b) ? b.documentElement : b.body;
  return new goog.math.Size(a.clientWidth, a.clientHeight)
};
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window)
};
goog.dom.getDocumentHeight_ = function(a) {
  var b = a.document, c = 0;
  if(b) {
    var a = goog.dom.getViewportSize_(a).height, c = b.body, d = b.documentElement;
    if(goog.dom.isCss1CompatMode_(b) && d.scrollHeight) {
      c = d.scrollHeight != a ? d.scrollHeight : d.offsetHeight
    }else {
      var b = d.scrollHeight, e = d.offsetHeight;
      d.clientHeight != e && (b = c.scrollHeight, e = c.offsetHeight);
      c = b > a ? b > e ? b : e : b < e ? b : e
    }
  }
  return c
};
goog.dom.getPageScroll = function(a) {
  return goog.dom.getDomHelper((a || goog.global || window).document).getDocumentScroll()
};
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document)
};
goog.dom.getDocumentScroll_ = function(a) {
  var b = goog.dom.getDocumentScrollElement_(a), a = goog.dom.getWindow_(a);
  return new goog.math.Coordinate(a.pageXOffset || b.scrollLeft, a.pageYOffset || b.scrollTop)
};
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document)
};
goog.dom.getDocumentScrollElement_ = function(a) {
  return!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(a) ? a.documentElement : a.body
};
goog.dom.getWindow = function(a) {
  return a ? goog.dom.getWindow_(a) : window
};
goog.dom.getWindow_ = function(a) {
  return a.parentWindow || a.defaultView
};
goog.dom.createDom = function(a, b, c) {
  return goog.dom.createDom_(document, arguments)
};
goog.dom.createDom_ = function(a, b) {
  var c = b[0], d = b[1];
  if(!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && d && (d.name || d.type)) {
    c = ["<", c];
    d.name && c.push(' name="', goog.string.htmlEscape(d.name), '"');
    if(d.type) {
      c.push(' type="', goog.string.htmlEscape(d.type), '"');
      var e = {};
      goog.object.extend(e, d);
      d = e;
      delete d.type
    }
    c.push(">");
    c = c.join("")
  }
  c = a.createElement(c);
  d && (goog.isString(d) ? c.className = d : goog.isArray(d) ? goog.dom.classes.add.apply(null, [c].concat(d)) : goog.dom.setProperties(c, d));
  2 < b.length && goog.dom.append_(a, c, b, 2);
  return c
};
goog.dom.append_ = function(a, b, c, d) {
  function e(c) {
    c && b.appendChild(goog.isString(c) ? a.createTextNode(c) : c)
  }
  for(;d < c.length;d++) {
    var f = c[d];
    goog.isArrayLike(f) && !goog.dom.isNodeLike(f) ? goog.array.forEach(goog.dom.isNodeList(f) ? goog.array.clone(f) : f, e) : e(f)
  }
};
goog.dom.$dom = goog.dom.createDom;
goog.dom.createElement = function(a) {
  return document.createElement(a)
};
goog.dom.createTextNode = function(a) {
  return document.createTextNode(a)
};
goog.dom.createTable = function(a, b, c) {
  return goog.dom.createTable_(document, a, b, !!c)
};
goog.dom.createTable_ = function(a, b, c, d) {
  for(var e = ["<tr>"], f = 0;f < c;f++) {
    e.push(d ? "<td>&nbsp;</td>" : "<td></td>")
  }
  e.push("</tr>");
  e = e.join("");
  c = ["<table>"];
  for(f = 0;f < b;f++) {
    c.push(e)
  }
  c.push("</table>");
  a = a.createElement(goog.dom.TagName.DIV);
  a.innerHTML = c.join("");
  return a.removeChild(a.firstChild)
};
goog.dom.htmlToDocumentFragment = function(a) {
  return goog.dom.htmlToDocumentFragment_(document, a)
};
goog.dom.htmlToDocumentFragment_ = function(a, b) {
  var c = a.createElement("div");
  goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT ? (c.innerHTML = "<br>" + b, c.removeChild(c.firstChild)) : c.innerHTML = b;
  if(1 == c.childNodes.length) {
    return c.removeChild(c.firstChild)
  }
  for(var d = a.createDocumentFragment();c.firstChild;) {
    d.appendChild(c.firstChild)
  }
  return d
};
goog.dom.getCompatMode = function() {
  return goog.dom.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document)
};
goog.dom.isCss1CompatMode_ = function(a) {
  return goog.dom.COMPAT_MODE_KNOWN_ ? goog.dom.ASSUME_STANDARDS_MODE : "CSS1Compat" == a.compatMode
};
goog.dom.canHaveChildren = function(a) {
  if(a.nodeType != goog.dom.NodeType.ELEMENT) {
    return!1
  }
  switch(a.tagName) {
    case goog.dom.TagName.APPLET:
    ;
    case goog.dom.TagName.AREA:
    ;
    case goog.dom.TagName.BASE:
    ;
    case goog.dom.TagName.BR:
    ;
    case goog.dom.TagName.COL:
    ;
    case goog.dom.TagName.FRAME:
    ;
    case goog.dom.TagName.HR:
    ;
    case goog.dom.TagName.IMG:
    ;
    case goog.dom.TagName.INPUT:
    ;
    case goog.dom.TagName.IFRAME:
    ;
    case goog.dom.TagName.ISINDEX:
    ;
    case goog.dom.TagName.LINK:
    ;
    case goog.dom.TagName.NOFRAMES:
    ;
    case goog.dom.TagName.NOSCRIPT:
    ;
    case goog.dom.TagName.META:
    ;
    case goog.dom.TagName.OBJECT:
    ;
    case goog.dom.TagName.PARAM:
    ;
    case goog.dom.TagName.SCRIPT:
    ;
    case goog.dom.TagName.STYLE:
      return!1
  }
  return!0
};
goog.dom.appendChild = function(a, b) {
  a.appendChild(b)
};
goog.dom.append = function(a, b) {
  goog.dom.append_(goog.dom.getOwnerDocument(a), a, arguments, 1)
};
goog.dom.removeChildren = function(a) {
  for(var b;b = a.firstChild;) {
    a.removeChild(b)
  }
};
goog.dom.insertSiblingBefore = function(a, b) {
  b.parentNode && b.parentNode.insertBefore(a, b)
};
goog.dom.insertSiblingAfter = function(a, b) {
  b.parentNode && b.parentNode.insertBefore(a, b.nextSibling)
};
goog.dom.insertChildAt = function(a, b, c) {
  a.insertBefore(b, a.childNodes[c] || null)
};
goog.dom.removeNode = function(a) {
  return a && a.parentNode ? a.parentNode.removeChild(a) : null
};
goog.dom.replaceNode = function(a, b) {
  var c = b.parentNode;
  c && c.replaceChild(a, b)
};
goog.dom.flattenElement = function(a) {
  var b, c = a.parentNode;
  if(c && c.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    if(a.removeNode) {
      return a.removeNode(!1)
    }
    for(;b = a.firstChild;) {
      c.insertBefore(b, a)
    }
    return goog.dom.removeNode(a)
  }
};
goog.dom.getChildren = function(a) {
  return goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && void 0 != a.children ? a.children : goog.array.filter(a.childNodes, function(a) {
    return a.nodeType == goog.dom.NodeType.ELEMENT
  })
};
goog.dom.getFirstElementChild = function(a) {
  return void 0 != a.firstElementChild ? a.firstElementChild : goog.dom.getNextElementNode_(a.firstChild, !0)
};
goog.dom.getLastElementChild = function(a) {
  return void 0 != a.lastElementChild ? a.lastElementChild : goog.dom.getNextElementNode_(a.lastChild, !1)
};
goog.dom.getNextElementSibling = function(a) {
  return void 0 != a.nextElementSibling ? a.nextElementSibling : goog.dom.getNextElementNode_(a.nextSibling, !0)
};
goog.dom.getPreviousElementSibling = function(a) {
  return void 0 != a.previousElementSibling ? a.previousElementSibling : goog.dom.getNextElementNode_(a.previousSibling, !1)
};
goog.dom.getNextElementNode_ = function(a, b) {
  for(;a && a.nodeType != goog.dom.NodeType.ELEMENT;) {
    a = b ? a.nextSibling : a.previousSibling
  }
  return a
};
goog.dom.getNextNode = function(a) {
  if(!a) {
    return null
  }
  if(a.firstChild) {
    return a.firstChild
  }
  for(;a && !a.nextSibling;) {
    a = a.parentNode
  }
  return a ? a.nextSibling : null
};
goog.dom.getPreviousNode = function(a) {
  if(!a) {
    return null
  }
  if(!a.previousSibling) {
    return a.parentNode
  }
  for(a = a.previousSibling;a && a.lastChild;) {
    a = a.lastChild
  }
  return a
};
goog.dom.isNodeLike = function(a) {
  return goog.isObject(a) && 0 < a.nodeType
};
goog.dom.isElement = function(a) {
  return goog.isObject(a) && a.nodeType == goog.dom.NodeType.ELEMENT
};
goog.dom.isWindow = function(a) {
  return goog.isObject(a) && a.window == a
};
goog.dom.contains = function(a, b) {
  if(a.contains && b.nodeType == goog.dom.NodeType.ELEMENT) {
    return a == b || a.contains(b)
  }
  if("undefined" != typeof a.compareDocumentPosition) {
    return a == b || Boolean(a.compareDocumentPosition(b) & 16)
  }
  for(;b && a != b;) {
    b = b.parentNode
  }
  return b == a
};
goog.dom.compareNodeOrder = function(a, b) {
  if(a == b) {
    return 0
  }
  if(a.compareDocumentPosition) {
    return a.compareDocumentPosition(b) & 2 ? 1 : -1
  }
  if("sourceIndex" in a || a.parentNode && "sourceIndex" in a.parentNode) {
    var c = a.nodeType == goog.dom.NodeType.ELEMENT, d = b.nodeType == goog.dom.NodeType.ELEMENT;
    if(c && d) {
      return a.sourceIndex - b.sourceIndex
    }
    var e = a.parentNode, f = b.parentNode;
    return e == f ? goog.dom.compareSiblingOrder_(a, b) : !c && goog.dom.contains(e, b) ? -1 * goog.dom.compareParentsDescendantNodeIe_(a, b) : !d && goog.dom.contains(f, a) ? goog.dom.compareParentsDescendantNodeIe_(b, a) : (c ? a.sourceIndex : e.sourceIndex) - (d ? b.sourceIndex : f.sourceIndex)
  }
  d = goog.dom.getOwnerDocument(a);
  c = d.createRange();
  c.selectNode(a);
  c.collapse(!0);
  d = d.createRange();
  d.selectNode(b);
  d.collapse(!0);
  return c.compareBoundaryPoints(goog.global.Range.START_TO_END, d)
};
goog.dom.compareParentsDescendantNodeIe_ = function(a, b) {
  var c = a.parentNode;
  if(c == b) {
    return-1
  }
  for(var d = b;d.parentNode != c;) {
    d = d.parentNode
  }
  return goog.dom.compareSiblingOrder_(d, a)
};
goog.dom.compareSiblingOrder_ = function(a, b) {
  for(var c = b;c = c.previousSibling;) {
    if(c == a) {
      return-1
    }
  }
  return 1
};
goog.dom.findCommonAncestor = function(a) {
  var b, c = arguments.length;
  if(c) {
    if(1 == c) {
      return arguments[0]
    }
  }else {
    return null
  }
  var d = [], e = Infinity;
  for(b = 0;b < c;b++) {
    for(var f = [], g = arguments[b];g;) {
      f.unshift(g), g = g.parentNode
    }
    d.push(f);
    e = Math.min(e, f.length)
  }
  f = null;
  for(b = 0;b < e;b++) {
    for(var g = d[0][b], h = 1;h < c;h++) {
      if(g != d[h][b]) {
        return f
      }
    }
    f = g
  }
  return f
};
goog.dom.getOwnerDocument = function(a) {
  return a.nodeType == goog.dom.NodeType.DOCUMENT ? a : a.ownerDocument || a.document
};
goog.dom.getFrameContentDocument = function(a) {
  return a.contentDocument || a.contentWindow.document
};
goog.dom.getFrameContentWindow = function(a) {
  return a.contentWindow || goog.dom.getWindow_(goog.dom.getFrameContentDocument(a))
};
goog.dom.setTextContent = function(a, b) {
  if("textContent" in a) {
    a.textContent = b
  }else {
    if(a.firstChild && a.firstChild.nodeType == goog.dom.NodeType.TEXT) {
      for(;a.lastChild != a.firstChild;) {
        a.removeChild(a.lastChild)
      }
      a.firstChild.data = b
    }else {
      goog.dom.removeChildren(a);
      var c = goog.dom.getOwnerDocument(a);
      a.appendChild(c.createTextNode(b))
    }
  }
};
goog.dom.getOuterHtml = function(a) {
  if("outerHTML" in a) {
    return a.outerHTML
  }
  var b = goog.dom.getOwnerDocument(a).createElement("div");
  b.appendChild(a.cloneNode(!0));
  return b.innerHTML
};
goog.dom.findNode = function(a, b) {
  var c = [];
  return goog.dom.findNodes_(a, b, c, !0) ? c[0] : void 0
};
goog.dom.findNodes = function(a, b) {
  var c = [];
  goog.dom.findNodes_(a, b, c, !1);
  return c
};
goog.dom.findNodes_ = function(a, b, c, d) {
  if(null != a) {
    for(a = a.firstChild;a;) {
      if(b(a) && (c.push(a), d) || goog.dom.findNodes_(a, b, c, d)) {
        return!0
      }
      a = a.nextSibling
    }
  }
  return!1
};
goog.dom.TAGS_TO_IGNORE_ = {SCRIPT:1, STYLE:1, HEAD:1, IFRAME:1, OBJECT:1};
goog.dom.PREDEFINED_TAG_VALUES_ = {IMG:" ", BR:"\n"};
goog.dom.isFocusableTabIndex = function(a) {
  var b = a.getAttributeNode("tabindex");
  return b && b.specified ? (a = a.tabIndex, goog.isNumber(a) && 0 <= a && 32768 > a) : !1
};
goog.dom.setFocusableTabIndex = function(a, b) {
  b ? a.tabIndex = 0 : (a.tabIndex = -1, a.removeAttribute("tabIndex"))
};
goog.dom.getTextContent = function(a) {
  if(goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && "innerText" in a) {
    a = goog.string.canonicalizeNewlines(a.innerText)
  }else {
    var b = [];
    goog.dom.getTextContent_(a, b, !0);
    a = b.join("")
  }
  a = a.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
  a = a.replace(/\u200B/g, "");
  goog.dom.BrowserFeature.CAN_USE_INNER_TEXT || (a = a.replace(/ +/g, " "));
  " " != a && (a = a.replace(/^\s*/, ""));
  return a
};
goog.dom.getRawTextContent = function(a) {
  var b = [];
  goog.dom.getTextContent_(a, b, !1);
  return b.join("")
};
goog.dom.getTextContent_ = function(a, b, c) {
  if(!(a.nodeName in goog.dom.TAGS_TO_IGNORE_)) {
    if(a.nodeType == goog.dom.NodeType.TEXT) {
      c ? b.push(("" + a.nodeValue).replace(/(\r\n|\r|\n)/g, "")) : b.push(a.nodeValue)
    }else {
      if(a.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        b.push(goog.dom.PREDEFINED_TAG_VALUES_[a.nodeName])
      }else {
        for(a = a.firstChild;a;) {
          goog.dom.getTextContent_(a, b, c), a = a.nextSibling
        }
      }
    }
  }
};
goog.dom.getNodeTextLength = function(a) {
  return goog.dom.getTextContent(a).length
};
goog.dom.getNodeTextOffset = function(a, b) {
  for(var c = b || goog.dom.getOwnerDocument(a).body, d = [];a && a != c;) {
    for(var e = a;e = e.previousSibling;) {
      d.unshift(goog.dom.getTextContent(e))
    }
    a = a.parentNode
  }
  return goog.string.trimLeft(d.join("")).replace(/ +/g, " ").length
};
goog.dom.getNodeAtOffset = function(a, b, c) {
  for(var a = [a], d = 0, e;0 < a.length && d < b;) {
    if(e = a.pop(), !(e.nodeName in goog.dom.TAGS_TO_IGNORE_)) {
      if(e.nodeType == goog.dom.NodeType.TEXT) {
        var f = e.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " "), d = d + f.length
      }else {
        if(e.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
          d += goog.dom.PREDEFINED_TAG_VALUES_[e.nodeName].length
        }else {
          for(f = e.childNodes.length - 1;0 <= f;f--) {
            a.push(e.childNodes[f])
          }
        }
      }
    }
  }
  goog.isObject(c) && (c.remainder = e ? e.nodeValue.length + b - d - 1 : 0, c.node = e);
  return e
};
goog.dom.isNodeList = function(a) {
  if(a && "number" == typeof a.length) {
    if(goog.isObject(a)) {
      return"function" == typeof a.item || "string" == typeof a.item
    }
    if(goog.isFunction(a)) {
      return"function" == typeof a.item
    }
  }
  return!1
};
goog.dom.getAncestorByTagNameAndClass = function(a, b, c) {
  var d = b ? b.toUpperCase() : null;
  return goog.dom.getAncestor(a, function(a) {
    return(!d || a.nodeName == d) && (!c || goog.dom.classes.has(a, c))
  }, !0)
};
goog.dom.getAncestorByClass = function(a, b) {
  return goog.dom.getAncestorByTagNameAndClass(a, null, b)
};
goog.dom.getAncestor = function(a, b, c, d) {
  c || (a = a.parentNode);
  for(var c = null == d, e = 0;a && (c || e <= d);) {
    if(b(a)) {
      return a
    }
    a = a.parentNode;
    e++
  }
  return null
};
goog.dom.getActiveElement = function(a) {
  try {
    return a && a.activeElement
  }catch(b) {
  }
  return null
};
goog.dom.DomHelper = function(a) {
  this.document_ = a || goog.global.document || document
};
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;
goog.dom.DomHelper.prototype.setDocument = function(a) {
  this.document_ = a
};
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_
};
goog.dom.DomHelper.prototype.getElement = function(a) {
  return goog.isString(a) ? this.document_.getElementById(a) : a
};
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(a, b, c) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, a, b, c)
};
goog.dom.DomHelper.prototype.getElementsByClass = function(a, b) {
  return goog.dom.getElementsByClass(a, b || this.document_)
};
goog.dom.DomHelper.prototype.getElementByClass = function(a, b) {
  return goog.dom.getElementByClass(a, b || this.document_)
};
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;
goog.dom.DomHelper.prototype.getViewportSize = function(a) {
  return goog.dom.getViewportSize(a || this.getWindow())
};
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow())
};
goog.dom.DomHelper.prototype.createDom = function(a, b, c) {
  return goog.dom.createDom_(this.document_, arguments)
};
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;
goog.dom.DomHelper.prototype.createElement = function(a) {
  return this.document_.createElement(a)
};
goog.dom.DomHelper.prototype.createTextNode = function(a) {
  return this.document_.createTextNode(a)
};
goog.dom.DomHelper.prototype.createTable = function(a, b, c) {
  return goog.dom.createTable_(this.document_, a, b, !!c)
};
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(a) {
  return goog.dom.htmlToDocumentFragment_(this.document_, a)
};
goog.dom.DomHelper.prototype.getCompatMode = function() {
  return this.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_)
};
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_)
};
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;
goog.dom.DomHelper.prototype.append = goog.dom.append;
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;
goog.dom.DomHelper.prototype.contains = goog.dom.contains;
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;
goog.dom.DomHelper.prototype.getAncestorByClass = goog.dom.getAncestorByClass;
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
bot.locators = {};
bot.locators.xpath = {};
bot.locators.XPathResult_ = {ORDERED_NODE_SNAPSHOT_TYPE:7, FIRST_ORDERED_NODE_TYPE:9};
bot.locators.xpath.DEFAULT_RESOLVER_ = function() {
  var a = {svg:"http://www.w3.org/2000/svg"};
  return function(b) {
    return a[b] || null
  }
}();
bot.locators.xpath.evaluate_ = function(a, b, c) {
  var d = goog.dom.getOwnerDocument(a);
  try {
    if(!d.implementation || !d.implementation.hasFeature("XPath", "3.0")) {
      return null
    }
  }catch(e) {
    return null
  }
  try {
    var f = d.createNSResolver ? d.createNSResolver(d.documentElement) : bot.locators.xpath.DEFAULT_RESOLVER_;
    return d.evaluate(b, a, f, c, null)
  }catch(g) {
    if(!(goog.userAgent.GECKO && "NS_ERROR_ILLEGAL_VALUE" == g.name)) {
      throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR, "Unable to locate an element with the xpath expression " + b + " because of the following error:\n" + g);
    }
  }
};
bot.locators.xpath.checkElement_ = function(a, b) {
  if(!a || a.nodeType != goog.dom.NodeType.ELEMENT) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR, 'The result of the xpath expression "' + b + '" is: ' + a + ". It should be an element.");
  }
};
bot.locators.xpath.single = function(a, b) {
  var c = function() {
    var c = bot.locators.xpath.evaluate_(b, a, bot.locators.XPathResult_.FIRST_ORDERED_NODE_TYPE);
    return c ? (c = c.singleNodeValue, goog.userAgent.OPERA ? c : c || null) : b.selectSingleNode ? (c = goog.dom.getOwnerDocument(b), c.setProperty && c.setProperty("SelectionLanguage", "XPath"), b.selectSingleNode(a)) : null
  }();
  goog.isNull(c) || bot.locators.xpath.checkElement_(c, a);
  return c
};
bot.locators.xpath.many = function(a, b) {
  var c = function() {
    var c = bot.locators.xpath.evaluate_(b, a, bot.locators.XPathResult_.ORDERED_NODE_SNAPSHOT_TYPE);
    if(c) {
      var e = c.snapshotLength;
      goog.userAgent.OPERA && !goog.isDef(e) && bot.locators.xpath.checkElement_(null, a);
      for(var f = [], g = 0;g < e;++g) {
        f.push(c.snapshotItem(g))
      }
      return f
    }
    return b.selectNodes ? (c = goog.dom.getOwnerDocument(b), c.setProperty && c.setProperty("SelectionLanguage", "XPath"), b.selectNodes(a)) : []
  }();
  goog.array.forEach(c, function(b) {
    bot.locators.xpath.checkElement_(b, a)
  });
  return c
};
goog.userAgent.product = {};
goog.userAgent.product.ASSUME_FIREFOX = !1;
goog.userAgent.product.ASSUME_CAMINO = !1;
goog.userAgent.product.ASSUME_IPHONE = !1;
goog.userAgent.product.ASSUME_IPAD = !1;
goog.userAgent.product.ASSUME_ANDROID = !1;
goog.userAgent.product.ASSUME_CHROME = !1;
goog.userAgent.product.ASSUME_SAFARI = !1;
goog.userAgent.product.PRODUCT_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_OPERA || goog.userAgent.product.ASSUME_FIREFOX || goog.userAgent.product.ASSUME_CAMINO || goog.userAgent.product.ASSUME_IPHONE || goog.userAgent.product.ASSUME_IPAD || goog.userAgent.product.ASSUME_ANDROID || goog.userAgent.product.ASSUME_CHROME || goog.userAgent.product.ASSUME_SAFARI;
goog.userAgent.product.init_ = function() {
  goog.userAgent.product.detectedFirefox_ = !1;
  goog.userAgent.product.detectedCamino_ = !1;
  goog.userAgent.product.detectedIphone_ = !1;
  goog.userAgent.product.detectedIpad_ = !1;
  goog.userAgent.product.detectedAndroid_ = !1;
  goog.userAgent.product.detectedChrome_ = !1;
  goog.userAgent.product.detectedSafari_ = !1;
  var a = goog.userAgent.getUserAgentString();
  a && (-1 != a.indexOf("Firefox") ? goog.userAgent.product.detectedFirefox_ = !0 : -1 != a.indexOf("Camino") ? goog.userAgent.product.detectedCamino_ = !0 : -1 != a.indexOf("iPhone") || -1 != a.indexOf("iPod") ? goog.userAgent.product.detectedIphone_ = !0 : -1 != a.indexOf("iPad") ? goog.userAgent.product.detectedIpad_ = !0 : -1 != a.indexOf("Android") ? goog.userAgent.product.detectedAndroid_ = !0 : -1 != a.indexOf("Chrome") ? goog.userAgent.product.detectedChrome_ = !0 : -1 != a.indexOf("Safari") && 
  (goog.userAgent.product.detectedSafari_ = !0))
};
goog.userAgent.product.PRODUCT_KNOWN_ || goog.userAgent.product.init_();
goog.userAgent.product.OPERA = goog.userAgent.OPERA;
goog.userAgent.product.IE = goog.userAgent.IE;
goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_FIREFOX : goog.userAgent.product.detectedFirefox_;
goog.userAgent.product.CAMINO = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CAMINO : goog.userAgent.product.detectedCamino_;
goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPHONE : goog.userAgent.product.detectedIphone_;
goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPAD : goog.userAgent.product.detectedIpad_;
goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_ANDROID : goog.userAgent.product.detectedAndroid_;
goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CHROME : goog.userAgent.product.detectedChrome_;
goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_SAFARI : goog.userAgent.product.detectedSafari_;
goog.userAgent.product.determineVersion_ = function() {
  var a = "", b, c;
  if(goog.userAgent.product.FIREFOX) {
    b = /Firefox\/([0-9.]+)/
  }else {
    if(goog.userAgent.product.IE || goog.userAgent.product.OPERA) {
      return goog.userAgent.VERSION
    }
    goog.userAgent.product.CHROME ? b = /Chrome\/([0-9.]+)/ : goog.userAgent.product.SAFARI ? b = /Version\/([0-9.]+)/ : goog.userAgent.product.IPHONE || goog.userAgent.product.IPAD ? (b = /Version\/(\S+).*Mobile\/(\S+)/, c = !0) : goog.userAgent.product.ANDROID ? b = /Android\s+([0-9.]+)(?:.*Version\/([0-9.]+))?/ : goog.userAgent.product.CAMINO && (b = /Camino\/([0-9.]+)/)
  }
  b && (a = (a = b.exec(goog.userAgent.getUserAgentString())) ? c ? a[1] + "." + a[2] : a[2] || a[1] : "");
  return a
};
goog.userAgent.product.VERSION = goog.userAgent.product.determineVersion_();
goog.userAgent.product.isVersion = function(a) {
  return 0 <= goog.string.compareVersions(goog.userAgent.product.VERSION, a)
};
bot.userAgent = {};
bot.userAgent.isEngineVersion = function(a) {
  return bot.userAgent.FIREFOX_EXTENSION ? bot.userAgent.FIREFOX_EXTENSION_IS_ENGINE_VERSION_(a) : goog.userAgent.IE ? 0 <= goog.string.compareVersions(document.documentMode, a) : goog.userAgent.isVersion(a)
};
bot.userAgent.isProductVersion = function(a) {
  return bot.userAgent.FIREFOX_EXTENSION ? bot.userAgent.FIREFOX_EXTENSION_IS_PRODUCT_VERSION_(a) : goog.userAgent.product.ANDROID ? 0 <= goog.string.compareVersions(bot.userAgent.ANDROID_VERSION_, a) : goog.userAgent.product.isVersion(a)
};
bot.userAgent.FIREFOX_EXTENSION = function() {
  if(!goog.userAgent.GECKO) {
    return!1
  }
  var a = goog.global.Components;
  if(!a) {
    return!1
  }
  try {
    if(!a.classes) {
      return!1
    }
  }catch(b) {
    return!1
  }
  var c = a.classes, a = a.interfaces, d = c["@mozilla.org/xpcom/version-comparator;1"].getService(a.nsIVersionComparator), c = c["@mozilla.org/xre/app-info;1"].getService(a.nsIXULAppInfo), e = c.platformVersion, f = c.version;
  bot.userAgent.FIREFOX_EXTENSION_IS_ENGINE_VERSION_ = function(a) {
    return 0 <= d.compare(e, "" + a)
  };
  bot.userAgent.FIREFOX_EXTENSION_IS_PRODUCT_VERSION_ = function(a) {
    return 0 <= d.compare(f, "" + a)
  };
  return!0
}();
bot.userAgent.IOS = goog.userAgent.product.IPAD || goog.userAgent.product.IPHONE;
bot.userAgent.MOBILE = bot.userAgent.IOS || goog.userAgent.product.ANDROID;
bot.userAgent.ANDROID_VERSION_ = function() {
  if(goog.userAgent.product.ANDROID) {
    var a = /Android\s+([0-9\.]+)/.exec(goog.userAgent.getUserAgentString());
    return a ? a[1] : "0"
  }
  return"0"
}();
bot.userAgent.IE_DOC_9 = goog.userAgent.IE && 9 <= document.documentMode;
bot.userAgent.IE_DOC_PRE9 = goog.userAgent.IE && !bot.userAgent.IE_DOC_9;
bot.window = {};
bot.window.HISTORY_LENGTH_INCLUDES_NEW_PAGE_ = !goog.userAgent.IE && !goog.userAgent.OPERA;
bot.window.HISTORY_LENGTH_INCLUDES_FORWARD_PAGES_ = !goog.userAgent.OPERA && (!goog.userAgent.WEBKIT || bot.userAgent.isEngineVersion("533"));
bot.window.back = function(a) {
  var b = bot.window.HISTORY_LENGTH_INCLUDES_NEW_PAGE_ ? bot.getWindow().history.length - 1 : bot.getWindow().history.length, a = bot.window.checkNumPages_(b, a);
  bot.getWindow().history.go(-a)
};
bot.window.forward = function(a) {
  var b = bot.window.HISTORY_LENGTH_INCLUDES_FORWARD_PAGES_ ? bot.getWindow().history.length - 1 : null, a = bot.window.checkNumPages_(b, a);
  bot.getWindow().history.go(a)
};
bot.window.checkNumPages_ = function(a, b) {
  var c = goog.isDef(b) ? b : 1;
  if(0 >= c) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "number of pages must be positive");
  }
  if(null !== a && c > a) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "number of pages must be less than the length of the browser history");
  }
  return c
};
bot.window.getInteractableSize = function(a) {
  var b = (a || bot.getWindow()).document, a = b.documentElement, c = b.body;
  if(!c) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "No BODY element present");
  }
  b = [a.clientHeight, a.scrollHeight, a.offsetHeight, c.scrollHeight, c.offsetHeight];
  a = Math.max.apply(null, [a.clientWidth, a.scrollWidth, a.offsetWidth, c.scrollWidth, c.offsetWidth]);
  b = Math.max.apply(null, b);
  return new goog.math.Size(a, b)
};
bot.window.getSize = function(a) {
  a = a || bot.getWindow();
  return new goog.math.Size(a.outerWidth, a.outerHeight)
};
bot.window.setSize = function(a, b) {
  (b || bot.getWindow()).resizeTo(a.width, a.height)
};
bot.window.getPosition = function(a) {
  var b = a || bot.getWindow();
  goog.userAgent.IE ? (a = b.screenLeft, b = b.screenTop) : (a = b.screenX, b = b.screenY);
  return new goog.math.Coordinate(a, b)
};
bot.window.setPosition = function(a, b) {
  (b || bot.getWindow()).moveTo(a.x, a.y)
};
goog.iter = {};
goog.iter.StopIteration = "StopIteration" in goog.global ? goog.global.StopIteration : Error("StopIteration");
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function() {
  return this
};
goog.iter.toIterator = function(a) {
  if(a instanceof goog.iter.Iterator) {
    return a
  }
  if("function" == typeof a.__iterator__) {
    return a.__iterator__(!1)
  }
  if(goog.isArrayLike(a)) {
    var b = 0, c = new goog.iter.Iterator;
    c.next = function() {
      for(;;) {
        if(b >= a.length) {
          throw goog.iter.StopIteration;
        }
        if(b in a) {
          return a[b++]
        }
        b++
      }
    };
    return c
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(a, b, c) {
  if(goog.isArrayLike(a)) {
    try {
      goog.array.forEach(a, b, c)
    }catch(d) {
      if(d !== goog.iter.StopIteration) {
        throw d;
      }
    }
  }else {
    a = goog.iter.toIterator(a);
    try {
      for(;;) {
        b.call(c, a.next(), void 0, a)
      }
    }catch(e) {
      if(e !== goog.iter.StopIteration) {
        throw e;
      }
    }
  }
};
goog.iter.filter = function(a, b, c) {
  var a = goog.iter.toIterator(a), d = new goog.iter.Iterator;
  d.next = function() {
    for(;;) {
      var d = a.next();
      if(b.call(c, d, void 0, a)) {
        return d
      }
    }
  };
  return d
};
goog.iter.range = function(a, b, c) {
  var d = 0, e = a, f = c || 1;
  1 < arguments.length && (d = a, e = b);
  if(0 == f) {
    throw Error("Range step argument must not be zero");
  }
  var g = new goog.iter.Iterator;
  g.next = function() {
    if(f > 0 && d >= e || f < 0 && d <= e) {
      throw goog.iter.StopIteration;
    }
    var a = d;
    d = d + f;
    return a
  };
  return g
};
goog.iter.join = function(a, b) {
  return goog.iter.toArray(a).join(b)
};
goog.iter.map = function(a, b, c) {
  var a = goog.iter.toIterator(a), d = new goog.iter.Iterator;
  d.next = function() {
    for(;;) {
      var d = a.next();
      return b.call(c, d, void 0, a)
    }
  };
  return d
};
goog.iter.reduce = function(a, b, c, d) {
  var e = c;
  goog.iter.forEach(a, function(a) {
    e = b.call(d, e, a)
  });
  return e
};
goog.iter.some = function(a, b, c) {
  a = goog.iter.toIterator(a);
  try {
    for(;;) {
      if(b.call(c, a.next(), void 0, a)) {
        return!0
      }
    }
  }catch(d) {
    if(d !== goog.iter.StopIteration) {
      throw d;
    }
  }
  return!1
};
goog.iter.every = function(a, b, c) {
  a = goog.iter.toIterator(a);
  try {
    for(;;) {
      if(!b.call(c, a.next(), void 0, a)) {
        return!1
      }
    }
  }catch(d) {
    if(d !== goog.iter.StopIteration) {
      throw d;
    }
  }
  return!0
};
goog.iter.chain = function(a) {
  var b = arguments, c = b.length, d = 0, e = new goog.iter.Iterator;
  e.next = function() {
    try {
      if(d >= c) {
        throw goog.iter.StopIteration;
      }
      return goog.iter.toIterator(b[d]).next()
    }catch(a) {
      if(a !== goog.iter.StopIteration || d >= c) {
        throw a;
      }
      d++;
      return this.next()
    }
  };
  return e
};
goog.iter.dropWhile = function(a, b, c) {
  var a = goog.iter.toIterator(a), d = new goog.iter.Iterator, e = !0;
  d.next = function() {
    for(;;) {
      var d = a.next();
      if(!e || !b.call(c, d, void 0, a)) {
        return e = !1, d
      }
    }
  };
  return d
};
goog.iter.takeWhile = function(a, b, c) {
  var a = goog.iter.toIterator(a), d = new goog.iter.Iterator, e = !0;
  d.next = function() {
    for(;;) {
      if(e) {
        var d = a.next();
        if(b.call(c, d, void 0, a)) {
          return d
        }
        e = !1
      }else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return d
};
goog.iter.toArray = function(a) {
  if(goog.isArrayLike(a)) {
    return goog.array.toArray(a)
  }
  var a = goog.iter.toIterator(a), b = [];
  goog.iter.forEach(a, function(a) {
    b.push(a)
  });
  return b
};
goog.iter.equals = function(a, b) {
  var a = goog.iter.toIterator(a), b = goog.iter.toIterator(b), c, d;
  try {
    for(;;) {
      c = d = !1;
      var e = a.next();
      c = !0;
      var f = b.next();
      d = !0;
      if(e != f) {
        break
      }
    }
  }catch(g) {
    if(g !== goog.iter.StopIteration) {
      throw g;
    }
    if(c && !d) {
      return!1
    }
    if(!d) {
      try {
        b.next()
      }catch(h) {
        if(h !== goog.iter.StopIteration) {
          throw h;
        }
        return!0
      }
    }
  }
  return!1
};
goog.iter.nextOrValue = function(a, b) {
  try {
    return goog.iter.toIterator(a).next()
  }catch(c) {
    if(c != goog.iter.StopIteration) {
      throw c;
    }
    return b
  }
};
goog.iter.product = function(a) {
  if(goog.array.some(arguments, function(a) {
    return!a.length
  }) || !arguments.length) {
    return new goog.iter.Iterator
  }
  var b = new goog.iter.Iterator, c = arguments, d = goog.array.repeat(0, c.length);
  b.next = function() {
    if(d) {
      for(var a = goog.array.map(d, function(a, b) {
        return c[b][a]
      }), b = d.length - 1;0 <= b;b--) {
        goog.asserts.assert(d);
        if(d[b] < c[b].length - 1) {
          d[b]++;
          break
        }
        if(0 == b) {
          d = null;
          break
        }
        d[b] = 0
      }
      return a
    }
    throw goog.iter.StopIteration;
  };
  return b
};
goog.iter.cycle = function(a) {
  var b = goog.iter.toIterator(a), c = [], d = 0, a = new goog.iter.Iterator, e = !1;
  a.next = function() {
    var a = null;
    if(!e) {
      try {
        return a = b.next(), c.push(a), a
      }catch(g) {
        if(g != goog.iter.StopIteration || goog.array.isEmpty(c)) {
          throw g;
        }
        e = !0
      }
    }
    a = c[d];
    d = (d + 1) % c.length;
    return a
  };
  return a
};
goog.dom.TagWalkType = {START_TAG:1, OTHER:0, END_TAG:-1};
goog.dom.TagIterator = function(a, b, c, d, e) {
  this.reversed = !!b;
  a && this.setPosition(a, d);
  this.depth = void 0 != e ? e : this.tagType || 0;
  this.reversed && (this.depth *= -1);
  this.constrained = !c
};
goog.inherits(goog.dom.TagIterator, goog.iter.Iterator);
goog.dom.TagIterator.prototype.node = null;
goog.dom.TagIterator.prototype.tagType = goog.dom.TagWalkType.OTHER;
goog.dom.TagIterator.prototype.started_ = !1;
goog.dom.TagIterator.prototype.setPosition = function(a, b, c) {
  if(this.node = a) {
    this.tagType = goog.isNumber(b) ? b : this.node.nodeType != goog.dom.NodeType.ELEMENT ? goog.dom.TagWalkType.OTHER : this.reversed ? goog.dom.TagWalkType.END_TAG : goog.dom.TagWalkType.START_TAG
  }
  goog.isNumber(c) && (this.depth = c)
};
goog.dom.TagIterator.prototype.copyFrom = function(a) {
  this.node = a.node;
  this.tagType = a.tagType;
  this.depth = a.depth;
  this.reversed = a.reversed;
  this.constrained = a.constrained
};
goog.dom.TagIterator.prototype.clone = function() {
  return new goog.dom.TagIterator(this.node, this.reversed, !this.constrained, this.tagType, this.depth)
};
goog.dom.TagIterator.prototype.skipTag = function() {
  var a = this.reversed ? goog.dom.TagWalkType.END_TAG : goog.dom.TagWalkType.START_TAG;
  this.tagType == a && (this.tagType = -1 * a, this.depth += this.tagType * (this.reversed ? -1 : 1))
};
goog.dom.TagIterator.prototype.restartTag = function() {
  var a = this.reversed ? goog.dom.TagWalkType.START_TAG : goog.dom.TagWalkType.END_TAG;
  this.tagType == a && (this.tagType = -1 * a, this.depth += this.tagType * (this.reversed ? -1 : 1))
};
goog.dom.TagIterator.prototype.next = function() {
  var a;
  if(this.started_) {
    if(!this.node || this.constrained && 0 == this.depth) {
      throw goog.iter.StopIteration;
    }
    a = this.node;
    var b = this.reversed ? goog.dom.TagWalkType.END_TAG : goog.dom.TagWalkType.START_TAG;
    if(this.tagType == b) {
      var c = this.reversed ? a.lastChild : a.firstChild;
      c ? this.setPosition(c) : this.setPosition(a, -1 * b)
    }else {
      (c = this.reversed ? a.previousSibling : a.nextSibling) ? this.setPosition(c) : this.setPosition(a.parentNode, -1 * b)
    }
    this.depth += this.tagType * (this.reversed ? -1 : 1)
  }else {
    this.started_ = !0
  }
  a = this.node;
  if(!this.node) {
    throw goog.iter.StopIteration;
  }
  return a
};
goog.dom.TagIterator.prototype.isStarted = function() {
  return this.started_
};
goog.dom.TagIterator.prototype.isStartTag = function() {
  return this.tagType == goog.dom.TagWalkType.START_TAG
};
goog.dom.TagIterator.prototype.isEndTag = function() {
  return this.tagType == goog.dom.TagWalkType.END_TAG
};
goog.dom.TagIterator.prototype.isNonElement = function() {
  return this.tagType == goog.dom.TagWalkType.OTHER
};
goog.dom.TagIterator.prototype.equals = function(a) {
  return a.node == this.node && (!this.node || a.tagType == this.tagType)
};
goog.dom.TagIterator.prototype.splice = function(a) {
  var b = this.node;
  this.restartTag();
  this.reversed = !this.reversed;
  goog.dom.TagIterator.prototype.next.call(this);
  this.reversed = !this.reversed;
  for(var c = goog.isArrayLike(arguments[0]) ? arguments[0] : arguments, d = c.length - 1;0 <= d;d--) {
    goog.dom.insertSiblingAfter(c[d], b)
  }
  goog.dom.removeNode(b)
};
goog.dom.NodeIterator = function(a, b, c, d) {
  goog.dom.TagIterator.call(this, a, b, c, null, d)
};
goog.inherits(goog.dom.NodeIterator, goog.dom.TagIterator);
goog.dom.NodeIterator.prototype.next = function() {
  do {
    goog.dom.NodeIterator.superClass_.next.call(this)
  }while(this.isEndTag());
  return this.node
};
goog.math.Box = function(a, b, c, d) {
  this.top = a;
  this.right = b;
  this.bottom = c;
  this.left = d
};
goog.math.Box.boundingBox = function(a) {
  for(var b = new goog.math.Box(arguments[0].y, arguments[0].x, arguments[0].y, arguments[0].x), c = 1;c < arguments.length;c++) {
    var d = arguments[c];
    b.top = Math.min(b.top, d.y);
    b.right = Math.max(b.right, d.x);
    b.bottom = Math.max(b.bottom, d.y);
    b.left = Math.min(b.left, d.x)
  }
  return b
};
goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left)
};
goog.DEBUG && (goog.math.Box.prototype.toString = function() {
  return"(" + this.top + "t, " + this.right + "r, " + this.bottom + "b, " + this.left + "l)"
});
goog.math.Box.prototype.contains = function(a) {
  return goog.math.Box.contains(this, a)
};
goog.math.Box.prototype.expand = function(a, b, c, d) {
  if(goog.isObject(a)) {
    this.top = this.top - a.top;
    this.right = this.right + a.right;
    this.bottom = this.bottom + a.bottom;
    this.left = this.left - a.left
  }else {
    this.top = this.top - a;
    this.right = this.right + b;
    this.bottom = this.bottom + c;
    this.left = this.left - d
  }
  return this
};
goog.math.Box.prototype.expandToInclude = function(a) {
  this.left = Math.min(this.left, a.left);
  this.top = Math.min(this.top, a.top);
  this.right = Math.max(this.right, a.right);
  this.bottom = Math.max(this.bottom, a.bottom)
};
goog.math.Box.equals = function(a, b) {
  return a == b ? true : !a || !b ? false : a.top == b.top && a.right == b.right && a.bottom == b.bottom && a.left == b.left
};
goog.math.Box.contains = function(a, b) {
  return!a || !b ? false : b instanceof goog.math.Box ? b.left >= a.left && b.right <= a.right && b.top >= a.top && b.bottom <= a.bottom : b.x >= a.left && b.x <= a.right && b.y >= a.top && b.y <= a.bottom
};
goog.math.Box.distance = function(a, b) {
  return b.x >= a.left && b.x <= a.right ? b.y >= a.top && b.y <= a.bottom ? 0 : b.y < a.top ? a.top - b.y : b.y - a.bottom : b.y >= a.top && b.y <= a.bottom ? b.x < a.left ? a.left - b.x : b.x - a.right : goog.math.Coordinate.distance(b, new goog.math.Coordinate(b.x < a.left ? a.left : a.right, b.y < a.top ? a.top : a.bottom))
};
goog.math.Box.intersects = function(a, b) {
  return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom
};
goog.math.Box.intersectsWithPadding = function(a, b, c) {
  return a.left <= b.right + c && b.left <= a.right + c && a.top <= b.bottom + c && b.top <= a.bottom + c
};
goog.math.Rect = function(a, b, c, d) {
  this.left = a;
  this.top = b;
  this.width = c;
  this.height = d
};
goog.math.Rect.prototype.clone = function() {
  return new goog.math.Rect(this.left, this.top, this.width, this.height)
};
goog.math.Rect.prototype.toBox = function() {
  return new goog.math.Box(this.top, this.left + this.width, this.top + this.height, this.left)
};
goog.math.Rect.createFromBox = function(a) {
  return new goog.math.Rect(a.left, a.top, a.right - a.left, a.bottom - a.top)
};
goog.DEBUG && (goog.math.Rect.prototype.toString = function() {
  return"(" + this.left + ", " + this.top + " - " + this.width + "w x " + this.height + "h)"
});
goog.math.Rect.equals = function(a, b) {
  return a == b ? true : !a || !b ? false : a.left == b.left && a.width == b.width && a.top == b.top && a.height == b.height
};
goog.math.Rect.prototype.intersection = function(a) {
  var b = Math.max(this.left, a.left), c = Math.min(this.left + this.width, a.left + a.width);
  if(b <= c) {
    var d = Math.max(this.top, a.top), a = Math.min(this.top + this.height, a.top + a.height);
    if(d <= a) {
      this.left = b;
      this.top = d;
      this.width = c - b;
      this.height = a - d;
      return true
    }
  }
  return false
};
goog.math.Rect.intersection = function(a, b) {
  var c = Math.max(a.left, b.left), d = Math.min(a.left + a.width, b.left + b.width);
  if(c <= d) {
    var e = Math.max(a.top, b.top), f = Math.min(a.top + a.height, b.top + b.height);
    if(e <= f) {
      return new goog.math.Rect(c, e, d - c, f - e)
    }
  }
  return null
};
goog.math.Rect.intersects = function(a, b) {
  return a.left <= b.left + b.width && b.left <= a.left + a.width && a.top <= b.top + b.height && b.top <= a.top + a.height
};
goog.math.Rect.prototype.intersects = function(a) {
  return goog.math.Rect.intersects(this, a)
};
goog.math.Rect.difference = function(a, b) {
  var c = goog.math.Rect.intersection(a, b);
  if(!c || !c.height || !c.width) {
    return[a.clone()]
  }
  var c = [], d = a.top, e = a.height, f = a.left + a.width, g = a.top + a.height, h = b.left + b.width, i = b.top + b.height;
  if(b.top > a.top) {
    c.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top));
    d = b.top;
    e = e - (b.top - a.top)
  }
  if(i < g) {
    c.push(new goog.math.Rect(a.left, i, a.width, g - i));
    e = i - d
  }
  b.left > a.left && c.push(new goog.math.Rect(a.left, d, b.left - a.left, e));
  h < f && c.push(new goog.math.Rect(h, d, f - h, e));
  return c
};
goog.math.Rect.prototype.difference = function(a) {
  return goog.math.Rect.difference(this, a)
};
goog.math.Rect.prototype.boundingRect = function(a) {
  var b = Math.max(this.left + this.width, a.left + a.width), c = Math.max(this.top + this.height, a.top + a.height);
  this.left = Math.min(this.left, a.left);
  this.top = Math.min(this.top, a.top);
  this.width = b - this.left;
  this.height = c - this.top
};
goog.math.Rect.boundingRect = function(a, b) {
  if(!a || !b) {
    return null
  }
  var c = a.clone();
  c.boundingRect(b);
  return c
};
goog.math.Rect.prototype.contains = function(a) {
  return a instanceof goog.math.Rect ? this.left <= a.left && this.left + this.width >= a.left + a.width && this.top <= a.top && this.top + this.height >= a.top + a.height : a.x >= this.left && a.x <= this.left + this.width && a.y >= this.top && a.y <= this.top + this.height
};
goog.math.Rect.prototype.getSize = function() {
  return new goog.math.Size(this.width, this.height)
};
goog.style = {};
goog.style.setStyle = function(a, b, c) {
  goog.isString(b) ? goog.style.setStyle_(a, c, b) : goog.object.forEach(b, goog.partial(goog.style.setStyle_, a))
};
goog.style.setStyle_ = function(a, b, c) {
  a.style[goog.string.toCamelCase(c)] = b
};
goog.style.getStyle = function(a, b) {
  return a.style[goog.string.toCamelCase(b)] || ""
};
goog.style.getComputedStyle = function(a, b) {
  var c = goog.dom.getOwnerDocument(a);
  return c.defaultView && c.defaultView.getComputedStyle && (c = c.defaultView.getComputedStyle(a, null)) ? c[b] || c.getPropertyValue(b) : ""
};
goog.style.getCascadedStyle = function(a, b) {
  return a.currentStyle ? a.currentStyle[b] : null
};
goog.style.getStyle_ = function(a, b) {
  return goog.style.getComputedStyle(a, b) || goog.style.getCascadedStyle(a, b) || a.style && a.style[b]
};
goog.style.getComputedPosition = function(a) {
  return goog.style.getStyle_(a, "position")
};
goog.style.getBackgroundColor = function(a) {
  return goog.style.getStyle_(a, "backgroundColor")
};
goog.style.getComputedOverflowX = function(a) {
  return goog.style.getStyle_(a, "overflowX")
};
goog.style.getComputedOverflowY = function(a) {
  return goog.style.getStyle_(a, "overflowY")
};
goog.style.getComputedZIndex = function(a) {
  return goog.style.getStyle_(a, "zIndex")
};
goog.style.getComputedTextAlign = function(a) {
  return goog.style.getStyle_(a, "textAlign")
};
goog.style.getComputedCursor = function(a) {
  return goog.style.getStyle_(a, "cursor")
};
goog.style.setPosition = function(a, b, c) {
  var d, e = goog.userAgent.GECKO && (goog.userAgent.MAC || goog.userAgent.X11) && goog.userAgent.isVersion("1.9");
  b instanceof goog.math.Coordinate ? (d = b.x, b = b.y) : (d = b, b = c);
  a.style.left = goog.style.getPixelStyleValue_(d, e);
  a.style.top = goog.style.getPixelStyleValue_(b, e)
};
goog.style.getPosition = function(a) {
  return new goog.math.Coordinate(a.offsetLeft, a.offsetTop)
};
goog.style.getClientViewportElement = function(a) {
  a = a ? a.nodeType == goog.dom.NodeType.DOCUMENT ? a : goog.dom.getOwnerDocument(a) : goog.dom.getDocument();
  return goog.userAgent.IE && !goog.userAgent.isDocumentMode(9) && !goog.dom.getDomHelper(a).isCss1CompatMode() ? a.body : a.documentElement
};
goog.style.getBoundingClientRect_ = function(a) {
  var b = a.getBoundingClientRect();
  goog.userAgent.IE && (a = a.ownerDocument, b.left -= a.documentElement.clientLeft + a.body.clientLeft, b.top -= a.documentElement.clientTop + a.body.clientTop);
  return b
};
goog.style.getOffsetParent = function(a) {
  if(goog.userAgent.IE && !goog.userAgent.isDocumentMode(8)) {
    return a.offsetParent
  }
  for(var b = goog.dom.getOwnerDocument(a), c = goog.style.getStyle_(a, "position"), d = "fixed" == c || "absolute" == c, a = a.parentNode;a && a != b;a = a.parentNode) {
    if(c = goog.style.getStyle_(a, "position"), d = d && "static" == c && a != b.documentElement && a != b.body, !d && (a.scrollWidth > a.clientWidth || a.scrollHeight > a.clientHeight || "fixed" == c || "absolute" == c || "relative" == c)) {
      return a
    }
  }
  return null
};
goog.style.getVisibleRectForElement = function(a) {
  for(var b = new goog.math.Box(0, Infinity, Infinity, 0), c = goog.dom.getDomHelper(a), d = c.getDocument().body, e = c.getDocument().documentElement, f = c.getDocumentScrollElement();a = goog.style.getOffsetParent(a);) {
    if((!goog.userAgent.IE || 0 != a.clientWidth) && (!goog.userAgent.WEBKIT || 0 != a.clientHeight || a != d) && a != d && a != e && "visible" != goog.style.getStyle_(a, "overflow")) {
      var g = goog.style.getPageOffset(a), h = goog.style.getClientLeftTop(a);
      g.x += h.x;
      g.y += h.y;
      b.top = Math.max(b.top, g.y);
      b.right = Math.min(b.right, g.x + a.clientWidth);
      b.bottom = Math.min(b.bottom, g.y + a.clientHeight);
      b.left = Math.max(b.left, g.x)
    }
  }
  d = f.scrollLeft;
  f = f.scrollTop;
  b.left = Math.max(b.left, d);
  b.top = Math.max(b.top, f);
  c = c.getViewportSize();
  b.right = Math.min(b.right, d + c.width);
  b.bottom = Math.min(b.bottom, f + c.height);
  return 0 <= b.top && 0 <= b.left && b.bottom > b.top && b.right > b.left ? b : null
};
goog.style.scrollIntoContainerView = function(a, b, c) {
  var d = goog.style.getPageOffset(a), e = goog.style.getPageOffset(b), f = goog.style.getBorderBox(b), g = d.x - e.x - f.left, d = d.y - e.y - f.top, e = b.clientWidth - a.offsetWidth, a = b.clientHeight - a.offsetHeight;
  c ? (b.scrollLeft += g - e / 2, b.scrollTop += d - a / 2) : (b.scrollLeft += Math.min(g, Math.max(g - e, 0)), b.scrollTop += Math.min(d, Math.max(d - a, 0)))
};
goog.style.getClientLeftTop = function(a) {
  if(goog.userAgent.GECKO && !goog.userAgent.isVersion("1.9")) {
    var b = parseFloat(goog.style.getComputedStyle(a, "borderLeftWidth"));
    if(goog.style.isRightToLeft(a)) {
      var c = a.offsetWidth - a.clientWidth - b - parseFloat(goog.style.getComputedStyle(a, "borderRightWidth")), b = b + c
    }
    return new goog.math.Coordinate(b, parseFloat(goog.style.getComputedStyle(a, "borderTopWidth")))
  }
  return new goog.math.Coordinate(a.clientLeft, a.clientTop)
};
goog.style.getPageOffset = function(a) {
  var b, c = goog.dom.getOwnerDocument(a), d = goog.style.getStyle_(a, "position"), e = goog.userAgent.GECKO && c.getBoxObjectFor && !a.getBoundingClientRect && "absolute" == d && (b = c.getBoxObjectFor(a)) && (0 > b.screenX || 0 > b.screenY), f = new goog.math.Coordinate(0, 0), g = goog.style.getClientViewportElement(c);
  if(a == g) {
    return f
  }
  if(a.getBoundingClientRect) {
    b = goog.style.getBoundingClientRect_(a), a = goog.dom.getDomHelper(c).getDocumentScroll(), f.x = b.left + a.x, f.y = b.top + a.y
  }else {
    if(c.getBoxObjectFor && !e) {
      b = c.getBoxObjectFor(a), a = c.getBoxObjectFor(g), f.x = b.screenX - a.screenX, f.y = b.screenY - a.screenY
    }else {
      b = a;
      do {
        f.x += b.offsetLeft;
        f.y += b.offsetTop;
        b != a && (f.x += b.clientLeft || 0, f.y += b.clientTop || 0);
        if(goog.userAgent.WEBKIT && "fixed" == goog.style.getComputedPosition(b)) {
          f.x += c.body.scrollLeft;
          f.y += c.body.scrollTop;
          break
        }
        b = b.offsetParent
      }while(b && b != a);
      if(goog.userAgent.OPERA || goog.userAgent.WEBKIT && "absolute" == d) {
        f.y -= c.body.offsetTop
      }
      for(b = a;(b = goog.style.getOffsetParent(b)) && b != c.body && b != g;) {
        if(f.x -= b.scrollLeft, !goog.userAgent.OPERA || "TR" != b.tagName) {
          f.y -= b.scrollTop
        }
      }
    }
  }
  return f
};
goog.style.getPageOffsetLeft = function(a) {
  return goog.style.getPageOffset(a).x
};
goog.style.getPageOffsetTop = function(a) {
  return goog.style.getPageOffset(a).y
};
goog.style.getFramedPageOffset = function(a, b) {
  var c = new goog.math.Coordinate(0, 0), d = goog.dom.getWindow(goog.dom.getOwnerDocument(a)), e = a;
  do {
    var f = d == b ? goog.style.getPageOffset(e) : goog.style.getClientPosition(e);
    c.x += f.x;
    c.y += f.y
  }while(d && d != b && (e = d.frameElement) && (d = d.parent));
  return c
};
goog.style.translateRectForAnotherFrame = function(a, b, c) {
  if(b.getDocument() != c.getDocument()) {
    var d = b.getDocument().body, c = goog.style.getFramedPageOffset(d, c.getWindow()), c = goog.math.Coordinate.difference(c, goog.style.getPageOffset(d));
    goog.userAgent.IE && !b.isCss1CompatMode() && (c = goog.math.Coordinate.difference(c, b.getDocumentScroll()));
    a.left += c.x;
    a.top += c.y
  }
};
goog.style.getRelativePosition = function(a, b) {
  var c = goog.style.getClientPosition(a), d = goog.style.getClientPosition(b);
  return new goog.math.Coordinate(c.x - d.x, c.y - d.y)
};
goog.style.getClientPosition = function(a) {
  var b = new goog.math.Coordinate;
  if(a.nodeType == goog.dom.NodeType.ELEMENT) {
    if(a.getBoundingClientRect) {
      a = goog.style.getBoundingClientRect_(a), b.x = a.left, b.y = a.top
    }else {
      var c = goog.dom.getDomHelper(a).getDocumentScroll(), a = goog.style.getPageOffset(a);
      b.x = a.x - c.x;
      b.y = a.y - c.y
    }
  }else {
    var c = goog.isFunction(a.getBrowserEvent), d = a;
    a.targetTouches ? d = a.targetTouches[0] : c && a.getBrowserEvent().targetTouches && (d = a.getBrowserEvent().targetTouches[0]);
    b.x = d.clientX;
    b.y = d.clientY
  }
  return b
};
goog.style.setPageOffset = function(a, b, c) {
  var d = goog.style.getPageOffset(a);
  b instanceof goog.math.Coordinate && (c = b.y, b = b.x);
  goog.style.setPosition(a, a.offsetLeft + (b - d.x), a.offsetTop + (c - d.y))
};
goog.style.setSize = function(a, b, c) {
  if(b instanceof goog.math.Size) {
    c = b.height, b = b.width
  }else {
    if(void 0 == c) {
      throw Error("missing height argument");
    }
  }
  goog.style.setWidth(a, b);
  goog.style.setHeight(a, c)
};
goog.style.getPixelStyleValue_ = function(a, b) {
  "number" == typeof a && (a = (b ? Math.round(a) : a) + "px");
  return a
};
goog.style.setHeight = function(a, b) {
  a.style.height = goog.style.getPixelStyleValue_(b, !0)
};
goog.style.setWidth = function(a, b) {
  a.style.width = goog.style.getPixelStyleValue_(b, !0)
};
goog.style.getSize = function(a) {
  if("none" != goog.style.getStyle_(a, "display")) {
    return goog.style.getSizeWithDisplay_(a)
  }
  var b = a.style, c = b.display, d = b.visibility, e = b.position;
  b.visibility = "hidden";
  b.position = "absolute";
  b.display = "inline";
  a = goog.style.getSizeWithDisplay_(a);
  b.display = c;
  b.position = e;
  b.visibility = d;
  return a
};
goog.style.getSizeWithDisplay_ = function(a) {
  var b = a.offsetWidth, c = a.offsetHeight, d = goog.userAgent.WEBKIT && !b && !c;
  return(!goog.isDef(b) || d) && a.getBoundingClientRect ? (a = goog.style.getBoundingClientRect_(a), new goog.math.Size(a.right - a.left, a.bottom - a.top)) : new goog.math.Size(b, c)
};
goog.style.getBounds = function(a) {
  var b = goog.style.getPageOffset(a), a = goog.style.getSize(a);
  return new goog.math.Rect(b.x, b.y, a.width, a.height)
};
goog.style.toCamelCase = function(a) {
  return goog.string.toCamelCase("" + a)
};
goog.style.toSelectorCase = function(a) {
  return goog.string.toSelectorCase(a)
};
goog.style.getOpacity = function(a) {
  var b = a.style, a = "";
  "opacity" in b ? a = b.opacity : "MozOpacity" in b ? a = b.MozOpacity : "filter" in b && (b = b.filter.match(/alpha\(opacity=([\d.]+)\)/)) && (a = "" + b[1] / 100);
  return"" == a ? a : Number(a)
};
goog.style.setOpacity = function(a, b) {
  var c = a.style;
  "opacity" in c ? c.opacity = b : "MozOpacity" in c ? c.MozOpacity = b : "filter" in c && (c.filter = "" === b ? "" : "alpha(opacity=" + 100 * b + ")")
};
goog.style.setTransparentBackgroundImage = function(a, b) {
  var c = a.style;
  goog.userAgent.IE && !goog.userAgent.isVersion("8") ? c.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + b + '", sizingMethod="crop")' : (c.backgroundImage = "url(" + b + ")", c.backgroundPosition = "top left", c.backgroundRepeat = "no-repeat")
};
goog.style.clearTransparentBackgroundImage = function(a) {
  a = a.style;
  "filter" in a ? a.filter = "" : a.backgroundImage = "none"
};
goog.style.showElement = function(a, b) {
  a.style.display = b ? "" : "none"
};
goog.style.isElementShown = function(a) {
  return"none" != a.style.display
};
goog.style.installStyles = function(a, b) {
  var c = goog.dom.getDomHelper(b), d = null;
  if(goog.userAgent.IE) {
    d = c.getDocument().createStyleSheet(), goog.style.setStyles(d, a)
  }else {
    var e = c.getElementsByTagNameAndClass("head")[0];
    e || (d = c.getElementsByTagNameAndClass("body")[0], e = c.createDom("head"), d.parentNode.insertBefore(e, d));
    d = c.createDom("style");
    goog.style.setStyles(d, a);
    c.appendChild(e, d)
  }
  return d
};
goog.style.uninstallStyles = function(a) {
  goog.dom.removeNode(a.ownerNode || a.owningElement || a)
};
goog.style.setStyles = function(a, b) {
  goog.userAgent.IE ? a.cssText = b : a[goog.userAgent.WEBKIT ? "innerText" : "innerHTML"] = b
};
goog.style.setPreWrap = function(a) {
  a = a.style;
  goog.userAgent.IE && !goog.userAgent.isVersion("8") ? (a.whiteSpace = "pre", a.wordWrap = "break-word") : a.whiteSpace = goog.userAgent.GECKO ? "-moz-pre-wrap" : "pre-wrap"
};
goog.style.setInlineBlock = function(a) {
  a = a.style;
  a.position = "relative";
  goog.userAgent.IE && !goog.userAgent.isVersion("8") ? (a.zoom = "1", a.display = "inline") : a.display = goog.userAgent.GECKO ? goog.userAgent.isVersion("1.9a") ? "inline-block" : "-moz-inline-box" : "inline-block"
};
goog.style.isRightToLeft = function(a) {
  return"rtl" == goog.style.getStyle_(a, "direction")
};
goog.style.unselectableStyle_ = goog.userAgent.GECKO ? "MozUserSelect" : goog.userAgent.WEBKIT ? "WebkitUserSelect" : null;
goog.style.isUnselectable = function(a) {
  return goog.style.unselectableStyle_ ? "none" == a.style[goog.style.unselectableStyle_].toLowerCase() : goog.userAgent.IE || goog.userAgent.OPERA ? "on" == a.getAttribute("unselectable") : !1
};
goog.style.setUnselectable = function(a, b, c) {
  var c = !c ? a.getElementsByTagName("*") : null, d = goog.style.unselectableStyle_;
  if(d) {
    if(b = b ? "none" : "", a.style[d] = b, c) {
      for(var a = 0, e;e = c[a];a++) {
        e.style[d] = b
      }
    }
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      if(b = b ? "on" : "", a.setAttribute("unselectable", b), c) {
        for(a = 0;e = c[a];a++) {
          e.setAttribute("unselectable", b)
        }
      }
    }
  }
};
goog.style.getBorderBoxSize = function(a) {
  return new goog.math.Size(a.offsetWidth, a.offsetHeight)
};
goog.style.setBorderBoxSize = function(a, b) {
  var c = goog.dom.getOwnerDocument(a), d = goog.dom.getDomHelper(c).isCss1CompatMode();
  if(goog.userAgent.IE && (!d || !goog.userAgent.isVersion("8"))) {
    if(c = a.style, d) {
      var d = goog.style.getPaddingBox(a), e = goog.style.getBorderBox(a);
      c.pixelWidth = b.width - e.left - d.left - d.right - e.right;
      c.pixelHeight = b.height - e.top - d.top - d.bottom - e.bottom
    }else {
      c.pixelWidth = b.width, c.pixelHeight = b.height
    }
  }else {
    goog.style.setBoxSizingSize_(a, b, "border-box")
  }
};
goog.style.getContentBoxSize = function(a) {
  var b = goog.dom.getOwnerDocument(a), c = goog.userAgent.IE && a.currentStyle;
  if(c && goog.dom.getDomHelper(b).isCss1CompatMode() && "auto" != c.width && "auto" != c.height && !c.boxSizing) {
    return b = goog.style.getIePixelValue_(a, c.width, "width", "pixelWidth"), a = goog.style.getIePixelValue_(a, c.height, "height", "pixelHeight"), new goog.math.Size(b, a)
  }
  c = goog.style.getBorderBoxSize(a);
  b = goog.style.getPaddingBox(a);
  a = goog.style.getBorderBox(a);
  return new goog.math.Size(c.width - a.left - b.left - b.right - a.right, c.height - a.top - b.top - b.bottom - a.bottom)
};
goog.style.setContentBoxSize = function(a, b) {
  var c = goog.dom.getOwnerDocument(a), d = goog.dom.getDomHelper(c).isCss1CompatMode();
  if(goog.userAgent.IE && (!d || !goog.userAgent.isVersion("8"))) {
    if(c = a.style, d) {
      c.pixelWidth = b.width, c.pixelHeight = b.height
    }else {
      var d = goog.style.getPaddingBox(a), e = goog.style.getBorderBox(a);
      c.pixelWidth = b.width + e.left + d.left + d.right + e.right;
      c.pixelHeight = b.height + e.top + d.top + d.bottom + e.bottom
    }
  }else {
    goog.style.setBoxSizingSize_(a, b, "content-box")
  }
};
goog.style.setBoxSizingSize_ = function(a, b, c) {
  a = a.style;
  goog.userAgent.GECKO ? a.MozBoxSizing = c : goog.userAgent.WEBKIT ? a.WebkitBoxSizing = c : a.boxSizing = c;
  a.width = b.width + "px";
  a.height = b.height + "px"
};
goog.style.getIePixelValue_ = function(a, b, c, d) {
  if(/^\d+px?$/.test(b)) {
    return parseInt(b, 10)
  }
  var e = a.style[c], f = a.runtimeStyle[c];
  a.runtimeStyle[c] = a.currentStyle[c];
  a.style[c] = b;
  b = a.style[d];
  a.style[c] = e;
  a.runtimeStyle[c] = f;
  return b
};
goog.style.getIePixelDistance_ = function(a, b) {
  return goog.style.getIePixelValue_(a, goog.style.getCascadedStyle(a, b), "left", "pixelLeft")
};
goog.style.getBox_ = function(a, b) {
  if(goog.userAgent.IE) {
    var c = goog.style.getIePixelDistance_(a, b + "Left"), d = goog.style.getIePixelDistance_(a, b + "Right"), e = goog.style.getIePixelDistance_(a, b + "Top"), f = goog.style.getIePixelDistance_(a, b + "Bottom");
    return new goog.math.Box(e, d, f, c)
  }
  c = goog.style.getComputedStyle(a, b + "Left");
  d = goog.style.getComputedStyle(a, b + "Right");
  e = goog.style.getComputedStyle(a, b + "Top");
  f = goog.style.getComputedStyle(a, b + "Bottom");
  return new goog.math.Box(parseFloat(e), parseFloat(d), parseFloat(f), parseFloat(c))
};
goog.style.getPaddingBox = function(a) {
  return goog.style.getBox_(a, "padding")
};
goog.style.getMarginBox = function(a) {
  return goog.style.getBox_(a, "margin")
};
goog.style.ieBorderWidthKeywords_ = {thin:2, medium:4, thick:6};
goog.style.getIePixelBorder_ = function(a, b) {
  if("none" == goog.style.getCascadedStyle(a, b + "Style")) {
    return 0
  }
  var c = goog.style.getCascadedStyle(a, b + "Width");
  return c in goog.style.ieBorderWidthKeywords_ ? goog.style.ieBorderWidthKeywords_[c] : goog.style.getIePixelValue_(a, c, "left", "pixelLeft")
};
goog.style.getBorderBox = function(a) {
  if(goog.userAgent.IE) {
    var b = goog.style.getIePixelBorder_(a, "borderLeft"), c = goog.style.getIePixelBorder_(a, "borderRight"), d = goog.style.getIePixelBorder_(a, "borderTop"), a = goog.style.getIePixelBorder_(a, "borderBottom");
    return new goog.math.Box(d, c, a, b)
  }
  b = goog.style.getComputedStyle(a, "borderLeftWidth");
  c = goog.style.getComputedStyle(a, "borderRightWidth");
  d = goog.style.getComputedStyle(a, "borderTopWidth");
  a = goog.style.getComputedStyle(a, "borderBottomWidth");
  return new goog.math.Box(parseFloat(d), parseFloat(c), parseFloat(a), parseFloat(b))
};
goog.style.getFontFamily = function(a) {
  var b = goog.dom.getOwnerDocument(a), c = "";
  if(b.body.createTextRange) {
    b = b.body.createTextRange();
    b.moveToElementText(a);
    try {
      c = b.queryCommandValue("FontName")
    }catch(d) {
      c = ""
    }
  }
  c || (c = goog.style.getStyle_(a, "fontFamily"));
  a = c.split(",");
  1 < a.length && (c = a[0]);
  return goog.string.stripQuotes(c, "\"'")
};
goog.style.lengthUnitRegex_ = /[^\d]+$/;
goog.style.getLengthUnits = function(a) {
  return(a = a.match(goog.style.lengthUnitRegex_)) && a[0] || null
};
goog.style.ABSOLUTE_CSS_LENGTH_UNITS_ = {cm:1, "in":1, mm:1, pc:1, pt:1};
goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_ = {em:1, ex:1};
goog.style.getFontSize = function(a) {
  var b = goog.style.getStyle_(a, "fontSize"), c = goog.style.getLengthUnits(b);
  if(b && "px" == c) {
    return parseInt(b, 10)
  }
  if(goog.userAgent.IE) {
    if(c in goog.style.ABSOLUTE_CSS_LENGTH_UNITS_) {
      return goog.style.getIePixelValue_(a, b, "left", "pixelLeft")
    }
    if(a.parentNode && a.parentNode.nodeType == goog.dom.NodeType.ELEMENT && c in goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_) {
      return a = a.parentNode, c = goog.style.getStyle_(a, "fontSize"), goog.style.getIePixelValue_(a, b == c ? "1em" : b, "left", "pixelLeft")
    }
  }
  c = goog.dom.createDom("span", {style:"visibility:hidden;position:absolute;line-height:0;padding:0;margin:0;border:0;height:1em;"});
  goog.dom.appendChild(a, c);
  b = c.offsetHeight;
  goog.dom.removeNode(c);
  return b
};
goog.style.parseStyleAttribute = function(a) {
  var b = {};
  goog.array.forEach(a.split(/\s*;\s*/), function(a) {
    a = a.split(/\s*:\s*/);
    2 == a.length && (b[goog.string.toCamelCase(a[0].toLowerCase())] = a[1])
  });
  return b
};
goog.style.toStyleAttribute = function(a) {
  var b = [];
  goog.object.forEach(a, function(a, d) {
    b.push(goog.string.toSelectorCase(d), ":", a, ";")
  });
  return b.join("")
};
goog.style.setFloat = function(a, b) {
  a.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] = b
};
goog.style.getFloat = function(a) {
  return a.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] || ""
};
goog.style.getScrollbarWidth = function(a) {
  var b = goog.dom.createElement("div");
  a && (b.className = a);
  b.style.cssText = "visiblity:hidden;overflow:auto;position:absolute;top:0;width:100px;height:100px";
  a = goog.dom.createElement("div");
  goog.style.setSize(a, "200px", "200px");
  b.appendChild(a);
  goog.dom.appendChild(goog.dom.getDocument().body, b);
  a = b.offsetWidth - b.clientWidth;
  goog.dom.removeNode(b);
  return a
};
bot.dom = {};
bot.dom.getActiveElement = function(a) {
  return goog.dom.getOwnerDocument(a).activeElement
};
bot.dom.isElement = function(a, b) {
  return!!a && a.nodeType == goog.dom.NodeType.ELEMENT && (!b || a.tagName.toUpperCase() == b)
};
bot.dom.isInteractable = function(a) {
  return bot.dom.isShown(a, !0) && bot.dom.isEnabled(a) && (goog.userAgent.IE || goog.userAgent.OPERA || bot.userAgent.FIREFOX_EXTENSION && bot.userAgent.isProductVersion(3.6) || "none" != bot.dom.getEffectiveStyle(a, "pointer-events"))
};
bot.dom.isSelectable = function(a) {
  return bot.dom.isElement(a, goog.dom.TagName.OPTION) ? !0 : bot.dom.isElement(a, goog.dom.TagName.INPUT) ? (a = a.type.toLowerCase(), "checkbox" == a || "radio" == a) : !1
};
bot.dom.isSelected = function(a) {
  if(!bot.dom.isSelectable(a)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_SELECTABLE, "Element is not selectable");
  }
  var b = "selected", c = a.type && a.type.toLowerCase();
  if("checkbox" == c || "radio" == c) {
    b = "checked"
  }
  return!!bot.dom.getProperty(a, b)
};
bot.dom.FOCUSABLE_FORM_FIELDS_ = [goog.dom.TagName.A, goog.dom.TagName.AREA, goog.dom.TagName.BUTTON, goog.dom.TagName.INPUT, goog.dom.TagName.LABEL, goog.dom.TagName.SELECT, goog.dom.TagName.TEXTAREA];
bot.dom.isFocusable = function(a) {
  return goog.array.some(bot.dom.FOCUSABLE_FORM_FIELDS_, function(b) {
    return a.tagName.toUpperCase() == b
  }) || null != bot.dom.getAttribute(a, "tabindex") && 0 <= Number(bot.dom.getProperty(a, "tabIndex"))
};
bot.dom.PROPERTY_ALIASES_ = {"class":"className", readonly:"readOnly"};
bot.dom.BOOLEAN_PROPERTIES_ = ["checked", "disabled", "draggable", "hidden"];
bot.dom.getProperty = function(a, b) {
  var c = bot.dom.PROPERTY_ALIASES_[b] || b, d = a[c];
  if(!goog.isDef(d) && goog.array.contains(bot.dom.BOOLEAN_PROPERTIES_, c)) {
    return!1
  }
  "value" == b && bot.dom.isElement(a, goog.dom.TagName.OPTION) && !bot.dom.hasAttribute(a, b) && (d = goog.dom.getRawTextContent(a));
  return d
};
bot.dom.BOOLEAN_ATTRIBUTES_ = "async,autofocus,autoplay,checked,compact,complete,controls,declare,defaultchecked,defaultselected,defer,disabled,draggable,ended,formnovalidate,hidden,indeterminate,iscontenteditable,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,paused,pubdate,readonly,required,reversed,scoped,seamless,seeking,selected,spellcheck,truespeed,willvalidate".split(",");
bot.dom.SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP_ = /[;]+(?=(?:(?:[^"]*"){2})*[^"]*$)(?=(?:(?:[^']*'){2})*[^']*$)(?=(?:[^()]*\([^()]*\))*[^()]*$)/;
bot.dom.isBooleanAttribute = function(a) {
  return goog.array.contains(bot.dom.BOOLEAN_ATTRIBUTES_, a)
};
bot.dom.standardizeStyleAttribute_ = function(a) {
  var a = a.split(bot.dom.SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP_), b = [];
  goog.array.forEach(a, function(a) {
    var d = a.indexOf(":");
    0 < d && (a = [a.slice(0, d), a.slice(d + 1)], 2 == a.length && b.push(a[0].toLowerCase(), ":", a[1], ";"))
  });
  b = b.join("");
  b = ";" == b.charAt(b.length - 1) ? b : b + ";";
  return goog.userAgent.OPERA ? b.replace(/\w+:;/g, "") : b
};
bot.dom.getAttribute = function(a, b) {
  if(goog.dom.NodeType.COMMENT == a.nodeType) {
    return null
  }
  b = b.toLowerCase();
  if("style" == b) {
    return bot.dom.standardizeStyleAttribute_(a.style.cssText)
  }
  var c = a.getAttributeNode(b);
  goog.userAgent.IE && !c && goog.userAgent.isVersion(8) && bot.dom.isBooleanAttribute(b) && (c = a[b]);
  return!c ? null : bot.dom.isBooleanAttribute(b) ? bot.userAgent.IE_DOC_PRE9 && !c.specified && "false" == c.value ? null : "true" : c.specified ? c.value : null
};
bot.dom.hasAttribute = function(a, b) {
  b = b.toLowerCase();
  if(a.hasAttribute) {
    return a.hasAttribute(b)
  }
  try {
    return a.attributes[b].specified
  }catch(c) {
    return!1
  }
};
bot.dom.DISABLED_ATTRIBUTE_SUPPORTED_ = [goog.dom.TagName.BUTTON, goog.dom.TagName.INPUT, goog.dom.TagName.OPTGROUP, goog.dom.TagName.OPTION, goog.dom.TagName.SELECT, goog.dom.TagName.TEXTAREA];
bot.dom.isEnabled = function(a) {
  var b = a.tagName.toUpperCase();
  return!goog.array.contains(bot.dom.DISABLED_ATTRIBUTE_SUPPORTED_, b) ? !0 : bot.dom.getProperty(a, "disabled") ? !1 : a.parentNode && a.parentNode.nodeType == goog.dom.NodeType.ELEMENT && goog.dom.TagName.OPTGROUP == b || goog.dom.TagName.OPTION == b ? bot.dom.isEnabled(a.parentNode) : !0
};
bot.dom.TEXTUAL_INPUT_TYPES_ = "text,search,tel,url,email,password,number".split(",");
bot.dom.isTextual = function(a) {
  return bot.dom.isElement(a, goog.dom.TagName.TEXTAREA) ? !0 : bot.dom.isElement(a, goog.dom.TagName.INPUT) ? (a = a.type.toLowerCase(), goog.array.contains(bot.dom.TEXTUAL_INPUT_TYPES_, a)) : bot.dom.isContentEditable(a) ? !0 : !1
};
bot.dom.isContentEditable = function(a) {
  function b(a) {
    return"inherit" == a.contentEditable ? (a = bot.dom.getParentElement(a)) ? b(a) : !1 : "true" == a.contentEditable
  }
  return!goog.isDef(a.contentEditable) ? !1 : !goog.userAgent.IE && goog.isDef(a.isContentEditable) ? a.isContentEditable : b(a)
};
bot.dom.isEditable = function(a) {
  return bot.dom.isTextual(a) && !bot.dom.getProperty(a, "readOnly")
};
bot.dom.getParentElement = function(a) {
  for(a = a.parentNode;a && a.nodeType != goog.dom.NodeType.ELEMENT && a.nodeType != goog.dom.NodeType.DOCUMENT && a.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT;) {
    a = a.parentNode
  }
  return bot.dom.isElement(a) ? a : null
};
bot.dom.getInlineStyle = function(a, b) {
  return goog.style.getStyle(a, b)
};
bot.dom.getEffectiveStyle = function(a, b) {
  var c = goog.string.toCamelCase(b), c = goog.style.getComputedStyle(a, c) || bot.dom.getCascadedStyle_(a, c);
  return null === c ? null : bot.color.standardizeColor(b, c)
};
bot.dom.getCascadedStyle_ = function(a, b) {
  var c = a.currentStyle || a.style, d = c[b];
  !goog.isDef(d) && goog.isFunction(c.getPropertyValue) && (d = c.getPropertyValue(b));
  return"inherit" != d ? goog.isDef(d) ? d : null : (c = bot.dom.getParentElement(a)) ? bot.dom.getCascadedStyle_(c, b) : null
};
bot.dom.isBodyScrollBarShown_ = function(a) {
  bot.dom.isElement(a, goog.dom.TagName.BODY);
  if("hidden" != bot.dom.getEffectiveStyle(a, "overflow")) {
    return!0
  }
  a = bot.dom.getParentElement(a);
  if(!a || !bot.dom.isElement(a, goog.dom.TagName.HTML)) {
    return!0
  }
  a = bot.dom.getEffectiveStyle(a, "overflow");
  return"auto" == a || "scroll" == a
};
bot.dom.getElementSize = function(a) {
  if(goog.isFunction(a.getBBox)) {
    try {
      var b = a.getBBox();
      if(b) {
        return b
      }
    }catch(c) {
    }
  }
  return bot.dom.isElement(a, goog.dom.TagName.BODY) ? (b = goog.dom.getOwnerDocument(a), b = goog.dom.getWindow(b) || void 0, !bot.dom.isBodyScrollBarShown_(a) ? goog.dom.getViewportSize(b) : bot.window.getInteractableSize(b)) : goog.style.getSize(a)
};
bot.dom.isShown = function(a, b) {
  function c(a) {
    if("none" == bot.dom.getEffectiveStyle(a, "display")) {
      return!1
    }
    a = bot.dom.getParentElement(a);
    return!a || c(a)
  }
  function d(a) {
    var b = bot.dom.getElementSize(a);
    return 0 < b.height && 0 < b.width ? !0 : goog.array.some(a.childNodes, function(a) {
      return a.nodeType == goog.dom.NodeType.TEXT || bot.dom.isElement(a) && d(a)
    })
  }
  function e(a) {
    var b = goog.style.getOffsetParent(a), c = goog.userAgent.GECKO || goog.userAgent.IE ? bot.dom.getParentElement(a) : b;
    if((goog.userAgent.GECKO || goog.userAgent.IE) && bot.dom.isElement(c, goog.dom.TagName.BODY)) {
      b = c
    }
    if(b && "hidden" == bot.dom.getEffectiveStyle(b, "overflow")) {
      var c = bot.dom.getElementSize(b), d = goog.style.getClientPosition(b), a = goog.style.getClientPosition(a);
      return d.x + c.width < a.x || d.y + c.height < a.y ? !1 : e(b)
    }
    return!0
  }
  if(!bot.dom.isElement(a)) {
    throw Error("Argument to isShown must be of type Element");
  }
  if(bot.dom.isElement(a, goog.dom.TagName.OPTION) || bot.dom.isElement(a, goog.dom.TagName.OPTGROUP)) {
    var f = goog.dom.getAncestor(a, function(a) {
      return bot.dom.isElement(a, goog.dom.TagName.SELECT)
    });
    return!!f && bot.dom.isShown(f, !0)
  }
  if(bot.dom.isElement(a, goog.dom.TagName.MAP)) {
    if(!a.name) {
      return!1
    }
    f = goog.dom.getOwnerDocument(a);
    f = f.evaluate ? bot.locators.xpath.single('/descendant::*[@usemap = "#' + a.name + '"]', f) : goog.dom.findNode(f, function(b) {
      return bot.dom.isElement(b) && bot.dom.getAttribute(b, "usemap") == "#" + a.name
    });
    return!!f && bot.dom.isShown(f, b)
  }
  return bot.dom.isElement(a, goog.dom.TagName.AREA) ? (f = goog.dom.getAncestor(a, function(a) {
    return bot.dom.isElement(a, goog.dom.TagName.MAP)
  }), !!f && bot.dom.isShown(f, b)) : bot.dom.isElement(a, goog.dom.TagName.INPUT) && "hidden" == a.type.toLowerCase() || bot.dom.isElement(a, goog.dom.TagName.NOSCRIPT) || "hidden" == bot.dom.getEffectiveStyle(a, "visibility") || !c(a) || !b && 0 == bot.dom.getOpacity(a) || !d(a) ? !1 : e(a)
};
bot.dom.trimExcludingNonBreakingSpaceCharacters_ = function(a) {
  return a.replace(/^[^\S\xa0]+|[^\S\xa0]+$/g, "")
};
bot.dom.getVisibleText = function(a) {
  var b = [];
  bot.dom.appendVisibleTextLinesFromElement_(a, b);
  b = goog.array.map(b, bot.dom.trimExcludingNonBreakingSpaceCharacters_);
  a = b.join("\n");
  return bot.dom.trimExcludingNonBreakingSpaceCharacters_(a).replace(/\xa0/g, " ")
};
bot.dom.appendVisibleTextLinesFromElement_ = function(a, b) {
  if(bot.dom.isElement(a, goog.dom.TagName.BR)) {
    b.push("")
  }else {
    var c = bot.dom.isElement(a, goog.dom.TagName.TD), d = bot.dom.getEffectiveStyle(a, "display"), e = !c && !goog.array.contains(bot.dom.INLINE_DISPLAY_BOXES_, d), f = goog.dom.getPreviousElementSibling(a), f = f ? bot.dom.getEffectiveStyle(f, "display") : "", g = bot.dom.getEffectiveStyle(a, "float") || bot.dom.getEffectiveStyle(a, "cssFloat") || bot.dom.getEffectiveStyle(a, "styleFloat");
    e && !("run-in" == f && "none" == g) && !goog.string.isEmpty(goog.array.peek(b) || "") && b.push("");
    var h = bot.dom.isShown(a), i = null, j = null;
    h && (i = bot.dom.getEffectiveStyle(a, "white-space"), j = bot.dom.getEffectiveStyle(a, "text-transform"));
    goog.array.forEach(a.childNodes, function(a) {
      a.nodeType == goog.dom.NodeType.TEXT && h ? bot.dom.appendVisibleTextLinesFromTextNode_(a, b, i, j) : bot.dom.isElement(a) && bot.dom.appendVisibleTextLinesFromElement_(a, b)
    });
    f = goog.array.peek(b) || "";
    if((c || "table-cell" == d) && f && !goog.string.endsWith(f, " ")) {
      b[b.length - 1] += " "
    }
    e && "run-in" != d && !goog.string.isEmpty(f) && b.push("")
  }
};
bot.dom.INLINE_DISPLAY_BOXES_ = "inline,inline-block,inline-table,none,table-cell,table-column,table-column-group".split(",");
bot.dom.appendVisibleTextLinesFromTextNode_ = function(a, b, c, d) {
  a = a.nodeValue.replace(/\u200b/g, "");
  a = goog.string.canonicalizeNewlines(a);
  if("normal" == c || "nowrap" == c) {
    a = a.replace(/\n/g, " ")
  }
  a = "pre" == c || "pre-wrap" == c ? a.replace(/[ \f\t\v\u2028\u2029]/g, "\u00a0") : a.replace(/[\ \f\t\v\u2028\u2029]+/g, " ");
  "capitalize" == d ? a = a.replace(/(^|\s)(\S)/g, function(a, b, c) {
    return b + c.toUpperCase()
  }) : "uppercase" == d ? a = a.toUpperCase() : "lowercase" == d && (a = a.toLowerCase());
  c = b.pop() || "";
  goog.string.endsWith(c, " ") && goog.string.startsWith(a, " ") && (a = a.substr(1));
  b.push(c + a)
};
bot.dom.getOpacity = function(a) {
  if(goog.userAgent.IE) {
    if("relative" == bot.dom.getEffectiveStyle(a, "position")) {
      return 1
    }
    a = bot.dom.getEffectiveStyle(a, "filter");
    return(a = a.match(/^alpha\(opacity=(\d*)\)/) || a.match(/^progid:DXImageTransform.Microsoft.Alpha\(Opacity=(\d*)\)/)) ? Number(a[1]) / 100 : 1
  }
  return bot.dom.getOpacityNonIE_(a)
};
bot.dom.getOpacityNonIE_ = function(a) {
  var b = 1, c = bot.dom.getEffectiveStyle(a, "opacity");
  c && (b = Number(c));
  (a = bot.dom.getParentElement(a)) && (b *= bot.dom.getOpacityNonIE_(a));
  return b
};
bot.dom.calculateViewportScrolling_ = function(a, b) {
  return a >= b ? a - (b - 1) : 0 > a ? a : 0
};
bot.dom.getInViewLocation = function(a, b) {
  var c = b || bot.getWindow(), d = goog.dom.getViewportSize(c), e = bot.dom.calculateViewportScrolling_(a.x, d.width), f = bot.dom.calculateViewportScrolling_(a.y, d.height), g = goog.dom.getDomHelper(c.document).getDocumentScroll();
  (0 != e || 0 != f) && c.scrollBy(e, f);
  c = goog.dom.getDomHelper(c.document).getDocumentScroll();
  if(g.x + e != c.x || g.y + f != c.y) {
    throw new bot.Error(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS, "The target location (" + (a.x + g.x) + ", " + (a.y + g.y) + ") is not on the webpage.");
  }
  e = new goog.math.Coordinate(a.x - e, a.y - f);
  if(0 > e.x || e.x >= d.width) {
    throw new bot.Error(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS, "The target location (" + e.x + ", " + e.y + ") should be within the viewport (" + d.width + ":" + d.height + ") after scrolling.");
  }
  if(0 > e.y || e.y >= d.height) {
    throw new bot.Error(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS, "The target location (" + e.x + ", " + e.y + ") should be within the viewport (" + d.width + ":" + d.height + ") after scrolling.");
  }
  return e
};
bot.dom.scrollRegionIntoView_ = function(a, b) {
  b.scrollLeft += Math.min(a.left, Math.max(a.left - a.width, 0));
  b.scrollTop += Math.min(a.top, Math.max(a.top - a.height, 0))
};
bot.dom.scrollElementRegionIntoContainerView_ = function(a, b, c) {
  var a = goog.style.getPageOffset(a), d = goog.style.getPageOffset(c), e = goog.style.getBorderBox(c);
  bot.dom.scrollRegionIntoView_(new goog.math.Rect(a.x + b.left - d.x - e.left, a.y + b.top - d.y - e.top, c.clientWidth - b.width, c.clientHeight - b.height), c)
};
bot.dom.scrollElementRegionIntoClientView = function(a, b) {
  for(var c = goog.dom.getOwnerDocument(a), d = bot.dom.getParentElement(a);d && d != c.body && d != c.documentElement;d = bot.dom.getParentElement(d)) {
    bot.dom.scrollElementRegionIntoContainerView_(a, b, d)
  }
  var d = goog.style.getPageOffset(a), e = goog.dom.getDomHelper(c).getViewportSize(), d = new goog.math.Rect(d.x + b.left - c.body.scrollLeft, d.y + b.top - c.body.scrollTop, e.width - b.width, e.height - b.height);
  bot.dom.scrollRegionIntoView_(d, c.body || c.documentElement)
};
bot.dom.getLocationInView = function(a, b) {
  var c;
  c = b ? new goog.math.Rect(b.left, b.top, b.width, b.height) : new goog.math.Rect(0, 0, a.offsetWidth, a.offsetHeight);
  bot.dom.scrollElementRegionIntoClientView(a, c);
  var d = a.getClientRects ? a.getClientRects()[0] : null, d = d ? new goog.math.Coordinate(d.left, d.top) : goog.style.getClientPosition(a);
  return new goog.math.Coordinate(d.x + c.left, d.y + c.top)
};
bot.dom.isScrolledIntoView = function(a, b) {
  for(var c = goog.dom.getWindow(goog.dom.getOwnerDocument(a)), d = c.top, e = goog.style.getSize(a);;c = c.parent) {
    var f = goog.dom.getDomHelper(c.document).getDocumentScroll(), g = goog.dom.getViewportSize(c), f = new goog.math.Rect(f.x, f.y, g.width, g.height), g = goog.style.getFramedPageOffset(a, c), g = new goog.math.Rect(g.x, g.y, e.width, e.height);
    if(!goog.math.Rect.intersects(f, g)) {
      return!1
    }
    if(c == d) {
      break
    }
  }
  d = goog.style.getVisibleRectForElement(a);
  if(!d) {
    return!1
  }
  if(b) {
    return e = goog.style.getPageOffset(a), e = goog.math.Coordinate.sum(e, b), d.contains(e)
  }
  e = goog.style.getBounds(a).toBox();
  return goog.math.Box.intersects(d, e)
};
bot.Device = function() {
  this.element_ = bot.getDocument().documentElement;
  this.select_ = null;
  var a = bot.dom.getActiveElement(this.element_);
  a && this.setElement(a)
};
bot.Device.prototype.getElement = function() {
  return this.element_
};
bot.Device.prototype.setElement = function(a) {
  this.element_ = a;
  this.select_ = bot.dom.isElement(a, goog.dom.TagName.OPTION) ? goog.dom.getAncestor(a, function(a) {
    return bot.dom.isElement(a, goog.dom.TagName.SELECT)
  }) : null
};
bot.Device.prototype.fireHtmlEvent = function(a) {
  return bot.events.fire(this.element_, a)
};
bot.Device.prototype.fireKeyboardEvent = function(a, b) {
  return bot.events.fire(this.element_, a, b)
};
bot.Device.prototype.fireMouseEvent = function(a, b, c, d, e) {
  if(!bot.dom.isInteractable(this.element_)) {
    return!1
  }
  if(d && !(bot.events.EventType.MOUSEOVER == a || bot.events.EventType.MOUSEOUT == a)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE, "Event type does not allow related target: " + a);
  }
  b = {clientX:b.x, clientY:b.y, button:c, altKey:!1, ctrlKey:!1, shiftKey:!1, metaKey:!1, wheelDelta:e || 0, relatedTarget:d || null};
  return(c = this.select_ ? this.getTargetOfOptionMouseEvent_(a) : this.element_) ? bot.events.fire(c, a, b) : !0
};
bot.Device.prototype.fireTouchEvent = function(a, b, c, d, e) {
  function f(b, c) {
    var d = {identifier:b, screenX:c.x, screenY:c.y, clientX:c.x, clientY:c.y, pageX:c.x, pageY:c.y};
    g.changedTouches.push(d);
    if(a == bot.events.EventType.TOUCHSTART || a == bot.events.EventType.TOUCHMOVE) {
      g.touches.push(d), g.targetTouches.push(d)
    }
  }
  var g = {touches:[], targetTouches:[], changedTouches:[], altKey:!1, ctrlKey:!1, shiftKey:!1, metaKey:!1, relatedTarget:null, scale:0, rotation:0};
  f(b, c);
  goog.isDef(d) && f(d, e);
  return bot.events.fire(this.element_, a, g)
};
bot.Device.prototype.getTargetOfOptionMouseEvent_ = function(a) {
  if(goog.userAgent.IE) {
    switch(a) {
      case bot.events.EventType.MOUSEOVER:
        return null;
      case bot.events.EventType.CONTEXTMENU:
      ;
      case bot.events.EventType.MOUSEMOVE:
        return this.select_.multiple ? this.select_ : null;
      default:
        return this.select_
    }
  }
  if(goog.userAgent.OPERA) {
    switch(a) {
      case bot.events.EventType.CONTEXTMENU:
      ;
      case bot.events.EventType.MOUSEOVER:
        return this.select_.multiple ? this.element_ : null;
      default:
        return this.element_
    }
  }
  if(goog.userAgent.WEBKIT) {
    switch(a) {
      case bot.events.EventType.CLICK:
      ;
      case bot.events.EventType.MOUSEUP:
        return this.select_.multiple ? this.element_ : this.select_;
      default:
        return this.select_.multiple ? this.element_ : null
    }
  }
  return this.element_
};
bot.Device.prototype.clickElement = function(a, b) {
  if(bot.dom.isInteractable(this.element_)) {
    var c = null, d = null;
    if(!bot.Device.ALWAYS_FOLLOWS_LINKS_ON_CLICK_) {
      for(var e = this.element_;e;e = e.parentNode) {
        if(bot.dom.isElement(e, goog.dom.TagName.A)) {
          c = e;
          break
        }else {
          if(bot.Device.isFormSubmitElement(e)) {
            d = e;
            break
          }
        }
      }
    }
    var f = (e = bot.dom.isSelectable(this.element_)) && bot.dom.isSelected(this.element_);
    this.select_ && this.toggleOption_(f);
    goog.userAgent.IE && d ? d.click() : this.fireMouseEvent(bot.events.EventType.CLICK, a, b) && (c && bot.Device.shouldFollowHref_(c) ? bot.Device.followHref_(c) : e && !this.select_ && this.toggleRadioButtonOrCheckbox_(f))
  }
};
bot.Device.prototype.focusOnElement = function() {
  var a = this.select_ || this.element_, b = bot.dom.getActiveElement(a);
  if(a == b) {
    return!1
  }
  if(b && (goog.isFunction(b.blur) || goog.userAgent.IE && goog.isObject(b.blur))) {
    try {
      b.blur()
    }catch(c) {
      if(!(goog.userAgent.IE && "Unspecified error." == c.message)) {
        throw c;
      }
    }
    goog.userAgent.IE && !bot.userAgent.isEngineVersion(8) && goog.dom.getWindow(goog.dom.getOwnerDocument(a)).focus()
  }
  return goog.isFunction(a.focus) || goog.userAgent.IE && goog.isObject(a.focus) ? (goog.userAgent.OPERA && bot.userAgent.isEngineVersion(11) && !bot.dom.isShown(a) ? bot.events.fire(a, bot.events.EventType.FOCUS) : a.focus(), !0) : !1
};
bot.Device.ALWAYS_FOLLOWS_LINKS_ON_CLICK_ = goog.userAgent.WEBKIT || goog.userAgent.OPERA || bot.userAgent.FIREFOX_EXTENSION && bot.userAgent.isProductVersion(3.6);
bot.Device.isFormSubmitElement = function(a) {
  if(bot.dom.isElement(a, goog.dom.TagName.INPUT)) {
    var b = a.type.toLowerCase();
    if("submit" == b || "image" == b) {
      return!0
    }
  }
  return bot.dom.isElement(a, goog.dom.TagName.BUTTON) && (b = a.type.toLowerCase(), "submit" == b) ? !0 : !1
};
bot.Device.shouldFollowHref_ = function(a) {
  if(bot.Device.ALWAYS_FOLLOWS_LINKS_ON_CLICK_ || !a.href) {
    return!1
  }
  if(!bot.userAgent.FIREFOX_EXTENSION) {
    return!0
  }
  if(a.target || 0 == a.href.toLowerCase().indexOf("javascript")) {
    return!1
  }
  var b = goog.dom.getWindow(goog.dom.getOwnerDocument(a)), c = b.location.href, a = bot.Device.resolveUrl_(b.location, a.href);
  return c.split("#")[0] !== a.split("#")[0]
};
bot.Device.followHref_ = function(a) {
  var b = a.href, c = goog.dom.getWindow(goog.dom.getOwnerDocument(a));
  goog.userAgent.IE && !bot.userAgent.isEngineVersion(8) && (b = bot.Device.resolveUrl_(c.location, b));
  a.target ? c.open(b, a.target) : c.location.href = b
};
bot.Device.prototype.toggleOption_ = function(a) {
  var b = this.select_;
  if(!a || b.multiple) {
    this.element_.selected = !a, (!goog.userAgent.WEBKIT || !b.multiple || goog.userAgent.product.ANDROID && bot.userAgent.isProductVersion(4)) && bot.events.fire(b, bot.events.EventType.CHANGE)
  }
};
bot.Device.prototype.toggleRadioButtonOrCheckbox_ = function(a) {
  goog.userAgent.GECKO || goog.userAgent.WEBKIT || a && "radio" == this.element_.type.toLowerCase() || (this.element_.checked = !a, goog.userAgent.OPERA && !bot.userAgent.isEngineVersion(11) && bot.events.fire(this.element_, bot.events.EventType.CHANGE))
};
bot.Device.findAncestorForm = function(a) {
  return goog.dom.getAncestor(a, bot.Device.isForm_, !0)
};
bot.Device.isForm_ = function(a) {
  return bot.dom.isElement(a, goog.dom.TagName.FORM)
};
bot.Device.prototype.submitForm = function(a) {
  if(!bot.Device.isForm_(a)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE, "Element was not in a form, so could not submit.");
  }
  if(bot.events.fire(a, bot.events.EventType.SUBMIT)) {
    if(bot.dom.isElement(a.submit)) {
      if(!goog.userAgent.IE || bot.userAgent.isEngineVersion(8)) {
        a.constructor.prototype.submit.call(a)
      }else {
        var b = bot.locators.findElements({id:"submit"}, a), c = bot.locators.findElements({name:"submit"}, a);
        goog.array.forEach(b, function(a) {
          a.removeAttribute("id")
        });
        goog.array.forEach(c, function(a) {
          a.removeAttribute("name")
        });
        a = a.submit;
        goog.array.forEach(b, function(a) {
          a.setAttribute("id", "submit")
        });
        goog.array.forEach(c, function(a) {
          a.setAttribute("name", "submit")
        });
        a()
      }
    }else {
      a.submit()
    }
  }
};
bot.Device.URL_REGEXP_ = /^([^:/?#.]+:)?(?:\/\/([^/]*))?([^?#]+)?(\?[^#]*)?(#.*)?$/;
bot.Device.resolveUrl_ = function(a, b) {
  var c = b.match(bot.Device.URL_REGEXP_);
  if(!c) {
    return""
  }
  var d = c[1] || "", e = c[2] || "", f = c[3] || "", g = c[4] || "", c = c[5] || "";
  if(!d && (d = a.protocol, !e)) {
    if(e = a.host, f) {
      if("/" != f.charAt(0)) {
        var h = a.pathname.lastIndexOf("/");
        -1 != h && (f = a.pathname.substr(0, h + 1) + f)
      }
    }else {
      f = a.pathname, g = g || a.search
    }
  }
  return d + "//" + e + f + g + c
};
bot.events = {};
bot.events.SUPPORTS_TOUCH_EVENTS = !goog.userAgent.IE && !goog.userAgent.OPERA;
bot.events.BROKEN_TOUCH_API_ = function() {
  return goog.userAgent.product.ANDROID ? !bot.userAgent.isProductVersion(4) : !bot.userAgent.IOS
}();
bot.events.EventFactory_ = function(a, b, c) {
  this.type_ = a;
  this.bubbles_ = b;
  this.cancelable_ = c
};
bot.events.EventFactory_.prototype.create = function(a) {
  a = goog.dom.getOwnerDocument(a);
  bot.userAgent.IE_DOC_PRE9 ? a = a.createEventObject() : (a = a.createEvent("HTMLEvents"), a.initEvent(this.type_, this.bubbles_, this.cancelable_));
  return a
};
bot.events.EventFactory_.prototype.toString = function() {
  return this.type_
};
bot.events.MouseEventFactory_ = function(a, b, c) {
  bot.events.EventFactory_.call(this, a, b, c)
};
goog.inherits(bot.events.MouseEventFactory_, bot.events.EventFactory_);
bot.events.MouseEventFactory_.prototype.create = function(a, b) {
  if(!goog.userAgent.GECKO && this == bot.events.EventType.MOUSEPIXELSCROLL) {
    throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION, "Browser does not support a mouse pixel scroll event.");
  }
  var c = goog.dom.getOwnerDocument(a), d;
  if(bot.userAgent.IE_DOC_PRE9) {
    d = c.createEventObject();
    d.altKey = b.altKey;
    d.ctrlKey = b.ctrlKey;
    d.metaKey = b.metaKey;
    d.shiftKey = b.shiftKey;
    d.button = b.button;
    d.clientX = b.clientX;
    d.clientY = b.clientY;
    var e = function(a, b) {
      Object.defineProperty(d, a, {get:function() {
        return b
      }})
    };
    if(this == bot.events.EventType.MOUSEOUT || this == bot.events.EventType.MOUSEOVER) {
      if(Object.defineProperty) {
        var f = this == bot.events.EventType.MOUSEOUT;
        e("fromElement", f ? a : b.relatedTarget);
        e("toElement", f ? b.relatedTarget : a)
      }else {
        d.relatedTarget = b.relatedTarget
      }
    }
    this == bot.events.EventType.MOUSEWHEEL && (Object.defineProperty ? e("wheelDelta", b.wheelDelta) : d.detail = b.wheelDelta)
  }else {
    e = goog.dom.getWindow(c);
    d = c.createEvent("MouseEvents");
    f = 1;
    if(this == bot.events.EventType.MOUSEWHEEL && (goog.userAgent.GECKO || (d.wheelDelta = b.wheelDelta), goog.userAgent.GECKO || goog.userAgent.OPERA)) {
      f = b.wheelDelta / -40
    }
    goog.userAgent.GECKO && this == bot.events.EventType.MOUSEPIXELSCROLL && (f = b.wheelDelta);
    d.initMouseEvent(this.type_, this.bubbles_, this.cancelable_, e, f, 0, 0, b.clientX, b.clientY, b.ctrlKey, b.altKey, b.shiftKey, b.metaKey, b.button, b.relatedTarget);
    if(goog.userAgent.IE && 0 === d.pageX && 0 === d.pageY && Object.defineProperty) {
      var c = bot.getDocument().documentElement, g = bot.getDocument().body;
      Object.defineProperty(d, "pageX", {get:function() {
        return b.clientX + (c && c.scrollLeft || g && g.scrollLeft || 0) - (c && c.clientLeft || g && g.clientLeft || 0)
      }});
      Object.defineProperty(d, "pageY", {get:function() {
        return b.clientY + (c && c.scrollTop || g && g.scrollTop || 0) - (c && c.clientTop || g && g.clientTop || 0)
      }})
    }
  }
  return d
};
bot.events.KeyboardEventFactory_ = function(a, b, c) {
  bot.events.EventFactory_.call(this, a, b, c)
};
goog.inherits(bot.events.KeyboardEventFactory_, bot.events.EventFactory_);
bot.events.KeyboardEventFactory_.prototype.create = function(a, b) {
  var c = goog.dom.getOwnerDocument(a);
  if(goog.userAgent.GECKO) {
    var d = goog.dom.getWindow(c), e = b.charCode ? 0 : b.keyCode, c = c.createEvent("KeyboardEvent");
    c.initKeyEvent(this.type_, this.bubbles_, this.cancelable_, d, b.ctrlKey, b.altKey, b.shiftKey, b.metaKey, e, b.charCode);
    this.type_ == bot.events.EventType.KEYPRESS && b.preventDefault && c.preventDefault()
  }else {
    if(bot.userAgent.IE_DOC_PRE9 ? c = c.createEventObject() : (c = c.createEvent("Events"), c.initEvent(this.type_, this.bubbles_, this.cancelable_)), c.altKey = b.altKey, c.ctrlKey = b.ctrlKey, c.metaKey = b.metaKey, c.shiftKey = b.shiftKey, c.keyCode = b.charCode || b.keyCode, goog.userAgent.WEBKIT) {
      c.charCode = this == bot.events.EventType.KEYPRESS ? c.keyCode : 0
    }
  }
  return c
};
bot.events.TouchEventFactory_ = function(a, b, c) {
  bot.events.EventFactory_.call(this, a, b, c)
};
goog.inherits(bot.events.TouchEventFactory_, bot.events.EventFactory_);
bot.events.TouchEventFactory_.prototype.create = function(a, b) {
  function c(b) {
    b = goog.array.map(b, function(b) {
      return f.createTouch(g, a, b.identifier, b.pageX, b.pageY, b.screenX, b.screenY)
    });
    return f.createTouchList.apply(f, b)
  }
  function d(b) {
    var c = goog.array.map(b, function(b) {
      return{identifier:b.identifier, screenX:b.screenX, screenY:b.screenY, clientX:b.clientX, clientY:b.clientY, pageX:b.pageX, pageY:b.pageY, target:a}
    });
    c.item = function(a) {
      return c[a]
    };
    return c
  }
  function e(a) {
    return bot.events.BROKEN_TOUCH_API_ ? d(a) : c(a)
  }
  if(!bot.events.SUPPORTS_TOUCH_EVENTS) {
    throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION, "Browser does not support firing touch events.");
  }
  var f = goog.dom.getOwnerDocument(a), g = goog.dom.getWindow(f), h = e(b.changedTouches), i = b.touches == b.changedTouches ? h : e(b.touches), j = b.targetTouches == b.changedTouches ? h : e(b.targetTouches), k;
  bot.events.BROKEN_TOUCH_API_ ? (k = f.createEvent("MouseEvents"), k.initMouseEvent(this.type_, this.bubbles_, this.cancelable_, g, 1, 0, 0, b.clientX, b.clientY, b.ctrlKey, b.altKey, b.shiftKey, b.metaKey, 0, b.relatedTarget), k.touches = i, k.targetTouches = j, k.changedTouches = h, k.scale = b.scale, k.rotation = b.rotation) : (k = f.createEvent("TouchEvent"), goog.userAgent.product.ANDROID ? k.initTouchEvent(i, j, h, this.type_, g, 0, 0, b.clientX, b.clientY, b.ctrlKey, b.altKey, b.shiftKey, 
  b.metaKey) : k.initTouchEvent(this.type_, this.bubbles_, this.cancelable_, g, 1, 0, 0, b.clientX, b.clientY, b.ctrlKey, b.altKey, b.shiftKey, b.metaKey, i, j, h, b.scale, b.rotation), k.relatedTarget = b.relatedTarget);
  return k
};
bot.events.EventType = {BLUR:new bot.events.EventFactory_("blur", !1, !1), CHANGE:new bot.events.EventFactory_("change", !0, !1), FOCUS:new bot.events.EventFactory_("focus", !1, !1), INPUT:new bot.events.EventFactory_("input", !1, !1), PROPERTYCHANGE:new bot.events.EventFactory_("propertychange", !1, !1), SELECT:new bot.events.EventFactory_("select", !0, !1), SUBMIT:new bot.events.EventFactory_("submit", !0, !0), TEXTINPUT:new bot.events.EventFactory_("textInput", !0, !0), CLICK:new bot.events.MouseEventFactory_("click", 
!0, !0), CONTEXTMENU:new bot.events.MouseEventFactory_("contextmenu", !0, !0), DBLCLICK:new bot.events.MouseEventFactory_("dblclick", !0, !0), MOUSEDOWN:new bot.events.MouseEventFactory_("mousedown", !0, !0), MOUSEMOVE:new bot.events.MouseEventFactory_("mousemove", !0, !1), MOUSEOUT:new bot.events.MouseEventFactory_("mouseout", !0, !0), MOUSEOVER:new bot.events.MouseEventFactory_("mouseover", !0, !0), MOUSEUP:new bot.events.MouseEventFactory_("mouseup", !0, !0), MOUSEWHEEL:new bot.events.MouseEventFactory_(goog.userAgent.GECKO ? 
"DOMMouseScroll" : "mousewheel", !0, !0), MOUSEPIXELSCROLL:new bot.events.MouseEventFactory_("MozMousePixelScroll", !0, !0), KEYDOWN:new bot.events.KeyboardEventFactory_("keydown", !0, !0), KEYPRESS:new bot.events.KeyboardEventFactory_("keypress", !0, !0), KEYUP:new bot.events.KeyboardEventFactory_("keyup", !0, !0), TOUCHEND:new bot.events.TouchEventFactory_("touchend", !0, !0), TOUCHMOVE:new bot.events.TouchEventFactory_("touchmove", !0, !0), TOUCHSTART:new bot.events.TouchEventFactory_("touchstart", 
!0, !0)};
bot.events.fire = function(a, b, c) {
  c = b.create(a, c);
  "isTrusted" in c || (c.isTrusted = !1);
  return bot.userAgent.IE_DOC_PRE9 ? a.fireEvent("on" + b.type_, c) : a.dispatchEvent(c)
};
bot.events.isSynthetic = function(a) {
  a = a.getBrowserEvent ? a.getBrowserEvent() : a;
  return"isTrusted" in a ? !a.isTrusted : !1
};
goog.dom.selection = {};
goog.dom.selection.setStart = function(a, b) {
  if(goog.dom.selection.useSelectionProperties_(a)) {
    a.selectionStart = b
  }else {
    if(goog.userAgent.IE) {
      var c = goog.dom.selection.getRangeIe_(a), d = c[0];
      d.inRange(c[1]) && (b = goog.dom.selection.canonicalizePositionIe_(a, b), d.collapse(!0), d.move("character", b), d.select())
    }
  }
};
goog.dom.selection.getStart = function(a) {
  return goog.dom.selection.getEndPoints_(a, !0)[0]
};
goog.dom.selection.getEndPointsTextareaIe_ = function(a, b, c) {
  for(var b = b.duplicate(), d = a.text, e = d, f = b.text, g = f, h = !1;!h;) {
    0 == a.compareEndPoints("StartToEnd", a) ? h = !0 : (a.moveEnd("character", -1), a.text == d ? e += "\r\n" : h = !0)
  }
  if(c) {
    return[e.length, -1]
  }
  for(a = !1;!a;) {
    0 == b.compareEndPoints("StartToEnd", b) ? a = !0 : (b.moveEnd("character", -1), b.text == f ? g += "\r\n" : a = !0)
  }
  return[e.length, e.length + g.length]
};
goog.dom.selection.getEndPoints = function(a) {
  return goog.dom.selection.getEndPoints_(a, !1)
};
goog.dom.selection.getEndPoints_ = function(a, b) {
  var c = 0, d = 0;
  if(goog.dom.selection.useSelectionProperties_(a)) {
    c = a.selectionStart, d = b ? -1 : a.selectionEnd
  }else {
    if(goog.userAgent.IE) {
      var e = goog.dom.selection.getRangeIe_(a), f = e[0], e = e[1];
      if(f.inRange(e)) {
        f.setEndPoint("EndToStart", e);
        if("textarea" == a.type) {
          return goog.dom.selection.getEndPointsTextareaIe_(f, e, b)
        }
        c = f.text.length;
        d = b ? -1 : f.text.length + e.text.length
      }
    }
  }
  return[c, d]
};
goog.dom.selection.setEnd = function(a, b) {
  if(goog.dom.selection.useSelectionProperties_(a)) {
    a.selectionEnd = b
  }else {
    if(goog.userAgent.IE) {
      var c = goog.dom.selection.getRangeIe_(a), d = c[1];
      c[0].inRange(d) && (b = goog.dom.selection.canonicalizePositionIe_(a, b), c = goog.dom.selection.canonicalizePositionIe_(a, goog.dom.selection.getStart(a)), d.collapse(!0), d.moveEnd("character", b - c), d.select())
    }
  }
};
goog.dom.selection.getEnd = function(a) {
  return goog.dom.selection.getEndPoints_(a, !1)[1]
};
goog.dom.selection.setCursorPosition = function(a, b) {
  if(goog.dom.selection.useSelectionProperties_(a)) {
    a.selectionStart = b, a.selectionEnd = b
  }else {
    if(goog.userAgent.IE) {
      var b = goog.dom.selection.canonicalizePositionIe_(a, b), c = a.createTextRange();
      c.collapse(!0);
      c.move("character", b);
      c.select()
    }
  }
};
goog.dom.selection.setText = function(a, b) {
  if(goog.dom.selection.useSelectionProperties_(a)) {
    var c = a.value, d = a.selectionStart, e = c.substr(0, d), c = c.substr(a.selectionEnd);
    a.value = e + b + c;
    a.selectionStart = d;
    a.selectionEnd = d + b.length
  }else {
    if(goog.userAgent.IE) {
      e = goog.dom.selection.getRangeIe_(a), d = e[1], e[0].inRange(d) && (e = d.duplicate(), d.text = b, d.setEndPoint("StartToStart", e), d.select())
    }else {
      throw Error("Cannot set the selection end");
    }
  }
};
goog.dom.selection.getText = function(a) {
  if(goog.dom.selection.useSelectionProperties_(a)) {
    return a.value.substring(a.selectionStart, a.selectionEnd)
  }
  if(goog.userAgent.IE) {
    var b = goog.dom.selection.getRangeIe_(a), c = b[1];
    if(b[0].inRange(c)) {
      if("textarea" == a.type) {
        return goog.dom.selection.getSelectionRangeText_(c)
      }
    }else {
      return""
    }
    return c.text
  }
  throw Error("Cannot get the selection text");
};
goog.dom.selection.getSelectionRangeText_ = function(a) {
  for(var a = a.duplicate(), b = a.text, c = b, d = !1;!d;) {
    0 == a.compareEndPoints("StartToEnd", a) ? d = !0 : (a.moveEnd("character", -1), a.text == b ? c += "\r\n" : d = !0)
  }
  return c
};
goog.dom.selection.getRangeIe_ = function(a) {
  var b = a.ownerDocument || a.document, c = b.selection.createRange();
  "textarea" == a.type ? (b = b.body.createTextRange(), b.moveToElementText(a)) : b = a.createTextRange();
  return[b, c]
};
goog.dom.selection.canonicalizePositionIe_ = function(a, b) {
  if("textarea" == a.type) {
    var c = a.value.substring(0, b), b = goog.string.canonicalizeNewlines(c).length
  }
  return b
};
goog.dom.selection.useSelectionProperties_ = function(a) {
  try {
    return"number" == typeof a.selectionStart
  }catch(b) {
    return!1
  }
};
goog.events = {};
goog.events.KeyCodes = {MAC_ENTER:3, BACKSPACE:8, TAB:9, NUM_CENTER:12, ENTER:13, SHIFT:16, CTRL:17, ALT:18, PAUSE:19, CAPS_LOCK:20, ESC:27, SPACE:32, PAGE_UP:33, PAGE_DOWN:34, END:35, HOME:36, LEFT:37, UP:38, RIGHT:39, DOWN:40, PRINT_SCREEN:44, INSERT:45, DELETE:46, ZERO:48, ONE:49, TWO:50, THREE:51, FOUR:52, FIVE:53, SIX:54, SEVEN:55, EIGHT:56, NINE:57, FF_SEMICOLON:59, QUESTION_MARK:63, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, L:76, M:77, N:78, O:79, P:80, Q:81, R:82, 
S:83, T:84, U:85, V:86, W:87, X:88, Y:89, Z:90, META:91, WIN_KEY_RIGHT:92, CONTEXT_MENU:93, NUM_ZERO:96, NUM_ONE:97, NUM_TWO:98, NUM_THREE:99, NUM_FOUR:100, NUM_FIVE:101, NUM_SIX:102, NUM_SEVEN:103, NUM_EIGHT:104, NUM_NINE:105, NUM_MULTIPLY:106, NUM_PLUS:107, NUM_MINUS:109, NUM_PERIOD:110, NUM_DIVISION:111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, NUMLOCK:144, SCROLL_LOCK:145, FIRST_MEDIA_KEY:166, LAST_MEDIA_KEY:183, SEMICOLON:186, DASH:189, 
EQUALS:187, COMMA:188, PERIOD:190, SLASH:191, APOSTROPHE:192, TILDE:192, SINGLE_QUOTE:222, OPEN_SQUARE_BRACKET:219, BACKSLASH:220, CLOSE_SQUARE_BRACKET:221, WIN_KEY:224, MAC_FF_META:224, WIN_IME:229, PHANTOM:255};
goog.events.KeyCodes.isTextModifyingKeyEvent = function(a) {
  if(a.altKey && !a.ctrlKey || a.metaKey || a.keyCode >= goog.events.KeyCodes.F1 && a.keyCode <= goog.events.KeyCodes.F12) {
    return!1
  }
  switch(a.keyCode) {
    case goog.events.KeyCodes.ALT:
    ;
    case goog.events.KeyCodes.CAPS_LOCK:
    ;
    case goog.events.KeyCodes.CONTEXT_MENU:
    ;
    case goog.events.KeyCodes.CTRL:
    ;
    case goog.events.KeyCodes.DOWN:
    ;
    case goog.events.KeyCodes.END:
    ;
    case goog.events.KeyCodes.ESC:
    ;
    case goog.events.KeyCodes.HOME:
    ;
    case goog.events.KeyCodes.INSERT:
    ;
    case goog.events.KeyCodes.LEFT:
    ;
    case goog.events.KeyCodes.MAC_FF_META:
    ;
    case goog.events.KeyCodes.META:
    ;
    case goog.events.KeyCodes.NUMLOCK:
    ;
    case goog.events.KeyCodes.NUM_CENTER:
    ;
    case goog.events.KeyCodes.PAGE_DOWN:
    ;
    case goog.events.KeyCodes.PAGE_UP:
    ;
    case goog.events.KeyCodes.PAUSE:
    ;
    case goog.events.KeyCodes.PHANTOM:
    ;
    case goog.events.KeyCodes.PRINT_SCREEN:
    ;
    case goog.events.KeyCodes.RIGHT:
    ;
    case goog.events.KeyCodes.SCROLL_LOCK:
    ;
    case goog.events.KeyCodes.SHIFT:
    ;
    case goog.events.KeyCodes.UP:
    ;
    case goog.events.KeyCodes.WIN_KEY:
    ;
    case goog.events.KeyCodes.WIN_KEY_RIGHT:
      return!1;
    default:
      return a.keyCode < goog.events.KeyCodes.FIRST_MEDIA_KEY || a.keyCode > goog.events.KeyCodes.LAST_MEDIA_KEY
  }
};
goog.events.KeyCodes.firesKeyPressEvent = function(a, b, c, d, e) {
  if(!goog.userAgent.IE && (!goog.userAgent.WEBKIT || !goog.userAgent.isVersion("525"))) {
    return!0
  }
  if(goog.userAgent.MAC && e) {
    return goog.events.KeyCodes.isCharacterKey(a)
  }
  if(e && !d || !c && (b == goog.events.KeyCodes.CTRL || b == goog.events.KeyCodes.ALT) || goog.userAgent.IE && d && b == a) {
    return!1
  }
  switch(a) {
    case goog.events.KeyCodes.ENTER:
      return!(goog.userAgent.IE && goog.userAgent.isDocumentMode(9));
    case goog.events.KeyCodes.ESC:
      return!goog.userAgent.WEBKIT
  }
  return goog.events.KeyCodes.isCharacterKey(a)
};
goog.events.KeyCodes.isCharacterKey = function(a) {
  if(a >= goog.events.KeyCodes.ZERO && a <= goog.events.KeyCodes.NINE || a >= goog.events.KeyCodes.NUM_ZERO && a <= goog.events.KeyCodes.NUM_MULTIPLY || a >= goog.events.KeyCodes.A && a <= goog.events.KeyCodes.Z || goog.userAgent.WEBKIT && 0 == a) {
    return!0
  }
  switch(a) {
    case goog.events.KeyCodes.SPACE:
    ;
    case goog.events.KeyCodes.QUESTION_MARK:
    ;
    case goog.events.KeyCodes.NUM_PLUS:
    ;
    case goog.events.KeyCodes.NUM_MINUS:
    ;
    case goog.events.KeyCodes.NUM_PERIOD:
    ;
    case goog.events.KeyCodes.NUM_DIVISION:
    ;
    case goog.events.KeyCodes.SEMICOLON:
    ;
    case goog.events.KeyCodes.FF_SEMICOLON:
    ;
    case goog.events.KeyCodes.DASH:
    ;
    case goog.events.KeyCodes.EQUALS:
    ;
    case goog.events.KeyCodes.COMMA:
    ;
    case goog.events.KeyCodes.PERIOD:
    ;
    case goog.events.KeyCodes.SLASH:
    ;
    case goog.events.KeyCodes.APOSTROPHE:
    ;
    case goog.events.KeyCodes.SINGLE_QUOTE:
    ;
    case goog.events.KeyCodes.OPEN_SQUARE_BRACKET:
    ;
    case goog.events.KeyCodes.BACKSLASH:
    ;
    case goog.events.KeyCodes.CLOSE_SQUARE_BRACKET:
      return!0;
    default:
      return!1
  }
};
goog.structs = {};
goog.structs.getCount = function(a) {
  return"function" == typeof a.getCount ? a.getCount() : goog.isArrayLike(a) || goog.isString(a) ? a.length : goog.object.getCount(a)
};
goog.structs.getValues = function(a) {
  if("function" == typeof a.getValues) {
    return a.getValues()
  }
  if(goog.isString(a)) {
    return a.split("")
  }
  if(goog.isArrayLike(a)) {
    for(var b = [], c = a.length, d = 0;d < c;d++) {
      b.push(a[d])
    }
    return b
  }
  return goog.object.getValues(a)
};
goog.structs.getKeys = function(a) {
  if("function" == typeof a.getKeys) {
    return a.getKeys()
  }
  if("function" != typeof a.getValues) {
    if(goog.isArrayLike(a) || goog.isString(a)) {
      for(var b = [], a = a.length, c = 0;c < a;c++) {
        b.push(c)
      }
      return b
    }
    return goog.object.getKeys(a)
  }
};
goog.structs.contains = function(a, b) {
  return"function" == typeof a.contains ? a.contains(b) : "function" == typeof a.containsValue ? a.containsValue(b) : goog.isArrayLike(a) || goog.isString(a) ? goog.array.contains(a, b) : goog.object.containsValue(a, b)
};
goog.structs.isEmpty = function(a) {
  return"function" == typeof a.isEmpty ? a.isEmpty() : goog.isArrayLike(a) || goog.isString(a) ? goog.array.isEmpty(a) : goog.object.isEmpty(a)
};
goog.structs.clear = function(a) {
  "function" == typeof a.clear ? a.clear() : goog.isArrayLike(a) ? goog.array.clear(a) : goog.object.clear(a)
};
goog.structs.forEach = function(a, b, c) {
  if("function" == typeof a.forEach) {
    a.forEach(b, c)
  }else {
    if(goog.isArrayLike(a) || goog.isString(a)) {
      goog.array.forEach(a, b, c)
    }else {
      for(var d = goog.structs.getKeys(a), e = goog.structs.getValues(a), f = e.length, g = 0;g < f;g++) {
        b.call(c, e[g], d && d[g], a)
      }
    }
  }
};
goog.structs.filter = function(a, b, c) {
  if("function" == typeof a.filter) {
    return a.filter(b, c)
  }
  if(goog.isArrayLike(a) || goog.isString(a)) {
    return goog.array.filter(a, b, c)
  }
  var d, e = goog.structs.getKeys(a), f = goog.structs.getValues(a), g = f.length;
  if(e) {
    d = {};
    for(var h = 0;h < g;h++) {
      b.call(c, f[h], e[h], a) && (d[e[h]] = f[h])
    }
  }else {
    d = [];
    for(h = 0;h < g;h++) {
      b.call(c, f[h], void 0, a) && d.push(f[h])
    }
  }
  return d
};
goog.structs.map = function(a, b, c) {
  if("function" == typeof a.map) {
    return a.map(b, c)
  }
  if(goog.isArrayLike(a) || goog.isString(a)) {
    return goog.array.map(a, b, c)
  }
  var d, e = goog.structs.getKeys(a), f = goog.structs.getValues(a), g = f.length;
  if(e) {
    d = {};
    for(var h = 0;h < g;h++) {
      d[e[h]] = b.call(c, f[h], e[h], a)
    }
  }else {
    d = [];
    for(h = 0;h < g;h++) {
      d[h] = b.call(c, f[h], void 0, a)
    }
  }
  return d
};
goog.structs.some = function(a, b, c) {
  if("function" == typeof a.some) {
    return a.some(b, c)
  }
  if(goog.isArrayLike(a) || goog.isString(a)) {
    return goog.array.some(a, b, c)
  }
  for(var d = goog.structs.getKeys(a), e = goog.structs.getValues(a), f = e.length, g = 0;g < f;g++) {
    if(b.call(c, e[g], d && d[g], a)) {
      return!0
    }
  }
  return!1
};
goog.structs.every = function(a, b, c) {
  if("function" == typeof a.every) {
    return a.every(b, c)
  }
  if(goog.isArrayLike(a) || goog.isString(a)) {
    return goog.array.every(a, b, c)
  }
  for(var d = goog.structs.getKeys(a), e = goog.structs.getValues(a), f = e.length, g = 0;g < f;g++) {
    if(!b.call(c, e[g], d && d[g], a)) {
      return!1
    }
  }
  return!0
};
goog.structs.Collection = function() {
};
goog.structs.Map = function(a, b) {
  this.map_ = {};
  goog.structs.Map.PRESERVE_NON_STRING_KEYS && (this.numericKeyMap_ = {});
  var c = arguments.length;
  if(1 < c) {
    if(c % 2) {
      throw Error("Uneven number of arguments");
    }
    for(var d = 0;d < c;d += 2) {
      this.set(arguments[d], arguments[d + 1])
    }
  }else {
    a && this.addAll(a)
  }
};
goog.structs.Map.PRESERVE_NON_STRING_KEYS = !0;
goog.structs.Map.KEY_PREFIX = ":";
goog.structs.Map.prototype.count_ = 0;
goog.structs.Map.prototype.version_ = 0;
goog.structs.Map.prototype.getCount = function() {
  return this.count_
};
goog.structs.Map.prototype.getValues = function() {
  var a = [], b;
  for(b in this.map_) {
    goog.structs.Map.isKey_(b) && a.push(this.map_[b])
  }
  return a
};
goog.structs.Map.prototype.getKeys = function() {
  var a = [], b;
  for(b in this.map_) {
    goog.structs.Map.isKey_(b) && a.push(this.getKey_(b))
  }
  return a
};
goog.structs.Map.prototype.containsKey = function(a) {
  return goog.structs.Map.makeKey_(a) in this.map_
};
goog.structs.Map.prototype.containsValue = function(a) {
  for(var b in this.map_) {
    if(goog.structs.Map.isKey_(b) && this.map_[b] == a) {
      return!0
    }
  }
  return!1
};
goog.structs.Map.prototype.equals = function(a, b) {
  if(this === a) {
    return!0
  }
  if(this.count_ != a.getCount()) {
    return!1
  }
  var c = b || goog.structs.Map.defaultEquals, d;
  for(d in this.map_) {
    if(d = this.getKey_(d), !c(this.get(d), a.get(d))) {
      return!1
    }
  }
  return!0
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b
};
goog.structs.Map.prototype.isEmpty = function() {
  return 0 == this.count_
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.version_ = this.count_ = 0;
  goog.structs.Map.PRESERVE_NON_STRING_KEYS && (this.numericKeyMap_ = {})
};
goog.structs.Map.prototype.remove = function(a) {
  a = goog.structs.Map.makeKey_(a);
  return goog.object.remove(this.map_, a) ? (goog.structs.Map.PRESERVE_NON_STRING_KEYS && delete this.numericKeyMap_[a], this.count_--, this.version_++, !0) : !1
};
goog.structs.Map.prototype.get = function(a, b) {
  var c = goog.structs.Map.makeKey_(a);
  return c in this.map_ ? this.map_[c] : b
};
goog.structs.Map.prototype.set = function(a, b) {
  var c = goog.structs.Map.makeKey_(a);
  c in this.map_ || (this.version_++, this.count_++, goog.structs.Map.PRESERVE_NON_STRING_KEYS && goog.isNumber(a) && (this.numericKeyMap_[c] = !0));
  this.map_[c] = b
};
goog.structs.Map.prototype.addAll = function(a) {
  var b;
  a instanceof goog.structs.Map ? (b = a.getKeys(), a = a.getValues()) : (b = goog.object.getKeys(a), a = goog.object.getValues(a));
  for(var c = 0;c < b.length;c++) {
    this.set(b[c], a[c])
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this)
};
goog.structs.Map.prototype.transpose = function() {
  var a = new goog.structs.Map, b;
  for(b in this.map_) {
    a.set(this.map_[b], this.getKey_(b))
  }
  return a
};
goog.structs.Map.prototype.toObject = function() {
  var a = {}, b;
  for(b in this.map_) {
    goog.structs.Map.isKey_(b) && (a[this.getKey_(b)] = this.map_[b])
  }
  return a
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(!0)
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(!1)
};
goog.structs.Map.prototype.__iterator__ = function(a) {
  var b = 0, c = this.getKeys(), d = this.map_, e = this.version_, f = this, g = new goog.iter.Iterator;
  g.next = function() {
    for(;;) {
      if(e != f.version_) {
        throw Error("The map has changed since the iterator was created");
      }
      if(b >= c.length) {
        throw goog.iter.StopIteration;
      }
      var g = c[b++];
      return a ? g : d[goog.structs.Map.makeKey_(g)]
    }
  };
  return g
};
goog.structs.Map.prototype.getKey_ = function(a) {
  var b = a.substring(1);
  return goog.structs.Map.PRESERVE_NON_STRING_KEYS ? this.numericKeyMap_[a] ? Number(b) : b : b
};
goog.structs.Map.isKey_ = function(a) {
  return a.charAt(0) == goog.structs.Map.KEY_PREFIX
};
goog.structs.Map.makeKey_ = function(a) {
  return goog.structs.Map.KEY_PREFIX + a
};
goog.structs.Set = function(a) {
  this.map_ = new goog.structs.Map;
  a && this.addAll(a)
};
goog.structs.Set.getKey_ = function(a) {
  var b = typeof a;
  return"object" == b && a || "function" == b ? "o" + goog.getUid(a) : b.substr(0, 1) + a
};
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount()
};
goog.structs.Set.prototype.add = function(a) {
  this.map_.set(goog.structs.Set.getKey_(a), a)
};
goog.structs.Set.prototype.addAll = function(a) {
  for(var a = goog.structs.getValues(a), b = a.length, c = 0;c < b;c++) {
    this.add(a[c])
  }
};
goog.structs.Set.prototype.removeAll = function(a) {
  for(var a = goog.structs.getValues(a), b = a.length, c = 0;c < b;c++) {
    this.remove(a[c])
  }
};
goog.structs.Set.prototype.remove = function(a) {
  return this.map_.remove(goog.structs.Set.getKey_(a))
};
goog.structs.Set.prototype.clear = function() {
  this.map_.clear()
};
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty()
};
goog.structs.Set.prototype.contains = function(a) {
  return this.map_.containsKey(goog.structs.Set.getKey_(a))
};
goog.structs.Set.prototype.containsAll = function(a) {
  return goog.structs.every(a, this.contains, this)
};
goog.structs.Set.prototype.intersection = function(a) {
  for(var b = new goog.structs.Set, a = goog.structs.getValues(a), c = 0;c < a.length;c++) {
    var d = a[c];
    this.contains(d) && b.add(d)
  }
  return b
};
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues()
};
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this)
};
goog.structs.Set.prototype.equals = function(a) {
  return this.getCount() == goog.structs.getCount(a) && this.isSubsetOf(a)
};
goog.structs.Set.prototype.isSubsetOf = function(a) {
  var b = goog.structs.getCount(a);
  if(this.getCount() > b) {
    return!1
  }
  !(a instanceof goog.structs.Set) && 5 < b && (a = new goog.structs.Set(a));
  return goog.structs.every(this, function(b) {
    return goog.structs.contains(a, b)
  })
};
goog.structs.Set.prototype.__iterator__ = function() {
  return this.map_.__iterator__(!1)
};
bot.Keyboard = function(a) {
  bot.Device.call(this);
  this.editable_ = bot.dom.isEditable(this.getElement());
  this.pressed_ = new goog.structs.Set;
  a && this.pressed_.addAll(a)
};
goog.inherits(bot.Keyboard, bot.Device);
bot.Keyboard.CHAR_TO_KEY_ = {};
bot.Keyboard.newKey_ = function(a, b, c) {
  goog.isObject(a) && (a = goog.userAgent.GECKO ? a.gecko : goog.userAgent.OPERA ? a.opera : a.ieWebkit);
  a = new bot.Keyboard.Key(a, b, c);
  if(b && (!(b in bot.Keyboard.CHAR_TO_KEY_) || c)) {
    bot.Keyboard.CHAR_TO_KEY_[b] = {key:a, shift:!1}, c && (bot.Keyboard.CHAR_TO_KEY_[c] = {key:a, shift:!0})
  }
  return a
};
bot.Keyboard.Key = function(a, b, c) {
  this.code = a;
  this.character = b || null;
  this.shiftChar = c || this.character
};
bot.Keyboard.Keys = {BACKSPACE:bot.Keyboard.newKey_(8), TAB:bot.Keyboard.newKey_(9), ENTER:bot.Keyboard.newKey_(13), SHIFT:bot.Keyboard.newKey_(16), CONTROL:bot.Keyboard.newKey_(17), ALT:bot.Keyboard.newKey_(18), PAUSE:bot.Keyboard.newKey_(19), CAPS_LOCK:bot.Keyboard.newKey_(20), ESC:bot.Keyboard.newKey_(27), SPACE:bot.Keyboard.newKey_(32, " "), PAGE_UP:bot.Keyboard.newKey_(33), PAGE_DOWN:bot.Keyboard.newKey_(34), END:bot.Keyboard.newKey_(35), HOME:bot.Keyboard.newKey_(36), LEFT:bot.Keyboard.newKey_(37), 
UP:bot.Keyboard.newKey_(38), RIGHT:bot.Keyboard.newKey_(39), DOWN:bot.Keyboard.newKey_(40), PRINT_SCREEN:bot.Keyboard.newKey_(44), INSERT:bot.Keyboard.newKey_(45), DELETE:bot.Keyboard.newKey_(46), ZERO:bot.Keyboard.newKey_(48, "0", ")"), ONE:bot.Keyboard.newKey_(49, "1", "!"), TWO:bot.Keyboard.newKey_(50, "2", "@"), THREE:bot.Keyboard.newKey_(51, "3", "#"), FOUR:bot.Keyboard.newKey_(52, "4", "$"), FIVE:bot.Keyboard.newKey_(53, "5", "%"), SIX:bot.Keyboard.newKey_(54, "6", "^"), SEVEN:bot.Keyboard.newKey_(55, 
"7", "&"), EIGHT:bot.Keyboard.newKey_(56, "8", "*"), NINE:bot.Keyboard.newKey_(57, "9", "("), A:bot.Keyboard.newKey_(65, "a", "A"), B:bot.Keyboard.newKey_(66, "b", "B"), C:bot.Keyboard.newKey_(67, "c", "C"), D:bot.Keyboard.newKey_(68, "d", "D"), E:bot.Keyboard.newKey_(69, "e", "E"), F:bot.Keyboard.newKey_(70, "f", "F"), G:bot.Keyboard.newKey_(71, "g", "G"), H:bot.Keyboard.newKey_(72, "h", "H"), I:bot.Keyboard.newKey_(73, "i", "I"), J:bot.Keyboard.newKey_(74, "j", "J"), K:bot.Keyboard.newKey_(75, 
"k", "K"), L:bot.Keyboard.newKey_(76, "l", "L"), M:bot.Keyboard.newKey_(77, "m", "M"), N:bot.Keyboard.newKey_(78, "n", "N"), O:bot.Keyboard.newKey_(79, "o", "O"), P:bot.Keyboard.newKey_(80, "p", "P"), Q:bot.Keyboard.newKey_(81, "q", "Q"), R:bot.Keyboard.newKey_(82, "r", "R"), S:bot.Keyboard.newKey_(83, "s", "S"), T:bot.Keyboard.newKey_(84, "t", "T"), U:bot.Keyboard.newKey_(85, "u", "U"), V:bot.Keyboard.newKey_(86, "v", "V"), W:bot.Keyboard.newKey_(87, "w", "W"), X:bot.Keyboard.newKey_(88, "x", "X"), 
Y:bot.Keyboard.newKey_(89, "y", "Y"), Z:bot.Keyboard.newKey_(90, "z", "Z"), META:bot.Keyboard.newKey_(goog.userAgent.WINDOWS ? {gecko:91, ieWebkit:91, opera:219} : goog.userAgent.MAC ? {gecko:224, ieWebkit:91, opera:17} : {gecko:0, ieWebkit:91, opera:null}), META_RIGHT:bot.Keyboard.newKey_(goog.userAgent.WINDOWS ? {gecko:92, ieWebkit:92, opera:220} : goog.userAgent.MAC ? {gecko:224, ieWebkit:93, opera:17} : {gecko:0, ieWebkit:92, opera:null}), CONTEXT_MENU:bot.Keyboard.newKey_(goog.userAgent.WINDOWS ? 
{gecko:93, ieWebkit:93, opera:0} : goog.userAgent.MAC ? {gecko:0, ieWebkit:0, opera:16} : {gecko:93, ieWebkit:null, opera:0}), NUM_ZERO:bot.Keyboard.newKey_({gecko:96, ieWebkit:96, opera:48}, "0"), NUM_ONE:bot.Keyboard.newKey_({gecko:97, ieWebkit:97, opera:49}, "1"), NUM_TWO:bot.Keyboard.newKey_({gecko:98, ieWebkit:98, opera:50}, "2"), NUM_THREE:bot.Keyboard.newKey_({gecko:99, ieWebkit:99, opera:51}, "3"), NUM_FOUR:bot.Keyboard.newKey_({gecko:100, ieWebkit:100, opera:52}, "4"), NUM_FIVE:bot.Keyboard.newKey_({gecko:101, 
ieWebkit:101, opera:53}, "5"), NUM_SIX:bot.Keyboard.newKey_({gecko:102, ieWebkit:102, opera:54}, "6"), NUM_SEVEN:bot.Keyboard.newKey_({gecko:103, ieWebkit:103, opera:55}, "7"), NUM_EIGHT:bot.Keyboard.newKey_({gecko:104, ieWebkit:104, opera:56}, "8"), NUM_NINE:bot.Keyboard.newKey_({gecko:105, ieWebkit:105, opera:57}, "9"), NUM_MULTIPLY:bot.Keyboard.newKey_({gecko:106, ieWebkit:106, opera:goog.userAgent.LINUX ? 56 : 42}, "*"), NUM_PLUS:bot.Keyboard.newKey_({gecko:107, ieWebkit:107, opera:goog.userAgent.LINUX ? 
61 : 43}, "+"), NUM_MINUS:bot.Keyboard.newKey_({gecko:109, ieWebkit:109, opera:goog.userAgent.LINUX ? 109 : 45}, "-"), NUM_PERIOD:bot.Keyboard.newKey_({gecko:110, ieWebkit:110, opera:goog.userAgent.LINUX ? 190 : 78}, "."), NUM_DIVISION:bot.Keyboard.newKey_({gecko:111, ieWebkit:111, opera:goog.userAgent.LINUX ? 191 : 47}, "/"), NUM_LOCK:bot.Keyboard.newKey_(goog.userAgent.LINUX && goog.userAgent.OPERA ? null : 144), F1:bot.Keyboard.newKey_(112), F2:bot.Keyboard.newKey_(113), F3:bot.Keyboard.newKey_(114), 
F4:bot.Keyboard.newKey_(115), F5:bot.Keyboard.newKey_(116), F6:bot.Keyboard.newKey_(117), F7:bot.Keyboard.newKey_(118), F8:bot.Keyboard.newKey_(119), F9:bot.Keyboard.newKey_(120), F10:bot.Keyboard.newKey_(121), F11:bot.Keyboard.newKey_(122), F12:bot.Keyboard.newKey_(123), EQUALS:bot.Keyboard.newKey_({gecko:107, ieWebkit:187, opera:61}, "=", "+"), SEPARATOR:bot.Keyboard.newKey_(108, ","), HYPHEN:bot.Keyboard.newKey_({gecko:109, ieWebkit:189, opera:109}, "-", "_"), COMMA:bot.Keyboard.newKey_(188, ",", 
"<"), PERIOD:bot.Keyboard.newKey_(190, ".", ">"), SLASH:bot.Keyboard.newKey_(191, "/", "?"), BACKTICK:bot.Keyboard.newKey_(192, "`", "~"), OPEN_BRACKET:bot.Keyboard.newKey_(219, "[", "{"), BACKSLASH:bot.Keyboard.newKey_(220, "\\", "|"), CLOSE_BRACKET:bot.Keyboard.newKey_(221, "]", "}"), SEMICOLON:bot.Keyboard.newKey_({gecko:59, ieWebkit:186, opera:59}, ";", ":"), APOSTROPHE:bot.Keyboard.newKey_(222, "'", '"')};
bot.Keyboard.Key.fromChar = function(a) {
  if(1 != a.length) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Argument not a single character: " + a);
  }
  var b = bot.Keyboard.CHAR_TO_KEY_[a];
  if(!b) {
    var b = a.toUpperCase(), c = b.charCodeAt(0), b = bot.Keyboard.newKey_(c, a.toLowerCase(), b), b = {key:b, shift:a != b.character}
  }
  return b
};
bot.Keyboard.MODIFIERS = [bot.Keyboard.Keys.ALT, bot.Keyboard.Keys.CONTROL, bot.Keyboard.Keys.META, bot.Keyboard.Keys.SHIFT];
bot.Keyboard.NEW_LINE_ = goog.userAgent.IE || goog.userAgent.OPERA ? "\r\n" : "\n";
bot.Keyboard.prototype.isPressed = function(a) {
  return this.pressed_.contains(a)
};
bot.Keyboard.prototype.pressKey = function(a) {
  if(this.isPressed(a) && goog.array.contains(bot.Keyboard.MODIFIERS, a)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Cannot press a modifier key that is already pressed.");
  }
  var b = !goog.isNull(a.code) && this.fireKeyEvent_(bot.events.EventType.KEYDOWN, a);
  if(b || goog.userAgent.GECKO) {
    if((!this.requiresKeyPress_(a) || this.fireKeyEvent_(bot.events.EventType.KEYPRESS, a, !b)) && b) {
      this.maybeSubmitForm_(a), this.editable_ && this.maybeEditText_(a)
    }
  }
  this.pressed_.add(a)
};
bot.Keyboard.prototype.requiresKeyPress_ = function(a) {
  if(a.character || a == bot.Keyboard.Keys.ENTER) {
    return!0
  }
  if(goog.userAgent.WEBKIT) {
    return!1
  }
  if(goog.userAgent.IE) {
    return a == bot.Keyboard.Keys.ESC
  }
  switch(a) {
    case bot.Keyboard.Keys.SHIFT:
    ;
    case bot.Keyboard.Keys.CONTROL:
    ;
    case bot.Keyboard.Keys.ALT:
      return!1;
    case bot.Keyboard.Keys.META:
    ;
    case bot.Keyboard.Keys.META_RIGHT:
    ;
    case bot.Keyboard.Keys.CONTEXT_MENU:
      return goog.userAgent.GECKO;
    default:
      return!0
  }
};
bot.Keyboard.prototype.maybeSubmitForm_ = function(a) {
  if(!(a != bot.Keyboard.Keys.ENTER || goog.userAgent.GECKO || !bot.dom.isElement(this.getElement(), goog.dom.TagName.INPUT))) {
    if(a = bot.Device.findAncestorForm(this.getElement())) {
      var b = a.getElementsByTagName("input");
      (goog.array.some(b, function(a) {
        return bot.Device.isFormSubmitElement(a)
      }) || 1 == b.length || goog.userAgent.WEBKIT && !bot.userAgent.isEngineVersion(534)) && this.submitForm(a)
    }
  }
};
bot.Keyboard.prototype.maybeEditText_ = function(a) {
  if(a.character) {
    this.updateOnCharacter_(a)
  }else {
    switch(a) {
      case bot.Keyboard.Keys.ENTER:
        this.updateOnEnter_();
        break;
      case bot.Keyboard.Keys.BACKSPACE:
      ;
      case bot.Keyboard.Keys.DELETE:
        this.updateOnBackspaceOrDelete_(a);
        break;
      case bot.Keyboard.Keys.LEFT:
      ;
      case bot.Keyboard.Keys.RIGHT:
        this.updateOnLeftOrRight_(a)
    }
  }
};
bot.Keyboard.prototype.releaseKey = function(a) {
  if(!this.isPressed(a)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Cannot release a key that is not pressed.");
  }
  goog.isNull(a.code) || this.fireKeyEvent_(bot.events.EventType.KEYUP, a);
  this.pressed_.remove(a)
};
bot.Keyboard.prototype.getChar_ = function(a) {
  if(!a.character) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "not a character key");
  }
  return this.isPressed(bot.Keyboard.Keys.SHIFT) ? a.shiftChar : a.character
};
bot.Keyboard.KEYPRESS_EDITS_TEXT_ = goog.userAgent.GECKO && !bot.userAgent.isEngineVersion(12);
bot.Keyboard.prototype.updateOnCharacter_ = function(a) {
  bot.Keyboard.KEYPRESS_EDITS_TEXT_ || (a = this.getChar_(a), goog.dom.selection.setText(this.getElement(), a), goog.dom.selection.setStart(this.getElement(), goog.dom.selection.getStart(this.getElement()) + 1), goog.userAgent.WEBKIT && this.fireHtmlEvent(bot.events.EventType.TEXTINPUT), bot.userAgent.IE_DOC_PRE9 || this.fireHtmlEvent(bot.events.EventType.INPUT))
};
bot.Keyboard.prototype.updateOnEnter_ = function() {
  bot.Keyboard.KEYPRESS_EDITS_TEXT_ || (goog.userAgent.WEBKIT && this.fireHtmlEvent(bot.events.EventType.TEXTINPUT), bot.dom.isElement(this.getElement(), goog.dom.TagName.TEXTAREA) && (goog.dom.selection.setText(this.getElement(), bot.Keyboard.NEW_LINE_), goog.dom.selection.setStart(this.getElement(), goog.dom.selection.getStart(this.getElement()) + bot.Keyboard.NEW_LINE_.length), goog.userAgent.IE || this.fireHtmlEvent(bot.events.EventType.INPUT)))
};
bot.Keyboard.prototype.updateOnBackspaceOrDelete_ = function(a) {
  if(!bot.Keyboard.KEYPRESS_EDITS_TEXT_) {
    var b = goog.dom.selection.getEndPoints(this.getElement());
    a == bot.Keyboard.Keys.BACKSPACE && b[0] == b[1] ? (goog.dom.selection.setStart(this.getElement(), b[1] - 1), goog.dom.selection.setEnd(this.getElement(), b[1])) : goog.dom.selection.setEnd(this.getElement(), b[1] + 1);
    b = goog.dom.selection.getEndPoints(this.getElement());
    b = !(b[0] == this.getElement().value.length || 0 == b[1]);
    goog.dom.selection.setText(this.getElement(), "");
    (!goog.userAgent.IE && b || goog.userAgent.GECKO && a == bot.Keyboard.Keys.BACKSPACE) && this.fireHtmlEvent(bot.events.EventType.INPUT)
  }
};
bot.Keyboard.prototype.updateOnLeftOrRight_ = function(a) {
  var b = goog.dom.selection.getStart(this.getElement());
  a == bot.Keyboard.Keys.LEFT ? goog.dom.selection.setCursorPosition(this.getElement(), b - 1) : goog.dom.selection.setCursorPosition(this.getElement(), b + 1)
};
bot.Keyboard.prototype.fireKeyEvent_ = function(a, b, c) {
  if(goog.isNull(b.code)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Key must have a keycode to be fired.");
  }
  b = {altKey:this.isPressed(bot.Keyboard.Keys.ALT), ctrlKey:this.isPressed(bot.Keyboard.Keys.CONTROL), metaKey:this.isPressed(bot.Keyboard.Keys.META), shiftKey:this.isPressed(bot.Keyboard.Keys.SHIFT), keyCode:b.code, charCode:b.character && a == bot.events.EventType.KEYPRESS ? this.getChar_(b).charCodeAt(0) : 0, preventDefault:!!c};
  return this.fireKeyboardEvent(a, b)
};
bot.Keyboard.prototype.moveCursor = function(a) {
  this.setElement(a);
  this.editable_ = bot.dom.isEditable(a);
  var b = this.focusOnElement();
  this.editable_ && b && goog.dom.selection.setCursorPosition(a, a.value.length)
};
bot.Keyboard.prototype.getState = function() {
  return this.pressed_.getValues()
};
goog.disposable = {};
goog.disposable.IDisposable = function() {
};
goog.Disposable = function() {
  goog.Disposable.ENABLE_MONITORING && (goog.Disposable.instances_[goog.getUid(this)] = this)
};
goog.Disposable.ENABLE_MONITORING = !1;
goog.Disposable.instances_ = {};
goog.Disposable.getUndisposedObjects = function() {
  var a = [], b;
  for(b in goog.Disposable.instances_) {
    goog.Disposable.instances_.hasOwnProperty(b) && a.push(goog.Disposable.instances_[Number(b)])
  }
  return a
};
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {}
};
goog.Disposable.prototype.disposed_ = !1;
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_
};
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;
goog.Disposable.prototype.dispose = function() {
  if(!this.disposed_ && (this.disposed_ = !0, this.disposeInternal(), goog.Disposable.ENABLE_MONITORING)) {
    var a = goog.getUid(this);
    if(!goog.Disposable.instances_.hasOwnProperty(a)) {
      throw Error(this + " did not call the goog.Disposable base constructor or was disposed of after a clearUndisposedObjects call");
    }
    delete goog.Disposable.instances_[a]
  }
};
goog.Disposable.prototype.registerDisposable = function(a) {
  this.dependentDisposables_ || (this.dependentDisposables_ = []);
  this.dependentDisposables_.push(a)
};
goog.Disposable.prototype.disposeInternal = function() {
  this.dependentDisposables_ && goog.disposeAll.apply(null, this.dependentDisposables_)
};
goog.dispose = function(a) {
  a && "function" == typeof a.dispose && a.dispose()
};
goog.disposeAll = function(a) {
  for(var b = 0, c = arguments.length;b < c;++b) {
    var d = arguments[b];
    goog.isArrayLike(d) ? goog.disposeAll.apply(null, d) : goog.dispose(d)
  }
};
goog.debug.catchErrors = function(a, b, c) {
  var c = c || goog.global, d = c.onerror, e = goog.userAgent.WEBKIT ? !b : !!b;
  c.onerror = function(b, c, h) {
    d && d(b, c, h);
    a({message:b, fileName:c, line:h});
    return e
  }
};
goog.debug.expose = function(a, b) {
  if("undefined" == typeof a) {
    return"undefined"
  }
  if(null == a) {
    return"NULL"
  }
  var c = [], d;
  for(d in a) {
    if(b || !goog.isFunction(a[d])) {
      var e = d + " = ";
      try {
        e += a[d]
      }catch(f) {
        e += "*** " + f + " ***"
      }
      c.push(e)
    }
  }
  return c.join("\n")
};
goog.debug.deepExpose = function(a, b) {
  var c = new goog.structs.Set, d = [], e = function(a, g) {
    var h = g + "  ";
    try {
      if(goog.isDef(a)) {
        if(goog.isNull(a)) {
          d.push("NULL")
        }else {
          if(goog.isString(a)) {
            d.push('"' + a.replace(/\n/g, "\n" + g) + '"')
          }else {
            if(goog.isFunction(a)) {
              d.push(("" + a).replace(/\n/g, "\n" + g))
            }else {
              if(goog.isObject(a)) {
                if(c.contains(a)) {
                  d.push("*** reference loop detected ***")
                }else {
                  c.add(a);
                  d.push("{");
                  for(var i in a) {
                    if(b || !goog.isFunction(a[i])) {
                      d.push("\n"), d.push(h), d.push(i + " = "), e(a[i], h)
                    }
                  }
                  d.push("\n" + g + "}")
                }
              }else {
                d.push(a)
              }
            }
          }
        }
      }else {
        d.push("undefined")
      }
    }catch(j) {
      d.push("*** " + j + " ***")
    }
  };
  e(a, "");
  return d.join("")
};
goog.debug.exposeArray = function(a) {
  for(var b = [], c = 0;c < a.length;c++) {
    goog.isArray(a[c]) ? b.push(goog.debug.exposeArray(a[c])) : b.push(a[c])
  }
  return"[ " + b.join(", ") + " ]"
};
goog.debug.exposeException = function(a, b) {
  try {
    var c = goog.debug.normalizeErrorObject(a);
    return"Message: " + goog.string.htmlEscape(c.message) + '\nUrl: <a href="view-source:' + c.fileName + '" target="_new">' + c.fileName + "</a>\nLine: " + c.lineNumber + "\n\nBrowser stack:\n" + goog.string.htmlEscape(c.stack + "-> ") + "[end]\n\nJS stack traversal:\n" + goog.string.htmlEscape(goog.debug.getStacktrace(b) + "-> ")
  }catch(d) {
    return"Exception trying to expose exception! You win, we lose. " + d
  }
};
goog.debug.normalizeErrorObject = function(a) {
  var b = goog.getObjectByName("window.location.href");
  if(goog.isString(a)) {
    return{message:a, name:"Unknown error", lineNumber:"Not available", fileName:b, stack:"Not available"}
  }
  var c, d, e = !1;
  try {
    c = a.lineNumber || a.line || "Not available"
  }catch(f) {
    c = "Not available", e = !0
  }
  try {
    d = a.fileName || a.filename || a.sourceURL || b
  }catch(g) {
    d = "Not available", e = !0
  }
  return e || !a.lineNumber || !a.fileName || !a.stack ? {message:a.message, name:a.name, lineNumber:c, fileName:d, stack:a.stack || "Not available"} : a
};
goog.debug.enhanceError = function(a, b) {
  var c = "string" == typeof a ? Error(a) : a;
  c.stack || (c.stack = goog.debug.getStacktrace(arguments.callee.caller));
  if(b) {
    for(var d = 0;c["message" + d];) {
      ++d
    }
    c["message" + d] = "" + b
  }
  return c
};
goog.debug.getStacktraceSimple = function(a) {
  for(var b = [], c = arguments.callee.caller, d = 0;c && (!a || d < a);) {
    b.push(goog.debug.getFunctionName(c));
    b.push("()\n");
    try {
      c = c.caller
    }catch(e) {
      b.push("[exception trying to get caller]\n");
      break
    }
    d++;
    if(d >= goog.debug.MAX_STACK_DEPTH) {
      b.push("[...long stack...]");
      break
    }
  }
  a && d >= a ? b.push("[...reached max depth limit...]") : b.push("[end]");
  return b.join("")
};
goog.debug.MAX_STACK_DEPTH = 50;
goog.debug.getStacktrace = function(a) {
  return goog.debug.getStacktraceHelper_(a || arguments.callee.caller, [])
};
goog.debug.getStacktraceHelper_ = function(a, b) {
  var c = [];
  if(goog.array.contains(b, a)) {
    c.push("[...circular reference...]")
  }else {
    if(a && b.length < goog.debug.MAX_STACK_DEPTH) {
      c.push(goog.debug.getFunctionName(a) + "(");
      for(var d = a.arguments, e = 0;e < d.length;e++) {
        0 < e && c.push(", ");
        var f;
        f = d[e];
        switch(typeof f) {
          case "object":
            f = f ? "object" : "null";
            break;
          case "string":
            break;
          case "number":
            f = "" + f;
            break;
          case "boolean":
            f = f ? "true" : "false";
            break;
          case "function":
            f = (f = goog.debug.getFunctionName(f)) ? f : "[fn]";
            break;
          default:
            f = typeof f
        }
        40 < f.length && (f = f.substr(0, 40) + "...");
        c.push(f)
      }
      b.push(a);
      c.push(")\n");
      try {
        c.push(goog.debug.getStacktraceHelper_(a.caller, b))
      }catch(g) {
        c.push("[exception trying to get caller]\n")
      }
    }else {
      a ? c.push("[...long stack...]") : c.push("[end]")
    }
  }
  return c.join("")
};
goog.debug.setFunctionResolver = function(a) {
  goog.debug.fnNameResolver_ = a
};
goog.debug.getFunctionName = function(a) {
  if(goog.debug.fnNameCache_[a]) {
    return goog.debug.fnNameCache_[a]
  }
  if(goog.debug.fnNameResolver_) {
    var b = goog.debug.fnNameResolver_(a);
    if(b) {
      return goog.debug.fnNameCache_[a] = b
    }
  }
  a = "" + a;
  goog.debug.fnNameCache_[a] || (b = /function ([^\(]+)/.exec(a), goog.debug.fnNameCache_[a] = b ? b[1] : "[Anonymous]");
  return goog.debug.fnNameCache_[a]
};
goog.debug.makeWhitespaceVisible = function(a) {
  return a.replace(/ /g, "[_]").replace(/\f/g, "[f]").replace(/\n/g, "[n]\n").replace(/\r/g, "[r]").replace(/\t/g, "[t]")
};
goog.debug.fnNameCache_ = {};
goog.debug.LogRecord = function(a, b, c, d, e) {
  this.reset(a, b, c, d, e)
};
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;
goog.debug.LogRecord.prototype.exception_ = null;
goog.debug.LogRecord.prototype.exceptionText_ = null;
goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS = !0;
goog.debug.LogRecord.nextSequenceNumber_ = 0;
goog.debug.LogRecord.prototype.reset = function(a, b, c, d, e) {
  goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS && (this.sequenceNumber_ = "number" == typeof e ? e : goog.debug.LogRecord.nextSequenceNumber_++);
  this.time_ = d || goog.now();
  this.level_ = a;
  this.msg_ = b;
  this.loggerName_ = c;
  delete this.exception_;
  delete this.exceptionText_
};
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_
};
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_
};
goog.debug.LogRecord.prototype.setException = function(a) {
  this.exception_ = a
};
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_
};
goog.debug.LogRecord.prototype.setExceptionText = function(a) {
  this.exceptionText_ = a
};
goog.debug.LogRecord.prototype.setLoggerName = function(a) {
  this.loggerName_ = a
};
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_
};
goog.debug.LogRecord.prototype.setLevel = function(a) {
  this.level_ = a
};
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_
};
goog.debug.LogRecord.prototype.setMessage = function(a) {
  this.msg_ = a
};
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_
};
goog.debug.LogRecord.prototype.setMillis = function(a) {
  this.time_ = a
};
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_
};
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(), "Cannot use goog.debug.LogBuffer without defining goog.debug.LogBuffer.CAPACITY.");
  this.clear()
};
goog.debug.LogBuffer.getInstance = function() {
  goog.debug.LogBuffer.instance_ || (goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer);
  return goog.debug.LogBuffer.instance_
};
goog.debug.LogBuffer.CAPACITY = 0;
goog.debug.LogBuffer.prototype.addRecord = function(a, b, c) {
  var d = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = d;
  if(this.isFull_) {
    return d = this.buffer_[d], d.reset(a, b, c), d
  }
  this.isFull_ = d == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[d] = new goog.debug.LogRecord(a, b, c)
};
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return 0 < goog.debug.LogBuffer.CAPACITY
};
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = !1
};
goog.debug.LogBuffer.prototype.forEachRecord = function(a) {
  var b = this.buffer_;
  if(b[0]) {
    var c = this.curIndex_, d = this.isFull_ ? c : -1;
    do {
      d = (d + 1) % goog.debug.LogBuffer.CAPACITY, a(b[d])
    }while(d != c)
  }
};
goog.debug.Logger = function(a) {
  this.name_ = a
};
goog.debug.Logger.prototype.parent_ = null;
goog.debug.Logger.prototype.level_ = null;
goog.debug.Logger.prototype.children_ = null;
goog.debug.Logger.prototype.handlers_ = null;
goog.debug.Logger.ENABLE_HIERARCHY = !0;
goog.debug.Logger.ENABLE_HIERARCHY || (goog.debug.Logger.rootHandlers_ = []);
goog.debug.Logger.Level = function(a, b) {
  this.name = a;
  this.value = b
};
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name
};
goog.debug.Logger.Level.OFF = new goog.debug.Logger.Level("OFF", Infinity);
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level("SHOUT", 1200);
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level("SEVERE", 1E3);
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level("WARNING", 900);
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level("INFO", 800);
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level("CONFIG", 700);
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level("FINE", 500);
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level("FINER", 400);
goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level("FINEST", 300);
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level("ALL", 0);
goog.debug.Logger.Level.PREDEFINED_LEVELS = [goog.debug.Logger.Level.OFF, goog.debug.Logger.Level.SHOUT, goog.debug.Logger.Level.SEVERE, goog.debug.Logger.Level.WARNING, goog.debug.Logger.Level.INFO, goog.debug.Logger.Level.CONFIG, goog.debug.Logger.Level.FINE, goog.debug.Logger.Level.FINER, goog.debug.Logger.Level.FINEST, goog.debug.Logger.Level.ALL];
goog.debug.Logger.Level.predefinedLevelsCache_ = null;
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for(var a = 0, b;b = goog.debug.Logger.Level.PREDEFINED_LEVELS[a];a++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[b.value] = b;
    goog.debug.Logger.Level.predefinedLevelsCache_[b.name] = b
  }
};
goog.debug.Logger.Level.getPredefinedLevel = function(a) {
  goog.debug.Logger.Level.predefinedLevelsCache_ || goog.debug.Logger.Level.createPredefinedLevelsCache_();
  return goog.debug.Logger.Level.predefinedLevelsCache_[a] || null
};
goog.debug.Logger.Level.getPredefinedLevelByValue = function(a) {
  goog.debug.Logger.Level.predefinedLevelsCache_ || goog.debug.Logger.Level.createPredefinedLevelsCache_();
  if(a in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[a]
  }
  for(var b = 0;b < goog.debug.Logger.Level.PREDEFINED_LEVELS.length;++b) {
    var c = goog.debug.Logger.Level.PREDEFINED_LEVELS[b];
    if(c.value <= a) {
      return c
    }
  }
  return null
};
goog.debug.Logger.getLogger = function(a) {
  return goog.debug.LogManager.getLogger(a)
};
goog.debug.Logger.logToProfilers = function(a) {
  goog.global.console && (goog.global.console.timeStamp ? goog.global.console.timeStamp(a) : goog.global.console.markTimeline && goog.global.console.markTimeline(a));
  goog.global.msWriteProfilerMark && goog.global.msWriteProfilerMark(a)
};
goog.debug.Logger.prototype.getName = function() {
  return this.name_
};
goog.debug.Logger.prototype.addHandler = function(a) {
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    if(!this.handlers_) {
      this.handlers_ = []
    }
    this.handlers_.push(a)
  }else {
    goog.asserts.assert(!this.name_, "Cannot call addHandler on a non-root logger when goog.debug.Logger.ENABLE_HIERARCHY is false.");
    goog.debug.Logger.rootHandlers_.push(a)
  }
};
goog.debug.Logger.prototype.removeHandler = function(a) {
  var b = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ : goog.debug.Logger.rootHandlers_;
  return!!b && goog.array.remove(b, a)
};
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_
};
goog.debug.Logger.prototype.getChildren = function() {
  if(!this.children_) {
    this.children_ = {}
  }
  return this.children_
};
goog.debug.Logger.prototype.setLevel = function(a) {
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    this.level_ = a
  }else {
    goog.asserts.assert(!this.name_, "Cannot call setLevel() on a non-root logger when goog.debug.Logger.ENABLE_HIERARCHY is false.");
    goog.debug.Logger.rootLevel_ = a
  }
};
goog.debug.Logger.prototype.getLevel = function() {
  return this.level_
};
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if(!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_
  }
  if(this.level_) {
    return this.level_
  }
  if(this.parent_) {
    return this.parent_.getEffectiveLevel()
  }
  goog.asserts.fail("Root logger has no level set.");
  return null
};
goog.debug.Logger.prototype.isLoggable = function(a) {
  return a.value >= this.getEffectiveLevel().value
};
goog.debug.Logger.prototype.log = function(a, b, c) {
  this.isLoggable(a) && this.doLogRecord_(this.getLogRecord(a, b, c))
};
goog.debug.Logger.prototype.getLogRecord = function(a, b, c) {
  var d = goog.debug.LogBuffer.isBufferingEnabled() ? goog.debug.LogBuffer.getInstance().addRecord(a, b, this.name_) : new goog.debug.LogRecord(a, "" + b, this.name_);
  if(c) {
    d.setException(c);
    d.setExceptionText(goog.debug.exposeException(c, arguments.callee.caller))
  }
  return d
};
goog.debug.Logger.prototype.shout = function(a, b) {
  this.log(goog.debug.Logger.Level.SHOUT, a, b)
};
goog.debug.Logger.prototype.severe = function(a, b) {
  this.log(goog.debug.Logger.Level.SEVERE, a, b)
};
goog.debug.Logger.prototype.warning = function(a, b) {
  this.log(goog.debug.Logger.Level.WARNING, a, b)
};
goog.debug.Logger.prototype.info = function(a, b) {
  this.log(goog.debug.Logger.Level.INFO, a, b)
};
goog.debug.Logger.prototype.config = function(a, b) {
  this.log(goog.debug.Logger.Level.CONFIG, a, b)
};
goog.debug.Logger.prototype.fine = function(a, b) {
  this.log(goog.debug.Logger.Level.FINE, a, b)
};
goog.debug.Logger.prototype.finer = function(a, b) {
  this.log(goog.debug.Logger.Level.FINER, a, b)
};
goog.debug.Logger.prototype.finest = function(a, b) {
  this.log(goog.debug.Logger.Level.FINEST, a, b)
};
goog.debug.Logger.prototype.logRecord = function(a) {
  this.isLoggable(a.getLevel()) && this.doLogRecord_(a)
};
goog.debug.Logger.prototype.doLogRecord_ = function(a) {
  goog.debug.Logger.logToProfilers("log:" + a.getMessage());
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    for(var b = this;b;) {
      b.callPublish_(a);
      b = b.getParent()
    }
  }else {
    for(var b = 0, c;c = goog.debug.Logger.rootHandlers_[b++];) {
      c(a)
    }
  }
};
goog.debug.Logger.prototype.callPublish_ = function(a) {
  if(this.handlers_) {
    for(var b = 0, c;c = this.handlers_[b];b++) {
      c(a)
    }
  }
};
goog.debug.Logger.prototype.setParent_ = function(a) {
  this.parent_ = a
};
goog.debug.Logger.prototype.addChild_ = function(a, b) {
  this.getChildren()[a] = b
};
goog.debug.LogManager = {};
goog.debug.LogManager.loggers_ = {};
goog.debug.LogManager.rootLogger_ = null;
goog.debug.LogManager.initialize = function() {
  if(!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger("");
    goog.debug.LogManager.loggers_[""] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG)
  }
};
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_
};
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return goog.debug.LogManager.rootLogger_
};
goog.debug.LogManager.getLogger = function(a) {
  goog.debug.LogManager.initialize();
  return goog.debug.LogManager.loggers_[a] || goog.debug.LogManager.createLogger_(a)
};
goog.debug.LogManager.createFunctionForCatchErrors = function(a) {
  return function(b) {
    (a || goog.debug.LogManager.getRoot()).severe("Error: " + b.message + " (" + b.fileName + " @ Line: " + b.line + ")")
  }
};
goog.debug.LogManager.createLogger_ = function(a) {
  var b = new goog.debug.Logger(a);
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    var c = a.lastIndexOf("."), d = a.substr(0, c), c = a.substr(c + 1), d = goog.debug.LogManager.getLogger(d);
    d.addChild_(c, b);
    b.setParent_(d)
  }
  return goog.debug.LogManager.loggers_[a] = b
};
goog.dom.SavedRange = function() {
  goog.Disposable.call(this)
};
goog.inherits(goog.dom.SavedRange, goog.Disposable);
goog.dom.SavedRange.logger_ = goog.debug.Logger.getLogger("goog.dom.SavedRange");
goog.dom.SavedRange.prototype.restore = function(a) {
  this.isDisposed() && goog.dom.SavedRange.logger_.severe("Disposed SavedRange objects cannot be restored.");
  var b = this.restoreInternal();
  a || this.dispose();
  return b
};
goog.dom.SavedCaretRange = function(a) {
  goog.dom.SavedRange.call(this);
  this.startCaretId_ = goog.string.createUniqueString();
  this.endCaretId_ = goog.string.createUniqueString();
  this.dom_ = goog.dom.getDomHelper(a.getDocument());
  a.surroundWithNodes(this.createCaret_(!0), this.createCaret_(!1))
};
goog.inherits(goog.dom.SavedCaretRange, goog.dom.SavedRange);
goog.dom.SavedCaretRange.prototype.toAbstractRange = function() {
  var a = null, b = this.getCaret(!0), c = this.getCaret(!1);
  b && c && (a = goog.dom.Range.createFromNodes(b, 0, c, 0));
  return a
};
goog.dom.SavedCaretRange.prototype.getCaret = function(a) {
  return this.dom_.getElement(a ? this.startCaretId_ : this.endCaretId_)
};
goog.dom.SavedCaretRange.prototype.removeCarets = function(a) {
  goog.dom.removeNode(this.getCaret(!0));
  goog.dom.removeNode(this.getCaret(!1));
  return a
};
goog.dom.SavedCaretRange.prototype.setRestorationDocument = function(a) {
  this.dom_.setDocument(a)
};
goog.dom.SavedCaretRange.prototype.restoreInternal = function() {
  var a = null, b = this.getCaret(!0), c = this.getCaret(!1);
  if(b && c) {
    var a = b.parentNode, b = goog.array.indexOf(a.childNodes, b), d = c.parentNode, c = goog.array.indexOf(d.childNodes, c);
    d == a && (c -= 1);
    a = goog.dom.Range.createFromNodes(a, b, d, c);
    a = this.removeCarets(a);
    a.select()
  }else {
    this.removeCarets()
  }
  return a
};
goog.dom.SavedCaretRange.prototype.disposeInternal = function() {
  this.removeCarets();
  this.dom_ = null
};
goog.dom.SavedCaretRange.prototype.createCaret_ = function(a) {
  return this.dom_.createDom(goog.dom.TagName.SPAN, {id:a ? this.startCaretId_ : this.endCaretId_})
};
goog.dom.SavedCaretRange.CARET_REGEX = /<span\s+id="?goog_\d+"?><\/span>/ig;
goog.dom.SavedCaretRange.htmlEqual = function(a, b) {
  return a == b || a.replace(goog.dom.SavedCaretRange.CARET_REGEX, "") == b.replace(goog.dom.SavedCaretRange.CARET_REGEX, "")
};
goog.dom.RangeType = {TEXT:"text", CONTROL:"control", MULTI:"mutli"};
goog.dom.AbstractRange = function() {
};
goog.dom.AbstractRange.getBrowserSelectionForWindow = function(a) {
  if(a.getSelection) {
    return a.getSelection()
  }
  var a = a.document, b = a.selection;
  if(b) {
    try {
      var c = b.createRange();
      if(c.parentElement) {
        if(c.parentElement().document != a) {
          return null
        }
      }else {
        if(!c.length || c.item(0).document != a) {
          return null
        }
      }
    }catch(d) {
      return null
    }
    return b
  }
  return null
};
goog.dom.AbstractRange.isNativeControlRange = function(a) {
  return!!a && !!a.addElement
};
goog.dom.AbstractRange.prototype.setBrowserRangeObject = function() {
  return!1
};
goog.dom.AbstractRange.prototype.getTextRanges = function() {
  for(var a = [], b = 0, c = this.getTextRangeCount();b < c;b++) {
    a.push(this.getTextRange(b))
  }
  return a
};
goog.dom.AbstractRange.prototype.getContainerElement = function() {
  var a = this.getContainer();
  return a.nodeType == goog.dom.NodeType.ELEMENT ? a : a.parentNode
};
goog.dom.AbstractRange.prototype.getAnchorNode = function() {
  return this.isReversed() ? this.getEndNode() : this.getStartNode()
};
goog.dom.AbstractRange.prototype.getAnchorOffset = function() {
  return this.isReversed() ? this.getEndOffset() : this.getStartOffset()
};
goog.dom.AbstractRange.prototype.getFocusNode = function() {
  return this.isReversed() ? this.getStartNode() : this.getEndNode()
};
goog.dom.AbstractRange.prototype.getFocusOffset = function() {
  return this.isReversed() ? this.getStartOffset() : this.getEndOffset()
};
goog.dom.AbstractRange.prototype.isReversed = function() {
  return!1
};
goog.dom.AbstractRange.prototype.getDocument = function() {
  return goog.dom.getOwnerDocument(goog.userAgent.IE ? this.getContainer() : this.getStartNode())
};
goog.dom.AbstractRange.prototype.getWindow = function() {
  return goog.dom.getWindow(this.getDocument())
};
goog.dom.AbstractRange.prototype.containsNode = function(a, b) {
  return this.containsRange(goog.dom.Range.createFromNodeContents(a), b)
};
goog.dom.AbstractRange.prototype.replaceContentsWithNode = function(a) {
  this.isCollapsed() || this.removeContents();
  return this.insertNode(a, !0)
};
goog.dom.AbstractRange.prototype.saveUsingCarets = function() {
  return this.getStartNode() && this.getEndNode() ? new goog.dom.SavedCaretRange(this) : null
};
goog.dom.RangeIterator = function(a, b) {
  goog.dom.TagIterator.call(this, a, b, !0)
};
goog.inherits(goog.dom.RangeIterator, goog.dom.TagIterator);
goog.dom.AbstractMultiRange = function() {
};
goog.inherits(goog.dom.AbstractMultiRange, goog.dom.AbstractRange);
goog.dom.AbstractMultiRange.prototype.containsRange = function(a, b) {
  var c = this.getTextRanges(), d = a.getTextRanges();
  return(b ? goog.array.some : goog.array.every)(d, function(a) {
    return goog.array.some(c, function(c) {
      return c.containsRange(a, b)
    })
  })
};
goog.dom.AbstractMultiRange.prototype.insertNode = function(a, b) {
  b ? goog.dom.insertSiblingBefore(a, this.getStartNode()) : goog.dom.insertSiblingAfter(a, this.getEndNode());
  return a
};
goog.dom.AbstractMultiRange.prototype.surroundWithNodes = function(a, b) {
  this.insertNode(a, !0);
  this.insertNode(b, !1)
};
goog.dom.TextRangeIterator = function(a, b, c, d, e) {
  var f;
  if(a && (this.startNode_ = a, this.startOffset_ = b, this.endNode_ = c, this.endOffset_ = d, a.nodeType == goog.dom.NodeType.ELEMENT && a.tagName != goog.dom.TagName.BR && (a = a.childNodes, (b = a[b]) ? (this.startNode_ = b, this.startOffset_ = 0) : (a.length && (this.startNode_ = goog.array.peek(a)), f = !0)), c.nodeType == goog.dom.NodeType.ELEMENT)) {
    (this.endNode_ = c.childNodes[d]) ? this.endOffset_ = 0 : this.endNode_ = c
  }
  goog.dom.RangeIterator.call(this, e ? this.endNode_ : this.startNode_, e);
  if(f) {
    try {
      this.next()
    }catch(g) {
      if(g != goog.iter.StopIteration) {
        throw g;
      }
    }
  }
};
goog.inherits(goog.dom.TextRangeIterator, goog.dom.RangeIterator);
goog.dom.TextRangeIterator.prototype.startNode_ = null;
goog.dom.TextRangeIterator.prototype.endNode_ = null;
goog.dom.TextRangeIterator.prototype.startOffset_ = 0;
goog.dom.TextRangeIterator.prototype.endOffset_ = 0;
goog.dom.TextRangeIterator.prototype.getStartTextOffset = function() {
  return this.node.nodeType != goog.dom.NodeType.TEXT ? -1 : this.node == this.startNode_ ? this.startOffset_ : 0
};
goog.dom.TextRangeIterator.prototype.getEndTextOffset = function() {
  return this.node.nodeType != goog.dom.NodeType.TEXT ? -1 : this.node == this.endNode_ ? this.endOffset_ : this.node.nodeValue.length
};
goog.dom.TextRangeIterator.prototype.getStartNode = function() {
  return this.startNode_
};
goog.dom.TextRangeIterator.prototype.setStartNode = function(a) {
  this.isStarted() || this.setPosition(a);
  this.startNode_ = a;
  this.startOffset_ = 0
};
goog.dom.TextRangeIterator.prototype.getEndNode = function() {
  return this.endNode_
};
goog.dom.TextRangeIterator.prototype.setEndNode = function(a) {
  this.endNode_ = a;
  this.endOffset_ = 0
};
goog.dom.TextRangeIterator.prototype.isLast = function() {
  return this.isStarted() && this.node == this.endNode_ && (!this.endOffset_ || !this.isStartTag())
};
goog.dom.TextRangeIterator.prototype.next = function() {
  if(this.isLast()) {
    throw goog.iter.StopIteration;
  }
  return goog.dom.TextRangeIterator.superClass_.next.call(this)
};
goog.dom.TextRangeIterator.prototype.skipTag = function() {
  goog.dom.TextRangeIterator.superClass_.skipTag.apply(this);
  if(goog.dom.contains(this.node, this.endNode_)) {
    throw goog.iter.StopIteration;
  }
};
goog.dom.TextRangeIterator.prototype.copyFrom = function(a) {
  this.startNode_ = a.startNode_;
  this.endNode_ = a.endNode_;
  this.startOffset_ = a.startOffset_;
  this.endOffset_ = a.endOffset_;
  this.isReversed_ = a.isReversed_;
  goog.dom.TextRangeIterator.superClass_.copyFrom.call(this, a)
};
goog.dom.TextRangeIterator.prototype.clone = function() {
  var a = new goog.dom.TextRangeIterator(this.startNode_, this.startOffset_, this.endNode_, this.endOffset_, this.isReversed_);
  a.copyFrom(this);
  return a
};
goog.dom.RangeEndpoint = {START:1, END:0};
goog.userAgent.jscript = {};
goog.userAgent.jscript.ASSUME_NO_JSCRIPT = !1;
goog.userAgent.jscript.init_ = function() {
  goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ = "ScriptEngine" in goog.global && "JScript" == goog.global.ScriptEngine();
  goog.userAgent.jscript.DETECTED_VERSION_ = goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ? goog.global.ScriptEngineMajorVersion() + "." + goog.global.ScriptEngineMinorVersion() + "." + goog.global.ScriptEngineBuildVersion() : "0"
};
goog.userAgent.jscript.ASSUME_NO_JSCRIPT || goog.userAgent.jscript.init_();
goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? !1 : goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_;
goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? "0" : goog.userAgent.jscript.DETECTED_VERSION_;
goog.userAgent.jscript.isVersion = function(a) {
  return 0 <= goog.string.compareVersions(goog.userAgent.jscript.VERSION, a)
};
goog.string.StringBuffer = function(a, b) {
  this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : "";
  null != a && this.append.apply(this, arguments)
};
goog.string.StringBuffer.prototype.set = function(a) {
  this.clear();
  this.append(a)
};
goog.userAgent.jscript.HAS_JSCRIPT ? (goog.string.StringBuffer.prototype.bufferLength_ = 0, goog.string.StringBuffer.prototype.append = function(a, b, c) {
  null == b ? this.buffer_[this.bufferLength_++] = a : (this.buffer_.push.apply(this.buffer_, arguments), this.bufferLength_ = this.buffer_.length);
  return this
}) : goog.string.StringBuffer.prototype.append = function(a, b, c) {
  this.buffer_ += a;
  if(null != b) {
    for(var d = 1;d < arguments.length;d++) {
      this.buffer_ += arguments[d]
    }
  }
  return this
};
goog.string.StringBuffer.prototype.clear = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    this.bufferLength_ = this.buffer_.length = 0
  }else {
    this.buffer_ = ""
  }
};
goog.string.StringBuffer.prototype.getLength = function() {
  return this.toString().length
};
goog.string.StringBuffer.prototype.toString = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    var a = this.buffer_.join("");
    this.clear();
    a && this.append(a);
    return a
  }
  return this.buffer_
};
goog.dom.browserrange = {};
goog.dom.browserrange.AbstractRange = function() {
};
goog.dom.browserrange.AbstractRange.prototype.containsRange = function(a, b) {
  var c = b && !a.isCollapsed(), d = a.getBrowserRange(), e = goog.dom.RangeEndpoint.START, f = goog.dom.RangeEndpoint.END;
  try {
    return c ? 0 <= this.compareBrowserRangeEndpoints(d, f, e) && 0 >= this.compareBrowserRangeEndpoints(d, e, f) : 0 <= this.compareBrowserRangeEndpoints(d, f, f) && 0 >= this.compareBrowserRangeEndpoints(d, e, e)
  }catch(g) {
    if(!goog.userAgent.IE) {
      throw g;
    }
    return!1
  }
};
goog.dom.browserrange.AbstractRange.prototype.containsNode = function(a, b) {
  return this.containsRange(goog.dom.browserrange.createRangeFromNodeContents(a), b)
};
goog.dom.browserrange.AbstractRange.prototype.getHtmlFragment = function() {
  var a = new goog.string.StringBuffer;
  goog.iter.forEach(this, function(b, c, d) {
    b.nodeType == goog.dom.NodeType.TEXT ? a.append(goog.string.htmlEscape(b.nodeValue.substring(d.getStartTextOffset(), d.getEndTextOffset()))) : b.nodeType == goog.dom.NodeType.ELEMENT && (d.isEndTag() ? goog.dom.canHaveChildren(b) && a.append("</" + b.tagName + ">") : (c = b.cloneNode(!1), c = goog.dom.getOuterHtml(c), goog.userAgent.IE && b.tagName == goog.dom.TagName.LI ? a.append(c) : (b = c.lastIndexOf("<"), a.append(b ? c.substr(0, b) : c))))
  }, this);
  return a.toString()
};
goog.dom.browserrange.AbstractRange.prototype.__iterator__ = function() {
  return new goog.dom.TextRangeIterator(this.getStartNode(), this.getStartOffset(), this.getEndNode(), this.getEndOffset())
};
goog.dom.browserrange.W3cRange = function(a) {
  this.range_ = a
};
goog.inherits(goog.dom.browserrange.W3cRange, goog.dom.browserrange.AbstractRange);
goog.dom.browserrange.W3cRange.getBrowserRangeForNode = function(a) {
  var b = goog.dom.getOwnerDocument(a).createRange();
  if(a.nodeType == goog.dom.NodeType.TEXT) {
    b.setStart(a, 0), b.setEnd(a, a.length)
  }else {
    if(goog.dom.browserrange.canContainRangeEndpoint(a)) {
      for(var c, d = a;(c = d.firstChild) && goog.dom.browserrange.canContainRangeEndpoint(c);) {
        d = c
      }
      b.setStart(d, 0);
      for(d = a;(c = d.lastChild) && goog.dom.browserrange.canContainRangeEndpoint(c);) {
        d = c
      }
      b.setEnd(d, d.nodeType == goog.dom.NodeType.ELEMENT ? d.childNodes.length : d.length)
    }else {
      c = a.parentNode, a = goog.array.indexOf(c.childNodes, a), b.setStart(c, a), b.setEnd(c, a + 1)
    }
  }
  return b
};
goog.dom.browserrange.W3cRange.getBrowserRangeForNodes = function(a, b, c, d) {
  var e = goog.dom.getOwnerDocument(a).createRange();
  e.setStart(a, b);
  e.setEnd(c, d);
  return e
};
goog.dom.browserrange.W3cRange.createFromNodeContents = function(a) {
  return new goog.dom.browserrange.W3cRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNode(a))
};
goog.dom.browserrange.W3cRange.createFromNodes = function(a, b, c, d) {
  return new goog.dom.browserrange.W3cRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(a, b, c, d))
};
goog.dom.browserrange.W3cRange.prototype.clone = function() {
  return new this.constructor(this.range_.cloneRange())
};
goog.dom.browserrange.W3cRange.prototype.getBrowserRange = function() {
  return this.range_
};
goog.dom.browserrange.W3cRange.prototype.getContainer = function() {
  return this.range_.commonAncestorContainer
};
goog.dom.browserrange.W3cRange.prototype.getStartNode = function() {
  return this.range_.startContainer
};
goog.dom.browserrange.W3cRange.prototype.getStartOffset = function() {
  return this.range_.startOffset
};
goog.dom.browserrange.W3cRange.prototype.getEndNode = function() {
  return this.range_.endContainer
};
goog.dom.browserrange.W3cRange.prototype.getEndOffset = function() {
  return this.range_.endOffset
};
goog.dom.browserrange.W3cRange.prototype.compareBrowserRangeEndpoints = function(a, b, c) {
  return this.range_.compareBoundaryPoints(c == goog.dom.RangeEndpoint.START ? b == goog.dom.RangeEndpoint.START ? goog.global.Range.START_TO_START : goog.global.Range.START_TO_END : b == goog.dom.RangeEndpoint.START ? goog.global.Range.END_TO_START : goog.global.Range.END_TO_END, a)
};
goog.dom.browserrange.W3cRange.prototype.isCollapsed = function() {
  return this.range_.collapsed
};
goog.dom.browserrange.W3cRange.prototype.getText = function() {
  return this.range_.toString()
};
goog.dom.browserrange.W3cRange.prototype.getValidHtml = function() {
  var a = goog.dom.getDomHelper(this.range_.startContainer).createDom("div");
  a.appendChild(this.range_.cloneContents());
  a = a.innerHTML;
  if(goog.string.startsWith(a, "<") || !this.isCollapsed() && !goog.string.contains(a, "<")) {
    return a
  }
  var b = this.getContainer(), b = b.nodeType == goog.dom.NodeType.ELEMENT ? b : b.parentNode;
  return goog.dom.getOuterHtml(b.cloneNode(!1)).replace(">", ">" + a)
};
goog.dom.browserrange.W3cRange.prototype.select = function(a) {
  this.selectInternal(goog.dom.getWindow(goog.dom.getOwnerDocument(this.getStartNode())).getSelection(), a)
};
goog.dom.browserrange.W3cRange.prototype.selectInternal = function(a) {
  a.removeAllRanges();
  a.addRange(this.range_)
};
goog.dom.browserrange.W3cRange.prototype.removeContents = function() {
  var a = this.range_;
  a.extractContents();
  if(a.startContainer.hasChildNodes() && (a = a.startContainer.childNodes[a.startOffset])) {
    var b = a.previousSibling;
    "" == goog.dom.getRawTextContent(a) && goog.dom.removeNode(a);
    b && "" == goog.dom.getRawTextContent(b) && goog.dom.removeNode(b)
  }
};
goog.dom.browserrange.W3cRange.prototype.surroundContents = function(a) {
  this.range_.surroundContents(a);
  return a
};
goog.dom.browserrange.W3cRange.prototype.insertNode = function(a, b) {
  var c = this.range_.cloneRange();
  c.collapse(b);
  c.insertNode(a);
  c.detach();
  return a
};
goog.dom.browserrange.W3cRange.prototype.surroundWithNodes = function(a, b) {
  var c = goog.dom.getWindow(goog.dom.getOwnerDocument(this.getStartNode()));
  if(c = goog.dom.Range.createFromWindow(c)) {
    var d = c.getStartNode(), e = c.getEndNode(), f = c.getStartOffset(), g = c.getEndOffset()
  }
  var h = this.range_.cloneRange(), i = this.range_.cloneRange();
  h.collapse(!1);
  i.collapse(!0);
  h.insertNode(b);
  i.insertNode(a);
  h.detach();
  i.detach();
  if(c) {
    if(d.nodeType == goog.dom.NodeType.TEXT) {
      for(;f > d.length;) {
        f -= d.length;
        do {
          d = d.nextSibling
        }while(d == a || d == b)
      }
    }
    if(e.nodeType == goog.dom.NodeType.TEXT) {
      for(;g > e.length;) {
        g -= e.length;
        do {
          e = e.nextSibling
        }while(e == a || e == b)
      }
    }
    goog.dom.Range.createFromNodes(d, f, e, g).select()
  }
};
goog.dom.browserrange.W3cRange.prototype.collapse = function(a) {
  this.range_.collapse(a)
};
goog.dom.browserrange.GeckoRange = function(a) {
  goog.dom.browserrange.W3cRange.call(this, a)
};
goog.inherits(goog.dom.browserrange.GeckoRange, goog.dom.browserrange.W3cRange);
goog.dom.browserrange.GeckoRange.createFromNodeContents = function(a) {
  return new goog.dom.browserrange.GeckoRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNode(a))
};
goog.dom.browserrange.GeckoRange.createFromNodes = function(a, b, c, d) {
  return new goog.dom.browserrange.GeckoRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(a, b, c, d))
};
goog.dom.browserrange.GeckoRange.prototype.selectInternal = function(a, b) {
  var c = b ? this.getEndNode() : this.getStartNode(), d = b ? this.getEndOffset() : this.getStartOffset(), e = b ? this.getStartNode() : this.getEndNode(), f = b ? this.getStartOffset() : this.getEndOffset();
  a.collapse(c, d);
  (c != e || d != f) && a.extend(e, f)
};
goog.dom.browserrange.IeRange = function(a, b) {
  this.range_ = a;
  this.doc_ = b
};
goog.inherits(goog.dom.browserrange.IeRange, goog.dom.browserrange.AbstractRange);
goog.dom.browserrange.IeRange.logger_ = goog.debug.Logger.getLogger("goog.dom.browserrange.IeRange");
goog.dom.browserrange.IeRange.getBrowserRangeForNode_ = function(a) {
  var b = goog.dom.getOwnerDocument(a).body.createTextRange();
  if(a.nodeType == goog.dom.NodeType.ELEMENT) {
    b.moveToElementText(a), goog.dom.browserrange.canContainRangeEndpoint(a) && !a.childNodes.length && b.collapse(!1)
  }else {
    for(var c = 0, d = a;d = d.previousSibling;) {
      var e = d.nodeType;
      if(e == goog.dom.NodeType.TEXT) {
        c += d.length
      }else {
        if(e == goog.dom.NodeType.ELEMENT) {
          b.moveToElementText(d);
          break
        }
      }
    }
    d || b.moveToElementText(a.parentNode);
    b.collapse(!d);
    c && b.move("character", c);
    b.moveEnd("character", a.length)
  }
  return b
};
goog.dom.browserrange.IeRange.getBrowserRangeForNodes_ = function(a, b, c, d) {
  var e = !1;
  a.nodeType == goog.dom.NodeType.ELEMENT && (b > a.childNodes.length && goog.dom.browserrange.IeRange.logger_.severe("Cannot have startOffset > startNode child count"), b = a.childNodes[b], e = !b, a = b || a.lastChild || a, b = 0);
  var f = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(a);
  b && f.move("character", b);
  if(a == c && b == d) {
    return f.collapse(!0), f
  }
  e && f.collapse(!1);
  e = !1;
  c.nodeType == goog.dom.NodeType.ELEMENT && (d > c.childNodes.length && goog.dom.browserrange.IeRange.logger_.severe("Cannot have endOffset > endNode child count"), c = (b = c.childNodes[d]) || c.lastChild || c, d = 0, e = !b);
  a = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(c);
  a.collapse(!e);
  d && a.moveEnd("character", d);
  f.setEndPoint("EndToEnd", a);
  return f
};
goog.dom.browserrange.IeRange.createFromNodeContents = function(a) {
  var b = new goog.dom.browserrange.IeRange(goog.dom.browserrange.IeRange.getBrowserRangeForNode_(a), goog.dom.getOwnerDocument(a));
  if(goog.dom.browserrange.canContainRangeEndpoint(a)) {
    for(var c, d = a;(c = d.firstChild) && goog.dom.browserrange.canContainRangeEndpoint(c);) {
      d = c
    }
    b.startNode_ = d;
    b.startOffset_ = 0;
    for(d = a;(c = d.lastChild) && goog.dom.browserrange.canContainRangeEndpoint(c);) {
      d = c
    }
    b.endNode_ = d;
    b.endOffset_ = d.nodeType == goog.dom.NodeType.ELEMENT ? d.childNodes.length : d.length;
    b.parentNode_ = a
  }else {
    b.startNode_ = b.endNode_ = b.parentNode_ = a.parentNode, b.startOffset_ = goog.array.indexOf(b.parentNode_.childNodes, a), b.endOffset_ = b.startOffset_ + 1
  }
  return b
};
goog.dom.browserrange.IeRange.createFromNodes = function(a, b, c, d) {
  var e = new goog.dom.browserrange.IeRange(goog.dom.browserrange.IeRange.getBrowserRangeForNodes_(a, b, c, d), goog.dom.getOwnerDocument(a));
  e.startNode_ = a;
  e.startOffset_ = b;
  e.endNode_ = c;
  e.endOffset_ = d;
  return e
};
goog.dom.browserrange.IeRange.prototype.parentNode_ = null;
goog.dom.browserrange.IeRange.prototype.startNode_ = null;
goog.dom.browserrange.IeRange.prototype.endNode_ = null;
goog.dom.browserrange.IeRange.prototype.startOffset_ = -1;
goog.dom.browserrange.IeRange.prototype.endOffset_ = -1;
goog.dom.browserrange.IeRange.prototype.clone = function() {
  var a = new goog.dom.browserrange.IeRange(this.range_.duplicate(), this.doc_);
  a.parentNode_ = this.parentNode_;
  a.startNode_ = this.startNode_;
  a.endNode_ = this.endNode_;
  return a
};
goog.dom.browserrange.IeRange.prototype.getBrowserRange = function() {
  return this.range_
};
goog.dom.browserrange.IeRange.prototype.clearCachedValues_ = function() {
  this.parentNode_ = this.startNode_ = this.endNode_ = null;
  this.startOffset_ = this.endOffset_ = -1
};
goog.dom.browserrange.IeRange.prototype.getContainer = function() {
  if(!this.parentNode_) {
    var a = this.range_.text, b = this.range_.duplicate(), c = a.replace(/ +$/, "");
    (c = a.length - c.length) && b.moveEnd("character", -c);
    c = b.parentElement();
    b = goog.string.stripNewlines(b.htmlText).length;
    if(this.isCollapsed() && 0 < b) {
      return this.parentNode_ = c
    }
    for(;b > goog.string.stripNewlines(c.outerHTML).length;) {
      c = c.parentNode
    }
    for(;1 == c.childNodes.length && c.innerText == goog.dom.browserrange.IeRange.getNodeText_(c.firstChild) && goog.dom.browserrange.canContainRangeEndpoint(c.firstChild);) {
      c = c.firstChild
    }
    0 == a.length && (c = this.findDeepestContainer_(c));
    this.parentNode_ = c
  }
  return this.parentNode_
};
goog.dom.browserrange.IeRange.prototype.findDeepestContainer_ = function(a) {
  for(var b = a.childNodes, c = 0, d = b.length;c < d;c++) {
    var e = b[c];
    if(goog.dom.browserrange.canContainRangeEndpoint(e)) {
      var f = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(e), g = goog.dom.RangeEndpoint.START, h = goog.dom.RangeEndpoint.END, i = f.htmlText != e.outerHTML;
      if(this.isCollapsed() && i ? 0 <= this.compareBrowserRangeEndpoints(f, g, g) && 0 >= this.compareBrowserRangeEndpoints(f, g, h) : this.range_.inRange(f)) {
        return this.findDeepestContainer_(e)
      }
    }
  }
  return a
};
goog.dom.browserrange.IeRange.prototype.getStartNode = function() {
  this.startNode_ || (this.startNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.START), this.isCollapsed() && (this.endNode_ = this.startNode_));
  return this.startNode_
};
goog.dom.browserrange.IeRange.prototype.getStartOffset = function() {
  0 > this.startOffset_ && (this.startOffset_ = this.getOffset_(goog.dom.RangeEndpoint.START), this.isCollapsed() && (this.endOffset_ = this.startOffset_));
  return this.startOffset_
};
goog.dom.browserrange.IeRange.prototype.getEndNode = function() {
  if(this.isCollapsed()) {
    return this.getStartNode()
  }
  this.endNode_ || (this.endNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.END));
  return this.endNode_
};
goog.dom.browserrange.IeRange.prototype.getEndOffset = function() {
  if(this.isCollapsed()) {
    return this.getStartOffset()
  }
  0 > this.endOffset_ && (this.endOffset_ = this.getOffset_(goog.dom.RangeEndpoint.END), this.isCollapsed() && (this.startOffset_ = this.endOffset_));
  return this.endOffset_
};
goog.dom.browserrange.IeRange.prototype.compareBrowserRangeEndpoints = function(a, b, c) {
  return this.range_.compareEndPoints((b == goog.dom.RangeEndpoint.START ? "Start" : "End") + "To" + (c == goog.dom.RangeEndpoint.START ? "Start" : "End"), a)
};
goog.dom.browserrange.IeRange.prototype.getEndpointNode_ = function(a, b) {
  var c = b || this.getContainer();
  if(!c || !c.firstChild) {
    return c
  }
  for(var d = goog.dom.RangeEndpoint.START, e = goog.dom.RangeEndpoint.END, f = a == d, g = 0, h = c.childNodes.length;g < h;g++) {
    var i = f ? g : h - g - 1, j = c.childNodes[i], k;
    try {
      k = goog.dom.browserrange.createRangeFromNodeContents(j)
    }catch(m) {
      continue
    }
    var l = k.getBrowserRange();
    if(this.isCollapsed()) {
      if(goog.dom.browserrange.canContainRangeEndpoint(j)) {
        if(k.containsRange(this)) {
          return this.getEndpointNode_(a, j)
        }
      }else {
        if(0 == this.compareBrowserRangeEndpoints(l, d, d)) {
          this.startOffset_ = this.endOffset_ = i;
          break
        }
      }
    }else {
      if(this.containsRange(k)) {
        if(!goog.dom.browserrange.canContainRangeEndpoint(j)) {
          f ? this.startOffset_ = i : this.endOffset_ = i + 1;
          break
        }
        return this.getEndpointNode_(a, j)
      }
      if(0 > this.compareBrowserRangeEndpoints(l, d, e) && 0 < this.compareBrowserRangeEndpoints(l, e, d)) {
        return this.getEndpointNode_(a, j)
      }
    }
  }
  return c
};
goog.dom.browserrange.IeRange.prototype.compareNodeEndpoints_ = function(a, b, c) {
  return this.range_.compareEndPoints((b == goog.dom.RangeEndpoint.START ? "Start" : "End") + "To" + (c == goog.dom.RangeEndpoint.START ? "Start" : "End"), goog.dom.browserrange.createRangeFromNodeContents(a).getBrowserRange())
};
goog.dom.browserrange.IeRange.prototype.getOffset_ = function(a, b) {
  var c = a == goog.dom.RangeEndpoint.START, d = b || (c ? this.getStartNode() : this.getEndNode());
  if(d.nodeType == goog.dom.NodeType.ELEMENT) {
    for(var d = d.childNodes, e = d.length, f = c ? 1 : -1, g = c ? 0 : e - 1;0 <= g && g < e;g += f) {
      var h = d[g];
      if(!goog.dom.browserrange.canContainRangeEndpoint(h) && 0 == this.compareNodeEndpoints_(h, a, a)) {
        return c ? g : g + 1
      }
    }
    return-1 == g ? 0 : g
  }
  e = this.range_.duplicate();
  f = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(d);
  e.setEndPoint(c ? "EndToEnd" : "StartToStart", f);
  e = e.text.length;
  return c ? d.length - e : e
};
goog.dom.browserrange.IeRange.getNodeText_ = function(a) {
  return a.nodeType == goog.dom.NodeType.TEXT ? a.nodeValue : a.innerText
};
goog.dom.browserrange.IeRange.prototype.isRangeInDocument = function() {
  var a = this.doc_.body.createTextRange();
  a.moveToElementText(this.doc_.body);
  return this.containsRange(new goog.dom.browserrange.IeRange(a, this.doc_), !0)
};
goog.dom.browserrange.IeRange.prototype.isCollapsed = function() {
  return 0 == this.range_.compareEndPoints("StartToEnd", this.range_)
};
goog.dom.browserrange.IeRange.prototype.getText = function() {
  return this.range_.text
};
goog.dom.browserrange.IeRange.prototype.getValidHtml = function() {
  return this.range_.htmlText
};
goog.dom.browserrange.IeRange.prototype.select = function() {
  this.range_.select()
};
goog.dom.browserrange.IeRange.prototype.removeContents = function() {
  if(!this.isCollapsed() && this.range_.htmlText) {
    var a = this.getStartNode(), b = this.getEndNode(), c = this.range_.text, d = this.range_.duplicate();
    d.moveStart("character", 1);
    d.moveStart("character", -1);
    d.text == c && (this.range_ = d);
    this.range_.text = "";
    this.clearCachedValues_();
    c = this.getStartNode();
    d = this.getStartOffset();
    try {
      var e = a.nextSibling;
      a == b && a.parentNode && a.nodeType == goog.dom.NodeType.TEXT && e && e.nodeType == goog.dom.NodeType.TEXT && (a.nodeValue += e.nodeValue, goog.dom.removeNode(e), this.range_ = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(c), this.range_.move("character", d), this.clearCachedValues_())
    }catch(f) {
    }
  }
};
goog.dom.browserrange.IeRange.getDomHelper_ = function(a) {
  return goog.dom.getDomHelper(a.parentElement())
};
goog.dom.browserrange.IeRange.pasteElement_ = function(a, b, c) {
  var c = c || goog.dom.browserrange.IeRange.getDomHelper_(a), d, e = d = b.id;
  d || (d = b.id = goog.string.createUniqueString());
  a.pasteHTML(b.outerHTML);
  (b = c.getElement(d)) && (e || b.removeAttribute("id"));
  return b
};
goog.dom.browserrange.IeRange.prototype.surroundContents = function(a) {
  goog.dom.removeNode(a);
  a.innerHTML = this.range_.htmlText;
  (a = goog.dom.browserrange.IeRange.pasteElement_(this.range_, a)) && this.range_.moveToElementText(a);
  this.clearCachedValues_();
  return a
};
goog.dom.browserrange.IeRange.insertNode_ = function(a, b, c, d) {
  var d = d || goog.dom.browserrange.IeRange.getDomHelper_(a), e;
  b.nodeType != goog.dom.NodeType.ELEMENT && (e = !0, b = d.createDom(goog.dom.TagName.DIV, null, b));
  a.collapse(c);
  b = goog.dom.browserrange.IeRange.pasteElement_(a, b, d);
  e && (a = b.firstChild, d.flattenElement(b), b = a);
  return b
};
goog.dom.browserrange.IeRange.prototype.insertNode = function(a, b) {
  var c = goog.dom.browserrange.IeRange.insertNode_(this.range_.duplicate(), a, b);
  this.clearCachedValues_();
  return c
};
goog.dom.browserrange.IeRange.prototype.surroundWithNodes = function(a, b) {
  var c = this.range_.duplicate(), d = this.range_.duplicate();
  goog.dom.browserrange.IeRange.insertNode_(c, a, !0);
  goog.dom.browserrange.IeRange.insertNode_(d, b, !1);
  this.clearCachedValues_()
};
goog.dom.browserrange.IeRange.prototype.collapse = function(a) {
  this.range_.collapse(a);
  a ? (this.endNode_ = this.startNode_, this.endOffset_ = this.startOffset_) : (this.startNode_ = this.endNode_, this.startOffset_ = this.endOffset_)
};
goog.dom.browserrange.OperaRange = function(a) {
  goog.dom.browserrange.W3cRange.call(this, a)
};
goog.inherits(goog.dom.browserrange.OperaRange, goog.dom.browserrange.W3cRange);
goog.dom.browserrange.OperaRange.createFromNodeContents = function(a) {
  return new goog.dom.browserrange.OperaRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNode(a))
};
goog.dom.browserrange.OperaRange.createFromNodes = function(a, b, c, d) {
  return new goog.dom.browserrange.OperaRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(a, b, c, d))
};
goog.dom.browserrange.OperaRange.prototype.selectInternal = function(a) {
  a.collapse(this.getStartNode(), this.getStartOffset());
  (this.getEndNode() != this.getStartNode() || this.getEndOffset() != this.getStartOffset()) && a.extend(this.getEndNode(), this.getEndOffset());
  0 == a.rangeCount && a.addRange(this.range_)
};
goog.dom.browserrange.WebKitRange = function(a) {
  goog.dom.browserrange.W3cRange.call(this, a)
};
goog.inherits(goog.dom.browserrange.WebKitRange, goog.dom.browserrange.W3cRange);
goog.dom.browserrange.WebKitRange.createFromNodeContents = function(a) {
  return new goog.dom.browserrange.WebKitRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNode(a))
};
goog.dom.browserrange.WebKitRange.createFromNodes = function(a, b, c, d) {
  return new goog.dom.browserrange.WebKitRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(a, b, c, d))
};
goog.dom.browserrange.WebKitRange.prototype.compareBrowserRangeEndpoints = function(a, b, c) {
  return goog.userAgent.isVersion("528") ? goog.dom.browserrange.WebKitRange.superClass_.compareBrowserRangeEndpoints.call(this, a, b, c) : this.range_.compareBoundaryPoints(c == goog.dom.RangeEndpoint.START ? b == goog.dom.RangeEndpoint.START ? goog.global.Range.START_TO_START : goog.global.Range.END_TO_START : b == goog.dom.RangeEndpoint.START ? goog.global.Range.START_TO_END : goog.global.Range.END_TO_END, a)
};
goog.dom.browserrange.WebKitRange.prototype.selectInternal = function(a, b) {
  a.removeAllRanges();
  b ? a.setBaseAndExtent(this.getEndNode(), this.getEndOffset(), this.getStartNode(), this.getStartOffset()) : a.setBaseAndExtent(this.getStartNode(), this.getStartOffset(), this.getEndNode(), this.getEndOffset())
};
goog.dom.browserrange.Error = {NOT_IMPLEMENTED:"Not Implemented"};
goog.dom.browserrange.createRange = function(a) {
  return goog.userAgent.IE && !goog.userAgent.isDocumentMode(9) ? new goog.dom.browserrange.IeRange(a, goog.dom.getOwnerDocument(a.parentElement())) : goog.userAgent.WEBKIT ? new goog.dom.browserrange.WebKitRange(a) : goog.userAgent.GECKO ? new goog.dom.browserrange.GeckoRange(a) : goog.userAgent.OPERA ? new goog.dom.browserrange.OperaRange(a) : new goog.dom.browserrange.W3cRange(a)
};
goog.dom.browserrange.createRangeFromNodeContents = function(a) {
  return goog.userAgent.IE && !goog.userAgent.isDocumentMode(9) ? goog.dom.browserrange.IeRange.createFromNodeContents(a) : goog.userAgent.WEBKIT ? goog.dom.browserrange.WebKitRange.createFromNodeContents(a) : goog.userAgent.GECKO ? goog.dom.browserrange.GeckoRange.createFromNodeContents(a) : goog.userAgent.OPERA ? goog.dom.browserrange.OperaRange.createFromNodeContents(a) : goog.dom.browserrange.W3cRange.createFromNodeContents(a)
};
goog.dom.browserrange.createRangeFromNodes = function(a, b, c, d) {
  return goog.userAgent.IE && !goog.userAgent.isDocumentMode(9) ? goog.dom.browserrange.IeRange.createFromNodes(a, b, c, d) : goog.userAgent.WEBKIT ? goog.dom.browserrange.WebKitRange.createFromNodes(a, b, c, d) : goog.userAgent.GECKO ? goog.dom.browserrange.GeckoRange.createFromNodes(a, b, c, d) : goog.userAgent.OPERA ? goog.dom.browserrange.OperaRange.createFromNodes(a, b, c, d) : goog.dom.browserrange.W3cRange.createFromNodes(a, b, c, d)
};
goog.dom.browserrange.canContainRangeEndpoint = function(a) {
  return goog.dom.canHaveChildren(a) || a.nodeType == goog.dom.NodeType.TEXT
};
goog.dom.TextRange = function() {
};
goog.inherits(goog.dom.TextRange, goog.dom.AbstractRange);
goog.dom.TextRange.createFromBrowserRange = function(a, b) {
  return goog.dom.TextRange.createFromBrowserRangeWrapper_(goog.dom.browserrange.createRange(a), b)
};
goog.dom.TextRange.createFromBrowserRangeWrapper_ = function(a, b) {
  var c = new goog.dom.TextRange;
  c.browserRangeWrapper_ = a;
  c.isReversed_ = !!b;
  return c
};
goog.dom.TextRange.createFromNodeContents = function(a, b) {
  return goog.dom.TextRange.createFromBrowserRangeWrapper_(goog.dom.browserrange.createRangeFromNodeContents(a), b)
};
goog.dom.TextRange.createFromNodes = function(a, b, c, d) {
  var e = new goog.dom.TextRange;
  e.isReversed_ = goog.dom.Range.isReversed(a, b, c, d);
  if("BR" == a.tagName) {
    var f = a.parentNode, b = goog.array.indexOf(f.childNodes, a), a = f
  }
  "BR" == c.tagName && (f = c.parentNode, d = goog.array.indexOf(f.childNodes, c), c = f);
  e.isReversed_ ? (e.startNode_ = c, e.startOffset_ = d, e.endNode_ = a, e.endOffset_ = b) : (e.startNode_ = a, e.startOffset_ = b, e.endNode_ = c, e.endOffset_ = d);
  return e
};
goog.dom.TextRange.prototype.browserRangeWrapper_ = null;
goog.dom.TextRange.prototype.startNode_ = null;
goog.dom.TextRange.prototype.startOffset_ = null;
goog.dom.TextRange.prototype.endNode_ = null;
goog.dom.TextRange.prototype.endOffset_ = null;
goog.dom.TextRange.prototype.isReversed_ = !1;
goog.dom.TextRange.prototype.clone = function() {
  var a = new goog.dom.TextRange;
  a.browserRangeWrapper_ = this.browserRangeWrapper_;
  a.startNode_ = this.startNode_;
  a.startOffset_ = this.startOffset_;
  a.endNode_ = this.endNode_;
  a.endOffset_ = this.endOffset_;
  a.isReversed_ = this.isReversed_;
  return a
};
goog.dom.TextRange.prototype.getType = function() {
  return goog.dom.RangeType.TEXT
};
goog.dom.TextRange.prototype.getBrowserRangeObject = function() {
  return this.getBrowserRangeWrapper_().getBrowserRange()
};
goog.dom.TextRange.prototype.setBrowserRangeObject = function(a) {
  if(goog.dom.AbstractRange.isNativeControlRange(a)) {
    return!1
  }
  this.browserRangeWrapper_ = goog.dom.browserrange.createRange(a);
  this.clearCachedValues_();
  return!0
};
goog.dom.TextRange.prototype.clearCachedValues_ = function() {
  this.startNode_ = this.startOffset_ = this.endNode_ = this.endOffset_ = null
};
goog.dom.TextRange.prototype.getTextRangeCount = function() {
  return 1
};
goog.dom.TextRange.prototype.getTextRange = function() {
  return this
};
goog.dom.TextRange.prototype.getBrowserRangeWrapper_ = function() {
  return this.browserRangeWrapper_ || (this.browserRangeWrapper_ = goog.dom.browserrange.createRangeFromNodes(this.getStartNode(), this.getStartOffset(), this.getEndNode(), this.getEndOffset()))
};
goog.dom.TextRange.prototype.getContainer = function() {
  return this.getBrowserRangeWrapper_().getContainer()
};
goog.dom.TextRange.prototype.getStartNode = function() {
  return this.startNode_ || (this.startNode_ = this.getBrowserRangeWrapper_().getStartNode())
};
goog.dom.TextRange.prototype.getStartOffset = function() {
  return null != this.startOffset_ ? this.startOffset_ : this.startOffset_ = this.getBrowserRangeWrapper_().getStartOffset()
};
goog.dom.TextRange.prototype.getEndNode = function() {
  return this.endNode_ || (this.endNode_ = this.getBrowserRangeWrapper_().getEndNode())
};
goog.dom.TextRange.prototype.getEndOffset = function() {
  return null != this.endOffset_ ? this.endOffset_ : this.endOffset_ = this.getBrowserRangeWrapper_().getEndOffset()
};
goog.dom.TextRange.prototype.moveToNodes = function(a, b, c, d, e) {
  this.startNode_ = a;
  this.startOffset_ = b;
  this.endNode_ = c;
  this.endOffset_ = d;
  this.isReversed_ = e;
  this.browserRangeWrapper_ = null
};
goog.dom.TextRange.prototype.isReversed = function() {
  return this.isReversed_
};
goog.dom.TextRange.prototype.containsRange = function(a, b) {
  var c = a.getType();
  return c == goog.dom.RangeType.TEXT ? this.getBrowserRangeWrapper_().containsRange(a.getBrowserRangeWrapper_(), b) : c == goog.dom.RangeType.CONTROL ? (c = a.getElements(), (b ? goog.array.some : goog.array.every)(c, function(a) {
    return this.containsNode(a, b)
  }, this)) : !1
};
goog.dom.TextRange.isAttachedNode = function(a) {
  if(goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) {
    var b = !1;
    try {
      b = a.parentNode
    }catch(c) {
    }
    return!!b
  }
  return goog.dom.contains(a.ownerDocument.body, a)
};
goog.dom.TextRange.prototype.isRangeInDocument = function() {
  return(!this.startNode_ || goog.dom.TextRange.isAttachedNode(this.startNode_)) && (!this.endNode_ || goog.dom.TextRange.isAttachedNode(this.endNode_)) && (!(goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) || this.getBrowserRangeWrapper_().isRangeInDocument())
};
goog.dom.TextRange.prototype.isCollapsed = function() {
  return this.getBrowserRangeWrapper_().isCollapsed()
};
goog.dom.TextRange.prototype.getText = function() {
  return this.getBrowserRangeWrapper_().getText()
};
goog.dom.TextRange.prototype.getHtmlFragment = function() {
  return this.getBrowserRangeWrapper_().getHtmlFragment()
};
goog.dom.TextRange.prototype.getValidHtml = function() {
  return this.getBrowserRangeWrapper_().getValidHtml()
};
goog.dom.TextRange.prototype.getPastableHtml = function() {
  var a = this.getValidHtml();
  if(a.match(/^\s*<td\b/i)) {
    a = "<table><tbody><tr>" + a + "</tr></tbody></table>"
  }else {
    if(a.match(/^\s*<tr\b/i)) {
      a = "<table><tbody>" + a + "</tbody></table>"
    }else {
      if(a.match(/^\s*<tbody\b/i)) {
        a = "<table>" + a + "</table>"
      }else {
        if(a.match(/^\s*<li\b/i)) {
          for(var b = this.getContainer(), c = goog.dom.TagName.UL;b;) {
            if(b.tagName == goog.dom.TagName.OL) {
              c = goog.dom.TagName.OL;
              break
            }else {
              if(b.tagName == goog.dom.TagName.UL) {
                break
              }
            }
            b = b.parentNode
          }
          a = goog.string.buildString("<", c, ">", a, "</", c, ">")
        }
      }
    }
  }
  return a
};
goog.dom.TextRange.prototype.__iterator__ = function() {
  return new goog.dom.TextRangeIterator(this.getStartNode(), this.getStartOffset(), this.getEndNode(), this.getEndOffset())
};
goog.dom.TextRange.prototype.select = function() {
  this.getBrowserRangeWrapper_().select(this.isReversed_)
};
goog.dom.TextRange.prototype.removeContents = function() {
  this.getBrowserRangeWrapper_().removeContents();
  this.clearCachedValues_()
};
goog.dom.TextRange.prototype.surroundContents = function(a) {
  a = this.getBrowserRangeWrapper_().surroundContents(a);
  this.clearCachedValues_();
  return a
};
goog.dom.TextRange.prototype.insertNode = function(a, b) {
  var c = this.getBrowserRangeWrapper_().insertNode(a, b);
  this.clearCachedValues_();
  return c
};
goog.dom.TextRange.prototype.surroundWithNodes = function(a, b) {
  this.getBrowserRangeWrapper_().surroundWithNodes(a, b);
  this.clearCachedValues_()
};
goog.dom.TextRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedTextRange_(this)
};
goog.dom.TextRange.prototype.collapse = function(a) {
  a = this.isReversed() ? !a : a;
  this.browserRangeWrapper_ && this.browserRangeWrapper_.collapse(a);
  a ? (this.endNode_ = this.startNode_, this.endOffset_ = this.startOffset_) : (this.startNode_ = this.endNode_, this.startOffset_ = this.endOffset_);
  this.isReversed_ = !1
};
goog.dom.DomSavedTextRange_ = function(a) {
  this.anchorNode_ = a.getAnchorNode();
  this.anchorOffset_ = a.getAnchorOffset();
  this.focusNode_ = a.getFocusNode();
  this.focusOffset_ = a.getFocusOffset()
};
goog.inherits(goog.dom.DomSavedTextRange_, goog.dom.SavedRange);
goog.dom.DomSavedTextRange_.prototype.restoreInternal = function() {
  return goog.dom.Range.createFromNodes(this.anchorNode_, this.anchorOffset_, this.focusNode_, this.focusOffset_)
};
goog.dom.DomSavedTextRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedTextRange_.superClass_.disposeInternal.call(this);
  this.focusNode_ = this.anchorNode_ = null
};
goog.dom.ControlRange = function() {
};
goog.inherits(goog.dom.ControlRange, goog.dom.AbstractMultiRange);
goog.dom.ControlRange.createFromBrowserRange = function(a) {
  var b = new goog.dom.ControlRange;
  b.range_ = a;
  return b
};
goog.dom.ControlRange.createFromElements = function(a) {
  for(var b = goog.dom.getOwnerDocument(arguments[0]).body.createControlRange(), c = 0, d = arguments.length;c < d;c++) {
    b.addElement(arguments[c])
  }
  return goog.dom.ControlRange.createFromBrowserRange(b)
};
goog.dom.ControlRange.prototype.range_ = null;
goog.dom.ControlRange.prototype.elements_ = null;
goog.dom.ControlRange.prototype.sortedElements_ = null;
goog.dom.ControlRange.prototype.clearCachedValues_ = function() {
  this.sortedElements_ = this.elements_ = null
};
goog.dom.ControlRange.prototype.clone = function() {
  return goog.dom.ControlRange.createFromElements.apply(this, this.getElements())
};
goog.dom.ControlRange.prototype.getType = function() {
  return goog.dom.RangeType.CONTROL
};
goog.dom.ControlRange.prototype.getBrowserRangeObject = function() {
  return this.range_ || document.body.createControlRange()
};
goog.dom.ControlRange.prototype.setBrowserRangeObject = function(a) {
  if(!goog.dom.AbstractRange.isNativeControlRange(a)) {
    return!1
  }
  this.range_ = a;
  return!0
};
goog.dom.ControlRange.prototype.getTextRangeCount = function() {
  return this.range_ ? this.range_.length : 0
};
goog.dom.ControlRange.prototype.getTextRange = function(a) {
  return goog.dom.TextRange.createFromNodeContents(this.range_.item(a))
};
goog.dom.ControlRange.prototype.getContainer = function() {
  return goog.dom.findCommonAncestor.apply(null, this.getElements())
};
goog.dom.ControlRange.prototype.getStartNode = function() {
  return this.getSortedElements()[0]
};
goog.dom.ControlRange.prototype.getStartOffset = function() {
  return 0
};
goog.dom.ControlRange.prototype.getEndNode = function() {
  var a = this.getSortedElements(), b = goog.array.peek(a);
  return goog.array.find(a, function(a) {
    return goog.dom.contains(a, b)
  })
};
goog.dom.ControlRange.prototype.getEndOffset = function() {
  return this.getEndNode().childNodes.length
};
goog.dom.ControlRange.prototype.getElements = function() {
  if(!this.elements_ && (this.elements_ = [], this.range_)) {
    for(var a = 0;a < this.range_.length;a++) {
      this.elements_.push(this.range_.item(a))
    }
  }
  return this.elements_
};
goog.dom.ControlRange.prototype.getSortedElements = function() {
  this.sortedElements_ || (this.sortedElements_ = this.getElements().concat(), this.sortedElements_.sort(function(a, b) {
    return a.sourceIndex - b.sourceIndex
  }));
  return this.sortedElements_
};
goog.dom.ControlRange.prototype.isRangeInDocument = function() {
  var a = !1;
  try {
    a = goog.array.every(this.getElements(), function(a) {
      return goog.userAgent.IE ? a.parentNode : goog.dom.contains(a.ownerDocument.body, a)
    })
  }catch(b) {
  }
  return a
};
goog.dom.ControlRange.prototype.isCollapsed = function() {
  return!this.range_ || !this.range_.length
};
goog.dom.ControlRange.prototype.getText = function() {
  return""
};
goog.dom.ControlRange.prototype.getHtmlFragment = function() {
  return goog.array.map(this.getSortedElements(), goog.dom.getOuterHtml).join("")
};
goog.dom.ControlRange.prototype.getValidHtml = function() {
  return this.getHtmlFragment()
};
goog.dom.ControlRange.prototype.getPastableHtml = goog.dom.ControlRange.prototype.getValidHtml;
goog.dom.ControlRange.prototype.__iterator__ = function() {
  return new goog.dom.ControlRangeIterator(this)
};
goog.dom.ControlRange.prototype.select = function() {
  this.range_ && this.range_.select()
};
goog.dom.ControlRange.prototype.removeContents = function() {
  if(this.range_) {
    for(var a = [], b = 0, c = this.range_.length;b < c;b++) {
      a.push(this.range_.item(b))
    }
    goog.array.forEach(a, goog.dom.removeNode);
    this.collapse(!1)
  }
};
goog.dom.ControlRange.prototype.replaceContentsWithNode = function(a) {
  a = this.insertNode(a, !0);
  this.isCollapsed() || this.removeContents();
  return a
};
goog.dom.ControlRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedControlRange_(this)
};
goog.dom.ControlRange.prototype.collapse = function() {
  this.range_ = null;
  this.clearCachedValues_()
};
goog.dom.DomSavedControlRange_ = function(a) {
  this.elements_ = a.getElements()
};
goog.inherits(goog.dom.DomSavedControlRange_, goog.dom.SavedRange);
goog.dom.DomSavedControlRange_.prototype.restoreInternal = function() {
  for(var a = (this.elements_.length ? goog.dom.getOwnerDocument(this.elements_[0]) : document).body.createControlRange(), b = 0, c = this.elements_.length;b < c;b++) {
    a.addElement(this.elements_[b])
  }
  return goog.dom.ControlRange.createFromBrowserRange(a)
};
goog.dom.DomSavedControlRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedControlRange_.superClass_.disposeInternal.call(this);
  delete this.elements_
};
goog.dom.ControlRangeIterator = function(a) {
  a && (this.elements_ = a.getSortedElements(), this.startNode_ = this.elements_.shift(), this.endNode_ = goog.array.peek(this.elements_) || this.startNode_);
  goog.dom.RangeIterator.call(this, this.startNode_, !1)
};
goog.inherits(goog.dom.ControlRangeIterator, goog.dom.RangeIterator);
goog.dom.ControlRangeIterator.prototype.startNode_ = null;
goog.dom.ControlRangeIterator.prototype.endNode_ = null;
goog.dom.ControlRangeIterator.prototype.elements_ = null;
goog.dom.ControlRangeIterator.prototype.getStartTextOffset = function() {
  return 0
};
goog.dom.ControlRangeIterator.prototype.getEndTextOffset = function() {
  return 0
};
goog.dom.ControlRangeIterator.prototype.getStartNode = function() {
  return this.startNode_
};
goog.dom.ControlRangeIterator.prototype.getEndNode = function() {
  return this.endNode_
};
goog.dom.ControlRangeIterator.prototype.isLast = function() {
  return!this.depth && !this.elements_.length
};
goog.dom.ControlRangeIterator.prototype.next = function() {
  if(this.isLast()) {
    throw goog.iter.StopIteration;
  }
  if(!this.depth) {
    var a = this.elements_.shift();
    this.setPosition(a, goog.dom.TagWalkType.START_TAG, goog.dom.TagWalkType.START_TAG);
    return a
  }
  return goog.dom.ControlRangeIterator.superClass_.next.call(this)
};
goog.dom.ControlRangeIterator.prototype.copyFrom = function(a) {
  this.elements_ = a.elements_;
  this.startNode_ = a.startNode_;
  this.endNode_ = a.endNode_;
  goog.dom.ControlRangeIterator.superClass_.copyFrom.call(this, a)
};
goog.dom.ControlRangeIterator.prototype.clone = function() {
  var a = new goog.dom.ControlRangeIterator(null);
  a.copyFrom(this);
  return a
};
goog.dom.MultiRange = function() {
  this.browserRanges_ = [];
  this.ranges_ = [];
  this.container_ = this.sortedRanges_ = null
};
goog.inherits(goog.dom.MultiRange, goog.dom.AbstractMultiRange);
goog.dom.MultiRange.createFromBrowserSelection = function(a) {
  for(var b = new goog.dom.MultiRange, c = 0, d = a.rangeCount;c < d;c++) {
    b.browserRanges_.push(a.getRangeAt(c))
  }
  return b
};
goog.dom.MultiRange.createFromBrowserRanges = function(a) {
  var b = new goog.dom.MultiRange;
  b.browserRanges_ = goog.array.clone(a);
  return b
};
goog.dom.MultiRange.createFromTextRanges = function(a) {
  var b = new goog.dom.MultiRange;
  b.ranges_ = a;
  b.browserRanges_ = goog.array.map(a, function(a) {
    return a.getBrowserRangeObject()
  });
  return b
};
goog.dom.MultiRange.prototype.logger_ = goog.debug.Logger.getLogger("goog.dom.MultiRange");
goog.dom.MultiRange.prototype.clearCachedValues_ = function() {
  this.ranges_ = [];
  this.container_ = this.sortedRanges_ = null
};
goog.dom.MultiRange.prototype.clone = function() {
  return goog.dom.MultiRange.createFromBrowserRanges(this.browserRanges_)
};
goog.dom.MultiRange.prototype.getType = function() {
  return goog.dom.RangeType.MULTI
};
goog.dom.MultiRange.prototype.getBrowserRangeObject = function() {
  1 < this.browserRanges_.length && this.logger_.warning("getBrowserRangeObject called on MultiRange with more than 1 range");
  return this.browserRanges_[0]
};
goog.dom.MultiRange.prototype.setBrowserRangeObject = function() {
  return!1
};
goog.dom.MultiRange.prototype.getTextRangeCount = function() {
  return this.browserRanges_.length
};
goog.dom.MultiRange.prototype.getTextRange = function(a) {
  this.ranges_[a] || (this.ranges_[a] = goog.dom.TextRange.createFromBrowserRange(this.browserRanges_[a]));
  return this.ranges_[a]
};
goog.dom.MultiRange.prototype.getContainer = function() {
  if(!this.container_) {
    for(var a = [], b = 0, c = this.getTextRangeCount();b < c;b++) {
      a.push(this.getTextRange(b).getContainer())
    }
    this.container_ = goog.dom.findCommonAncestor.apply(null, a)
  }
  return this.container_
};
goog.dom.MultiRange.prototype.getSortedRanges = function() {
  this.sortedRanges_ || (this.sortedRanges_ = this.getTextRanges(), this.sortedRanges_.sort(function(a, b) {
    var c = a.getStartNode(), d = a.getStartOffset(), e = b.getStartNode(), f = b.getStartOffset();
    return c == e && d == f ? 0 : goog.dom.Range.isReversed(c, d, e, f) ? 1 : -1
  }));
  return this.sortedRanges_
};
goog.dom.MultiRange.prototype.getStartNode = function() {
  return this.getSortedRanges()[0].getStartNode()
};
goog.dom.MultiRange.prototype.getStartOffset = function() {
  return this.getSortedRanges()[0].getStartOffset()
};
goog.dom.MultiRange.prototype.getEndNode = function() {
  return goog.array.peek(this.getSortedRanges()).getEndNode()
};
goog.dom.MultiRange.prototype.getEndOffset = function() {
  return goog.array.peek(this.getSortedRanges()).getEndOffset()
};
goog.dom.MultiRange.prototype.isRangeInDocument = function() {
  return goog.array.every(this.getTextRanges(), function(a) {
    return a.isRangeInDocument()
  })
};
goog.dom.MultiRange.prototype.isCollapsed = function() {
  return 0 == this.browserRanges_.length || 1 == this.browserRanges_.length && this.getTextRange(0).isCollapsed()
};
goog.dom.MultiRange.prototype.getText = function() {
  return goog.array.map(this.getTextRanges(), function(a) {
    return a.getText()
  }).join("")
};
goog.dom.MultiRange.prototype.getHtmlFragment = function() {
  return this.getValidHtml()
};
goog.dom.MultiRange.prototype.getValidHtml = function() {
  return goog.array.map(this.getTextRanges(), function(a) {
    return a.getValidHtml()
  }).join("")
};
goog.dom.MultiRange.prototype.getPastableHtml = function() {
  return this.getValidHtml()
};
goog.dom.MultiRange.prototype.__iterator__ = function() {
  return new goog.dom.MultiRangeIterator(this)
};
goog.dom.MultiRange.prototype.select = function() {
  var a = goog.dom.AbstractRange.getBrowserSelectionForWindow(this.getWindow());
  a.removeAllRanges();
  for(var b = 0, c = this.getTextRangeCount();b < c;b++) {
    a.addRange(this.getTextRange(b).getBrowserRangeObject())
  }
};
goog.dom.MultiRange.prototype.removeContents = function() {
  goog.array.forEach(this.getTextRanges(), function(a) {
    a.removeContents()
  })
};
goog.dom.MultiRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedMultiRange_(this)
};
goog.dom.MultiRange.prototype.collapse = function(a) {
  if(!this.isCollapsed()) {
    var b = a ? this.getTextRange(0) : this.getTextRange(this.getTextRangeCount() - 1);
    this.clearCachedValues_();
    b.collapse(a);
    this.ranges_ = [b];
    this.sortedRanges_ = [b];
    this.browserRanges_ = [b.getBrowserRangeObject()]
  }
};
goog.dom.DomSavedMultiRange_ = function(a) {
  this.savedRanges_ = goog.array.map(a.getTextRanges(), function(a) {
    return a.saveUsingDom()
  })
};
goog.inherits(goog.dom.DomSavedMultiRange_, goog.dom.SavedRange);
goog.dom.DomSavedMultiRange_.prototype.restoreInternal = function() {
  var a = goog.array.map(this.savedRanges_, function(a) {
    return a.restore()
  });
  return goog.dom.MultiRange.createFromTextRanges(a)
};
goog.dom.DomSavedMultiRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedMultiRange_.superClass_.disposeInternal.call(this);
  goog.array.forEach(this.savedRanges_, function(a) {
    a.dispose()
  });
  delete this.savedRanges_
};
goog.dom.MultiRangeIterator = function(a) {
  a && (this.iterators_ = goog.array.map(a.getSortedRanges(), function(a) {
    return goog.iter.toIterator(a)
  }));
  goog.dom.RangeIterator.call(this, a ? this.getStartNode() : null, !1)
};
goog.inherits(goog.dom.MultiRangeIterator, goog.dom.RangeIterator);
goog.dom.MultiRangeIterator.prototype.iterators_ = null;
goog.dom.MultiRangeIterator.prototype.currentIdx_ = 0;
goog.dom.MultiRangeIterator.prototype.getStartTextOffset = function() {
  return this.iterators_[this.currentIdx_].getStartTextOffset()
};
goog.dom.MultiRangeIterator.prototype.getEndTextOffset = function() {
  return this.iterators_[this.currentIdx_].getEndTextOffset()
};
goog.dom.MultiRangeIterator.prototype.getStartNode = function() {
  return this.iterators_[0].getStartNode()
};
goog.dom.MultiRangeIterator.prototype.getEndNode = function() {
  return goog.array.peek(this.iterators_).getEndNode()
};
goog.dom.MultiRangeIterator.prototype.isLast = function() {
  return this.iterators_[this.currentIdx_].isLast()
};
goog.dom.MultiRangeIterator.prototype.next = function() {
  try {
    var a = this.iterators_[this.currentIdx_], b = a.next();
    this.setPosition(a.node, a.tagType, a.depth);
    return b
  }catch(c) {
    if(c !== goog.iter.StopIteration || this.iterators_.length - 1 == this.currentIdx_) {
      throw c;
    }
    this.currentIdx_++;
    return this.next()
  }
};
goog.dom.MultiRangeIterator.prototype.copyFrom = function(a) {
  this.iterators_ = goog.array.clone(a.iterators_);
  goog.dom.MultiRangeIterator.superClass_.copyFrom.call(this, a)
};
goog.dom.MultiRangeIterator.prototype.clone = function() {
  var a = new goog.dom.MultiRangeIterator(null);
  a.copyFrom(this);
  return a
};
goog.dom.Range = {};
goog.dom.Range.createFromWindow = function(a) {
  return(a = goog.dom.AbstractRange.getBrowserSelectionForWindow(a || window)) && goog.dom.Range.createFromBrowserSelection(a)
};
goog.dom.Range.createFromBrowserSelection = function(a) {
  var b, c = !1;
  if(a.createRange) {
    try {
      b = a.createRange()
    }catch(d) {
      return null
    }
  }else {
    if(a.rangeCount) {
      if(1 < a.rangeCount) {
        return goog.dom.MultiRange.createFromBrowserSelection(a)
      }
      b = a.getRangeAt(0);
      c = goog.dom.Range.isReversed(a.anchorNode, a.anchorOffset, a.focusNode, a.focusOffset)
    }else {
      return null
    }
  }
  return goog.dom.Range.createFromBrowserRange(b, c)
};
goog.dom.Range.createFromBrowserRange = function(a, b) {
  return goog.dom.AbstractRange.isNativeControlRange(a) ? goog.dom.ControlRange.createFromBrowserRange(a) : goog.dom.TextRange.createFromBrowserRange(a, b)
};
goog.dom.Range.createFromNodeContents = function(a, b) {
  return goog.dom.TextRange.createFromNodeContents(a, b)
};
goog.dom.Range.createCaret = function(a, b) {
  return goog.dom.TextRange.createFromNodes(a, b, a, b)
};
goog.dom.Range.createFromNodes = function(a, b, c, d) {
  return goog.dom.TextRange.createFromNodes(a, b, c, d)
};
goog.dom.Range.clearSelection = function(a) {
  if(a = goog.dom.AbstractRange.getBrowserSelectionForWindow(a || window)) {
    if(a.empty) {
      try {
        a.empty()
      }catch(b) {
      }
    }else {
      try {
        a.removeAllRanges()
      }catch(c) {
      }
    }
  }
};
goog.dom.Range.hasSelection = function(a) {
  a = goog.dom.AbstractRange.getBrowserSelectionForWindow(a || window);
  return!!a && (goog.userAgent.IE ? "None" != a.type : !!a.rangeCount)
};
goog.dom.Range.isReversed = function(a, b, c, d) {
  if(a == c) {
    return d < b
  }
  var e;
  if(a.nodeType == goog.dom.NodeType.ELEMENT && b) {
    if(e = a.childNodes[b]) {
      a = e, b = 0
    }else {
      if(goog.dom.contains(a, c)) {
        return!0
      }
    }
  }
  if(c.nodeType == goog.dom.NodeType.ELEMENT && d) {
    if(e = c.childNodes[d]) {
      c = e, d = 0
    }else {
      if(goog.dom.contains(c, a)) {
        return!1
      }
    }
  }
  return 0 < (goog.dom.compareNodeOrder(a, c) || b - d)
};
bot.Mouse = function(a) {
  bot.Device.call(this);
  this.elementPressed_ = this.buttonPressed_ = null;
  this.clientXY_ = new goog.math.Coordinate(0, 0);
  this.hasEverInteracted_ = this.nextClickIsDoubleClick_ = !1;
  if(a) {
    this.buttonPressed_ = a.buttonPressed;
    try {
      bot.dom.isElement(a.elementPressed) && (this.elementPressed_ = a.elementPressed)
    }catch(b) {
      this.buttonPressed_ = null
    }
    this.clientXY_ = a.clientXY;
    this.nextClickIsDoubleClick_ = a.nextClickIsDoubleClick;
    this.hasEverInteracted_ = a.hasEverInteracted;
    try {
      bot.dom.isElement(a.element) && this.setElement(a.element)
    }catch(c) {
      this.buttonPressed_ = null
    }
  }
};
goog.inherits(bot.Mouse, bot.Device);
bot.Mouse.Button = {LEFT:0, MIDDLE:1, RIGHT:2};
bot.Mouse.NO_BUTTON_VALUE_INDEX_ = 3;
bot.Mouse.MOUSE_BUTTON_VALUE_MAP_ = function() {
  var a = {};
  bot.userAgent.IE_DOC_PRE9 ? (a[bot.events.EventType.CLICK] = [0, 0, 0, null], a[bot.events.EventType.CONTEXTMENU] = [null, null, 0, null], a[bot.events.EventType.MOUSEUP] = [1, 4, 2, null], a[bot.events.EventType.MOUSEOUT] = [0, 0, 0, 0], a[bot.events.EventType.MOUSEMOVE] = [1, 4, 2, 0]) : goog.userAgent.WEBKIT || bot.userAgent.IE_DOC_9 ? (a[bot.events.EventType.CLICK] = [0, 1, 2, null], a[bot.events.EventType.CONTEXTMENU] = [null, null, 2, null], a[bot.events.EventType.MOUSEUP] = [0, 1, 2, null], 
  a[bot.events.EventType.MOUSEOUT] = [0, 1, 2, 0], a[bot.events.EventType.MOUSEMOVE] = [0, 1, 2, 0]) : (a[bot.events.EventType.CLICK] = [0, 1, 2, null], a[bot.events.EventType.CONTEXTMENU] = [null, null, 2, null], a[bot.events.EventType.MOUSEUP] = [0, 1, 2, null], a[bot.events.EventType.MOUSEOUT] = [0, 0, 0, 0], a[bot.events.EventType.MOUSEMOVE] = [0, 0, 0, 0]);
  a[bot.events.EventType.DBLCLICK] = a[bot.events.EventType.CLICK];
  a[bot.events.EventType.MOUSEDOWN] = a[bot.events.EventType.MOUSEUP];
  a[bot.events.EventType.MOUSEOVER] = a[bot.events.EventType.MOUSEOUT];
  return a
}();
bot.Mouse.prototype.fireMousedown_ = function() {
  var a = goog.userAgent.GECKO && !bot.userAgent.isProductVersion(4);
  if((goog.userAgent.WEBKIT || a) && (bot.dom.isElement(this.getElement(), goog.dom.TagName.OPTION) || bot.dom.isElement(this.getElement(), goog.dom.TagName.SELECT))) {
    return!0
  }
  var b;
  (a = goog.userAgent.GECKO || goog.userAgent.IE) && (b = bot.dom.getActiveElement(this.getElement()));
  var c = this.fireMouseEvent_(bot.events.EventType.MOUSEDOWN);
  return c && a && b != bot.dom.getActiveElement(this.getElement()) ? !1 : c
};
bot.Mouse.prototype.pressButton = function(a) {
  if(!goog.isNull(this.buttonPressed_)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Cannot press more then one button or an already pressed button.");
  }
  this.buttonPressed_ = a;
  this.elementPressed_ = this.getElement();
  this.fireMousedown_() && this.focusOnElement()
};
bot.Mouse.prototype.releaseButton = function() {
  if(goog.isNull(this.buttonPressed_)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Cannot release a button when no button is pressed.");
  }
  this.fireMouseEvent_(bot.events.EventType.MOUSEUP);
  this.buttonPressed_ == bot.Mouse.Button.LEFT && this.getElement() == this.elementPressed_ ? (this.clickElement(this.clientXY_, this.getButtonValue_(bot.events.EventType.CLICK)), this.maybeDoubleClickElement_()) : this.buttonPressed_ == bot.Mouse.Button.RIGHT && this.fireMouseEvent_(bot.events.EventType.CONTEXTMENU);
  this.elementPressed_ = this.buttonPressed_ = null
};
bot.Mouse.prototype.maybeDoubleClickElement_ = function() {
  this.nextClickIsDoubleClick_ && this.fireMouseEvent_(bot.events.EventType.DBLCLICK);
  this.nextClickIsDoubleClick_ = !this.nextClickIsDoubleClick_
};
bot.Mouse.prototype.move = function(a, b) {
  var c = goog.style.getClientPosition(a);
  this.clientXY_.x = b.x + c.x;
  this.clientXY_.y = b.y + c.y;
  c = this.getElement();
  if(a != c) {
    try {
      goog.dom.getWindow(goog.dom.getOwnerDocument(c)).closed && (c = null)
    }catch(d) {
      c = null
    }
    if(c) {
      var e = c === bot.getDocument().documentElement || c === bot.getDocument().body, c = !this.hasEverInteracted_ && e ? null : c;
      this.fireMouseEvent_(bot.events.EventType.MOUSEOUT, a)
    }
    this.setElement(a);
    this.fireMouseEvent_(bot.events.EventType.MOUSEOVER, c)
  }
  this.fireMouseEvent_(bot.events.EventType.MOUSEMOVE);
  this.nextClickIsDoubleClick_ = !1
};
bot.Mouse.prototype.scroll = function(a) {
  if(0 == a) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Must scroll a non-zero number of ticks.");
  }
  for(var b = 0 < a ? -120 : 120, c = 0 < a ? 57 : -57, d = 0;d < Math.abs(a);d++) {
    this.fireMouseEvent_(bot.events.EventType.MOUSEWHEEL, null, b), goog.userAgent.GECKO && this.fireMouseEvent_(bot.events.EventType.MOUSEPIXELSCROLL, null, c)
  }
};
bot.Mouse.prototype.fireMouseEvent_ = function(a, b, c) {
  this.hasEverInteracted_ = !0;
  return this.fireMouseEvent(a, this.clientXY_, this.getButtonValue_(a), b, c)
};
bot.Mouse.prototype.getButtonValue_ = function(a) {
  if(!(a in bot.Mouse.MOUSE_BUTTON_VALUE_MAP_)) {
    return 0
  }
  var b = goog.isNull(this.buttonPressed_) ? bot.Mouse.NO_BUTTON_VALUE_INDEX_ : this.buttonPressed_, a = bot.Mouse.MOUSE_BUTTON_VALUE_MAP_[a][b];
  if(goog.isNull(a)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Event does not permit the specified mouse button.");
  }
  return a
};
bot.Mouse.prototype.getState = function() {
  var a = {};
  a.buttonPressed = this.buttonPressed_;
  a.elementPressed = this.elementPressed_;
  a.clientXY = this.clientXY_;
  a.nextClickIsDoubleClick = this.nextClickIsDoubleClick_;
  a.hasEverInteracted = this.hasEverInteracted_;
  a.element = this.getElement();
  return a
};
bot.Touchscreen = function() {
  bot.Device.call(this);
  this.clientXY_ = new goog.math.Coordinate(0, 0);
  this.clientXY2_ = new goog.math.Coordinate(0, 0)
};
goog.inherits(bot.Touchscreen, bot.Device);
bot.Touchscreen.prototype.hasMovedAfterPress_ = !1;
bot.Touchscreen.prototype.touchIdentifier_ = 0;
bot.Touchscreen.prototype.touchIdentifier2_ = 0;
bot.Touchscreen.prototype.touchCounter_ = 1;
bot.Touchscreen.prototype.press = function(a) {
  if(this.isPressed()) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Cannot press touchscreen when already pressed.");
  }
  this.hasMovedAfterPress_ = !1;
  this.touchIdentifier_ = this.touchCounter_++;
  a && (this.touchIdentifier2_ = this.touchCounter_++);
  this.fireTouchEvent_(bot.events.EventType.TOUCHSTART)
};
bot.Touchscreen.prototype.release = function() {
  if(!this.isPressed()) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Cannot release touchscreen when not already pressed.");
  }
  this.fireTouchEvent_(bot.events.EventType.TOUCHEND);
  this.hasMovedAfterPress_ || (this.fireMouseEvent(bot.events.EventType.MOUSEMOVE, this.clientXY_, 0), this.fireMouseEvent(bot.events.EventType.MOUSEDOWN, this.clientXY_, 0) && this.focusOnElement(), this.fireMouseEvent(bot.events.EventType.MOUSEUP, this.clientXY_, 0), this.clickElement(this.clientXY_, 0));
  this.touchIdentifier2_ = this.touchIdentifier_ = 0
};
bot.Touchscreen.prototype.move = function(a, b, c) {
  this.isPressed() || this.setElement(a);
  a = goog.style.getClientPosition(a);
  this.clientXY_.x = b.x + a.x;
  this.clientXY_.y = b.y + a.y;
  goog.isDef(c) && (this.clientXY2_.x = c.x + a.x, this.clientXY2_.y = c.y + a.y);
  this.isPressed() && (this.hasMovedAfterPress_ = !0, this.fireTouchEvent_(bot.events.EventType.TOUCHMOVE))
};
bot.Touchscreen.prototype.isPressed = function() {
  return!!this.touchIdentifier_
};
bot.Touchscreen.prototype.fireTouchEvent_ = function(a) {
  if(!this.isPressed()) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Should never fire event when touchscreen is not pressed.");
  }
  var b, c;
  this.touchIdentifier2_ && (b = this.touchIdentifier2_, c = this.clientXY2_);
  return this.fireTouchEvent(a, this.touchIdentifier_, this.clientXY_, b, c)
};
bot.locators.className = {};
bot.locators.className.canUseQuerySelector_ = function(a) {
  return!(!a.querySelectorAll || !a.querySelector)
};
bot.locators.className.single = function(a, b) {
  if(!a) {
    throw Error("No class name specified");
  }
  a = goog.string.trim(a);
  if(1 < a.split(/\s+/).length) {
    throw Error("Compound class names not permitted");
  }
  if(bot.locators.className.canUseQuerySelector_(b)) {
    return b.querySelector("." + a.replace(/\./g, "\\.")) || null
  }
  var c = goog.dom.getDomHelper(b).getElementsByTagNameAndClass("*", a, b);
  return c.length ? c[0] : null
};
bot.locators.className.many = function(a, b) {
  if(!a) {
    throw Error("No class name specified");
  }
  a = goog.string.trim(a);
  if(1 < a.split(/\s+/).length) {
    throw Error("Compound class names not permitted");
  }
  return bot.locators.className.canUseQuerySelector_(b) ? b.querySelectorAll("." + a.replace(/\./g, "\\.")) : goog.dom.getDomHelper(b).getElementsByTagNameAndClass("*", a, b)
};
bot.locators.css = {};
bot.locators.css.single = function(a, b) {
  if(!goog.isFunction(b.querySelector) && goog.userAgent.IE && bot.userAgent.isEngineVersion(8) && !goog.isObject(b.querySelector)) {
    throw Error("CSS selection is not supported");
  }
  if(!a) {
    throw Error("No selector specified");
  }
  var a = goog.string.trim(a), c = b.querySelector(a);
  return c && c.nodeType == goog.dom.NodeType.ELEMENT ? c : null
};
bot.locators.css.many = function(a, b) {
  if(!goog.isFunction(b.querySelectorAll) && goog.userAgent.IE && bot.userAgent.isEngineVersion(8) && !goog.isObject(b.querySelector)) {
    throw Error("CSS selection is not supported");
  }
  if(!a) {
    throw Error("No selector specified");
  }
  a = goog.string.trim(a);
  return b.querySelectorAll(a)
};
bot.locators.id = {};
bot.locators.id.single = function(a, b) {
  var c = goog.dom.getDomHelper(b), d = c.getElement(a);
  if(!d) {
    return null
  }
  if(bot.dom.getAttribute(d, "id") == a && goog.dom.contains(b, d)) {
    return d
  }
  c = c.getElementsByTagNameAndClass("*");
  return goog.array.find(c, function(c) {
    return bot.dom.getAttribute(c, "id") == a && goog.dom.contains(b, c)
  })
};
bot.locators.id.many = function(a, b) {
  var c = goog.dom.getDomHelper(b).getElementsByTagNameAndClass("*", null, b);
  return goog.array.filter(c, function(b) {
    return bot.dom.getAttribute(b, "id") == a
  })
};
bot.locators.linkText = {};
bot.locators.partialLinkText = {};
bot.locators.linkText.single_ = function(a, b, c) {
  var d;
  try {
    d = bot.locators.css.many("a", b)
  }catch(e) {
    d = goog.dom.getDomHelper(b).getElementsByTagNameAndClass(goog.dom.TagName.A, null, b)
  }
  return goog.array.find(d, function(b) {
    b = bot.dom.getVisibleText(b);
    return c && -1 != b.indexOf(a) || b == a
  })
};
bot.locators.linkText.many_ = function(a, b, c) {
  var d;
  try {
    d = bot.locators.css.many("a", b)
  }catch(e) {
    d = goog.dom.getDomHelper(b).getElementsByTagNameAndClass(goog.dom.TagName.A, null, b)
  }
  return goog.array.filter(d, function(b) {
    b = bot.dom.getVisibleText(b);
    return c && -1 != b.indexOf(a) || b == a
  })
};
bot.locators.linkText.single = function(a, b) {
  return bot.locators.linkText.single_(a, b, !1)
};
bot.locators.linkText.many = function(a, b) {
  return bot.locators.linkText.many_(a, b, !1)
};
bot.locators.partialLinkText.single = function(a, b) {
  return bot.locators.linkText.single_(a, b, !0)
};
bot.locators.partialLinkText.many = function(a, b) {
  return bot.locators.linkText.many_(a, b, !0)
};
bot.locators.name = {};
bot.locators.name.single = function(a, b) {
  var c = goog.dom.getDomHelper(b).getElementsByTagNameAndClass("*", null, b);
  return goog.array.find(c, function(b) {
    return bot.dom.getAttribute(b, "name") == a
  })
};
bot.locators.name.many = function(a, b) {
  var c = goog.dom.getDomHelper(b).getElementsByTagNameAndClass("*", null, b);
  return goog.array.filter(c, function(b) {
    return bot.dom.getAttribute(b, "name") == a
  })
};
bot.locators.tagName = {};
bot.locators.tagName.single = function(a, b) {
  return b.getElementsByTagName(a)[0] || null
};
bot.locators.tagName.many = function(a, b) {
  return b.getElementsByTagName(a)
};
bot.locators.STRATEGIES_ = {className:bot.locators.className, "class name":bot.locators.className, css:bot.locators.css, "css selector":bot.locators.css, id:bot.locators.id, linkText:bot.locators.linkText, "link text":bot.locators.linkText, name:bot.locators.name, partialLinkText:bot.locators.partialLinkText, "partial link text":bot.locators.partialLinkText, tagName:bot.locators.tagName, "tag name":bot.locators.tagName, xpath:bot.locators.xpath};
bot.locators.add = function(a, b) {
  bot.locators.STRATEGIES_[a] = b
};
bot.locators.getOnlyKey = function(a) {
  for(var b in a) {
    if(a.hasOwnProperty(b)) {
      return b
    }
  }
  return null
};
bot.locators.findElement = function(a, b) {
  var c = bot.locators.getOnlyKey(a);
  if(c) {
    var d = bot.locators.STRATEGIES_[c];
    if(d && goog.isFunction(d.single)) {
      var e = b || bot.getDocument();
      return d.single(a[c], e)
    }
  }
  throw Error("Unsupported locator strategy: " + c);
};
bot.locators.findElements = function(a, b) {
  var c = bot.locators.getOnlyKey(a);
  if(c) {
    var d = bot.locators.STRATEGIES_[c];
    if(d && goog.isFunction(d.many)) {
      var e = b || bot.getDocument();
      return d.many(a[c], e)
    }
  }
  throw Error("Unsupported locator strategy: " + c);
};
goog.math.Vec2 = function(a, b) {
  this.x = a;
  this.y = b
};
goog.inherits(goog.math.Vec2, goog.math.Coordinate);
goog.math.Vec2.randomUnit = function() {
  var a = 2 * Math.random() * Math.PI;
  return new goog.math.Vec2(Math.cos(a), Math.sin(a))
};
goog.math.Vec2.random = function() {
  var a = Math.sqrt(Math.random()), b = 2 * Math.random() * Math.PI;
  return new goog.math.Vec2(Math.cos(b) * a, Math.sin(b) * a)
};
goog.math.Vec2.fromCoordinate = function(a) {
  return new goog.math.Vec2(a.x, a.y)
};
goog.math.Vec2.prototype.clone = function() {
  return new goog.math.Vec2(this.x, this.y)
};
goog.math.Vec2.prototype.magnitude = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y)
};
goog.math.Vec2.prototype.squaredMagnitude = function() {
  return this.x * this.x + this.y * this.y
};
goog.math.Vec2.prototype.scale = function(a) {
  this.x *= a;
  this.y *= a;
  return this
};
goog.math.Vec2.prototype.invert = function() {
  this.x = -this.x;
  this.y = -this.y;
  return this
};
goog.math.Vec2.prototype.normalize = function() {
  return this.scale(1 / this.magnitude())
};
goog.math.Vec2.prototype.add = function(a) {
  this.x += a.x;
  this.y += a.y;
  return this
};
goog.math.Vec2.prototype.subtract = function(a) {
  this.x -= a.x;
  this.y -= a.y;
  return this
};
goog.math.Vec2.prototype.rotate = function(a) {
  var b = Math.cos(a), a = Math.sin(a), c = this.y * b + this.x * a;
  this.x = this.x * b - this.y * a;
  this.y = c;
  return this
};
goog.math.Vec2.rotateAroundPoint = function(a, b, c) {
  return a.clone().subtract(b).rotate(c).add(b)
};
goog.math.Vec2.prototype.equals = function(a) {
  return this == a || !!a && this.x == a.x && this.y == a.y
};
goog.math.Vec2.distance = goog.math.Coordinate.distance;
goog.math.Vec2.squaredDistance = goog.math.Coordinate.squaredDistance;
goog.math.Vec2.equals = goog.math.Coordinate.equals;
goog.math.Vec2.sum = function(a, b) {
  return new goog.math.Vec2(a.x + b.x, a.y + b.y)
};
goog.math.Vec2.difference = function(a, b) {
  return new goog.math.Vec2(a.x - b.x, a.y - b.y)
};
goog.math.Vec2.dot = function(a, b) {
  return a.x * b.x + a.y * b.y
};
goog.math.Vec2.lerp = function(a, b, c) {
  return new goog.math.Vec2(goog.math.lerp(a.x, b.x, c), goog.math.lerp(a.y, b.y, c))
};
bot.action = {};
bot.action.checkShown_ = function(a) {
  if(!bot.dom.isShown(a, !0)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_VISIBLE, "Element is not currently visible and may not be manipulated");
  }
};
bot.action.checkInteractable_ = function(a) {
  if(!bot.dom.isInteractable(a)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE, "Element is not currently interactable and may not be manipulated");
  }
};
bot.action.clear = function(a) {
  bot.action.checkInteractable_(a);
  if(!bot.dom.isEditable(a)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE, "Element must be user-editable in order to clear it.");
  }
  bot.action.LegacyDevice_.focusOnElement(a);
  a.value && (a.value = "", bot.events.fire(a, bot.events.EventType.CHANGE));
  bot.dom.isContentEditable(a) && (a.innerHTML = " ")
};
bot.action.focusOnElement = function(a) {
  bot.action.checkInteractable_(a);
  bot.action.LegacyDevice_.focusOnElement(a)
};
bot.action.type = function(a, b, c) {
  function d(a) {
    goog.isString(a) ? goog.array.forEach(a.split(""), function(a) {
      a = bot.Keyboard.Key.fromChar(a);
      a.shift && e.pressKey(bot.Keyboard.Keys.SHIFT);
      e.pressKey(a.key);
      e.releaseKey(a.key);
      a.shift && e.releaseKey(bot.Keyboard.Keys.SHIFT)
    }) : goog.array.contains(bot.Keyboard.MODIFIERS, a) ? e.isPressed(a) ? e.releaseKey(a) : e.pressKey(a) : (e.pressKey(a), e.releaseKey(a))
  }
  bot.action.checkShown_(a);
  bot.action.checkInteractable_(a);
  var e = c || new bot.Keyboard;
  e.moveCursor(a);
  goog.isArray(b) ? goog.array.forEach(b, d) : d(b);
  goog.array.forEach(bot.Keyboard.MODIFIERS, function(a) {
    e.isPressed(a) && e.releaseKey(a)
  })
};
bot.action.submit = function(a) {
  var b = bot.action.LegacyDevice_.findAncestorForm(a);
  if(!b) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE, "Element was not in a form, so could not submit.");
  }
  bot.action.LegacyDevice_.submitForm(a, b)
};
bot.action.moveMouse = function(a, b, c) {
  b = bot.action.prepareToInteractWith_(a, b);
  (c || new bot.Mouse).move(a, b)
};
bot.action.click = function(a, b, c) {
  b = bot.action.prepareToInteractWith_(a, b);
  c = c || new bot.Mouse;
  c.move(a, b);
  c.pressButton(bot.Mouse.Button.LEFT);
  c.releaseButton()
};
bot.action.rightClick = function(a, b, c) {
  b = bot.action.prepareToInteractWith_(a, b);
  c = c || new bot.Mouse;
  c.move(a, b);
  c.pressButton(bot.Mouse.Button.RIGHT);
  c.releaseButton()
};
bot.action.doubleClick = function(a, b, c) {
  b = bot.action.prepareToInteractWith_(a, b);
  c = c || new bot.Mouse;
  c.move(a, b);
  c.pressButton(bot.Mouse.Button.LEFT);
  c.releaseButton();
  c.pressButton(bot.Mouse.Button.LEFT);
  c.releaseButton()
};
bot.action.scrollMouse = function(a, b, c, d) {
  c = bot.action.prepareToInteractWith_(a, c);
  d = d || new bot.Mouse;
  d.move(a, c);
  d.scroll(b)
};
bot.action.drag = function(a, b, c, d, e) {
  d = bot.action.prepareToInteractWith_(a, d);
  e = e || new bot.Mouse;
  e.move(a, d);
  e.pressButton(bot.Mouse.Button.LEFT);
  var f = goog.style.getClientPosition(a), g = new goog.math.Coordinate(d.x + Math.floor(b / 2), d.y + Math.floor(c / 2));
  e.move(a, g);
  g = goog.style.getClientPosition(a);
  b = new goog.math.Coordinate(f.x + d.x + b - g.x, f.y + d.y + c - g.y);
  e.move(a, b);
  e.releaseButton()
};
bot.action.tap = function(a, b, c) {
  b = bot.action.prepareToInteractWith_(a, b);
  c = c || new bot.Touchscreen;
  c.move(a, b);
  c.press();
  c.release()
};
bot.action.swipe = function(a, b, c, d, e) {
  d = bot.action.prepareToInteractWith_(a, d);
  e = e || new bot.Touchscreen;
  e.move(a, d);
  e.press();
  var f = goog.style.getClientPosition(a), g = new goog.math.Coordinate(d.x + Math.floor(b / 2), d.y + Math.floor(c / 2));
  e.move(a, g);
  g = goog.style.getClientPosition(a);
  b = new goog.math.Coordinate(f.x + d.x + b - g.x, f.y + d.y + c - g.y);
  e.move(a, b);
  e.release()
};
bot.action.pinch = function(a, b, c, d) {
  if(0 == b) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Cannot pinch by a distance of zero.");
  }
  var e = b / 2;
  bot.action.multiTouchAction_(a, function(a) {
    if(0 > b) {
      var c = a.magnitude();
      a.scale(c ? (c + b) / c : 0)
    }
  }, function(a) {
    var b = a.magnitude();
    a.scale(b ? (b - e) / b : 0)
  }, c, d)
};
bot.action.rotate = function(a, b, c, d) {
  if(0 == b) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Cannot rotate by an angle of zero.");
  }
  var e = Math.PI * (b / 180) / 2;
  bot.action.multiTouchAction_(a, function(a) {
    a.scale(0.5)
  }, function(a) {
    a.rotate(e)
  }, c, d)
};
bot.action.multiTouchAction_ = function(a, b, c, d, e) {
  var d = bot.action.prepareToInteractWith_(a, d), f = bot.action.getInteractableSize_(a), f = new goog.math.Vec2(Math.min(d.x, f.width - d.x), Math.min(d.y, f.height - d.y)), e = e || new bot.Touchscreen;
  b(f);
  var b = goog.math.Vec2.sum(d, f), g = goog.math.Vec2.difference(d, f);
  e.move(a, b, g);
  e.press(!0);
  b = goog.style.getClientPosition(a);
  c(f);
  var g = goog.math.Vec2.sum(d, f), h = goog.math.Vec2.difference(d, f);
  e.move(a, g, h);
  b = goog.math.Vec2.difference(goog.style.getClientPosition(a), b);
  c(f);
  c = goog.math.Vec2.sum(d, f).subtract(b);
  d = goog.math.Vec2.difference(d, f).subtract(b);
  e.move(a, c, d);
  e.release()
};
bot.action.prepareToInteractWith_ = function(a, b) {
  bot.action.checkShown_(a);
  var c = goog.dom.getOwnerDocument(a);
  goog.style.scrollIntoContainerView(a, goog.userAgent.WEBKIT || goog.userAgent.IE ? c.body : c.documentElement);
  if(b) {
    return goog.math.Vec2.fromCoordinate(b)
  }
  c = bot.action.getInteractableSize_(a);
  return new goog.math.Vec2(c.width / 2, c.height / 2)
};
bot.action.getInteractableSize_ = function(a) {
  var b = goog.style.getSize(a);
  return 0 < b.width && 0 < b.height || !a.offsetParent ? b : bot.action.getInteractableSize_(a.offsetParent)
};
bot.action.LegacyDevice_ = function() {
  bot.Device.call(this)
};
goog.inherits(bot.action.LegacyDevice_, bot.Device);
goog.addSingletonGetter(bot.action.LegacyDevice_);
bot.action.LegacyDevice_.focusOnElement = function(a) {
  var b = bot.action.LegacyDevice_.getInstance();
  b.setElement(a);
  return b.focusOnElement()
};
bot.action.LegacyDevice_.submitForm = function(a, b) {
  var c = bot.action.LegacyDevice_.getInstance();
  c.setElement(a);
  c.submitForm(b)
};
bot.action.LegacyDevice_.findAncestorForm = function(a) {
  return bot.Device.findAncestorForm(a)
};
bot.action.scrollIntoView = function(a, b) {
  if(!bot.dom.isScrolledIntoView(a, b) && (a.scrollIntoView(), goog.userAgent.OPERA && !bot.userAgent.isEngineVersion(11))) {
    for(var c = goog.dom.getWindow(goog.dom.getOwnerDocument(a)), c = c.frameElement;c;c = c.frameElement) {
      c.scrollIntoView(), c = goog.dom.getWindow(goog.dom.getOwnerDocument(c))
    }
  }
  b && (c = new goog.math.Rect(b.x, b.y, 1, 1), bot.dom.scrollElementRegionIntoClientView(a, c));
  c = bot.dom.isScrolledIntoView(a, b);
  if(!c && b) {
    var d = goog.style.getClientPosition(a), d = goog.math.Coordinate.sum(d, b);
    try {
      bot.dom.getInViewLocation(d, goog.dom.getWindow(goog.dom.getOwnerDocument(a))), c = !0
    }catch(e) {
      c = !1
    }
  }
  return c
};
bot.frame = {};
bot.frame.defaultContent = function() {
  return bot.getWindow().top
};
bot.frame.activeElement = function() {
  return document.activeElement || document.body
};
bot.frame.getFrameWindow = function(a) {
  if(bot.frame.isFrame_(a)) {
    return goog.dom.getFrameContentWindow(a)
  }
  throw new bot.Error(bot.ErrorCode.NO_SUCH_FRAME, "The given element isn't a frame or an iframe.");
};
bot.frame.isFrame_ = function(a) {
  return bot.dom.isElement(a, goog.dom.TagName.FRAME) || bot.dom.isElement(a, goog.dom.TagName.IFRAME)
};
bot.frame.findFrameByNameOrId = function(a, b) {
  var c = b || bot.getWindow(), d = c.frames[a];
  if(d) {
    return d.document ? d : goog.dom.getFrameContentWindow(d)
  }
  c = bot.locators.findElements({id:a}, c.document);
  for(d = 0;d < c.length;d++) {
    if(bot.frame.isFrame_(c[d])) {
      return goog.dom.getFrameContentWindow(c[d])
    }
  }
  return null
};
bot.frame.findFrameByIndex = function(a, b) {
  return(b || bot.getWindow()).frames[a] || null
};
bot.frame.getFrameIndex = function(a, b) {
  try {
    var c = a.contentWindow
  }catch(d) {
    return null
  }
  if(!bot.frame.isFrame_(a)) {
    return null
  }
  for(var e = b || bot.getWindow(), f = 0;f < e.frames.length;f++) {
    if(c == e.frames[f]) {
      return f
    }
  }
  return null
};
goog.json = {};
goog.json.isValid_ = function(a) {
  return/^\s*$/.test(a) ? !1 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, ""))
};
goog.json.parse = function(a) {
  a = "" + a;
  if(goog.json.isValid_(a)) {
    try {
      return eval("(" + a + ")")
    }catch(b) {
    }
  }
  throw Error("Invalid JSON string: " + a);
};
goog.json.unsafeParse = function(a) {
  return eval("(" + a + ")")
};
goog.json.serialize = function(a, b) {
  return(new goog.json.Serializer(b)).serialize(a)
};
goog.json.Serializer = function(a) {
  this.replacer_ = a
};
goog.json.Serializer.prototype.serialize = function(a) {
  var b = [];
  this.serialize_(a, b);
  return b.join("")
};
goog.json.Serializer.prototype.serialize_ = function(a, b) {
  switch(typeof a) {
    case "string":
      this.serializeString_(a, b);
      break;
    case "number":
      this.serializeNumber_(a, b);
      break;
    case "boolean":
      b.push(a);
      break;
    case "undefined":
      b.push("null");
      break;
    case "object":
      if(null == a) {
        b.push("null");
        break
      }
      if(goog.isArray(a)) {
        this.serializeArray_(a, b);
        break
      }
      this.serializeObject_(a, b);
      break;
    case "function":
      break;
    default:
      throw Error("Unknown type: " + typeof a);
  }
};
goog.json.Serializer.charToJsonCharCache_ = {'"':'\\"', "\\":"\\\\", "/":"\\/", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\u000b"};
goog.json.Serializer.charsToReplace_ = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
goog.json.Serializer.prototype.serializeString_ = function(a, b) {
  b.push('"', a.replace(goog.json.Serializer.charsToReplace_, function(a) {
    if(a in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[a]
    }
    var b = a.charCodeAt(0), e = "\\u";
    16 > b ? e += "000" : 256 > b ? e += "00" : 4096 > b && (e += "0");
    return goog.json.Serializer.charToJsonCharCache_[a] = e + b.toString(16)
  }), '"')
};
goog.json.Serializer.prototype.serializeNumber_ = function(a, b) {
  b.push(isFinite(a) && !isNaN(a) ? a : "null")
};
goog.json.Serializer.prototype.serializeArray_ = function(a, b) {
  var c = a.length;
  b.push("[");
  for(var d = "", e = 0;e < c;e++) {
    b.push(d), d = a[e], this.serialize_(this.replacer_ ? this.replacer_.call(a, "" + e, d) : d, b), d = ","
  }
  b.push("]")
};
goog.json.Serializer.prototype.serializeObject_ = function(a, b) {
  b.push("{");
  var c = "", d;
  for(d in a) {
    if(Object.prototype.hasOwnProperty.call(a, d)) {
      var e = a[d];
      "function" != typeof e && (b.push(c), this.serializeString_(d, b), b.push(":"), this.serialize_(this.replacer_ ? this.replacer_.call(a, d, e) : e, b), c = ",")
    }
  }
  b.push("}")
};
bot.json = {};
bot.json.NATIVE_JSON_ = goog.userAgent.WEBKIT || goog.userAgent.OPERA || goog.userAgent.GECKO && bot.userAgent.isEngineVersion(3.5) || goog.userAgent.IE && bot.userAgent.isEngineVersion(8);
bot.json.stringify = bot.json.NATIVE_JSON_ ? JSON.stringify : goog.json.serialize;
bot.json.parse = bot.json.NATIVE_JSON_ ? JSON.parse : goog.json.parse;
bot.response = {};
bot.response.isResponseObject = function(a) {
  return goog.isObject(a) && goog.isNumber(a.status)
};
bot.response.createResponse = function(a) {
  return bot.response.isResponseObject(a) ? a : {status:bot.ErrorCode.SUCCESS, value:a}
};
bot.response.createErrorResponse = function(a) {
  return bot.response.isResponseObject(a) ? a : {status:a && goog.isNumber(a.code) ? a.code : bot.ErrorCode.UNKNOWN_ERROR, value:{message:(a && a.message || a) + ""}}
};
bot.response.checkResponse = function(a) {
  var b = a.status;
  if(b == bot.ErrorCode.SUCCESS) {
    return a
  }
  b = b || bot.ErrorCode.UNKNOWN_ERROR;
  a = a.value;
  if(!a || !goog.isObject(a)) {
    throw new bot.Error(b, a + "");
  }
  throw new bot.Error(b, a.message + "");
};
bot.inject = {};
bot.inject.cache = {};
bot.inject.ELEMENT_KEY = "ELEMENT";
bot.inject.WINDOW_KEY = "WINDOW";
bot.inject.wrapValue = function(a) {
  switch(goog.typeOf(a)) {
    case "string":
    ;
    case "number":
    ;
    case "boolean":
      return a;
    case "function":
      return a.toString();
    case "array":
      return goog.array.map(a, bot.inject.wrapValue);
    case "object":
      if(goog.object.containsKey(a, "nodeType") && (a.nodeType == goog.dom.NodeType.ELEMENT || a.nodeType == goog.dom.NodeType.DOCUMENT)) {
        var b = {};
        b[bot.inject.ELEMENT_KEY] = bot.inject.cache.addElement(a);
        return b
      }
      if(goog.object.containsKey(a, "document")) {
        return b = {}, b[bot.inject.WINDOW_KEY] = bot.inject.cache.addElement(a), b
      }
      if(goog.isArrayLike(a)) {
        return goog.array.map(a, bot.inject.wrapValue)
      }
      a = goog.object.filter(a, function(a, b) {
        return goog.isNumber(b) || goog.isString(b)
      });
      return goog.object.map(a, bot.inject.wrapValue);
    default:
      return null
  }
};
bot.inject.unwrapValue_ = function(a, b) {
  return goog.isArray(a) ? goog.array.map(a, function(a) {
    return bot.inject.unwrapValue_(a, b)
  }) : goog.isObject(a) ? "function" == typeof a ? a : goog.object.containsKey(a, bot.inject.ELEMENT_KEY) ? bot.inject.cache.getElement(a[bot.inject.ELEMENT_KEY], b) : goog.object.containsKey(a, bot.inject.WINDOW_KEY) ? bot.inject.cache.getElement(a[bot.inject.WINDOW_KEY], b) : goog.object.map(a, function(a) {
    return bot.inject.unwrapValue_(a, b)
  }) : a
};
bot.inject.recompileFunction_ = function(a, b) {
  return goog.isString(a) ? new b.Function(a) : b == window ? a : new b.Function("return (" + a + ").apply(null,arguments);")
};
bot.inject.executeScript = function(a, b, c, d) {
  var d = d || bot.getWindow(), e;
  try {
    var a = bot.inject.recompileFunction_(a, d), f = bot.inject.unwrapValue_(b, d.document);
    e = bot.inject.wrapResponse(a.apply(null, f))
  }catch(g) {
    e = bot.inject.wrapError(g)
  }
  return c ? bot.json.stringify(e) : e
};
bot.inject.executeAsyncScript = function(a, b, c, d, e, f) {
  function g(a, b) {
    if(!k) {
      i.removeEventListener ? i.removeEventListener("unload", h, !0) : i.detachEvent("onunload", h);
      i.clearTimeout(j);
      if(a != bot.ErrorCode.SUCCESS) {
        var c = new bot.Error(a, b.message || b + "");
        c.stack = b.stack;
        b = bot.inject.wrapError(c)
      }else {
        b = bot.inject.wrapResponse(b)
      }
      d(e ? bot.json.stringify(b) : b);
      k = !0
    }
  }
  function h() {
    g(bot.ErrorCode.UNKNOWN_ERROR, Error("Detected a page unload event; asynchronous script execution does not work across page loads."))
  }
  var i = f || window, j, k = !1, f = goog.partial(g, bot.ErrorCode.UNKNOWN_ERROR);
  if(i.closed) {
    return f("Unable to execute script; the target window is closed.")
  }
  a = bot.inject.recompileFunction_(a, i);
  b = bot.inject.unwrapValue_(b, i.document);
  b.push(goog.partial(g, bot.ErrorCode.SUCCESS));
  i.addEventListener ? i.addEventListener("unload", h, !0) : i.attachEvent("onunload", h);
  var m = goog.now();
  try {
    a.apply(i, b), j = i.setTimeout(function() {
      g(bot.ErrorCode.SCRIPT_TIMEOUT, Error("Timed out waiting for asyncrhonous script result after " + (goog.now() - m) + " ms"))
    }, Math.max(0, c))
  }catch(l) {
    g(l.code || bot.ErrorCode.UNKNOWN_ERROR, l)
  }
};
bot.inject.wrapResponse = function(a) {
  return{status:bot.ErrorCode.SUCCESS, value:bot.inject.wrapValue(a)}
};
bot.inject.wrapError = function(a) {
  return{status:goog.object.containsKey(a, "code") ? a.code : bot.ErrorCode.UNKNOWN_ERROR, value:{message:a.message}}
};
bot.inject.cache.CACHE_KEY_ = "$wdc_";
bot.inject.cache.ELEMENT_KEY_PREFIX = ":wdc:";
bot.inject.cache.getCache_ = function(a) {
  var a = a || document, b = a[bot.inject.cache.CACHE_KEY_];
  b || (b = a[bot.inject.cache.CACHE_KEY_] = {}, b.nextId = goog.now());
  b.nextId || (b.nextId = goog.now());
  return b
};
bot.inject.cache.addElement = function(a) {
  var b = bot.inject.cache.getCache_(a.ownerDocument), c = goog.object.findKey(b, function(b) {
    return b == a
  });
  c || (c = bot.inject.cache.ELEMENT_KEY_PREFIX + b.nextId++, b[c] = a);
  return c
};
bot.inject.cache.getElement = function(a, b) {
  var a = decodeURIComponent(a), c = b || document, d = bot.inject.cache.getCache_(c);
  if(!goog.object.containsKey(d, a)) {
    throw new bot.Error(bot.ErrorCode.STALE_ELEMENT_REFERENCE, "Element does not exist in cache");
  }
  var e = d[a];
  if(goog.object.containsKey(e, "setInterval")) {
    if(e.closed) {
      throw delete d[a], new bot.Error(bot.ErrorCode.NO_SUCH_WINDOW, "Window has been closed.");
    }
    return e
  }
  for(var f = e;f;) {
    if(f == c.documentElement) {
      return e
    }
    f = f.parentNode
  }
  delete d[a];
  throw new bot.Error(bot.ErrorCode.STALE_ELEMENT_REFERENCE, "Element is no longer attached to the DOM");
};
bot.html5 = {};
bot.html5.API = {APPCACHE:"appcache", BROWSER_CONNECTION:"browser_connection", DATABASE:"database", GEOLOCATION:"location", LOCAL_STORAGE:"local_storage", SESSION_STORAGE:"session_storage", VIDEO:"video", AUDIO:"audio", CANVAS:"canvas"};
bot.html5.IS_IE8_ = goog.userAgent.IE && bot.userAgent.isEngineVersion(8) && !bot.userAgent.isEngineVersion(9);
bot.html5.IS_SAFARI4_ = goog.userAgent.product.SAFARI && bot.userAgent.isProductVersion(4) && !bot.userAgent.isProductVersion(5);
bot.html5.IS_ANDROID_FROYO_ = goog.userAgent.product.ANDROID && bot.userAgent.isProductVersion(2.2) && !bot.userAgent.isProductVersion(2.3);
bot.html5.IS_SAFARI_WINDOWS_ = goog.userAgent.WINDOWS && goog.userAgent.product.SAFARI && bot.userAgent.isProductVersion(4) && !bot.userAgent.isProductVersion(6);
bot.html5.isSupported = function(a, b) {
  var c = b || bot.getWindow();
  switch(a) {
    case bot.html5.API.APPCACHE:
      return bot.html5.IS_IE8_ ? !1 : goog.isDefAndNotNull(c.applicationCache);
    case bot.html5.API.BROWSER_CONNECTION:
      return goog.isDefAndNotNull(c.navigator) && goog.isDefAndNotNull(c.navigator.onLine);
    case bot.html5.API.DATABASE:
      return bot.html5.IS_SAFARI4_ || bot.html5.IS_ANDROID_FROYO_ ? !1 : goog.isDefAndNotNull(c.openDatabase);
    case bot.html5.API.GEOLOCATION:
      return bot.html5.IS_SAFARI_WINDOWS_ ? !1 : goog.isDefAndNotNull(c.navigator) && goog.isDefAndNotNull(c.navigator.geolocation);
    case bot.html5.API.LOCAL_STORAGE:
      return bot.html5.IS_IE8_ ? !1 : goog.isDefAndNotNull(c.localStorage);
    case bot.html5.API.SESSION_STORAGE:
      return bot.html5.IS_IE8_ ? !1 : goog.isDefAndNotNull(c.sessionStorage) && goog.isDefAndNotNull(c.sessionStorage.clear);
    default:
      throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Unsupported API identifier provided as parameter");
  }
};
bot.appcache = {};
bot.appcache.getStatus = function(a) {
  a = a || bot.getWindow();
  if(bot.html5.isSupported(bot.html5.API.APPCACHE, a)) {
    return a.applicationCache.status
  }
  throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Undefined application cache");
};
bot.connection = {};
bot.connection.isOnline = function() {
  if(bot.html5.isSupported(bot.html5.API.BROWSER_CONNECTION)) {
    return bot.getWindow().navigator.onLine
  }
  throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Undefined browser connection state");
};
bot.storage = {};
bot.storage.database = {};
bot.storage.database.openOrCreate = function(a, b, c, d, e) {
  return(e || bot.getWindow()).openDatabase(a, b || "", c || a + "name", d || 5242880)
};
bot.storage.database.executeSql = function(a, b, c, d, e, f, g) {
  var h;
  try {
    h = bot.storage.database.openOrCreate(a)
  }catch(i) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, i.message);
  }
  var j = function(a, b) {
    var c = new bot.storage.database.ResultSet(b);
    d(a, c)
  };
  h.transaction(function(a) {
    a.executeSql(b, c, j, g)
  }, e, f)
};
bot.storage.database.ResultSet = function(a) {
  this.rows = [];
  for(var b = 0;b < a.rows.length;b++) {
    this.rows[b] = a.rows.item(b)
  }
  this.rowsAffected = a.rowsAffected;
  this.insertId = -1;
  try {
    this.insertId = a.insertId
  }catch(c) {
  }
};
bot.geolocation = {};
bot.geolocation.DEFAULT_OPTIONS = {enableHighAccuracy:!0, maximumAge:Infinity, timeout:5E3};
bot.geolocation.getCurrentPosition = function(a, b, c) {
  var d = bot.getWindow(), c = c || bot.geolocation.DEFAULT_OPTIONS;
  if(bot.html5.isSupported(bot.html5.API.GEOLOCATION, d)) {
    d.navigator.geolocation.getCurrentPosition(a, b, c)
  }else {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Geolocation undefined");
  }
};
bot.storage.getLocalStorage = function(a) {
  a = a || bot.getWindow();
  if(!bot.html5.isSupported(bot.html5.API.LOCAL_STORAGE, a)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Local storage undefined");
  }
  return new bot.storage.Storage(a.localStorage)
};
bot.storage.getSessionStorage = function(a) {
  a = a || bot.getWindow();
  if(bot.html5.isSupported(bot.html5.API.SESSION_STORAGE, a)) {
    return new bot.storage.Storage(a.sessionStorage)
  }
  throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, "Session storage undefined");
};
bot.storage.Storage = function(a) {
  this.storageMap_ = a
};
bot.storage.Storage.prototype.setItem = function(a, b) {
  try {
    this.storageMap_.setItem(a, b + "")
  }catch(c) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, c.message);
  }
};
bot.storage.Storage.prototype.getItem = function(a) {
  return this.storageMap_.getItem(a)
};
bot.storage.Storage.prototype.keySet = function() {
  for(var a = [], b = this.size(), c = 0;c < b;c++) {
    a[c] = this.storageMap_.key(c)
  }
  return a
};
bot.storage.Storage.prototype.removeItem = function(a) {
  var b = this.getItem(a);
  this.storageMap_.removeItem(a);
  return b
};
bot.storage.Storage.prototype.clear = function() {
  this.storageMap_.clear()
};
bot.storage.Storage.prototype.size = function() {
  return this.storageMap_.length
};
bot.storage.Storage.prototype.key = function(a) {
  return this.storageMap_.key(a)
};
bot.storage.Storage.prototype.getStorageMap = function() {
  return this.storageMap_
};
var webdriver = {Key:{NULL:"\ue000", CANCEL:"\ue001", HELP:"\ue002", BACK_SPACE:"\ue003", TAB:"\ue004", CLEAR:"\ue005", RETURN:"\ue006", ENTER:"\ue007", SHIFT:"\ue008", CONTROL:"\ue009", ALT:"\ue00a", PAUSE:"\ue00b", ESCAPE:"\ue00c", SPACE:"\ue00d", PAGE_UP:"\ue00e", PAGE_DOWN:"\ue00f", END:"\ue010", HOME:"\ue011", ARROW_LEFT:"\ue012", LEFT:"\ue012", ARROW_UP:"\ue013", UP:"\ue013", ARROW_RIGHT:"\ue014", RIGHT:"\ue014", ARROW_DOWN:"\ue015", DOWN:"\ue015", INSERT:"\ue016", DELETE:"\ue017", SEMICOLON:"\ue018", 
EQUALS:"\ue019", NUMPAD0:"\ue01a", NUMPAD1:"\ue01b", NUMPAD2:"\ue01c", NUMPAD3:"\ue01d", NUMPAD4:"\ue01e", NUMPAD5:"\ue01f", NUMPAD6:"\ue020", NUMPAD7:"\ue021", NUMPAD8:"\ue022", NUMPAD9:"\ue023", MULTIPLY:"\ue024", ADD:"\ue025", SEPARATOR:"\ue026", SUBTRACT:"\ue027", DECIMAL:"\ue028", DIVIDE:"\ue029", F1:"\ue031", F2:"\ue032", F3:"\ue033", F4:"\ue034", F5:"\ue035", F6:"\ue036", F7:"\ue037", F8:"\ue038", F9:"\ue039", F10:"\ue03a", F11:"\ue03b", F12:"\ue03c", COMMAND:"\ue03d", META:"\ue03d"}};
webdriver.atoms = {};
webdriver.atoms.element = {};
webdriver.atoms.element.isSelected = function(a) {
  return!bot.dom.isSelectable(a) ? !1 : bot.dom.isSelected(a)
};
webdriver.atoms.element.getAttribute = function(a, b) {
  var c = null, d = b.toLowerCase();
  if("style" == b.toLowerCase()) {
    if((c = a.style) && !goog.isString(c)) {
      c = c.cssText
    }
    return c
  }
  if("selected" == d || "checked" == d && bot.dom.isSelectable(a)) {
    return bot.dom.isSelected(a) ? "true" : null
  }
  c = bot.dom.isElement(a, goog.dom.TagName.A);
  if(bot.dom.isElement(a, goog.dom.TagName.IMG) && "src" == d || c && "href" == d) {
    return(c = bot.dom.getAttribute(a, d)) && (c = bot.dom.getProperty(a, d)), c
  }
  if(bot.dom.isBooleanAttribute(b.toLowerCase())) {
    return(c = bot.dom.getAttribute(a, b) || bot.dom.getProperty(a, b)) ? "true" : null
  }
  var e;
  try {
    e = bot.dom.getProperty(a, b)
  }catch(f) {
  }
  c = !goog.isDefAndNotNull(e) || goog.isObject(e) ? bot.dom.getAttribute(a, b) : e;
  return goog.isDefAndNotNull(c) ? c.toString() : null
};
webdriver.atoms.element.getLocation = function(a) {
  return!bot.dom.isShown(a) ? null : goog.style.getBounds(a)
};
webdriver.atoms.element.isInHead_ = function(a) {
  for(;a;) {
    if(a.tagName && "head" == a.tagName.toLowerCase()) {
      return!0
    }
    try {
      a = a.parentNode
    }catch(b) {
      break
    }
  }
  return!1
};
webdriver.atoms.element.getText = function(a) {
  if(webdriver.atoms.element.isInHead_(a)) {
    var b = goog.dom.getOwnerDocument(a);
    return a.tagName.toUpperCase() == goog.dom.TagName.TITLE && goog.dom.getWindow(b) == bot.window_.top ? goog.string.trim(b.title) : ""
  }
  return bot.dom.getVisibleText(a)
};
webdriver.atoms.element.type = function(a, b, c) {
  var d = [], e = [];
  d.push(e);
  goog.array.forEach(b, function(a) {
    goog.array.forEach(a.split(""), function(a) {
      if("\ue000" <= a && "\ue03d" >= a) {
        var b = webdriver.atoms.element.type.JSON_TO_KEY_MAP_[a];
        if(null === b) {
          d.push(e = [])
        }else {
          if(goog.isDef(b)) {
            e.push(b)
          }else {
            throw Error("Unsupported WebDriver key: \\u" + a.charCodeAt(0).toString(16));
          }
        }
      }else {
        switch(a) {
          case "\n":
            e.push(bot.Keyboard.Keys.ENTER);
            break;
          case "\t":
            e.push(bot.Keyboard.Keys.TAB);
            break;
          case "\u0008":
            e.push(bot.Keyboard.Keys.BACKSPACE);
            break;
          default:
            e.push(a)
        }
      }
    })
  });
  goog.array.forEach(d, function(b) {
    bot.action.type(a, b, c)
  })
};
webdriver.atoms.element.type.JSON_TO_KEY_MAP_ = {};
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NULL] = null;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.BACK_SPACE] = bot.Keyboard.Keys.BACKSPACE;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.TAB] = bot.Keyboard.Keys.TAB;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.RETURN] = bot.Keyboard.Keys.ENTER;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.ENTER] = bot.Keyboard.Keys.ENTER;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.SHIFT] = bot.Keyboard.Keys.SHIFT;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.CONTROL] = bot.Keyboard.Keys.CONTROL;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.ALT] = bot.Keyboard.Keys.ALT;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.PAUSE] = bot.Keyboard.Keys.PAUSE;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.ESCAPE] = bot.Keyboard.Keys.ESC;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.SPACE] = bot.Keyboard.Keys.SPACE;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.PAGE_UP] = bot.Keyboard.Keys.PAGE_UP;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.PAGE_DOWN] = bot.Keyboard.Keys.PAGE_DOWN;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.END] = bot.Keyboard.Keys.END;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.HOME] = bot.Keyboard.Keys.HOME;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.LEFT] = bot.Keyboard.Keys.LEFT;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.UP] = bot.Keyboard.Keys.UP;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.RIGHT] = bot.Keyboard.Keys.RIGHT;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.DOWN] = bot.Keyboard.Keys.DOWN;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.INSERT] = bot.Keyboard.Keys.INSERT;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.DELETE] = bot.Keyboard.Keys.DELETE;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.SEMICOLON] = bot.Keyboard.Keys.SEMICOLON;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.EQUALS] = bot.Keyboard.Keys.EQUALS;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD0] = bot.Keyboard.Keys.NUM_ZERO;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD1] = bot.Keyboard.Keys.NUM_ONE;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD2] = bot.Keyboard.Keys.NUM_TWO;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD3] = bot.Keyboard.Keys.NUM_THREE;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD4] = bot.Keyboard.Keys.NUM_FOUR;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD5] = bot.Keyboard.Keys.NUM_FIVE;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD6] = bot.Keyboard.Keys.NUM_SIX;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD7] = bot.Keyboard.Keys.NUM_SEVEN;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD8] = bot.Keyboard.Keys.NUM_EIGHT;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.NUMPAD9] = bot.Keyboard.Keys.NUM_NINE;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.MULTIPLY] = bot.Keyboard.Keys.NUM_MULTIPLY;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.ADD] = bot.Keyboard.Keys.NUM_PLUS;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.SUBTRACT] = bot.Keyboard.Keys.NUM_MINUS;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.DECIMAL] = bot.Keyboard.Keys.NUM_PERIOD;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.DIVIDE] = bot.Keyboard.Keys.NUM_DIVISION;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.SEPARATOR] = bot.Keyboard.Keys.SEPARATOR;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F1] = bot.Keyboard.Keys.F1;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F2] = bot.Keyboard.Keys.F2;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F3] = bot.Keyboard.Keys.F3;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F4] = bot.Keyboard.Keys.F4;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F5] = bot.Keyboard.Keys.F5;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F6] = bot.Keyboard.Keys.F6;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F7] = bot.Keyboard.Keys.F7;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F8] = bot.Keyboard.Keys.F8;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F9] = bot.Keyboard.Keys.F9;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F10] = bot.Keyboard.Keys.F10;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F11] = bot.Keyboard.Keys.F11;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.F12] = bot.Keyboard.Keys.F12;
webdriver.atoms.element.type.JSON_TO_KEY_MAP_[webdriver.Key.META] = bot.Keyboard.Keys.META;
webdriver.atoms.inputs = {};
webdriver.atoms.inputs.sendKeys = function(a, b, c) {
  var d = new bot.Keyboard(b), e = goog.array.slice(arguments, 2), e = goog.array.flatten(e);
  a || (a = bot.dom.getActiveElement(document));
  webdriver.atoms.element.type(a, e, d);
  return d.getState()
};
goog.exportSymbol("webdriver.atoms.inputs.sendKeys", webdriver.atoms.inputs.sendKeys);
webdriver.atoms.inputs.click = function(a, b) {
  var c = new bot.Mouse(b);
  a || (a = c.getElement());
  bot.action.click(a, null, c);
  return c.getState()
};
goog.exportSymbol("webdriver.atoms.inputs.click", webdriver.atoms.inputs.click);
webdriver.atoms.inputs.mouseMove = function(a, b, c, d) {
  var d = new bot.Mouse(d), e = a || d.getElement(), f = null != b && null != c, b = b || 0, c = c || 0;
  a ? f || (c = bot.action.getInteractableSize_(a), b = Math.floor(c.width / 2), c = Math.floor(c.height / 2)) : (a = goog.style.getClientPosition(e), b += d.clientXY_.x - a.x, c += d.clientXY_.y - a.y);
  a = goog.dom.getOwnerDocument(e);
  goog.dom.getWindow(a);
  bot.action.scrollIntoView(e, new goog.math.Coordinate(b, c));
  b = new goog.math.Coordinate(b, c);
  d.move(e, b);
  return d.getState()
};
goog.exportSymbol("webdriver.atoms.inputs.mouseMove", webdriver.atoms.inputs.mouseMove);
webdriver.atoms.inputs.mouseButtonDown = function(a) {
  a = new bot.Mouse(a);
  a.pressButton(bot.Mouse.Button.LEFT);
  return a.getState()
};
goog.exportSymbol("webdriver.atoms.inputs.mouseButtonDown", webdriver.atoms.inputs.mouseButtonDown);
webdriver.atoms.inputs.mouseButtonUp = function(a) {
  a = new bot.Mouse(a);
  a.releaseButton();
  return a.getState()
};
goog.exportSymbol("webdriver.atoms.inputs.mouseButtonUp", webdriver.atoms.inputs.mouseButtonUp);
webdriver.atoms.inputs.doubleClick = function(a) {
  a = new bot.Mouse(a);
  a.pressButton(bot.Mouse.Button.LEFT);
  a.releaseButton();
  a.pressButton(bot.Mouse.Button.LEFT);
  a.releaseButton();
  return a.getState()
};
goog.exportSymbol("webdriver.atoms.inputs.doubleClick", webdriver.atoms.inputs.doubleClick);
webdriver.atoms.inputs.rightClick = function(a) {
  a = new bot.Mouse(a);
  a.pressButton(bot.Mouse.Button.RIGHT);
  a.releaseButton();
  return a.getState()
};
goog.exportSymbol("webdriver.atoms.inputs.rightClick", webdriver.atoms.inputs.rightClick);
webdriver.atoms.inject = {};
webdriver.atoms.inject.action = {};
webdriver.atoms.inject.action.type = function(a, b) {
  return bot.inject.executeScript(webdriver.atoms.element.type, [a, b], !0)
};
webdriver.atoms.inject.action.submit = function(a) {
  return bot.inject.executeScript(bot.action.submit, [a], !0)
};
webdriver.atoms.inject.action.clear = function(a) {
  return bot.inject.executeScript(bot.action.clear, [a], !0)
};
webdriver.atoms.inject.action.click = function(a) {
  return bot.inject.executeScript(bot.action.click, [a], !0)
};
webdriver.atoms.storage = {};
webdriver.atoms.storage.appcache = {};
webdriver.atoms.storage.appcache.getStatus = function() {
  return bot.appcache.getStatus()
};
webdriver.atoms.inject.storage = {};
webdriver.atoms.inject.storage.appcache = {};
webdriver.atoms.inject.storage.appcache.getStatus = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.appcache.getStatus, [], !0)
};
webdriver.atoms.inject.dom = {};
webdriver.atoms.inject.dom.getText = function(a) {
  return bot.inject.executeScript(bot.dom.getVisibleText, [a], !0)
};
webdriver.atoms.inject.dom.isSelected = function(a) {
  return bot.inject.executeScript(bot.dom.isSelected, [a], !0)
};
webdriver.atoms.inject.dom.getTopLeftCoordinates = function(a) {
  return bot.inject.executeScript(bot.dom.getLocationInView, [a], !0)
};
webdriver.atoms.inject.dom.getAttributeValue = function(a, b) {
  return bot.inject.executeScript(webdriver.atoms.element.getAttribute, [a, b], !0)
};
webdriver.atoms.inject.dom.getSize = function(a) {
  return bot.inject.executeScript(bot.dom.getElementSize, [a], !0)
};
webdriver.atoms.inject.dom.getValueOfCssProperty = function(a, b) {
  return bot.inject.executeScript(bot.dom.getEffectiveStyle, [a, b], !0)
};
webdriver.atoms.inject.dom.isEnabled = function(a) {
  return bot.inject.executeScript(bot.dom.isEnabled, [a], !0)
};
webdriver.atoms.inject.dom.isDisplayed = function(a) {
  return bot.inject.executeScript(bot.dom.isShown, [a, !0], !0)
};
webdriver.atoms.inject.executeScript = function(a, b, c) {
  return bot.inject.executeScript(a, b, !0, webdriver.atoms.inject.getWindow_(c))
};
webdriver.atoms.inject.executeAsyncScript = function(a, b, c, d, e) {
  return bot.inject.executeScript(a, b, c, d, !0, webdriver.atoms.inject.getWindow_(e))
};
webdriver.atoms.inject.getWindow_ = function(a) {
  return a ? bot.inject.cache.getElement(a[bot.inject.WINDOW_KEY]) : window
};
webdriver.atoms.inject.locators = {};
webdriver.atoms.inject.locators.findElement = function(a, b, c) {
  var d = {};
  d[a] = b;
  return bot.inject.executeScript(bot.locators.findElement, [d, c], !0)
};
webdriver.atoms.inject.locators.findElements = function(a, b, c) {
  var d = {};
  d[a] = b;
  return bot.inject.executeScript(bot.locators.findElements, [d, c], !0)
};
webdriver.atoms.inject.frame = {};
webdriver.atoms.inject.frame.findFrameByIdOrName = function(a, b) {
  return bot.inject.executeScript(bot.frame.findFrameByNameOrId, [a, b], !0)
};
webdriver.atoms.inject.frame.activeElement = function() {
  return bot.inject.executeScript(bot.frame.activeElement, [], !0)
};
webdriver.atoms.inject.frame.findFrameByIndex = function(a, b) {
  return bot.inject.executeScript(bot.frame.findFrameByIndex, [a, b], !0)
};
webdriver.atoms.inject.frame.defaultContent = function() {
  return bot.inject.executeScript(bot.frame.defaultContent, [], !0)
};
webdriver.atoms.inject.frame.getFrameWindow = function(a) {
  return bot.inject.executeScript(bot.frame.getFrameWindow, [a], !0)
};
webdriver.atoms.storage.local = {};
webdriver.atoms.storage.local.setItem = function(a, b) {
  bot.storage.getLocalStorage().setItem(a, b)
};
webdriver.atoms.storage.local.getItem = function(a) {
  return bot.storage.getLocalStorage().getItem(a)
};
webdriver.atoms.storage.local.keySet = function() {
  return bot.storage.getLocalStorage().keySet()
};
webdriver.atoms.storage.local.removeItem = function(a) {
  return bot.storage.getLocalStorage().removeItem(a)
};
webdriver.atoms.storage.local.clear = function() {
  bot.storage.getLocalStorage().clear()
};
webdriver.atoms.storage.local.size = function() {
  return bot.storage.getLocalStorage().size()
};
webdriver.atoms.storage.local.key = function(a) {
  return bot.storage.getLocalStorage().key(a)
};
webdriver.atoms.inject.storage.local = {};
webdriver.atoms.inject.storage.local.setItem = function(a, b) {
  return bot.inject.executeScript(webdriver.atoms.storage.local.setItem, [a, b], !0)
};
webdriver.atoms.inject.storage.local.getItem = function(a) {
  return bot.inject.executeScript(webdriver.atoms.storage.local.getItem, [a], !0)
};
webdriver.atoms.inject.storage.local.keySet = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.local.keySet, [], !0)
};
webdriver.atoms.inject.storage.local.removeItem = function(a) {
  return bot.inject.executeScript(webdriver.atoms.storage.local.removeItem, [a], !0)
};
webdriver.atoms.inject.storage.local.clear = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.local.clear, [], !0)
};
webdriver.atoms.inject.storage.local.size = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.local.size, [], !0)
};
webdriver.atoms.storage.session = {};
webdriver.atoms.storage.session.setItem = function(a, b) {
  bot.storage.getSessionStorage().setItem(a, b)
};
webdriver.atoms.storage.session.getItem = function(a) {
  return bot.storage.getSessionStorage().getItem(a)
};
webdriver.atoms.storage.session.keySet = function() {
  return bot.storage.getSessionStorage().keySet()
};
webdriver.atoms.storage.session.removeItem = function(a) {
  return bot.storage.getSessionStorage().removeItem(a)
};
webdriver.atoms.storage.session.clear = function() {
  bot.storage.getSessionStorage().clear()
};
webdriver.atoms.storage.session.size = function() {
  return bot.storage.getSessionStorage().size()
};
webdriver.atoms.storage.session.key = function(a) {
  return bot.storage.getSessionStorage().key(a)
};
webdriver.atoms.inject.storage.session = {};
webdriver.atoms.inject.storage.session.setItem = function(a, b) {
  return bot.inject.executeScript(webdriver.atoms.storage.session.setItem, [a, b], !0)
};
webdriver.atoms.inject.storage.session.getItem = function(a) {
  return bot.inject.executeScript(webdriver.atoms.storage.session.getItem, [a], !0)
};
webdriver.atoms.inject.storage.session.keySet = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.session.keySet, [], !0)
};
webdriver.atoms.inject.storage.session.removeItem = function(a) {
  return bot.inject.executeScript(webdriver.atoms.storage.session.removeItem, [a], !0)
};
webdriver.atoms.inject.storage.session.clear = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.session.clear, [], !0)
};
webdriver.atoms.inject.storage.session.size = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.session.size, [], !0)
};
webdriver.atoms.inject.storage.database = {};
webdriver.atoms.inject.storage.database.executeSql = function(a, b, c, d) {
  bot.storage.database.executeSql(a, b, c, function(a, b) {
    d(bot.inject.executeScript(function() {
      return b
    }, [b], !0))
  }, function(a) {
    d(bot.inject.executeScript(function() {
      throw new bot.Error(bot.ErrorCode.SQL_DATABASE_ERROR, "SQL Error Code: " + a.code + ". SQL Error Message: " + a.message);
    }, [], !0))
  })
};
var core = {atoms:{}};
core.Error = function(a) {
  goog.debug.Error.call(this, a)
};
goog.inherits(core.Error, goog.debug.Error);
core.filters = {};
core.filters.name_ = function(a, b) {
  return goog.array.filter(b, function(b) {
    return bot.dom.getProperty(b, "name") == a
  })
};
core.filters.value_ = function(a, b) {
  return goog.array.filter(b, function(b) {
    return bot.dom.getProperty(b, "value") === a
  })
};
core.filters.index_ = function(a, b) {
  var c = Number(a);
  if(isNaN(c) || 0 > c) {
    throw new core.Error("Illegal Index: " + a);
  }
  if(b.length <= c) {
    throw new core.Error("Index out of range: " + a);
  }
  return[b[c]]
};
core.filters.Filters_ = {index:core.filters.index_, name:core.filters.name_, value:core.filters.value_};
core.filters.selectElementsBy_ = function(a, b, c) {
  var d = core.filters.Filters_[a];
  if(!d) {
    throw new core.Error("Unrecognised element-filter type: '" + a + "'");
  }
  return d(b, c)
};
core.filters.selectElements = function(a, b, c) {
  var c = c || "value", d = a.match(/^([A-Za-z]+)=(.+)/);
  d && (c = d[1].toLowerCase(), a = d[2]);
  return core.filters.selectElementsBy_(c, a, b)
};
core.LocatorStrategies = {};
core.LocatorStrategies.implicit_ = function(a, b) {
  return goog.string.startsWith(a, "//") ? core.LocatorStrategies.xpath_(a, b) : goog.string.startsWith(a, "document.") ? core.LocatorStrategies.dom_(a, b) : core.LocatorStrategies.identifier_(a, b)
};
core.LocatorStrategies.alt_ = function(a, b) {
  var c = b || goog.dom.getOwnerDocument(bot.window_);
  return core.locators.elementFindFirstMatchingChild(c, function(b) {
    return b.alt == a
  })
};
core.LocatorStrategies.class_ = function(a, b) {
  var c = b || goog.dom.getOwnerDocument(bot.window_);
  return core.locators.elementFindFirstMatchingChild(c, function(b) {
    return b.className == a
  })
};
core.LocatorStrategies.dom_ = function(a) {
  var b = null;
  try {
    b = eval(a)
  }catch(c) {
    return null
  }
  return b ? b : null
};
core.LocatorStrategies.id_ = function(a, b) {
  return bot.locators.findElement({id:a}, b)
};
core.LocatorStrategies.identifier_ = function(a, b) {
  return core.LocatorStrategies.id(a, b) || core.LocatorStrategies.name(a, b)
};
core.LocatorStrategies.name_ = function(a, b) {
  var c = b || goog.dom.getOwnerDocument(bot.window_);
  goog.dom.getDomHelper(c);
  var c = goog.dom.getElementsByTagNameAndClass("*", null, c), d = a.split(" ");
  for(d[0] = "name=" + d[0];d.length;) {
    var e = d.shift(), c = core.filters.selectElements(e, c, "value")
  }
  return 0 < c.length ? c[0] : null
};
core.LocatorStrategies.stored_ = function(a, b) {
  try {
    return bot.inject.cache.getElement(a, b)
  }catch(c) {
    return null
  }
};
core.LocatorStrategies.xpath_ = function(a, b) {
  var c = goog.string.endsWith(a, "/"), d = {xpath:a};
  try {
    var e = bot.locators.findElement(d, b);
    if(e || !c) {
      return e
    }
  }catch(f) {
    if(!c) {
      throw f;
    }
  }
  d = {xpath:a.substring(0, a.length - 1)};
  return bot.locators.findElement(d, b)
};
core.LocatorStrategies.alt = core.LocatorStrategies.alt_;
core.LocatorStrategies["class"] = core.LocatorStrategies.class_;
core.LocatorStrategies.dom = core.LocatorStrategies.dom_;
core.LocatorStrategies.id = core.LocatorStrategies.id_;
core.LocatorStrategies.identifier = core.LocatorStrategies.identifier_;
core.LocatorStrategies.implicit = core.LocatorStrategies.implicit_;
core.LocatorStrategies.name = core.LocatorStrategies.name_;
core.LocatorStrategies.stored = core.LocatorStrategies.stored_;
core.LocatorStrategies.xpath = core.LocatorStrategies.xpath_;
core.locators = {};
core.locators.parseLocator_ = function(a) {
  var b = a.match(/^([A-Za-z]+)=.+/);
  if(b) {
    return b = b[1].toLowerCase(), a = a.substring(b.length + 1), {type:b, string:a}
  }
  b = {string:"", type:""};
  b.string = a;
  b.type = goog.string.startsWith(a, "//") ? "xpath" : goog.string.startsWith(a, "document.") ? "dom" : "identifier";
  return b
};
core.locators.addStrategy = function(a, b) {
  core.LocatorStrategies[a] = b
};
core.locators.findElementBy_ = function(a, b, c) {
  var d = core.LocatorStrategies[a];
  if(!d) {
    throw new core.Error("Unrecognised locator type: '" + a + "'");
  }
  return d.call(null, b, c)
};
core.locators.findElementRecursive_ = function(a, b, c, d) {
  c = core.locators.findElementBy_(a, b, c);
  if(null != c) {
    return c
  }
  if(!d) {
    return null
  }
  for(var e = 0;e < d.frames.length;e++) {
    var f;
    try {
      f = d.frames[e].document
    }catch(g) {
    }
    if(f && (c = core.locators.findElementRecursive_(a, b, f, d.frames[e]), null != c)) {
      return c
    }
  }
  return null
};
core.locators.findElementOrNull = function(a, b) {
  var c = core.locators.parseLocator_(a), d = b || bot.window_;
  return core.locators.findElementRecursive_(c.type, c.string, d.document, d)
};
core.locators.findElement = function(a, b, c) {
  if(!goog.isString(a)) {
    return a
  }
  b = core.locators.findElementOrNull(a, c || bot.window_);
  if(null == b) {
    throw new core.Error("Element " + a + " not found");
  }
  return b
};
core.locators.isElementPresent = function(a) {
  return!!core.locators.findElementOrNull(a)
};
core.locators.elementFindFirstMatchingChild = function(a, b) {
  for(var c = a.childNodes.length, d = 0;d < c;d++) {
    var e = a.childNodes[d];
    if(e.nodeType == goog.dom.NodeType.ELEMENT && (b(e) || (e = core.locators.elementFindFirstMatchingChild(e, b)))) {
      return e
    }
  }
  return null
};
core.patternMatcher = {};
core.patternMatcher.exact_ = function(a, b) {
  return-1 != b.indexOf(a)
};
core.patternMatcher.regexp_ = function(a, b) {
  return RegExp(a).test(b)
};
core.patternMatcher.regexpi_ = function(a, b) {
  return RegExp(a, "i").text(b)
};
core.patternMatcher.globContains_ = function(a, b) {
  return RegExp(core.patternMatcher.regexpFromGlobContains(a)).test(b)
};
core.patternMatcher.glob_ = function(a, b) {
  return RegExp(core.patternMatcher.regexpFromGlob(a)).test(b)
};
core.patternMatcher.convertGlobMetaCharsToRegexpMetaChars_ = function(a) {
  a = a.replace(/([.^$+(){}\[\]\\|])/g, "\\$1");
  a = a.replace(/\?/g, "(.|[\r\n])");
  return a = a.replace(/\*/g, "(.|[\r\n])*")
};
core.patternMatcher.regexpFromGlobContains = function(a) {
  return core.patternMatcher.convertGlobMetaCharsToRegexpMetaChars_(a)
};
core.patternMatcher.regexpFromGlob = function(a) {
  return"^" + core.patternMatcher.convertGlobMetaCharsToRegexpMetaChars_(a) + "$"
};
core.patternMatcher.KNOWN_STRATEGIES_ = {exact:core.patternMatcher.exact_, glob:core.patternMatcher.glob_, globcontains:core.patternMatcher.globContains_, regex:core.patternMatcher.regexp_, regexi:core.patternMatcher.regexpi_, regexpi:core.patternMatcher.regexpi_, regexp:core.patternMatcher.regexp_};
core.patternMatcher.against = function(a) {
  var b = "glob", c = /^([a-zA-Z-]+):(.*)/.exec(a);
  if(c) {
    var d = c[1], c = c[2];
    core.patternMatcher.KNOWN_STRATEGIES_[d.toLowerCase()] && (b = d.toLowerCase(), a = c)
  }
  d = core.patternMatcher.KNOWN_STRATEGIES_[b];
  if(!d) {
    throw new core.Error("Cannot find pattern matching strategy: " + b);
  }
  "glob" == b ? (0 == a.indexOf("glob:") && (a = a.substring(5)), d = core.patternMatcher.KNOWN_STRATEGIES_.glob) : "exact" == b && 0 == a.indexOf("exact:") && (a = a.substring(6));
  a = goog.partial(d, a);
  a.strategyName = b;
  return a
};
core.patternMatcher.matches = function(a, b) {
  return core.patternMatcher.against(a)(b)
};
core.browserbot = {};
core.browserbot.isVisible = function(a) {
  a = core.locators.findElement(a);
  return bot.dom.isShown(a)
};
core.events = {};
core.events.controlKeyDown_ = !1;
core.events.altKeyDown_ = !1;
core.events.metaKeyDown_ = !1;
core.events.shiftKeyDown_ = !1;
var XPCNativeWrapper = XPCNativeWrapper || function() {
};
core.events.getEventFactory_ = function(a) {
  for(var b in bot.events.EventType) {
    var c = bot.events.EventType[b];
    if(c.toString() == a) {
      return c
    }
  }
  return{create:function(b) {
    b = goog.dom.getOwnerDocument(b);
    bot.userAgent.IE_DOC_PRE9 ? b = b.createEventObject() : (b = b.createEvent("HTMLEvents"), b.initEvent(a, !0, !0));
    return b
  }}
};
core.events.fire = function(a, b) {
  var c = core.locators.findElement(a), d = core.events.getEventFactory_(b);
  bot.events.fire(c, d)
};
core.events.parseCoordinates_ = function(a) {
  if(goog.isString(a)) {
    var b = a.split(/,/), a = parseInt(b[0], 0), b = parseInt(b[1], 0);
    return{x:a, y:b}
  }
  return{x:0, y:0}
};
core.events.fireAt = function(a, b, c) {
  a = core.locators.findElement(a);
  c = core.events.parseCoordinates_(c || "0,0");
  if(goog.userAgent.IE || goog.userAgent.product.CHROME) {
    var d = goog.style.getBounds(a);
    c.x += d.left;
    c.y += d.top
  }
  b = core.events.getEventFactory_(b);
  bot.events.fire(a, b, {clientX:c.x, clientY:c.y, button:0, altKey:!1, ctrlKey:!1, shiftKey:!1, metaKey:!1, relatedTarget:null})
};
core.events.replaceText_ = function(a, b) {
  bot.events.fire(a, bot.events.EventType.FOCUS);
  bot.events.fire(a, bot.events.EventType.SELECT);
  var c = bot.dom.getAttribute(a, "maxlength"), d = b;
  null != c && (c = parseInt(c, 0), b.length > c && (d = b.substr(0, c)));
  bot.dom.isElement(a, goog.dom.TagName.BODY) ? a.ownerDocument && a.ownerDocument.designMode && "on" == (new String(a.ownerDocument.designMode)).toLowerCase() && (a.innerHTML = d) : goog.userAgent.GECKO && bot.userAgent.FIREFOX_EXTENSION && bot.userAgent.isEngineVersion(8) ? XPCNativeWrapper(a).value = d : a.value = d;
  try {
    bot.events.fire(a, bot.events.EventType.CHANGE)
  }catch(e) {
  }
};
core.events.setValue = function(a, b) {
  if(core.events.controlKeyDown_ || core.events.altKeyDown_ || core.events.metaKeyDown_) {
    throw new core.Error("type not supported immediately after call to controlKeyDown() or altKeyDown() or metaKeyDown()");
  }
  var c = core.locators.findElement(a), d = core.events.shiftKeyDown_ ? (new String(b)).toUpperCase() : b;
  core.events.replaceText_(c, d)
};
core.firefox = {};
core.firefox.isUsingUnwrapping_ = function() {
  try {
    var a = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
    return 0 <= Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator).compare(a.version, "4.0")
  }catch(b) {
    return!1
  }
};
core.firefox.isUsingUnwrapping_ = core.firefox.isUsingUnwrapping_();
core.firefox.unwrap = function(a) {
  if(!core.firefox.isUsingUnwrapping_ || !goog.isDefAndNotNull(a) || a.__fxdriver_unwrapped) {
    return a
  }
  if(a.wrappedJSObject) {
    return a.wrappedJSObject.__fxdriver_unwrapped = !0, a.wrappedJSObject
  }
  try {
    if(a == XPCNativeWrapper(a)) {
      var b = XPCNativeWrapper.unwrap(a), b = b ? b : a;
      b.__fxdriver_unwrapped = !0;
      return b
    }
  }catch(c) {
  }
  return a
};
core.inject = {};
core.inject.executeScript = function(a, b) {
  var c = bot.inject.executeScript(a.script, core.inject.removeElementIdPrefix_(a.args), !1, b || window), c = core.inject.addElementIdPrefix_(c);
  return goog.json.serialize(c)
};
core.inject.executeAsyncScript = function(a) {
  var b = !1, c, d = core.inject.removeElementIdPrefix_(a.args);
  d.push(a.script, function(a, b) {
    a = core.inject.unwrapResultValue_(a);
    b(a)
  });
  bot.inject.executeAsyncScript(function() {
    (new Function(arguments[arguments.length - 3])).apply(null, function(a) {
      var b = a[a.length - 1], c = a[a.length - 2];
      Array.prototype.splice.apply(a, [a.length - 3, 3]);
      a.push(function(a) {
        c(a, b)
      });
      return a
    }(Array.prototype.slice.apply(arguments, [0])))
  }, d, a.timeout, function(a) {
    b = !0;
    c = core.inject.addElementIdPrefix_(a);
    c = goog.json.serialize(c)
  }, !1, selenium.browserbot.getCurrentWindow());
  return{terminationCondition:function() {
    b && (this.result = c);
    return b
  }}
};
core.inject.unwrapResultValue_ = function(a) {
  switch(goog.typeOf(a)) {
    case "array":
      return goog.array.map(a, core.inject.unwrapResultValue_);
    case "object":
      return bot.dom.isElement(a) ? core.firefox.unwrap(a) : goog.object.map(a, core.inject.unwrapResultValue_);
    default:
      return core.firefox.unwrap(a)
  }
};
core.inject.ELEMENT_ID_PREFIX = "stored=";
core.inject.removeElementIdPrefix_ = function(a) {
  if(goog.isArray(a)) {
    return goog.array.map(a, core.inject.removeElementIdPrefix_)
  }
  if(a && goog.isObject(a) && !goog.isFunction(a) && goog.object.containsKey(a, bot.inject.ELEMENT_KEY)) {
    var b = a[bot.inject.ELEMENT_KEY];
    return b.substring(0, core.inject.ELEMENT_ID_PREFIX.length) === core.inject.ELEMENT_ID_PREFIX ? (a[bot.inject.ELEMENT_KEY] = b.substring(core.inject.ELEMENT_ID_PREFIX.length), a) : goog.object.map(a, core.inject.removeElementIdPrefix_)
  }
  return a
};
core.inject.addElementIdPrefix_ = function(a) {
  return goog.isArray(a) ? goog.array.map(a, core.inject.addElementIdPrefix_) : a && goog.isObject(a) && !goog.isFunction(a) ? goog.object.containsKey(a, bot.inject.ELEMENT_KEY) ? (a[bot.inject.ELEMENT_KEY] = core.inject.ELEMENT_ID_PREFIX + a[bot.inject.ELEMENT_KEY], a) : goog.object.map(a, core.inject.addElementIdPrefix_) : a
};
core.element = {};
core.element.findAttribute_ = function(a) {
  var b = a.lastIndexOf("@"), c = a.slice(0, b), a = a.slice(b + 1), c = core.locators.findElement(c);
  return bot.dom.getAttribute(c, a)
};
core.element.getAttribute = function(a) {
  var b = core.element.findAttribute_(a);
  if(null == b) {
    throw new core.Error("Could not find element attribute: " + a);
  }
  return b
};
core.select = {};
core.select.option = {};
core.select.option.createIndexLocator_ = function(a) {
  var b = Number(a);
  if(isNaN(b) || 0 > b) {
    throw new core.Error("Illegal Index: " + a);
  }
  return{findOption:function(a) {
    if(a.options.length <= b) {
      throw new core.Error("Index out of range.  Only " + a.options.length + " options available");
    }
    return a.options[b]
  }, assertSelected:function(a) {
    if(b != a.selectedIndex) {
      throw new core.Error("Selected index (" + a.selectedIndex + ") does not match expected index: " + b);
    }
  }}
};
core.select.option.createTextLocator_ = function(a) {
  var b = core.patternMatcher.against(a);
  return{findOption:function(c) {
    for(var d = 0;d < c.options.length;d++) {
      if(b(c.options[d].text)) {
        return c.options[d]
      }
    }
    throw new core.Error("Option with label '" + a + "' not found");
  }, assertSelected:function(c) {
    c = c.options[c.selectedIndex].text;
    if(!b(c)) {
      throw new core.Error("Expected text (" + a + ") did not match: " + c);
    }
  }}
};
core.select.option.createValueLocator_ = function(a) {
  var b = core.patternMatcher.against(a);
  return{findOption:function(c) {
    for(var d = 0;d < c.options.length;d++) {
      if(b(c.options[d].value)) {
        return c.options[d]
      }
    }
    throw new core.Error("Option with value '" + a + "' not found");
  }, assertSelected:function(c) {
    c = c.options[c.selectedIndex].value;
    if(!b(c)) {
      throw new core.Error("Expected value (" + a + ") did not match: " + c);
    }
  }}
};
core.select.option.createIdLocator_ = function(a) {
  var b = core.patternMatcher.against(a);
  return{findOption:function(c) {
    for(var d = 0;d < c.options.length;d++) {
      if(b(c.options[d].id)) {
        return c.options[d]
      }
    }
    throw new core.Error("Option with id '" + a + "' not found");
  }, assertSelected:function(c) {
    c = c.options[c.selectedIndex].id;
    if(!b(c)) {
      throw new core.Error("Expected id (" + a + ") did not match: " + c);
    }
  }}
};
core.select.option.Locators_ = {id:core.select.option.createIdLocator_, index:core.select.option.createIndexLocator_, label:core.select.option.createTextLocator_, text:core.select.option.createTextLocator_, value:core.select.option.createValueLocator_};
core.select.option.getOptionLocator_ = function(a) {
  var b = "label", c = a;
  if(a = a.match(/^([a-zA-Z]+)=(.*)/)) {
    b = a[1], c = a[2]
  }
  if(a = core.select.option.Locators_[b]) {
    return a(c)
  }
  throw new core.Error("Unknown option locator type: " + b);
};
core.select.findSelect = function(a) {
  a = goog.isString(a) ? core.locators.findElement(a) : a;
  if(goog.isDef(a.options)) {
    return a
  }
  throw new core.Error("Specified element is not a Select (has no options)");
};
core.select.option.findOption = function(a, b) {
  var c = core.select.findSelect(a);
  return core.select.option.getOptionLocator_(b).findOption(c)
};
core.select.findSelectedOptionProperties_ = function(a, b) {
  for(var c = core.select.findSelect(a), d = [], e = 0;e < c.options.length;e++) {
    c.options[e].selected && d.push(c.options[e][b])
  }
  if(0 == d.length) {
    throw new core.Error("No option selected");
  }
  return d
};
core.select.findSelectedOptionProperty_ = function(a, b) {
  var c = core.select.findSelectedOptionProperties_(a, b);
  if(1 < c.length) {
    throw new core.Error("More than one selected option!");
  }
  return c[0]
};
core.select.isSomethingSelected = function(a) {
  for(var a = core.select.findSelect(a), b = 0;b < a.options.length;b++) {
    if(a.options[b].selected) {
      return!0
    }
  }
  return!1
};
core.select.getSelectedText = function(a) {
  return core.select.findSelectedOptionProperty_(a, "text")
};
core.select.setSelected = function(a, b) {
  var c = core.select.findSelect(a), c = core.select.option.getOptionLocator_(b).findOption(c);
  bot.dom.isSelected(c) || bot.action.click(c)
};
core.text = {};
core.text.getTextContent_ = function(a, b) {
  if(a.style && ("hidden" == a.style.visibility || "none" == a.style.display)) {
    return""
  }
  var c;
  if(a.nodeType == goog.dom.NodeType.TEXT) {
    return c = a.data, b || (c = c.replace(/\n|\r|\t/g, " ")), c.replace(/&nbsp/, " ")
  }
  if(a.nodeType == goog.dom.NodeType.ELEMENT && "SCRIPT" != a.nodeName) {
    var d = b || "PRE" == a.tagName;
    c = "";
    for(var e = 0;e < a.childNodes.length;e++) {
      var f = a.childNodes.item(e);
      f && (c += core.text.getTextContent_(f, d))
    }
    if("P" == a.tagName || "BR" == a.tagName || "HR" == a.tagName || "DIV" == a.tagName) {
      c += "\n"
    }
    c = c.replace(/&nbsp/, " ");
    bot.userAgent.IE && bot.userAgent.isProductVersion(9) && (c = c.replace(/&#100;/, " "));
    return c
  }
  return""
};
core.text.normalizeNewlines_ = function(a) {
  return a.replace(/\r\n|\r/g, "\n")
};
core.text.replaceAll_ = function(a, b, c) {
  for(;-1 != a.indexOf(b);) {
    a = a.replace(b, c)
  }
  return a
};
core.text.normalizeSpaces_ = function(a) {
  var a = a.replace(/\ +/g, " "), b = RegExp(String.fromCharCode(160), "g");
  return goog.userAgent.SAFARI ? core.text.replaceAll_(a, String.fromCharCode(160), " ") : a.replace(b, " ")
};
core.text.getText = function(a) {
  var a = core.locators.findElement(a), b = "";
  goog.userAgent.GECKO && "1.8" <= goog.userAgent.VERSION || goog.userAgent.SAFARI || goog.userAgent.OPERA || goog.userAgent.IE ? b = core.text.getTextContent_(a, !1) : a.textContent ? b = a.textContent : a.innerText && (b = a.innerText);
  b = core.text.normalizeNewlines_(b);
  b = core.text.normalizeSpaces_(b);
  return goog.string.trim(b)
};
core.text.getBodyText = function() {
  var a = bot.window_.document.body;
  return a ? core.text.getText(a) : ""
};
core.text.isTextPresent = function(a) {
  var b = core.text.getBodyText(), c = core.patternMatcher.against(a);
  "glob" == c.strategyName && (0 == a.indexOf("glob:") && (a = a.substring(5)), c = core.patternMatcher.against("globContains:" + a));
  return c(b)
};
core.text.linkLocator = function(a, b) {
  for(var c = (b || goog.dom.getOwnerDocument(bot.getWindow())).getElementsByTagName("a"), d = 0;d < c.length;d++) {
    var e = c[d], f = core.text.getText(e);
    if(core.patternMatcher.matches(a, f)) {
      return e
    }
  }
  return null
};
core.locators.addStrategy("link", core.text.linkLocator);

