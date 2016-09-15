
coomanPlus.spinEvent = function (spinevent, element, spin)
{
//	alert(objSpinButton.id + '\n' + spinevent);

//	var element = objSpinButton.id.replace('-spinButtons','');
	var element = element || spinevent.target;

	element = element.id.replace('-spinButtons','');
	var spin = spin || spinevent.target.getAttribute('class');

	var objControl = document.getElementById('ifl_expires_' + element);
	if (objControl.disabled)
		return false;

	if (spin=='up')
			objControl.value++;

	if (spin=='down')
			objControl.value--;

	this.spinFunc[element](objControl);

	switch (element.toLowerCase())
	{
		case 'day': case 'year':
			this.setDateField();
			break;
		case 'hours': case 'minutes': case 'seconds':
			this.setTimeField();
			break;

		default:
			alert("Invalid date type");
	}

//	ChangeSeconds(this);SetTimeField()

}

coomanPlus.calendarSet = function()
{
	document.getElementById( "oe-date-picker-popup" ).setAttribute( "value", (new Date(document.getElementById("ifl_expires_date").value)) );
}

coomanPlus.calendarSave = function(datepopup)
{
	var newDate = datepopup.value;
//	var tempSrc = document.getElementById("start-date-text");
	var tempSrc = document.getElementById("ifl_expires_date");
	var getMonth = newDate.getMonth();

	tempSrc.value= this.getMonth(getMonth) + ' ' + newDate.getDate() + ", " +  newDate.getFullYear();
	this.fixDate();
	// datepopup.value is a Date object with
	// the year, month, day set to the user selection
}

coomanPlus.changeSeconds = function(objText)
{
	coomanPlus.validateSeconds(objText);

	var v = objText.value;
	if (v.length < 1 )
		v = document.getElementById('ifl_expires_time').value.substring(6,8);

	if (v < 0 || v > 59)
		v = document.getElementById('ifl_expires_time').value.substring(6,8);

	objText.value = coomanPlus.right('00' + v,2)

}

coomanPlus.validateSeconds = function(objText)
{
	var v = this.numberClean(objText.value);

	if (v.length > 2)
		v = this.left(v,2)

	if (v > 59)
		v = '00';

	if (v < 0)
		v = '59';

	objText.value = v;
}

coomanPlus.changeMinutes = function(objText)
{
	coomanPlus.validateMinutes(objText);

	var v = objText.value;
	if (v.length < 1)
		v = document.getElementById('ifl_expires_time').value.substring(3,5);

	if (v < 0 || v > 59)
		v = document.getElementById('ifl_expires_time').value.substring(3,5);

	objText.value = coomanPlus.right('00' + v,2)

}

coomanPlus.validateMinutes = function(objText)
{
	var v = this.numberClean(objText.value);

	if (v.length > 2)
		v = this.left(v,2)

	if (v > 59)
		v = '00';

	if (v < 0)
		v = '59';

	objText.value = v;


}

coomanPlus.changeHours = function(objText)
{
	coomanPlus.validateHours(objText);
	var v = objText.value;
	if (v.length < 1)
		v = document.getElementById('ifl_expires_time').value.substring(0,2);


	if (v < 0 || v > 23)
		v = document.getElementById('ifl_expires_time').value.substring(0,2);

	objText.value = coomanPlus.right('00' + v,2)

}

coomanPlus.validateHours = function(objText)
{
	var v = this.numberClean(objText.value);

	if (v.length > 2)
		v = this.left(v, 2)

	if (v > 23)
		v = '00';

	if (v < 0)
		v = '23';
	objText.value = coomanPlus.right('00' + v);
}

coomanPlus.changeDay = function(objText)
{
	coomanPlus.validateDay(objText);

	var v = objText.value;
	if (v.length == 1)
			v = coomanPlus.right('00' + v,2)

	if (v.length < 1 || v < 1)
	{
		v = (new Date(document.getElementById('ifl_expires_date').value)).getDate();
//		alert("Please enter a valid day");
	}
	objText.value = coomanPlus.right('00' + v,2)
}

