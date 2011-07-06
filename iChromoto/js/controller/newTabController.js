
function NewTabController(eventify){

	var clickTimer = null;
	var history = null;

	new Requireify().require([
		"/js/util/jquery-1.6.1.min.js",
		"/js/service/persistenceService.js",
		"/js/service/fileService.js",
		"/js/service/optionsService.js",
		"/js/service/uiService.js",
		"/js/util/backgroundRequestHandler.js",
		"/js/displaySearch.js",
		"/js/util/jquery.contextMenu.js"
	], function(){
		persistenceService = new PersistenceService();
		optionsService = new OptionsService();
		uiService = new UiService(optionsService, persistenceService, new FileService());

		uiService.setupForm();

		chrome.management.onInstalled.addListener(function(){
			eventify.raise("ui_installedApp");
		});

		eventify.raise("newtab_documentReady");
	});

	this.togglePinnedUrl = function(state){
		persistenceService.togglePinnedUrl(state.url);
	}

	this.togglePinnedDomain = function(state){
		persistenceService.togglePinnedDomain(state.domain, optionsService.getItem("groupByFulldomain"));
	}
	
	this.addApps = function(state){
		chrome.management.getAll(function(info){
			uiService.addApps(info);
		});
	}

	this.openApp = function(state){
		chrome.management.launchApp(state.id);
	}

	this.appOptions = function(state){
		chrome.management.get(state.id, function(info){
			location.href = info.optionsUrl;
		});
	}

	this.uninstallApp = function(state){
		chrome.management.uninstall(state.id, function(){
			uiService.removeApp(state.id);
		});
	}

	this.getHistory = function(state){
		persistenceService.getHistory(optionsService.getItem("groupByFulldomain"), function(result){
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

	this.showDomainBlockList = function(state){
		uiService.showDomainBlockList(state.domain, state.position);
	}

	this.showUrlBlockList = function(state){
		uiService.showUrlBlockList(state.url, state.position);
	}

	this.blockItem = function(state){
		uiService.blockItem(state.type, state.value, state.srcTitle);
	}
}