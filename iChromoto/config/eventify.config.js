eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/backgroundController.js",
			type: "BackgroundController",
			listeners: [
				{"eventify_loaded": "addChromeListeners"},
				{"iChromoto_tabChanged": "takeScreenshot"},
				{"iChromoto_tookScreenshot": "resizeScreenshot"},
				{"iChromoto_tookScreenshot": "getBookmarkedStatus"},
				{"iChromoto_tookScreenshot": "getTabText"},
				{"iChromoto_screenshotScaled": "writeImageToDisk"},
				{"iChromoto_wroteFileToDisk": "prepareToPersist"},
				{"iChromoto_gotBookmarkedStatus": "prepareToPersist"},
				{"iChromoto_gotText": "prepareToPersist"}
			]
		}
	]
}