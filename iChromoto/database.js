dbTransaction = function(handler){
	if(db == null){
		db = window.openDatabase("iChomoto", "", "iChomoto Database", 250 * 1024 * 1024);

		var m = new Migrator(db);
		m.migration(1, function(t){
			t.executeSql(
				'CREATE TABLE history(' +
				'   url TEXT PRIMARY KEY, ' +
				'   domain TEXT, ' +
				'   title TEXT, ' +
				'   dataUrl TEXT, ' +
				'   visitdate REAL, ' +
				'   visits INTEGER ) '
			);
		});
		m.migration(2, function(t){
			t.executeSql(
				'CREATE VIRTUAL TABLE content USING fts3(' +
				'   url TEXT PRIMARY KEY, ' +
				'   text TEXT ) '
			);
		});
		m.doIt(function(){
			db.transaction(handler);
		});
	} else {
		db.transaction(handler);
	}
}