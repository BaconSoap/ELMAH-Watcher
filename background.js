function checkUrl(tabID, changeInfo, tab){
	if(changeInfo['status'] !== "complete")
		return;
	chrome.storage.sync.get(["pageWatchPattern", "pageRefreshInterval"], function(val){
		var pattern = '';
		var interval = 0;
		if (typeof val === 'undefined' || typeof val['pageWatchPattern'] === 'undefined' || val['pageWatchPattern'] === '')
			pattern = 'elmah.axd';
		else
			pattern = val["pageWatchPattern"];

		var re = new RegExp(pattern, "i")
		if (typeof val === 'undefined' || typeof val['pageRefreshInterval'] === 'undefined' || val['pageRefreshInterval'] === '')
			interval = 0;
		else
			interval = parseInt(val["pageRefreshInterval"],10);

		if (tab.url.toLowerCase().match(re)){
			chrome.tabs.executeScript(tabID, {file:'content_script.js'});
			chrome.pageAction.show(tabID);
			setTimeout(function(){
				chrome.extension.onMessage.addListener(onMessage);

				chrome.tabs.sendMessage(tabID, {interval:interval}, function(){})
			},500);

		}
	});
}

function onMessage(v){
	console.log('hhasfd');
}

chrome.tabs.onUpdated.removeListener(checkUrl);
chrome.tabs.onUpdated.addListener(checkUrl);