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
		columns.each(function(i, val){
			columnNameNumberMap[$j(val).text()] = i;
		});
	}

	function setupTokenColumnMap(){
		var matcher = new RegExp("(\\[[0-9a-zA-Z\\| ]+\\])", "gi");
		var tokens = messageDisplay.match(matcher);
		tokens.push(codePattern.match(matcher)[0]);

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
	}

	function checkRows(){
		chrome.storage.sync.get("latestErrorCode" + location.href, function(val){
			var oldTopCode = val["latestErrorCode" + location.href];
			var table = $j("#ErrorLog");
			var topRow = table.find(".odd-row, .even-row")[0];
			var codeColumn = tokenColumnMap[codePattern];
			
			var topCode = $j(topRow).find("td")[codeColumn].innerText;

			if (topCode !== oldTopCode){
				processNewTopCode(topRow, topCode);
			}

		});
	}

	function processNewTopCode(topRow, topCode){
		var vals = {};
		vals["latestErrorCode" + location.href] = topCode;
		chrome.storage.sync.set(vals, function(){
			var matcher = new RegExp("(\\[[0-9a-zA-Z\\| ]+\\])", "gi");
			var tokens = messageDisplay.match(matcher);
			var tokenValues = {};
			var cells = $j(topRow).find("td");
			
			for (var i = 0; i < tokens.length; i++){
				var column = tokenColumnMap[tokens[i]];
				tokenValues[tokens[i]] = cells[column].innerText;
			}
			
			var message = messageDisplay;
			console.log(tokens);
			console.log(message);
			console.log(tokenValues);
			for(var i = 0; i < tokens.length; i++)
				message = message.replace(tokens[i], tokenValues[tokens[i]]);

			notify(message);
		});
	}

	function notify(msg){
		port.postMessage({name:'notify', 'value':msg});
	}

	function onPopupMessage(msg){

		if (msg.name === "interval"){
			var interval = msg.value;

			if (interval === 0){
				clearTimeout(refresher);
			} else {
				clearTimeout(refresher);
				refresher = setTimeout(function(){location.reload();}, interval*1000);
			}
		}

		if (msg.name === "filter"){
			console.log("new filter! " + msg.value);
		}
	}

	function onMessage(msg){
		if (msg.name === "interval"){
			chrome.storage.sync.get("enabled" + location.href, function(val){
				var enabled = val['enabled' + location.href];
				var interval = msg.value;

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