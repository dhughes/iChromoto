eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/searchController.js",
			type: "SearchController",
			listeners: [
				{"search_updatedOmnibox": "search"},
				{"search_escapePressed": "closeSearch"},
				{"ui_blockUrlClicked": "showUrlBlockList"},
				{"ui_selectedItemToBlock": "blockItem"},
				{"ui_toggledPinnedUrl": "togglePinnedUrl"}
			]
		}
	]
}