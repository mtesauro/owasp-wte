/* ========================================================================= //
#?
#? DESCRIPTION
#?      This file is a copy from:
#?          http://code.gosu.pl/dl/JsDecoder/demo/JsColorizer.js
#?      It's used within EnDe as is but with following bugfixes:
#?          \-escaped quotes and double quotes are not used as strings.
#?
#? VERSION
#?      @(#) JsColorizer.js 3.2 10/08/05 07:37:15
#?
#? AUTHOR
#?      08-sep-08 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */
/*
 * DO NOT REMOVE THIS NOTICE
 *
 * PROJECT:   JsDecoder
 * VERSION:   1.1.0
 * COPYRIGHT: (c) 2004-2008 Cezary Tomczak
 * LINK:      http://code.gosu.pl
 * LICENSE:   GPL
 */

function JsColorizer() {
    this.color = {
        "keyword":   "#0000FF",
        "object":    "#FF0000",
        "quotation": "#FF00FF",
        "comment":   "#008000"
    };

    this.s = ""; // code to colorize
    this.i = 0;
    this.len = 0;

    this.ret = ""; // colorized code
    this.lastWord = ""; // last alphanumeric word
    this.nextChar = "";
    this.prevChar = "";

    this.code = [""];
    this.row = 0;

    this.times = {
        quotation: 0, quotation_calls: 0,
        lineComment: 0, lineComment_calls: 0,
        comment: 0, comment_calls: 0,
        slash: 0, slash_calls: 0,
        word: 0, word_calls: 0
    };

    this.write = function (s)
    {
        this.code[this.row] += s;
        if (s.length == 1) {
            this.prevChar = s;
        } else {
            this.prevCharInit();
        }
    };
    this.writeLine = function ()
    {
        this.code.push("");
        this.row++;
        this.prevChar = "\n";
    };
    this.prevCharInit = function ()
    {
        this.prevChar = this.code[this.row].charAt(this.code[this.row].length - 1);
    };

    this.showTimes = function ()
    {
        var ret = '';
        for (var f in this.times) {
            var t = this.times[f];
            if (/_calls/.test(f)) {
                ret += f+': '+t+"\n";
            } else {
                ret += f+': '+time_round(t)+" sec\n";
            }
        }
        return ret;
    };

    this.colorize = function()
    {
        this.len = this.s.length;
        while (this.i < this.len)
        {
            var c = this.s.charAt(this.i);
            if (this.len - 1 == this.i) {
                this.nextChar = "";
            } else {
                this.nextChar = this.s.charAt(this.i + 1);
            }
            switch (c) {
                case "\n":
                    if (this.lastWord.length) { this.word(); }
                    this.lastWord = '';
                    this.writeLine();
                    break;
                case "'":
                case '"':
// 21jul10 Achim: bugfix for \-escaped quotes
                    if ("\\" == this.s.charAt(this.i - 1)) {
                        this.write(c);
                    } else {
                    	if (this.lastWord.length) { this.word(); }
                    	this.lastWord = '';
                    	this.quotation(c);
                    }
                    break;
                case "/":
                    if (this.lastWord.length) { this.word(); }
                    this.lastWord = '';
                    if ("/" == this.nextChar) {
                        this.lineComment();
                    } else if ("*" == this.nextChar) {
                        this.comment();
                    } else {
                        this.slash();
                    }
                    break;
                default:
                    if (/^\w$/.test(c)) {
                        this.lastWord += c;
                    } else {
                        if (this.lastWord.length) { this.word(); }
                        this.lastWord = '';
                        this.write(c);
                    }
                    break;
            }
            this.i++;
        }
        this.write(this.lastWord);
        return this.code.join("\n");
    };

    this.quotation = function(quotation)
    {
        //var time = time_start();
        var s = quotation;
        var escaped = false;
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            if ("\\" == c) {
                escaped = (escaped ? false : true);
            }
            s += c;
            if (c == quotation) {
                if (!escaped) {
                    break;
                }
            }
            if ("\\" != c) {
                escaped = false;
            }
        }
        this.write('<font color="'+this.color.quotation+'">' + s + '</font>');
        //this.times.quotation += time_get(time);
        //this.times.quotation_calls++;
    };

    this.lineComment = function()
    {
        //var time = time_start();
        var s = "//";
        this.i++;
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            s += c;
            if ("\n" == c) {
                break;
            }
        }
        this.write('<font color="'+this.color.comment+'">' + s + '</font>');
        //this.times.lineComment += time_get(time);
        //this.times.lineComment_calls++;
    };

    this.comment = function()
    {
        //var time = time_start();
        var s = "/*";
        this.i++;
        var c = "";
        var prevC = "";
        while (this.i < this.len - 1) {
            this.i++;
            prevC = c;
            c = this.s.charAt(this.i);
            s += c;
            if ("/" == c && "*" == prevC) {
                break;
            }
        }
        this.write('<font color="'+this.color.comment+'">' + s + '</font>');
        //this.times.comment += time_get(time);
        //this.times.comment_calls++;
    };

    /* SLASH
     * divisor /= or *\/ (4/5 , a/5)
     * regexp /\w/ (//.test() , var asd = /some/;) */
    this.slash = function()
    {
        //var time = time_start();
        var a_i = this.i - 1;
        var a_c = this.s.charAt(a_i);
        for (a_i = this.i - 1; a_i >= 0; a_i--) {
            var c2 = this.s.charAt(a_i);
            if (" " == c2 || "\t" == c2) {
                continue;
            }
            a_c = this.s.charAt(a_i);
            break;
        }
        var a = /^\w+$/.test(a_c) || ']' == a_c || ')' == a_c;
        var b = ("*" == this.prevChar);
        if (a || b) {
            if (a) {
                if ("=" == this.nextChar) {
                    this.write("/");
                } else {
                    this.write("/");
                }
            } else if (b) {
                this.write("/");
            }
        } else if (')' == this.prevChar) {
            this.write('/');
        } else {
            var ret = '';
            if ("=" == this.prevChar) {
                ret += "/";
            } else {
                ret += "/";
            }
            var escaped = false;
            while (this.i < this.len - 1) {
                this.i++;
                var c = this.s.charAt(this.i);
                if ("\\" == c) {
                    escaped = (escaped ? false : true);
                }
                ret += c;
                if ("/" == c) {
                    if (!escaped) {
                        break;
                    }
                }
                if ("\\" != c) {
                    escaped = false;
                }
            }
            this.write('<font color="'+this.color.quotation+'">' + ret + '</font>');
        }
        //this.times.slash += time_get(time);
        //this.times.slash_calls++;
    };

    this.word = function()
    {
        //var time = time_start();
        if (this.keywords.indexOf(this.lastWord) != -1) {
            this.write('<font color="'+this.color.keyword+'">' + this.lastWord + '</font>');
        } else if (this.objects.indexOf(this.lastWord) != -1) {
            this.write('<font color="'+this.color.object+'">' + this.lastWord + '</font>');
        } else {
            this.write(this.lastWord);
        }
        //this.times.word += time_get(time);
        //this.times.word_calls++;
    };

    this.keywords = ["abstract", "boolean", "break", "byte", "case", "catch", "char", "class",
        "const", "continue", "default", "delete", "do", "double", "else", "extends", "false",
        "final", "finally", "float", "for", "function", "goto", "if", "implements", "import",
        "in", "instanceof", "int", "interface", "long", "native", "new", "null", "package",
        "private", "protected", "public", "return", "short", "static", "super", "switch",
        "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var",
        "void", "while", "with"];

    this.objects = ["Anchor", "anchors", "Applet", "applets", "Area", "Array", "Button", "Checkbox",
        "Date", "document", "FileUpload", "Form", "forms", "Frame", "frames", "Hidden", "history",
        "Image", "images", "Link", "links", "Area", "location", "Math", "MimeType", "mimeTypes",
        "navigator", "options", "Password", "Plugin", "plugins", "Radio", "Reset", "Select",
        "String", "Submit", "Text", "Textarea", "window"];
}
