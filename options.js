var $j = jQuery.noConflict();

$j(function(){
	chrome.storage.sync.get(['pageWatchPattern', 'pageRefreshInterval'], function(val){
		var pattern = getDefaultVal(val, "pageWatchPattern", "elmah.axd")
		var interval = getDefaultVal(val, "pageRefreshInterval", 0);
		console.log(interval);
		$j('#watchPagePattern').val(pattern);
		$j("#refreshInterval").val(interval);

	})
	
	$j('#saveOptions').on('click', function(){
		console.log("saved!");
		var matcher = $j('#watchPagePattern').val();
		var interval = $j("#refreshInterval").val();
		console.log(interval);
		if (matcher === '')
			matcher = "elmah.axd"
		
		chrome.storage.sync.set({"pageWatchPattern":matcher});
		chrome.storage.sync.set({"pageRefreshInterval":interval});
		$j("#saveOptions").fadeOut();
		return false;
	});

	function getDefaultVal(obj, prop, def){
		if (typeof obj === 'undefined' || typeof obj[prop] === 'undefined' || obj[prop] === '')
			return def;
		else
			return obj[prop];
	}
});