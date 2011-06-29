
function NewTabController(eventify){

	var clickTimer = null;
	var history = null;

	new Requireify().require([
		"/js/util/jquery-1.6.1.min.js",
		"/js/service/persistenceService.js",
		"/js/service/uiService.js"
	], function(){
		persistenceService = new PersistenceService();
		uiService = new UiService();

		// setup the back button
		$("#back").click(function(){
			eventify.raise("uiService_backClicked");
		});

		eventify.raise("newtab_documentReady");
	});

	this.getHistory = function(state){
		persistenceService.getHistory(function(result){
			console.log(result);
			history = result;
			eventify.raise("newtab_gotHistory", {}, state);
		});
	}

	this.showHistory = function(state){
		uiService.showHistory(history,
			// mousemove event
			function(offsetX, image, domainPreviewImages){
				eventify.raise("uiService_overPreviewImage", {offsetX: offsetX, image: image, domainPreviewImages: domainPreviewImages});
			},
			// mouseleave event
			function(image, previewImage){
				eventify.raise("uiService_leftPreviewImage", {image: image, previewImage: previewImage});
			},
			// click event
			function(domain){
				// start a timer to run the click event (.25 sec)
				if(clickTimer == null){
					clickTimer = setTimeout(function(){
						clickTimer = null;
						eventify.raise("uiService_previewImageClicked", {domain: domain});
					}, 200);
				}
			},
			// double click
			function(url){
				// cancel the timer (if it exists)
				if(clickTimer != null){
					clearTimeout(clickTimer);
				}
				eventify.raise("uiService_previewImageDoubleClicked", {url: url});
			}
		);
	}

	this.updatePreviewImage = function(state){
		uiService.updatePreviewImage(state.offsetX, state.image, state.domainPreviewImages);
	}

	this.resetPreviewImage = function(state){
		uiService.resetPreviewImage(state.image, state.previewImage);
	}

	this.showDomainHistory = function(state){
		uiService.showDomainHistory(state.domain,
			// preview clicked
			function(url){
				eventify.raise("uiService_domainPreviewImageClicked", {url: url});
			}
		);
	}

	this.goToUrl = function(state){
		location.href = state.url;
	}
}