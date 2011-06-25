
function PersistenceService(){
	db = window.openDatabase("iChomoto", "", "iChomoto Database", 250 * 1024 * 1024);
	inited = false;

	init = function(){
		
		var m = new Migrator(db);
		m.migration(1, function(t){
			console.log("tryin #1");
			t.executeSql(
				'CREATE TABLE history(' +
				'   url TEXT PRIMARY KEY, ' +
				'   domain TEXT, ' +
				'   title TEXT, ' +
				'   screenshotURL TEXT, ' +
				'   width INTEGER, ' +
				'   height INTEGER, ' +
				'   bookmarked INTEGER, ' +
				'   visitdate REAL, ' +
				'   visits INTEGER ) '
			);
		});
		m.migration(2, function(t){
			console.log("tryin #2");
			t.executeSql(
				'CREATE VIRTUAL TABLE content USING fts3(' +
				'   url TEXT PRIMARY KEY, ' +
				'   text TEXT ) '
			);
		});
		m.doIt(function(){
			inited = true;
		});
	}

	// note: I really don't like having this hidden down at the bottom of this file.
	require("/js/util/migrator.js", init);

	this.checkIfExists = function(url, callback){
		db.transaction(function(tx){
			// let's see if we have a record for this url already
			tx.executeSql("SELECT * FROM history WHERE url = ?", [data.url], function(tx, results){
				callback(results.rows.length >= 1);
			});
		});
	}
}

