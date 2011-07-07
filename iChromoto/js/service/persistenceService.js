
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
		m.migration(3, function(t){
			console.log("tryin #3");
			// add the fulldomain column
			t.executeSql(
				'ALTER TABLE history ' +
				'   ADD COLUMN fulldomain TEXT '
			);
			t.executeSql(
				// set the fulldomain column to the current domain column value
				'UPDATE history ' +
				'SET fulldomain = domain ',
				null,
				function(t, results){
					console.log("updated fulldomain column");
					t.executeSql(
						// get all the domain column values (so we can remove any subdomain from them)
						'SELECT DISTINCT domain FROM history',
						null,
						function(t, results){
							console.log("selected " + results.rows.length + " domains");
							// iterate over the domains and update each one
							for(var i = 0 ; i < results.rows.length ; i++){
								// remove the "sub" part of the domain
								var initialDomain = results.rows.item(i).domain;
								var domain = trimDomain(initialDomain);

								// update the database with the new domain value
								t.executeSql(
									'UPDATE history ' +
									'SET domain = ? ' +
									'WHERE domain = ? ',
									[domain, initialDomain]
								);
							}
						}
					);
				}
			);
		});
		m.migration(4, function(t){
			console.log("tryin #4");
			t.executeSql(
				'ALTER TABLE history ' +
				'   ADD COLUMN pinned INTEGER DEFAULT 0 '
			);

			t.executeSql(
				'CREATE TABLE domain(' +
				'   domain TEXT PRIMARY KEY, ' +
				'   pinned INTEGER DEFAULT 0  ) ',
				null,
				function(t, results){
					console.log("inserting domains");
					t.executeSql(
						'INSERT INTO domain ' +
						'SELECT DISTINCT domain, 0 FROM history '
					);
				}
			);

			t.executeSql(
				'CREATE TABLE fulldomain(' +
				'   fulldomain TEXT PRIMARY KEY, ' +
				'   domain TEXT, ' +
				'   pinned INTEGER DEFAULT 0  ) ',
				null,
				function(t, results){
					console.log("inserting full domains");
					t.executeSql(
						'INSERT INTO fulldomain ' +
						'SELECT DISTINCT fulldomain, domain, 0 FROM history '
					);
				}
			);
		});
		m.doIt(function(){
			inited = true;
		});
	}

	// note: I really don't like having this hidden down at the bottom of this file.
	new Requireify().require(["/js/util/migrator.js"], init);

	trimDomain = function(domain){
		var domain = domain.split(".");

		while(domain.length > 2){
			var removed = domain.shift();
			console.log("removed: " + removed);
		}
		return domain.join(".");
	}

	this.togglePinnedUrl = function(url){
		db.transaction(function(tx){
			tx.executeSql("UPDATE history SET pinned = CASE pinned WHEN 1 THEN 0 ELSE 1 END WHERE url = ?", [url]);
		});
	}

	this.togglePinnedDomain = function(domain, isFull){
		db.transaction(function(tx){
			if(isFull == "true"){
				tx.executeSql("UPDATE fulldomain SET pinned = CASE pinned WHEN 1 THEN 0 ELSE 1 END WHERE fulldomain = ?", [domain])
			} else {
				tx.executeSql("UPDATE domain SET pinned = CASE pinned WHEN 1 THEN 0 ELSE 1 END WHERE domain = ?", [domain])
			}
		});
	}

	this.checkIfExists = function(url, callback){
		db.transaction(function(tx){
			// let's see if we have a record for this url already
			tx.executeSql("SELECT * FROM history WHERE url = ?", [url], function(tx, results){
				callback(results.rows.length >= 1);
			});
		});
	}

	this.insert = function(url, fulldomain, title, screenshotURL, width, height, bookmarked, text, callback){
		// trim the domain down
		var domain = trimDomain(fulldomain);

		db.transaction(function(tx){
			tx.executeSql(
				"INSERT INTO history (url, domain, fulldomain, title, screenshotURL, width, height, bookmarked, visitdate, visits) " +
				"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[
					url,
					domain,
					fulldomain,
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
			// insert the domain
			tx.executeSql(
				"INSERT INTO domain (domain, pinned) " +
				"VALUES (?, 0)",
				[
					domain
				],
				log,
				log
			);
			// insert the domain
			tx.executeSql(
				"INSERT INTO fulldomain (fulldomain, domain, pinned) " +
				"VALUES (?, ?, 0)",
				[
					fulldomain,
					domain
				],
				log,
				log
			);
		});

		callback();
	}

	this.update = function(url, fulldomain, title, screenshotURL, width, height, bookmarked, text, callback){
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

	this.getHistory = function(groupByFulldomain, callback){

		db.transaction(function(tx){
			if(groupByFulldomain == "true"){
				tx.executeSql(
					"SELECT h1.fulldomain as domain, d.pinned as domainPinned, h1.pinned as urlPinned, h1.url, h1.screenshotURL, h1.width, h1.height, h1.bookmarked, date(h2.visitdate) as visitdate, h2.totalvisits " +
					"FROM history as h1 JOIN ( " +
					"	SELECT h1.fulldomain, max(h1.visitdate) as visitdate, sum(h1.visits) as totalvisits " +
					"	FROM history as h1 " +
					"	GROUP BY h1.fulldomain " +
					") as h2 " +
					"ON h1.fulldomain = h2.fulldomain " +
					"JOIN fulldomain as d " +
					"   ON h1.fulldomain = d.fulldomain " +
					"ORDER BY d.pinned DESC, h2.visitdate DESC",
					[],
					function(tx, result){
						console.log(result);
						callback(result);
					},
					log
				);
			} else {
				tx.executeSql(
					"SELECT h1.domain as domain, d.pinned as domainPinned, h1.pinned as urlPinned, h1.url, h1.screenshotURL, h1.width, h1.height, h1.bookmarked, date(h2.visitdate) as visitdate, h2.totalvisits " +
					"FROM history as h1 JOIN ( " +
					"	SELECT h1.domain, max(h1.visitdate) as visitdate, sum(h1.visits) as totalvisits " +
					"	FROM history as h1 " +
					"	GROUP BY h1.domain " +
					") as h2 " +
					"ON h1.domain = h2.domain " +
					"JOIN domain as d " +
					"   ON h1.domain = d.domain " +
					"ORDER BY d.pinned DESC, h2.visitdate DESC",
					[],
					function(tx, result){
						console.log(result);
						callback(result);
					},
					log
				);
			}
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

	log = function(){
		console.log(arguments);
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

