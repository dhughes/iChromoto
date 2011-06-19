handleTabLoaded = function(event){
	checkBookmarkedStatus(event.getValue("tab"));
}

handleBookmarkedStatus = function(event){
	getScreenshot();
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

	var data = {
		url: tab.url,
		title: tab.title,
		dataUrl: dataUrl,
		domain: tab.url.split("/")[2],
		date: new Date(),
		bookmarked: bookmarked
	};

	writeHistory(data);
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
			]
		);
	} else {
		console.log("insert");
		// insert the record
		tx.executeSql(
			"INSERT INTO history (url, domain, title, dataUrl, visitdate, visits)" +
			"VALUES (?, ?, ?, ?, ?, ?)",
			[
				data.url,
				data.domain,
				data.title,
				data.dataUrl,
				data.date,
				1
			]
		);

	}
}