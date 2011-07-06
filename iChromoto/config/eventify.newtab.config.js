eventifyConfig = {
	controllers: [
		{
			src: "/js/controller/newTabController.js",
			type: "NewTabController",
			listeners: [
				{"newtab_documentReady": "getHistory"},
				{"newtab_documentReady": "addApps"},
				{"ui_installedApp": "addApps"},
				{"newtab_gotHistory": "showHistory"},
				{"uiService_backClicked": "showHistory"},
				{"uiService_overPreviewImage": "updatePreviewImage"},
				{"uiService_leftPreviewImage": "resetPreviewImage"},
				{"uiService_previewImageClicked": "showDomainHistory"},
				{"uiService_previewImageDoubleClicked": "goToUrl"},
				{"uiService_domainPreviewImageClicked": "goToUrl"},
				{"ui_blockUrlClicked": "showUrlBlockList"},
				{"ui_blockDomainClicked": "showDomainBlockList"},
				{"ui_selectedItemToBlock": "blockItem"},
				{"ui_clickedAppIcon": "openApp"},
				{"ui_appContextOpenApp": "openApp"},
				{"ui_appContextOptions": "appOptions"},
				{"ui_appContextUninstall": "uninstallApp"},
				{"ui_toggledPinnedDomain": "togglePinnedDomain"},
				{"ui_toggledPinnedUrl": "togglePinnedUrl"}

			]
		}
	]
}