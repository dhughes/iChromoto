requireify = null;

function Requireify(){
	// make this a singleton!
	if(requireify != null){
		return requireify;
	}
	requireify = this;

	loaded = [];

	this.getLoaded = function(){
		return loaded;
	}

	this.require = function(scriptPaths, callback){
		var loadCount = 0;

		for(var x = 0 ; x < scriptPaths.length ; x++){
			loadScript(scriptPaths[x], function(){
				loadCount++;

				if(loadCount == scriptPaths.length){
					callback();
				}
			});
		}
	}

	loadScript = function(scriptPath, callback){
		// have we already required this?
		for(var i = 0 ; i < loaded.length ; i++){
			if(this.loaded[i] == scriptPath){
				// do nothing, we've already required this script
				callback();
				return;
			}
		}

		var node = document.getElementsByTagName("head")[0] || document.body;

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = scriptPath
		script.onload = callback;

		node.appendChild(script);
		this.loaded[i] = scriptPath;

	}


}



/*
requireify = {};
requireify.required = [];

require = function(scriptPaths, callback){

	var loadCount = 0;



	this.loaded = function(){
		loadCount++;

		if(loaded == scriptPaths.length){
			callback();
		}
	}


	for(var x = 0 ; x < scriptPaths.length ; x++){
		loadScript(scriptPaths[x]);
	}


}

loadScript = function(scriptPath, callback){
	// have we already required this?
	for(var i = 0 ; i < requireify.required.length ; i++){
		if(requireify.required[i] == scriptPath){
			// do nothing, we've already required this script
			loaded++
			if(loaded == scriptPaths.length){
				callback();
			}
			return;
		}
	}

	var node = document.getElementsByTagName("head")[0] || document.body;
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = scriptPath
	script.onload = callback;
	node.appendChild(script);
	requireify.required[i] = scriptPath;

}
		*/