coomanPlus.validateDay = function(objText)
{
	var v = this.numberClean(objText.value);

	var d = document;
	var year = d.getElementById('ifl_expires_Year').value;
	var month = this.monthToNumber(d.getElementById('ifl_expires_Month').value);
	var days = new Array(31, ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

	if (v > days[month])
		v = "01";

	if (v < 1)
		v = days[month];

	objText.value = v;
}

coomanPlus.changeYear = function(objText)
{
	coomanPlus.validateYear(objText);
	if (objText.value.length < 4 || objText.value.length > 4)
	{
		objText.value = (new Date(document.getElementById('ifl_expires_date').value)).getFullYear();
//		alert("Please enter a sensible valid year");
	}
}

coomanPlus.validateYear = function(objText)
{
	var v = this.numberClean(objText.value);

	var min = (new Date().getFullYear()) - 1;
	if (v <= min)
		v = min;

	objText.value = v;
}

coomanPlus.setTimeField = function()
{
	var d = document;
	d.getElementById('ifl_expires_time').value =  this.right('00' + d.getElementById('ifl_expires_Hours').value,2) + ':' +
																								this.right('00' + d.getElementById('ifl_expires_Minutes').value,2) + ':' +
																								this.right('00' + d.getElementById('ifl_expires_Seconds').value,2);
	this.showWarning();
}

coomanPlus.setDateField = function()
{
	var d = document;
	var t = new Date(	d.getElementById('ifl_expires_Month').value + ' ' +
										d.getElementById('ifl_expires_Day').value + ', ' +
										d.getElementById('ifl_expires_Year').value + ' ' +
										d.getElementById('ifl_expires_Hours').value + ':' +
										d.getElementById('ifl_expires_Minutes').value + ':' +
										d.getElementById('ifl_expires_Seconds').value
	);

	d.getElementById('ifl_expires_date').value =  this.getMonth(t.getMonth()) + ' ' +
																								this.right("00" + t.getDate(), 2) + ', ' +
																								t.getFullYear();
	if (d.getElementById('ifl_expires_date').value != d.getElementById('ifl_expires_Month').value + ' ' +
																										this.right("00" + d.getElementById('ifl_expires_Day').value,2) + ', ' +
																										d.getElementById('ifl_expires_Year').value)
	{
//		this.fixDate();
	}

	this.showWarning();
}

coomanPlus.showWarning = function()
{
	var t = this.getExpireSelection() * 1000;
	var d = new Date(t);
	document.getElementById("warning").hidden = !(t && !isNaN(d) && d < (new Date()));
}

coomanPlus.fixDate = function()
{
	var d = document;
	var expr_date = this.fixDateTime();
	d.getElementById('ifl_expires_Month').value	= this.getMonth(expr_date.getMonth());
	d.getElementById('ifl_expires_Day').value		= this.right("00" + expr_date.getDate(), 2);
	d.getElementById('ifl_expires_Year').value	= expr_date.getFullYear();
	this.showWarning();
	this.setDateField();
}

coomanPlus.fixDateTime = function()
{
	var d = document;
	var expr_date = (new Date(d.getElementById('ifl_expires_date').value + " " + d.getElementById('ifl_expires_time').value));
	if (isNaN(expr_date))
	{
		if (d.getElementById('ifl_expires_date').prevDate)
			expr_date = d.getElementById('ifl_expires_date').prevDate;
		else
			expr_date = d.getElementById('ifl_expires').value ? new Date(d.getElementById('ifl_expires').value*1000) : this.dateAdd((new Date()), "d", 1);
	}

	d.getElementById('ifl_expires_date').prevDate = expr_date / 1000;
	return expr_date;
}

coomanPlus.fixTime = function()
{
	var d = document;

//	var expr_time = (new Date( 'Thursday, January 01, 1970 ' +d.getElementById('ifl_expires_time').value));
	var expr_time = this.fixDateTime();

	d.getElementById('ifl_expires_Hours').value		= this.right("00" + expr_time.getHours(), 2);
	d.getElementById('ifl_expires_Minutes').value	= this.right("00" + expr_time.getMinutes(), 2);
	d.getElementById('ifl_expires_Seconds').value	= this.right("00" + expr_time.getSeconds(), 2);
/*
	var expr_time = d.getElementById('ifl_expires_time').value;

	d.getElementById('ifl_expires_Hours').value 					= expr_time.substring(0,2);
	d.getElementById('ifl_expires_Minutes').value 				= expr_time.substring(3,5);
	d.getElementById('ifl_expires_Seconds').value 				= expr_time.substring(6,8);
*/
	this.showWarning();
	this.setTimeField();
}

coomanPlus.getDay = function(ii)
{
	return ["Sunday", "Monday", "Tuesday", "Wednesday",
					"Thursday", "Friday", "Saturday"][i];
}

//------------------------------------------------------------------
coomanPlus.getMonth = function(i)
{
	var MonthArray = new Array();
	return ["January", "February", "March",
					"April", "May", "June",
					"July", "August", "September",
					"October", "November", "December"][i];
}


//------------------------------------------------------------------
coomanPlus.monthToNumber = function(strMonth)
{
	try
	{
		return {january: 0,
						february: 1,
						march: 2,
						april: 3,
						may: 4,
						june: 5,
						july: 6,
						august: 7,
						september: 8,
						october: 9,
						november: 10,
						december: 11
		}[strMonth.toLowerCase()];
	}
	catch(e)
	{
		return -1;
	}
}

coomanPlus.getDateStr = function(datestr)
{
	var dStr = new Date(datestr);
	var year = dStr.getYear();
	if(year<1000)
		year+=1900;
	
	return this.getMonth(dStr.getMonth()) + " " + dStr.getDate() + ", " + year;
}

coomanPlus.getTimeStr = function(datestr)
{
	var dStr = new Date(datestr);
	return this.right('00' + dStr.getHours(),2) + ':' + this.right('00' + dStr.getMinutes(),2) + ":" + this.right('00' + dStr.getSeconds(),2);
}


// http://www.flws.com.au/showusyourcode/codeLib/code/js_dateAdd.asp?catID=2
coomanPlus.dateAdd = function(start, interval, number)
{

	// Create 3 error messages, 1 for each argument.
	var startMsg = "Sorry the start parameter of the dateAdd function\n"
			startMsg += "must be a valid date format.\n\n"
			startMsg += "Please try again." ;

	var intervalMsg = "Sorry the dateAdd function only accepts\n"
			intervalMsg += "d, h, m OR s intervals.\n\n"
			intervalMsg += "Please try again." ;

	var numberMsg = "Sorry the number parameter of the dateAdd function\n"
			numberMsg += "must be numeric.\n\n"
			numberMsg += "Please try again." ;

	// get the milliseconds for this Date object.
	var buffer = Date.parse( start ) ;

	// check that the start parameter is a valid Date.
	if ( isNaN (buffer) )
	{
		alert( startMsg ) ;
		return null ;
	}

	// check that an interval parameter was not numeric.
	if ( interval.charAt == 'undefined' )
	{
		// the user specified an incorrect interval, handle the error.
		alert( intervalMsg ) ;
		return null ;
	}

	// check that the number parameter is numeric.
	if ( isNaN ( number ) )
	{
		alert( numberMsg ) ;
		return null ;
	}

	// so far, so good...
	//
	// what kind of add to do?
	switch (interval.charAt(0))
	{
		case 'd': case 'D':
				number *= 24 ; // days to hours
				// fall through!
		case 'h': case 'H':
				number *= 60 ; // hours to minutes
				// fall through!
		case 'm': case 'M':
				number *= 60 ; // minutes to seconds
				// fall through!
		case 's': case 'S':
				number *= 1000 ; // seconds to milliseconds
				break ;
		default:
		// If we get to here then the interval parameter
		// didn't meet the d,h,m,s criteria.  Handle
		// the error.
		alert(intervalMsg) ;
		return null ;
	}
	return new Date( buffer + number ) ;
}

coomanPlus.numbersOnly = function(e, ex)
{
	var r = true;
	var ex = ex || [];
	for(var i = 0; i < ex.length; i++)
	{
		if (e.keyCode == ex[i][0])
		{
			if (ex[i][1] && !e.shiftKey)
				r = false;

			return r;
		}
	}

	var start = e.target.selectionStart;
	var end = e.target.selectionEnd;
	var m = e.target.value.substring(start, end).match(/:/);
	if (e.keyCode == 8 || e.keyCode == 46) //backspace, delete
	{
		if (start == end)
		{
			if (e.keyCode == 8)
				start--;
			else
				end++;
		}
		if (e.target.value.substring(start, end).match(/:/))
			return false;
	}
	if ((e.keyCode > 57 && e.keyCode < 96) || e.keyCode > 105)
		r = false;
	else if (m && ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 95 && e.keyCode < 106)))
		r = false;

	if (e.keyCode == 38)
	{
		var s = e.target.parentNode.getElementsByTagName("spinbuttonsH");
		if (s.length)
			this.spinEvent("", s[0], "up");
	}
	else if (e.keyCode == 40)
	{
		var s = e.target.parentNode.getElementsByTagName("spinbuttonsH");
		if (s.length)
			this.spinEvent("", s[0], "down");
	}
	return r;
}


coomanPlus.spinFunc = {
	Year: coomanPlus.changeYear,
	Day: coomanPlus.changeDay,
	Hours: coomanPlus.changeHours,
	Minutes: coomanPlus.changeMinutes,
	Seconds: coomanPlus.changeSeconds
};

