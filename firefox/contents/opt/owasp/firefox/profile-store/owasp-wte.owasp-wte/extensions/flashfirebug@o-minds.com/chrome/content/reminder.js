// Initialized from window parameters.
Components.utils.import("resource://flashfirebuglibs/prepare.js");

var FlashModule;
var $FQuery;

function init()
{
  FlashModule = window.arguments[0].FlashModule;
  $FQuery = window.arguments[0].$FQuery;

  $FQuery("#ffbug-pro-reminder-message", document).text(Flashbug.$FL_STR("flashbug.reminder.expired"));

  $FQuery("#ffbug-pro-reminder-ok", document).attr("label", Flashbug.$FL_STR("flashbug.reminder.accept"));

  document.title = Flashbug.$FL_STR("flashbug.reminder.title");
}

function openTab(){
    var email = flashfirebugPrepare.getPrefValue("ffbug.email");
    var tabURL = "http://www.o-minds.com/payment/flashfirebug?m=1";
    if (email != "") {
      tabURL += "/" + encodeURIComponent(email);
    }
    flashfirebugPrepare.openTab(tabURL);
    window.close();
    return true;
}