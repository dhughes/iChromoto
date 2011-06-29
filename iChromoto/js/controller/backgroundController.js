
function BackgroundController(eventify){

	var disableScreenshots = false;

	new Requireify().require([
		"/js/service/imageService.js",
		"/js/service/fileService.js",
		"/js/service/persistenceService.js",
		"/js/util/md5.js"
	], function(){
		imageService = new ImageService();
		fileService = new FileService();
		persistenceService = new PersistenceService();
	});

	this.addChromeListeners = function(state){
		chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo){
			eventify.raise("background_tabChanged", {tabId: tabId, windowId: selectInfo.windowId});
		});

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
			if(changeInfo.status == "complete" && tab != undefined){
				eventify.raise("background_tabChanged", {tabId: tabId, windowId: tab.windowId});
			}
		});

		chrome.omnibox.onInputChanged.addListener(function(text){
			chrome.tabs.getSelected(state.windowId, function(tab){
				eventify.raise("background_omniboxChanged", {text: text, tab: tab});
			});
		});

		chrome.omnibox.onInputCancelled.addListener(function(){
			chrome.tabs.getSelected(state.windowId, function(tab){
				eventify.raise("background_omniboxCanceled", {tab: tab});
			});
		});

	}

	this.takeScreenshot = function(state){
		if(disableScreenshots){
			return;
		}
		// is the current tabID the same as the tab that was changed?
		chrome.tabs.getSelected(state.windowId, function(tab){
			//console.log("take screenshot!!!");
			if(tab.url.substr(0, 6) != "chrome" && tab != undefined && tab.id == state.tabId){
				chrome.tabs.captureVisibleTab(state.windowId, {format: "png"}, function(dataUrl){
					// double check that we're still on the tab we were on before
					eventify.raise("background_tookScreenshot", {screenshot: dataUrl, tab:tab});
				});
			} else if(tab.id != state.tabId){
				console.log("Skipped capture since tab is not what was expected.");
			}
		});
	}

	this.resizeScreenshot = function(state){
		imageService.scaleImage(state.screenshot, 500, function(thumbnail, width, height){
			eventify.raise("background_screenshotScaled", {thumbnail:thumbnail, width: width, height: height}, state);
		});
	}

	this.writeImageToDisk = function(state){
		// we're going to hash the url and use that as the filename
		var filename = b64_md5(state.tab.url).replace(/\W/g, "_") + ".png";

		chrome.tabs.getSelected(state.windowId, function(tabCheck){
			if(tabCheck.id = state.tab.id){
				fileService.saveAsFile(state.thumbnail, filename, function(fileUrl){
					eventify.raise("background_wroteFileToDisk", {fileUrl: fileUrl}, state);
				});
			} else {
				console.log("changed tab before screenshot was completed!");
			}
		});
	}

	this.getBookmarkedStatus = function(state){
		// search to see if this is a bookmarked page
		// state.tab.url
		chrome.bookmarks.getTree(function(results){
			var isBookMarked = searchBookmarks(results, state.tab.url);
			eventify.raise("background_gotBookmarkedStatus", {isBookMarked: isBookMarked}, state);
		});
	}

	// todo: factor this out of this controller.  I don't like this here
	searchBookmarks = function(bookmarkTreeNode, url){
		if(bookmarkTreeNode != undefined){
			for(var i = 0 ; i < bookmarkTreeNode.length ; i++){
				var node = bookmarkTreeNode[i];
				// does this url match?
				if((node.url != undefined && node.url == url) || searchBookmarks(node.children, url)){
					return true;
				}
			}
		}
		return false;
	}

	this.getTabText = function(state){
		chrome.tabs.sendRequest(state.tab.id, {func: "requestText", args: []}, function(response){
			eventify.raise("background_gotText", {text: response}, state);
		});
	}

	this.prepareToPersist = function(state){
		// this function makes sure we have all the data we need to persist the screenshot and data details into the database
		chrome.tabs.getSelected(state.windowId, function(tabCheck){
			if(tabCheck.id = state.tab.id){
				if(state.fileUrl != undefined && state.isBookMarked != undefined && state.text != undefined){
					persistenceService.checkIfExists(state.tab.url, function(exists){
						eventify.raise("background_readyToPersist", {exists: exists}, state);
					});
				}
			} else {
				console.log("changed tab before screenshot was completed!");
			}
		});

	}

	this.persist = function(state){

		if(!state.exists){
			//console.log("should insert");
			persistenceService.insert(state.tab.url, state.tab.url.split("/")[2], state.tab.title, state.fileUrl, state.width, state.height, state.isBookMarked, state.text, function(){
				//console.log("inserted!!");
			});
		} else {
			//console.log("should update");
			persistenceService.update(state.tab.url, state.tab.url.split("/")[2], state.tab.title, state.fileUrl, state.width, state.height, state.isBookMarked, state.text, function(){
				//console.log("updated!!");
			});
		}
	}

	this.showSearchResults = function(state){
		disableScreenshots = true;
		chrome.tabs.sendRequest(state.tab.id, {func: "displaySearch", args: [chrome.extension.getURL("/html/search.html") + "#" + state.text]});
	}

	this.hideSearch = function(state){
		chrome.tabs.sendRequest(state.tab.id, {func: "removeSearch", args: []});
		disableScreenshots = false;
	}

}