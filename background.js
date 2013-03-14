var interval = 0;

function checkUrl(tabID, changeInfo, tab){
	if(changeInfo['status'] !== "complete")
		return;
	chrome.storage.sync.get(["pageWatchPattern", "pageRefreshInterval"], function(val){
		var pattern = '';

		//Have a default watch expression

		pattern = getDefaultVal(val, "pageWatchPattern", "elmah.axd");
		interval = parseInt(getDefaultVal(val, "pageRefreshInterval", 0),10);
		var re = new RegExp(pattern, "i");
		
		if (tab.url.toLowerCase().match(re))
			initWatchedPage(tabID);
	});
}

function getDefaultVal(obj, prop, def){
	if (typeof obj === 'undefined' || typeof obj[prop] === 'undefined' || obj[prop] === '')
		return def;
	else
		return obj[prop];
}

function initWatchedPage(tabID) {
	var port = chrome.tabs.connect(tabID, {name:'elmahWatcher'});
	chrome.tabs.executeScript(tabID, {file:'jquery-1.9.1.min.js'});
	chrome.tabs.executeScript(tabID, {file:'content_script.js'});
	chrome.pageAction.show(tabID);
}

function onConnect(port){
	message(port, "interval", interval, "all");
}

function message(port, name, value, target){
	port.postMessage({name:name, value:value, target:target});
}

chrome.tabs.onUpdated.addListener(checkUrl);
chrome.extension.onConnect.addListener(onConnect);