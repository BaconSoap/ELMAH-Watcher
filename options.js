var elmahWatcherOptions =
(function($j){
	
	var previous;
	function start(){
		$j(init);
	}

	function init(){
		chrome.storage.sync.get(['pageWatchPattern', 'pageRefreshInterval', 'codePattern', 'messageDisplay'], function(val){
			previous = val;
			loadAllFromObject(val);
		})

		$j('#saveOptions').on('click', saveOptions);
		$j("#getJson").on('click', getJson);
		$j("#readJson").on('click', readJson);
		$j("#resetToDefault").on('click', resetToDefault);
		$j("#resetToPrevious").on('click', resetToPrevious);
	}

	function loadAllFromObject(obj){
		setFromStorage("#watchPagePattern", obj, "pageWatchPattern", "elmah.axd");
		setFromStorage("#refreshInterval", obj, "pageRefreshInterval", 0);
		setFromStorage("#codePattern", obj, "codePattern", "code|client code");
		setFromStorage("#messageDisplay", obj, "messageDisplay", "[code|client code] - [error|message]")
	}

	function resetToDefault(){
		var obj = {};
		loadAllFromObject(obj);
	}

	function resetToPrevious(){
		loadAllFromObject(previous);
	}

	function getJson(){
		var obj = {};
		var matcher = $j('#watchPagePattern').val();
		var interval = $j("#refreshInterval").val();
		var codePattern = $j("#codePattern").val();
		var messageDisplay = $j("#messageDisplay").val();

		obj['pageWatchPattern'] = matcher;
		obj['pageRefreshInterval'] = interval;
		obj['codePattern'] = codePattern;
		obj['messageDisplay'] = messageDisplay;

		$j("#jsonArea").val(JSON.stringify(obj));
	}

	function readJson(){
		var obj = JSON.parse($j("#jsonArea").val());
		loadAllFromObject(obj);
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