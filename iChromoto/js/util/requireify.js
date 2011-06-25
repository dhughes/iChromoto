requireify = {};
requireify.required = [];

require = function(scriptPath, callback){
	// have we already required this?
	for(var i = 0 ; i < requireify.required.length ; i++){
		if(requireify.required[i] == scriptPath){
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
	requireify.required[i] = scriptPath;
}
