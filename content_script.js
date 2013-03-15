jQuery.noConflict();

var elmahWatcher = (function($j){
	var DEBUG = false;
	var port;
	var popupPort;
	var refresher = -1;
	var codePattern;
	var messageDisplay;
	var columnNameNumberMap = {};
	var tokenColumnMap = {};
	var enabled;
	var tabID;
	var matcher = new RegExp("(@[0-9a-zA-Z\\| ]+@)", "gi");

	function start(){
		$j(init);
		webkitNotifications.requestPermission();
	}

	function init(){
		chrome.extension.onMessage.addListener(onMessage);
		chrome.extension.onConnect.addListener(onConnect);
		port = chrome.extension.connect({name:"elmahWatcher"});
		port.onMessage.addListener(onMessage);
		chrome.storage.sync.get(["codePattern", "messageDisplay", "enabled" + location.href], function(val) {
			enabled = getDefaultVal(val, "enabled" + location.href, false);
			codePattern = getDefaultVal(val, "codePatetrn", "@code|client code@");
			messageDisplay = getDefaultVal(val, "messageDisplay", "@code|client code@ - @error|message@");
			setupNameColumnMap();
			setupTokenColumnMap();
			checkRows();
		});
	}

	function setupNameColumnMap(){
		var table = $j("#ErrorLog");
		var columns = table.find("th");
		
		columns.each(function(i, val){
			columnNameNumberMap[$j(val).text()] = i;
		});
	}

	function addTokenColumns(str){
		var tokens = str.match(matcher);
		for(var i in columnNameNumberMap){
			if (columnNameNumberMap.hasOwnProperty(i)){
				var name = i;
				for(var j = 0; j < tokens.length; j++){
					var token = tokens[j];
					var tokenMatcher = new RegExp(token.replace("@","").replace("@",""), "gi");
					if (name.match(tokenMatcher)){
						tokenColumnMap[token] = columnNameNumberMap[i];
					}
				}
			}
		}
	}

	function setupTokenColumnMap(){
		addTokenColumns(messageDisplay);
		addTokenColumns(codePattern);
	}

	function checkRows(){
		chrome.storage.sync.get(["latestErrorCode" + location.href, 'filter' + location.href], function(val){
			var oldTopCode = val["latestErrorCode" + location.href];
			var filter = getDefaultVal(val, "filter" + location.href, "");

			var table = $j("#ErrorLog");
			
			var rows = table.find(".odd-row, .even-row");
			var topRow = runFilter($j(rows), filter);
			var codeColumn = tokenColumnMap[codePattern];

			var topCode = $j(topRow).find("td")[codeColumn].innerText;

			if (topCode !== oldTopCode || DEBUG){
				processNewTopCode(topRow, topCode);
			}

		});
	}

	function runFilter(rows, filter){
		if (filter === "")
			return rows[0];
		var expressions = filter.split("~~");
		
		//Add the column tokens
		$j.each(expressions, function(i,v){addTokenColumns(v)});
		
		for(var i = 0; i < expressions.length; i++){
			rows = filterRows(rows, FilterExpression(expressions[i]));
		}

		return rows[0]
	}

	function filterRows(rows, expression){
		//For each row:
		// Find the value of row[expression.columnToken]
		// does the value match against the RegExp of expression.valueMatcher?
		//  If so, add it to result set
		var results = [];
		var col = expression.columnToken;
		var valMatcher = new RegExp(expression.valueMatcher, "gi");
		rows.each(function(i,v){

			var val = $j(v).find('td')[tokenColumnMap[col]].innerText;
			if (val.match(valMatcher))
				results.push(v);
		});
		console.log(results);
		return $j(results);
	}

	function FilterExpression(expressionStr){
		var expression = {};
		var parts = expressionStr.split("~");
		return {columnToken:parts[0], valueMatcher: parts[1]};
	}

	function processNewTopCode(topRow, topCode){
		var vals = {};
		vals["latestErrorCode" + location.href] = topCode;
		chrome.storage.sync.set(vals, function(){
			var tokens = messageDisplay.match(matcher);
			var tokenValues = {};
			var cells = $j(topRow).find("td");

			for (var i = 0; i < tokens.length; i++){
				var column = tokenColumnMap[tokens[i]];
				tokenValues[tokens[i]] = cells[column].innerText;
			}
			
			var message = messageDisplay;

			for(var i = 0; i < tokens.length; i++)
				message = message.replace(tokens[i], tokenValues[tokens[i]]);

			notify(message,topCode);
		});
	}

	function notify(msg,topCode){
		port.postMessage({name:'notify', 'value':msg, 'matchedId': topCode});
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

		if (msg.name === "highlight")
			highlightRow(msg.value);
	}

	function highlightRow(code){
		var row = $j("tr:contains(" + code + ")");
		row.css("background-color", "#3B548C");
		row.css("color", "#E8DA78");
		row.find("a").css("color", "#D17C4A")
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