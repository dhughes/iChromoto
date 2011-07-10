eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/optionsController.js",
			type: "OptionsController",
			listeners: [
				{"options_changedSSL": "updateNoSSLSetting"},
				{"options_changedThumbnailSize": "updateThumbnailSettings"},
				{"options_changedDomainBlock": "updateDomainBlockSettings"},
				{"options_changedRegexBlock": "updateRegexBlockSettings"},
				{"options_changedShowWebStore": "updateShowWebStore"},
				{"options_changedShowAppsMenuWhenEmpty": "updateShowAppsMenuWhenEmpty"}
			]
		}
	]
}