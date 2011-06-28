eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/newTabController.js",
			type: "NewTabController",
			listeners: [
				{"newtab_documentReady": "getHistory"},
				{"newtab_gotHistory": "showHistory"},
				{"uiService_backClicked": "showHistory"},
				{"uiService_overPreviewImage": "updatePreviewImage"},
				{"uiService_leftPreviewImage": "resetPreviewImage"},
				{"uiService_previewImageClicked": "showDomainHistory"},
				{"uiService_previewImageDoubleClicked": "goToUrl"},
				{"uiService_domainPreviewImageClicked": "goToUrl"}
			]
		}
	]
}