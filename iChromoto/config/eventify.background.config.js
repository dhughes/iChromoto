eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/backgroundController.js",
			type: "BackgroundController",
			listeners: [
				{"eventify_loaded": "addChromeListeners"},
				{"background_tabChanged": "takeScreenshot"},
				{"background_tookScreenshot": "resizeScreenshot"},
				{"background_tookScreenshot": "getBookmarkedStatus"},
				{"background_tookScreenshot": "getTabText"},
				{"background_screenshotScaled": "writeImageToDisk"},
				{"background_wroteFileToDisk": "prepareToPersist"},
				{"background_gotBookmarkedStatus": "prepareToPersist"},
				{"background_gotText": "prepareToPersist"},
				{"background_readyToPersist": "persist"},
				{"background_omniboxChanged": "showSearchResults"}
			]
		}
	]
}