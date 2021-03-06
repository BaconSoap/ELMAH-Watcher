jQuery.noConflict();
var elmahPopup = (function($j){
	var backgroundPort;
	var pagePort;
	var interval;
	var tabID;
	var loc;

	function start(){
		$j(init);
	}

	function init(){
		backgroundPort = chrome.extension.connect({name:"elmahWatcher"});
		backgroundPort.onMessage.addListener(onBackgroundMessage);
		
		initPopupPort();

		$j('#enableWatcher').change(checkboxChanged);
		$j("#helpLink").on('click', showHelp);
	}

	function showHelp(){
		chrome.tabs.create({'url': chrome.extension.getURL('help.html')}, function(tab) {
  		});
		return false;
	}

	function setupFilterWatcher(){
		chrome.storage.sync.get("filter" + loc, function(val){
			var start = val["filter" + loc];
			$j("#filter").val(start);
			var content = start;
			$j("#filter").keyup(function(){
				if ($j("#filter").val() !== content){
					content = $j("#filter").val();
					updateFilter(content);
				}
			});
		});
		
	}

	function updateFilter(content){
		var obj = {};
		obj['filter' + loc] = content;
		chrome.storage.sync.set(obj, function(){
			
		});
	}

	function initPopupPort(){
		chrome.tabs.getSelected(null, function(tab) {
        	tabID = tab.id;
        	pagePort = chrome.tabs.connect(tabID, {name:"popupToPage"});
        	pagePort.onMessage.addListener(onPageMessage);
        });
	}

	function checkboxChanged(){
		if (this.checked){
			messagePage("interval", interval);
		} else {
			messagePage("interval", 0);
		}

		var name = "enabled" + loc;
		console.log(name)
		console.log(this.checked);
		var obj = {};
		obj[name] = this.checked;
		chrome.storage.sync.set(obj, function(){console.log(chrome.runtime.lastError)});
	}


	function onPageMessage(msg){
		if (msg.name === "location"){
			loc = msg.value;
			chrome.storage.sync.get("enabled" + loc, function(val){
				var enabled = val['enabled'+loc];

				if (enabled === true){
					$j("#enableWatcher")[0].checked = true;
					messagePage("interval", interval);
				}
				setupFilterWatcher();
			});
		}
	}

	function onBackgroundMessage(msg){
		if (msg.name === "interval")
			interval = msg.value;
		
	}

	

	function message(name, value, target){
		backgroundPort.postMessage({name:name, value:value, target:target});
	}

	function messagePage(name,value){
		pagePort.postMessage({name:name, value:value});
	}

	return {start:start};
})(jQuery.noConflict());

elmahPopup.start();