eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/optionsController.js",
			type: "OptionsController",
			listeners: [
				{"options_changedSSL": "updateNoSSLSetting"},
				{"options_changedThumbnailSize": "updateThumbnailSettings"},
				{"options_changedDomainBlacklist": "updateDomainBlacklistSettings"},
				{"options_changedRegexBlacklist": "updateRegexBlacklistSettings"}
			]
		}
	]
}