eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/searchController.js",
			type: "SearchController",
			listeners: [
				{"search_updatedOmnibox": "search"}
			]
		}
	]
}