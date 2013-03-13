function checkUrl(tabID, changeInfo, tab){
	chrome.storage.sync.get("pageWatchPattern", function(val){
		console.log(val);
		var pattern = val["pageWatchPattern"];
		console.log(pattern);
		var re = new RegExp(pattern, "i")
		if (tab.url.toLowerCase().match(re)){
			chrome.pageAction.show(tabID);
		}
	});
}

chrome.tabs.onUpdated.addListener(checkUrl);