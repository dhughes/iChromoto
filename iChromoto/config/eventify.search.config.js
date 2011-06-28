eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/searchController.js",
			type: "SearchController",
			listeners: [
				{"eventify_loaded": "addChromeListeners"}
			]
		}
	]
}