
// scriptable date formater, for pretty printing dates
var nsIScriptableDateFormat = Components.interfaces.nsIScriptableDateFormat;

var dateService = Components.classes["@mozilla.org/intl/scriptabledateformat;1"].getService(nsIScriptableDateFormat);

var kDate_MillisecondsInSecond = 1000;
var kDate_SecondsInMinute      = 60;
var kDate_MinutesInHour        = 60;
var kDate_HoursInDay           = 24;
var kDate_DaysInWeek           = 7;

var kDate_SecondsInHour        = 3600;
var kDate_SecondsInDay         = 86400
var kDate_SecondsInWeek        = 604800

var kDate_MinutesInDay         = 1440;
var kDate_MinutesInWeek        = 10080;


var kDate_MillisecondsInMinute =     60000;
var kDate_MillisecondsInHour   =   3600000;
var kDate_MillisecondsInDay    =  86400000;
var kDate_MillisecondsInWeek   = 604800000;


// required includes: "chrome://global/content/strres.js" - String Bundle Code

function DateUtils()
{

}

DateUtils.getLastDayOfMonth = function( year, month  )
{
   var pastLastDate = new Date( year, month, 32 );
   var lastDayOfMonth = 32 - pastLastDate.getDate();
   
   return lastDayOfMonth;
 
}




function DateFormater( CalendarWindow )
{
   // we get the date bundle in case the locale changes, can
   // we be notified of a locale change instead, then we could
   // get the bundle once.
   
   this.dateStringBundle = srGetStrBundle("chrome://oms/locale/dateFormat.properties");

   this.CalendarWindow = CalendarWindow;
}


DateFormater.prototype.getFormatedTime = function( date )
{
   return( dateService.FormatTime( "", dateService.timeFormatNoSeconds, date.getHours(), date.getMinutes(), 0 ) ); 
}


DateFormater.prototype.getFormatedDate = function( date )
{
   // Format the date using a hardcoded format for now, since everything
   // that displays the date uses this function we will be able to 
   // make a user settable date format and use it here.

   try
   {     
      if( getIntPref(gCalendarWindow.calendarPreferences.calendarPref, "date.format", 0 ) == 0 )
         return( this.getLongFormatedDate( date ) );
      else
         return( this.getShortFormatedDate( date ) );
   }
   catch(ex)
   {
      return "";
   }
}

DateFormater.prototype.getLongFormatedDate = function( date )
{
   if( (navigator.platform.indexOf("Win") == 0) || (navigator.platform.indexOf("Mac") != -1) )
   {
      return( dateService.FormatDate( "", dateService.dateFormatLong, date.getFullYear(), date.getMonth()+1, date.getDate() ) );
   }
   else
   {
      // HACK We are probably on Linux and want a string in long format.
      // dateService.dateFormatLong on Linux returns a short string, so build our own
      // this should move into Mozilla or libxpical
      var oneBasedMonthNum = date.getMonth() + 1;
      var monthString = this.dateStringBundle.GetStringFromName("month." + oneBasedMonthNum + ".Mmm" );
      var dateString =  monthString + " " + date.getDate()+", "+date.getFullYear();
      return dateString;
   }
}


DateFormater.prototype.getShortFormatedDate = function( date )
{
   return( dateService.FormatDate( "", dateService.dateFormatShort, date.getFullYear(), date.getMonth()+1, date.getDate() ) );
}


// 0-11 Month Index

DateFormater.prototype.getMonthName = function( monthIndex )
{

   var oneBasedMonthNum = monthIndex + 1;
   
   var monthName = this.dateStringBundle.GetStringFromName("month." + oneBasedMonthNum + ".name" );
   
   return monthName;
}


// 0-11 Month Index

DateFormater.prototype.getShortMonthName = function( monthIndex )
{

   var oneBasedMonthNum = monthIndex + 1;
   
   var monthName = this.dateStringBundle.GetStringFromName("month." + oneBasedMonthNum + ".Mmm" );
   
   return monthName;
}


// 0-6 Day index ( starts at Sun )

DateFormater.prototype.getDayName = function( dayIndex )
{

   var oneBasedDayNum = dayIndex + 1;
   
   var dayName = this.dateStringBundle.GetStringFromName("day." + oneBasedDayNum + ".name" );
   
   return dayName;
}


// 0-6 Day index ( starts at Sun )

DateFormater.prototype.getShortDayName = function( dayIndex )
{

   var oneBasedDayNum = dayIndex + 1;
   
   var dayName = this.dateStringBundle.GetStringFromName("day." + oneBasedDayNum + ".Mmm" );
   
   return dayName;
}





