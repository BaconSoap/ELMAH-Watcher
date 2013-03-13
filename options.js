document.addEventListener("DOMContentLoaded", function(){
	chrome.storage.sync.get('pageWatchPattern', function(val){
		var pattern = '';
		if (typeof val === 'undefined' || typeof val['pageWatchPattern'] === 'undefined' || val['pageWatchPattern'] === '')
			pattern = 'elmah.axd';
		else
			pattern = val['pageWatchPattern'];
		document.getElementById('watchPagePattern').value = pattern;

	})
	document.getElementById('saveOptions').addEventListener('click', function(){
		console.log("saved!");
		var matcher = document.getElementById('watchPagePattern').value;
		if (matcher === '')
			matcher = "elmah.axd"
		chrome.storage.sync.set({"pageWatchPattern":matcher});
		return false;
	});
});