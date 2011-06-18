db = null;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// see if the tab we're looking at has finished loading
	if(changeInfo.status == "complete"){
		// get a screenshot of this tab
		chrome.tabs.captureVisibleTab(null,null,function(dataUrl){
			if(dataUrl != undefined){
				var db = getDatabase();

				// check to see if this url is bookmarked
				chrome.bookmarks.search(tab.url, function(results){
					var data = {
						url: tab.url,
						title: tab.title,
						dataUrl: dataUrl,
						domain: tab.url.split("/")[2],
						date: new Date(),
						bookmarked: (results.length >= 1)
					};

					// persist this history item
					writeHistory(data);

				});
			}

		});
	}
});

getDatabase = function(){
	if(db == null){
		db =  window.openDatabase("iChomoto", "0.1", "iChomoto Database", 250 * 1024 * 1024);

		db.transaction(function(tx){
			tx.executeSql(
				'CREATE TABLE IF NOT EXISTS history(' +
				'   url TEXT PRIMARY KEY, ' +
				'   domain TEXT, ' +
				'   title TEXT, ' +
				'   dataUrl TEXT, ' +
				'   visitdate REAL, ' +
				'   visits INTEGER ) ',
				function(tx, result){
					console.log("created new db");
				},
				function(tx, error){
					console.log(error);
				}
			);

		});
	}

	return db;
}

writeHistory = function(data, callback){
	console.log(data);
	var db = getDatabase();
	
	db.transaction(function(tx){
		// let's first try to update this badboy
		tx.executeSql(
			'UPDATE history ' +
			'SET domain = ?, ' +
			'   title = ?, ' +
			'   dataUrl = ?, ' +
			'   visitdate = datetime(\'now\'),' +
			'   visits = visits + 1 ' +
			'WHERE url = ?',
			[
				data.domain,
				data.title,
				data.dataUrl,
				data.url
			],
			function(tx, result){
				if(!results.rowsAffected){
					console.log("no rows affected");
				} else {

					console.log("things were did!");
				}

				// return the first match
				//callback(results.rows.item(0));
			},
			function(){
				console.log(arguments);
			}

		)
	});
}
