
function BackgroundController(eventify){
	var imageService;
	
	require("/js/service/imageService.js", function(){
		imageService = new ImageService();
	});

	require("/js/service/fileService.js", function(){
		fileService = new FileService();
	});

	require("/js/service/persistenceService.js", function(){
		persistenceService = new PersistenceService();
	});

	require("/js/util/md5.js");

	this.addChromeListeners = function(state){
		chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo){
			eventify.raise("iChromoto_tabChanged", {tabId: tabId, windowId: selectInfo.windowId});
		});

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
			if(changeInfo.status == "complete" && tab != undefined){
				eventify.raise("iChromoto_tabChanged", {tabId: tabId, windowId: tab.windowId});
			}
		});
	}

	this.takeScreenshot = function(state){
		// is the current tabID the same as the tab that was changed?
		chrome.tabs.getSelected(state.windowId, function(tab){
			if(tab.url.substr(0, 6) != "chrome" && tab != undefined && tab.id == state.tabId){
				chrome.tabs.captureVisibleTab(state.windowId, {format: "png"}, function(dataUrl){
					eventify.raise("iChromoto_tookScreenshot", {screenshot: dataUrl, tab:tab});
				});
			} else if(tab.id != state.tabId){
				console.log("Skipped capture since tab is not what was expected.");
			}
		});
	}

	this.resizeScreenshot = function(state){
		imageService.scaleImage(state.screenshot, 500, function(thumbnail, width, height){
			eventify.raise("iChromoto_screenshotScaled", {thumbnail:thumbnail, width: width, height: height}, state);
		});
	}

	this.writeImageToDisk = function(state){
		// we're going to hash the url and use that as the filename
		var filename = b64_md5(state.tab.url).replace(/\W/, "_") + ".png";

		fileService.saveAsFile(state.thumbnail, filename, function(fileUrl){
			eventify.raise("iChromoto_wroteFileToDisk", {fileUrl: fileUrl}, state);
		});
	}

	this.getBookmarkedStatus = function(state){
		// search to see if this is a bookmarked page
		chrome.bookmarks.search(state.tab.url, function(results){
			var isBookMarked = (results.length >= 1);
			eventify.raise("iChromoto_gotBookmarkedStatus", {isBookMarked: isBookMarked}, state);
		});
	}

	this.getTabText = function(state){
		chrome.tabs.sendRequest(state.tab.id, {func: "requestText", args: []}, function(response){
			eventify.raise("iChromoto_gotText", {text: response}, state);
		});
	}

	this.prepareToPersist = function(state){
		// this function makes sure we have all the data we need to persist the screenshot and data details into the database
		
		if(state.fileUrl != undefined && state.isBookMarked != undefined && state.text != undefined){
			checkIfExists(state.tab.url, function(exists){
				console.log(exists);
			});
		}
	}


	// let's grab a bunch of data asyncronously
		//resizeScreenshot(state.screenshot);
		//getBookmarkedStatus(state.tab.url);
		//getTabText(state.tab.id);

}