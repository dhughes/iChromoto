
function SearchController(eventify){

	var lastSearch = "";

	new Requireify().require([
		"/js/util/jquery-1.6.1.min.js",
		"/js/service/persistenceService.js",
		"/js/service/uiService.js"
	], function(){
		persistenceService = new PersistenceService();
		uiService = new UiService();

		$("#search").keydown(function(event){
			if(event.which == 27){
				eventify.raise("search_escapePressed");
			}
			console.log(event.which);
		});

		setInterval(function(){
			var hashPosition = document.location.href.search("#") + 1;
			if(lastSearch != document.location.href.substr(hashPosition)){
				lastSearch = document.location.href.substr(hashPosition);
				eventify.raise("search_updatedOmnibox", {search: lastSearch});
			}
		},
		100);
	});

	this.search = function(state){
		persistenceService.search(state.search, function(matches){
			uiService.showSearchResults(state.search, matches, function(url){
				location.href = url;
			});
		});
	}

	this.closeSearch = function(state){
		// send a message to the background
		chrome.extension.sendRequest({func: "removeSearch", args: []}, function(response) {
			//console.log(response.farewell);
		});
	}


}
