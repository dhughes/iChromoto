// load eventify
require("/js/util/eventify.js", function(){
	// create an instance of eventify and tell it where to find its config
	eventify = new Eventify("/config/eventify.config.js");
});



/*
require("/js/util/eventify.js");








// create our controller
controller = new BackgroundController();

events = {
	"loaded": [controller.addChromeListeners],
	"tabChanged": [controller.takeScreenshot],
	"tookScreenshot": [controller.collectTabData]
}

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo){

});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo.status == "complete" && tab != undefined){

	}
});

takeScreenshot = function(){
	chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataUrl){
		// quick! let's get the selected tab! (so the image gets associated with the correct url)
		chrome.tabs.getSelected(null, function(tab){
			eventify.raise();
		});
	});
}

collectTabData = function(){
	resizeScreenshot(dataUrl);
	getTabText(tab.id);
	getBookmarkedStatus(tab.url);
}

*/