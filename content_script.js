jQuery.noConflict();

var elmahWatcher = (function($j){

	var port;
	var popupPort;

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
	}

	function onMessage(msg){
		console.log(msg)
	}
	function onConnect(p){
		popupPort = p;
		popupPort.onMessage.addListener(onPopupMessage);
		popupPort.postMessage({name:'location', value: location.href});
	}

	return {start:start};
})(jQuery.noConflict());

elmahWatcher.start();