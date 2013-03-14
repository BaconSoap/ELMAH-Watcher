jQuery.noConflict();

var elmahWatcher = (function($j){

	var port;
	var popupPort;
	var refresher = -1;

	function start(){
		$j(init);
	}

	function init(){
		chrome.extension.onConnect.addListener(onConnect);
		port = chrome.extension.connect({name:"elmahWatcher"});
		port.onMessage.addListener(onMessage);

	}

	function onPopupMessage(msg){
		console.log(msg);
		if (msg.name === "interval"){
			var interval = msg.value;
			console.log(interval);
			if (interval === 0){
				clearTimeout(refresher);
			} else {
				clearTimeout(refresher);
				refresher = setTimeout(function(){location.reload();}, interval*1000);
			}
		}
	}

	function onMessage(msg){
		if (msg.name === "interval"){
			chrome.storage.sync.get("enabled" + location.href, function(val){
				var enabled = val['enabled' + location.href];
				var interval = msg.value;
				console.log(msg);
				if (interval === 0){
					clearTimeout(refresher);
				} else if (enabled) {
					clearTimeout(refresher);
					refresher = setTimeout(function(){location.reload();}, interval*1000);
				}
			});
		}
	}

	function onConnect(p){
		popupPort = p;
		popupPort.onMessage.addListener(onPopupMessage);
		popupPort.postMessage({name:'location', value: location.href});
	}

	return {start:start};
})(jQuery.noConflict());

elmahWatcher.start();