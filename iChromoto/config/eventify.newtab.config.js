eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/newTabController.js",
			type: "NewTabController",
			listeners: [
				{"newtab_documentReady": "getHistory"},
				{"newtab_gotHistory": "showHistory"}
			]
		}
	]
}