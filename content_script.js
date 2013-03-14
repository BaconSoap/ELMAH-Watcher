jQuery.noConflict();

var elmahWatcher = (function($j){

	var port;
	var popupPort;
	var refresher = -1;
	var codePattern;
	var messageDisplay;
	var columnNameNumberMap = {};
	var tokenColumnMap = {};
	var enabled;
	var tabID;

	function start(){
		$j(init);
		webkitNotifications.requestPermission();
	}

	function init(){
		chrome.extension.onConnect.addListener(onConnect);
		port = chrome.extension.connect({name:"elmahWatcher"});
		port.onMessage.addListener(onMessage);
		chrome.storage.sync.get(["codePattern", "messageDisplay", "enabled" + location.href], function(val) {
			enabled = getDefaultVal(val, "enabled" + location.href, false);
			codePattern = getDefaultVal(val, "codePatetrn", "[code|client code]");
			messageDisplay = getDefaultVal(val, "messageDisplay", "[code|client code] - [error|message]");
			setupNameColumnMap();
			setupTokenColumnMap();
			checkRows();
		});
	}

	function setupNameColumnMap(){
		var table = $j("#ErrorLog");
		var columns = table.find("th");
		columnNameNumberMap = {};
		console.log(columns)
		columns.each(function(i, val){
			columnNameNumberMap[$j(val).text()] = i;
		});
		console.log(columnNameNumberMap)
	}

	function setupTokenColumnMap(){
		var matcher = new RegExp("(\\[[0-9a-zA-Z\\| ]+\\])", "gi");
		var tokens = messageDisplay.match(matcher);
		tokens.push(codePattern.match(matcher)[0]);
		console.log(tokens);
		for(var i in columnNameNumberMap){
			if (columnNameNumberMap.hasOwnProperty(i)){
				var name = i;
				for(var j = 0; j < tokens.length; j++){
					var token = tokens[j];
					
					var tokenMatcher = new RegExp(token.replace("[","").replace("]",""), "gi");
					if (name.match(tokenMatcher)){
						tokenColumnMap[token] = columnNameNumberMap[i];
					}

				}
			}
		}
		console.log(tokenColumnMap);
	}

	function checkRows(){
		chrome.storage.sync.get("latestErrorCode", function(val){
			var oldTopCode = getDefaultVal(val, "latestErrorCode", "there is no top code");
			var table = $j("#ErrorLog");
			var topRow = table.find(".odd-row, .even-row")[0];
			var codeColumn = tokenColumnMap[codePattern];
			
			var topCode = $j(topRow).find("td")[codeColumn].innerText;
			console.log(topCode)
			if (topCode !== oldTopCode){
				processNewTopCode(topRow, topCode);
			}

		});
	}

	function processNewTopCode(topRow, topCode){
		chrome.storage.sync.set({"latestErrorCode":topCode}, function(){
			var matcher = new RegExp("(\\[[0-9a-zA-Z\\| ]+\\])", "gi");
			var tokens = messageDisplay.match(matcher);
			var tokenValues = {};

			for (var i = 0; i < tokens.length; i++){
				tokenValues[tokens[i]] = tokenColumnMap[tokens[i]];
				
			}
			console.log(tokenValues);
			notify(topCode);
		});
	}

	function notify(msg){
		port.postMessage({name:'notify', 'value':msg});
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


	function getDefaultVal(obj, prop, def){
		if (typeof obj === 'undefined' || typeof obj[prop] === 'undefined' || obj[prop] === '')
			return def;
		else
			return obj[prop];
	}



	return {start:start};
})(jQuery.noConflict());

elmahWatcher.start();