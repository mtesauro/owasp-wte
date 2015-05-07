if (!Flashbug) {
var Flashbug = function() {
	var doc = document,
		event = doc.createEvent('Events');
		
	event.initEvent('SWFEvent', true, false)
	
	function callOnAllElements(tag, method, args, methodOnElement) {
		var elements = doc.getElementsByTagName(tag);
		args = args || [];
		if (Object.prototype.toString.call(args) !== '[object Array]') args = [args];
		
		for (var i = -1, len = elements.length; ++i < len;) {
			var el = elements[i];
			
			/* Add ids, and names in case they are missing */
			if (!el.getAttribute('id'))  el.setAttribute('id', 'flashbug' + i + ~~(Math.random() * 1000));
            if (!el.getAttribute('name')) el.setAttribute('name', el.getAttribute('id'));
			
			/* If we find an embed inside object, we've already commanded embeds so skip them */
			if (tag == 'object' && el.getElementsByTagName('embed').length) continue;
			
			var args2 = args.slice();
			if (el[method]) {
				if (methodOnElement) {
					args2 = [el[methodOnElement].apply(el, args2)];
					if (args2[0] == null && args[0] == 'id') args2 = [el[methodOnElement].apply(el, ['name'])];
				}
				
				el[method].apply(el, args2 || []);
			} else {
				/*console.error('Flashbug SWFIO Error: "' + method + '" not found on ' + el.id, el);*/
			}
		}
	}
	
	return {
		
		event:event,
		
		get: function(data, id) {
			var el = doc.getElementById(id);
			el.setUserData('flashbug', data, null);
			el.dispatchEvent(this.event);
		},
		
		send: function(data, id) {
			if (id) {
				var el = doc.getElementById(id);
				
				// Object may not have API if inner embed is available
				if (!el.send) el = el.getElementsByTagName('embed')[0];
				// Sometimes there is a deeper object embedded 
				// outer -> classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
				// inner -> type="application/x-shockwave-flash"
				if (!el.send) el = el.getElementsByTagName('object')[0];
				
				if (el && el.send) el.send(data);
				return;
			}
			
			callOnAllElements('embed', 'send', data);
			callOnAllElements('object', 'send', data);
		},
		
		start: function() {
			callOnAllElements('embed', 'startDebug', 'id', 'getAttribute');
			callOnAllElements('object', 'startDebug', 'id', 'getAttribute');
		},
		
		stop: function() {
			callOnAllElements('embed', 'stopDebug');
			callOnAllElements('object', 'stopDebug');
		}
	};
}();
}

function ___Flashbug_start() {
	if (Flashbug && Flashbug.start) Flashbug.start();
}

function ___Flashbug_stop() {
	if (Flashbug && Flashbug.stop) Flashbug.stop();
}