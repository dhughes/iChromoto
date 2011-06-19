eventify = new Eventify();
db = null;

handleTabLoaded = function(event){
	// check to see if this url is bookmarked
	var tab = event.getValue("tab");

	// search to see if this is a bookmarked page
	chrome.bookmarks.search(tab.url, function(results){
		event.setValue("bookmarked", (results.length >= 1));
		eventify.raise("bookmarkRetrieved", event.getAllValues());
	});
}

handleBookmarkStatus = function(event){
	// get the tab's text
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendRequest(tab.id, {}, function(response) {
			event.setValue("content", response);
			eventify.raise("retreivedText", event.getAllValues());
		});
	});
}

handleRetreivedText = function(event){
	// get a screenshot of the current tab
	chrome.tabs.captureVisibleTab(null,null,function(dataUrl){
		event.setValue("dataUrl", dataUrl);
		eventify.raise("capturedScreenshot", event.getAllValues());
	});
}

handleScreenshot = function(event){
	var tab = event.getValue("tab");
	var dataUrl = event.getValue("dataUrl");
	var bookmarked = event.getValue("bookmarked");
	var content = event.getValue("content");
	console.log(dataUrl);
	var data = {
		url: tab.url,
		title: tab.title,
		dataUrl: dataUrl,
		domain: tab.url.split("/")[2],
		date: new Date(),
		bookmarked: bookmarked,
		content: content
	};

	writeHistory(data);
}

writeHistory = function(data){
	// start a transaction.
	dbTransaction(function(tx){
		// let's see if we have a record for this url already
		tx.executeSql("SELECT * FROM history WHERE url = ?", [data.url], function(tx, results){
			eventify.raise("checkedHistoryExists", {
				data: data,
				tx: tx,
				exists: results.rows.length
			});
		});
	});
}

handleHistoryExists = function(event){
	var tx = event.getValue("tx");
	var data = event.getValue("data");

	console.log(event.getValue("exists"));
	if(event.getValue("exists")){
		console.log("update");
		// update the record
		tx.executeSql(
			"UPDATE history SET title = ?, dataUrl = ?, visitdate = ?, visits = visits + 1 " +
			"WHERE url = ?",
			[
				data.title,
				data.dataUrl,
				data.date,
				data.url
			],
			log,
			log
		);
		// update the content/text record
		tx.executeSql(
			"UPDATE content SET text = ? " +
			"WHERE url = ?",
			[
				data.content,
				data.url
			],
			log,
			log
		);
	} else {
		console.log("insert");
		// insert the record
		tx.executeSql(
			"INSERT INTO history (url, domain, title, dataUrl, visitdate, visits) " +
			"VALUES (?, ?, ?, ?, ?, ?)",
			[
				data.url,
				data.domain,
				data.title,
				data.dataUrl,
				data.date,
				1
			],
			log,
			log
		);
		// insert the text/content
		tx.executeSql(
			"INSERT INTO content (url, text) " +
			"VALUES (?, ?)",
			[
				data.url,
				data.content
			],
			log,
			log
		);

	}
}

// add listeners for specific events
eventify.listen("tabLoaded", handleTabLoaded);
eventify.listen("bookmarkRetrieved", handleBookmarkStatus);
eventify.listen("capturedScreenshot", handleScreenshot);
eventify.listen("checkedHistoryExists", handleHistoryExists);
eventify.listen("retreivedText", handleRetreivedText);

// listen for the chrome tab loaded event.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// see if the tab we're looking at has finished loading
	if(changeInfo.status == "complete" && tab != undefined){ 
		if(tab.url.substr(0, 6) != "chrome"){
			eventify.raise("tabLoaded", {
				tab: tab
			});
		}
	}
});

