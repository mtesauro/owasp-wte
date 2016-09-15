// Initialized from window parameters.
Components.utils.import("resource://flashfirebuglibs/prepare.js");

var FlashModule;
var $FQuery;
function mapMonth(monthNo) {
  switch (monthNo) {
    case 1:
      return 'Jan';
    case 2:
      return 'Feb';
    case 3:
      return 'Mar';
    case 4:
      return 'Apr';
    case 5:
      return 'May';
    case 6:
      return 'Jun';
    case 7:
      return 'Jul';
    case 8:
      return 'Aug';
    case 9:
      return 'Sep';
    case 10:
      return 'Oct';
    case 11:
      return 'Nov';
    case 12:
      return 'Dec';
  }
}
function init()
{
    FlashModule = window.arguments[0].FlashModule;
    $FQuery = window.arguments[0].$FQuery;

    $FQuery("#ffbug-pro-desc > label", document).append(Flashbug.$FL_STR("flashbug.unlockpro.desc"));
    
    $FQuery("#about-pro-desc", document).append(Flashbug.$FL_STR("flashbug.aboutpro.desc"));
    
    $FQuery("#ffbug-pro-unlock", document).attr("label", Flashbug.$FL_STR("flashbug.unlock.unlock"));
    $FQuery("#ffbug-pro-cancel", document).attr("label", Flashbug.$FL_STR("flashbug.unlock.cancel"));
    
    document.title = Flashbug.$FL_STR("flashbug.unlockpro.title.unlock");
    $FQuery("#ffbug-pro-form",document).attr("hidden","false");
    var email = $FQuery.trim(flashfirebugPrepare.getPrefValue("ffbug.email"));
    var key = $FQuery.trim(flashfirebugPrepare.getPrefValue("ffbug.key"));
    $FQuery("#ffbug-pro-email",document).val(email);
    $FQuery("#ffbug-pro-key",document).val(key);
    
    $FQuery("#ffbug-pro-status-title", document).append(Flashbug.$FL_STR("flashbug.unlockpro.status"));
    
    if (flashfirebugPrepare.isPro) {
      // let's format our date
      var date = new Date(flashfirebugPrepare.expDate * 1000), 
      datevalues = [
            date.getFullYear(),
            mapMonth(date.getMonth()+1),
            date.getDate()
        ];
      
      $FQuery("#ffbug-pro-desc", document).remove();
      $FQuery("#ffbug-pro-status-detail", document).append(' ' + Flashbug.$FL_STR("flashbug.unlockpro.statusActive"));
      $FQuery("#ffbug-pro-status-expiration-title", document).append(' (' + Flashbug.$FL_STR("flashbug.unlockpro.expiration"));
      $FQuery("#ffbug-pro-status-expiration-time", document).append(datevalues[1] + ' ' + datevalues[2] + ', ' + datevalues[0] + ")");
    } else {
      $FQuery("#ffbug-pro-status-detail", document).append(' ' + Flashbug.$FL_STR("flashbug.unlockpro.statusInactive"));
    }
}

function unlockPro(){
    flashfirebugPrepare.setPrefValue("ffbug.email",$FQuery.trim($FQuery("#ffbug-pro-email",document).val()).toLowerCase());
    flashfirebugPrepare.setPrefValue("ffbug.key",$FQuery.trim($FQuery("#ffbug-pro-key",document).val()));
    FlashModule.addversionswf("dialog");
    
    return true;
}

function openTab(tabURL){
  flashfirebugPrepare.openTab(tabURL);
  window.close();
}