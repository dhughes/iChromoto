// load eventify
new Requireify().require(["/js/util/eventify.js", "/js/search.js"], function(){
	// create an instance of eventify and tell it where to find its config
	eventify = new Eventify("/config/eventify.newtab.config.js");
});