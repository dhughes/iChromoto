
function NewTabController(eventify){

	new Requireify().require([
		"/js/util/jquery-1.6.1.min.js",
		"/js/service/persistenceService.js",
		"/js/service/uiService.js"
	], function(){
		persistenceService = new PersistenceService();
		uiService = new UiService();

		eventify.raise("newtab_documentReady");
	});

	this.getHistory = function(state){
		persistenceService.getHistory(function(result){
			eventify.raise("newtab_gotHistory", {history: result}, state);
		});
	}

	this.showHistory = function(state){
		uiService.showHistory(state.history);
	}

}