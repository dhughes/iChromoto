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

	// make an image to hold the dataUrl
	var img = document.createElement("img");
	img.src = dataUrl;
	img.onload = function(){
		var width = img.width;
		var height = img.height;

		//console.log("width " + width);
		//console.log("height " + height);

		// crop the screenshot to remove scroll bars

		// make a canvas slightly smaller than the screenshot
		var canvas = document.createElement("canvas");
		canvas.width = width - 16;
		canvas.height = height - 16;

		// draw the image into the canvas such that the canvas crops out the scroll bars
		var context = canvas.getContext("2d");
		context.drawImage(img, 0, 0);

		// reset the image's source to the new data
		var img2 = document.createElement("img");
		img2.src = canvas.toDataURL();
		img2.onload = function(){
			var width = img2.width;
			var height = img2.height;

			//console.log("width " + width);
			//console.log("height " + height);
			
			if(width >= height){
				// wide - max dimension we WANT is the height
				var scale = 300 / height;
			} else {
				// tall - max dimension we WANT is the width
				var scale = 300 / width;
			}

			var toWidth = Math.round(width * scale);
			var toHeight = Math.round(height * scale);

			//console.log("toWidth " +toWidth);
			//console.log("toheight " + toHeight);

			// resize the screenshot down to 400x400
			var canvas = document.createElement("canvas");
			canvas.width = toWidth;
			canvas.height = toHeight;

			var context = canvas.getContext("2d");
			context.drawImage(img2, 0, 0, toWidth, toHeight);

			dataUrl = canvas.toDataURL();

			var bookmarked = event.getValue("bookmarked");
			var content = event.getValue("content");

			var data = {
				url: tab.url,
				title: tab.title,
				dataUrl: dataUrl,
				width: toWidth,
				height: toHeight,
				domain: tab.url.split("/")[2],
				date: new Date(),
				bookmarked: bookmarked,
				content: content
			};

			writeHistory(data);
		}
	}


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
			"UPDATE history SET title = ?, dataUrl = ?, width = ?, height = ?, bookmarked = ?, visitdate = ?, visits = visits + 1 " +
			"WHERE url = ?",
			[
				data.title,
				data.dataUrl,
				data.width,
				data.height,
				data.bookmarked,
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
			"INSERT INTO history (url, domain, title, dataUrl, width, height, bookmarked, visitdate, visits) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				data.url,
				data.domain,
				data.title,
				data.dataUrl,
				data.width,
				data.height,
				data.bookmarked,
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

