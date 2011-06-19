// created by Max Aller <nanodeath@gmail.com>
function Migrator(db){
  var migrations = [];
  this.migration = function(number, func){
    migrations[number] = func;
  };

  var doMigration = function(number, func){
    if(migrations[number]){
      db.changeVersion(db.version, String(number), function(t){
        migrations[number](t);
      }, function(err){
        if(console.error) console.error("Error!: %o", err);
      }, function(){
        doMigration(number+1, func);
      });
    } else {
	    func();
    }
  };
	
  this.doIt = function(func){
    var initialVersion = parseInt(db.version) || 0;
    try {
      doMigration(initialVersion+1, func);
    } catch(e) {
      if(console.error) console.error(e);
    }
  }
}
