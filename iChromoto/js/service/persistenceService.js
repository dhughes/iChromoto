
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
	new Requireify().require(["/js/util/migrator.js"], init);

	this.checkIfExists = function(url, callback){
		db.transaction(function(tx){
			// let's see if we have a record for this url already
			tx.executeSql("SELECT * FROM history WHERE url = ?", [url], function(tx, results){
				callback(results.rows.length >= 1);
			});
		});
	}

	this.insert = function(url, domain, title, screenshotURL, width, height, bookmarked, text, callback){
		db.transaction(function(tx){
			tx.executeSql(
				"INSERT INTO history (url, domain, title, screenshotURL, width, height, bookmarked, visitdate, visits) " +
				"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[
					url,
					domain,
					title,
					screenshotURL,
					width,
					height,
					bookmarked ? 1 : 0,
					now(),
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
					url,
					text
				],
				log,
				log
			);
		});

		callback();
	}

	this.update = function(url, domain, title, screenshotURL, width, height, bookmarked, text, callback){
		db.transaction(function(tx){
			// update the record
			tx.executeSql(
				"UPDATE history SET title = ?, screenshotURL = ?, width = ?, height = ?, bookmarked = ?, visitdate = ?, visits = visits + 1 " +
				"WHERE url = ?",
				[
					title,
					screenshotURL,
					width,
					height,
					bookmarked ? 1 : 0,
					now(),
					url
				],
				log,
				log
			);
			// update the content/text record
			tx.executeSql(
				"UPDATE content SET text = ? " +
				"WHERE url = ?",
				[
					text,
					url
				],
				log,
				log
			);
		});
		
		callback();
	}

	this.getHistory = function(callback){
		db.transaction(function(tx){
			tx.executeSql(
				"SELECT h1.domain, h1.url, h1.screenshotURL, h1.width, h1.height, h1.bookmarked, date(h2.visitdate) as visitdate, h2.totalvisits " +
				"FROM history as h1 JOIN ( " +
				"	SELECT h1.domain, max(h1.visitdate) as visitdate, sum(h1.visits) as totalvisits " +
				"	FROM history as h1 " +
				"	GROUP BY h1.domain " +
				") as h2 " +
				"ON h1.domain = h2.domain " +
				"ORDER BY h2.visitdate DESC",
				[],
				function(tx, result){
					console.log(result);
					callback(result);
				},
				log
			);
		});
	}

	this.search = function(text, callback){
		db.transaction(function(tx){
			tx.executeSql(
				"SELECT snippet(content, '<b>', '</b>', '<b>...</b>', 1, 2) as snippet, h.* " +
				"FROM content as c JOIN history as h " +
				"   on c.url = h.url " +
				"WHERE content MATCH ?",
				[text],
				function(tx, result){
					callback(result);
				},
				log
			);
		});
	}

	this.deleteUrl = function(url, callback){

		db.transaction(function(tx){
			// find the image file name for the url we're deleting
			tx.executeSql(
				"SELECT screenshotURL " +
				"FROM history " +
				"WHERE url = ?",
				[url],
				function(tx, result){
					// get the screenshot url
					var screenshotURL = result.rows.item(0).screenshotURL;

					// delete this row from the DB
					tx.executeSql(
						"DELETE FROM history " +
						"WHERE url = ?",
						[url],
						function(tx, result){
							callback(screenshotURL.split("/").pop());
						},
						log
					);
				},
				log
			);


		});
	}

	this.deleteDomain = function(domain, callback){
		db.transaction(function(tx){
			// find all image files for the url we're deleting
			tx.executeSql(
				"SELECT screenshotURL " +
				"FROM history " +
				"WHERE domain GLOB ? ",
				[domain],
				function(tx, result){
					// create an array of screenshotURLs to return
					var screenshotURLs = [];
					for(var i = 0 ; i < result.rows.length ; i++){
						screenshotURLs.push(result.rows.item(i).screenshotURL.split("/").pop());
					}

					// delete this domain from the DB
					tx.executeSql(
						"DELETE FROM history " +
						"WHERE domain GLOB ? ",
						[domain],
						function(tx, result){
							callback(screenshotURLs);
						},
						log
					);
				},
				log
			);


		});
	}

	log = function(msg){
		//console.log(msg);
	}

	now = function(){
		var date = new Date();
		//alert(zeroPad(date.getMonth()+1,2));
		return date.getFullYear() + "-" + zeroPad(date.getMonth()+1,2) + "-" + zeroPad(date.getDate(), 2) + " " + zeroPad(date.getHours(), 2) + ":" + zeroPad(date.getMinutes(),2) + ":" + zeroPad(date.getSeconds(),2)
	}

	zeroPad = function(num,count){
		var numZeropad = num + '';
		while(numZeropad.length < count) {
			numZeropad = "0" + numZeropad;
		}
		return numZeropad;
	}
}

