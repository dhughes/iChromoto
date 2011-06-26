function UiService(eventify){

	var body = $("body");

	this.showHistory = function(history){
		var lastDomain = "";
		for(var i = 0 ; i < history.rows.length ; i++){
			var row = history.rows.item(i);
			var first = false;
			if(lastDomain != row.domain){
				first = true;
				lastDomain = row.domain;
			}

			var previewContainer = $("<div />");
			previewContainer.addClass("previewContainer");
			previewContainer.addClass("small");
			previewContainer.mouseover(function(event){
				$(event.target).hide();
			});
			if(!first){
				previewContainer.addClass("behind");
			}

			var previewImageContainer = $("<div />");
			previewImageContainer.addClass("previewImageContainer");

			previewContainer.append(previewImageContainer);

			var previewImage = $("<img />");
			previewImage.addClass("previewImage");
			previewImage.attr("src", row.screenshotURL);

			previewContainer.append(previewImageContainer);
			previewContainer.append("<p>" + row.domain + "</p>");
			previewImageContainer.append(previewImage);
			previewImageContainer.append("&nbsp;");
			body.append(previewContainer);
		}

	}

}