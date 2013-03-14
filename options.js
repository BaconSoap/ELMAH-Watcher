var elmahWatcherOptions =
(function($j){
	function start(){
		$j(init);
	}

	function init(){
		chrome.storage.sync.get(['pageWatchPattern', 'pageRefreshInterval', 'codePattern', 'messageDisplay'], function(val){
			setFromStorage("#watchPagePattern", val, "pageWatchPattern", "elmah.axd");
			setFromStorage("#refreshInterval", val, "pageRefreshInterval", 0);
			setFromStorage("#codePattern", val, "codePattern", "code|client code");
			setFromStorage("#messageDisplay", val, "messageDisplay", "[code|client code] - [error|message]")
		})

		$j('#saveOptions').on('click', saveOptions);
	}

	function getDefaultVal(obj, prop, def){
		if (typeof obj === 'undefined' || typeof obj[prop] === 'undefined' || obj[prop] === '')
			return def;
		else
			return obj[prop];
	}

	function saveOptions(){
		console.log("saved!");
		var matcher = $j('#watchPagePattern').val();
		var interval = $j("#refreshInterval").val();
		var codePattern = $j("#codePattern").val();
		var messageDisplay = $j("#messageDisplay").val();

		console.log(interval);
		if (matcher === '')
			matcher = "elmah.axd"
		
		chrome.storage.sync.set({"pageWatchPattern":matcher});
		chrome.storage.sync.set({"pageRefreshInterval":interval});
		chrome.storage.sync.set({"codePattern":codePattern});
		chrome.storage.sync.set({"messageDisplay":messageDisplay});
		$j("#saveOptions").fadeOut().fadeIn();
		return false;
	}

	function setFromStorage(id, obj, prop, def){
		var val = getDefaultVal(obj, prop, def);
		$j(id).val(val);
	}



	return {start:start};
})(jQuery.noConflict());

elmahWatcherOptions.start();