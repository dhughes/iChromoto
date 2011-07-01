
function UiService(){

	var body = $("body");

	var previewImages = {};

	this.showSearchResults = function(search, results, clickCallback){
		$(".previewContainer").remove();
		
		for(var i = 0 ; i < results.rows.length ; i++){
			var row = results.rows.item(i);
			
			// we always show all search results

			// our image
			var previewImage = $("<img />");
			previewImage.addClass("previewImage");
			previewImage.attr("src", row.screenshotURL);
			previewImage.attr("title", row.url);

			previewImage.click(function(event){
				var image = $(event.target);
				var url = image.parent().attr("title");
				clickCallback(url);
			});

			// create the div that holds everything for this domain
			var previewContainer = $("<div />");
			previewContainer.addClass("previewContainer");
			previewContainer.addClass("wide");

			// this is the container that will hold the image
			var previewImageContainer = $("<div />");
			previewImageContainer.addClass("previewImageContainer");
			previewImageContainer.attr("title", row.url);

			// add the preview image container to the preview container
			previewContainer.append(previewImageContainer);

			// add these things to the document
			previewContainer.append(previewImageContainer);
			previewContainer.append("<p>" + row.domain + "</p>");
			previewContainer.append("<p class='snippet'>" + row.snippet + "</p>");

			previewImageContainer.append(previewImage);
			previewImageContainer.append("&nbsp;");
			
			if(row.bookmarked == 1){
				var star = $("<img />");
				star.attr("src", "/img/star.png");
				star.attr("class", "bookmark");
				previewImageContainer.append(star);
			}

			body.append(previewContainer);
		}
	}

	this.showHistory = function(history, mousemoveCallback, mouseresetCallback, clickCallback, doubleClickCallback){
		// actually remove the preview images from the dom
		$(".previewContainer").remove();
		$("#toolbar").hide();
		previewImages = {};
		
		var lastDomain = "";
		var lastDate = "";
		var bookmarked = false;
		for(var i = 0 ; i < history.rows.length ; i++){
			var row = history.rows.item(i);
			var first = false;

			if(!(row.domain in previewImages)){
				previewImages[row.domain] = [];
			}

			previewImages[row.domain].push({
				screenshotUrl: row.screenshotURL,
				url: row.url,
				bookmarked: row.bookmarked
			});

			// though we won't stick them all in the document yet
			var newDay = false;
			if(lastDomain != row.domain){

				if(row.visitdate != lastDate){
					var newDay = true;
					lastDate = row.visitdate;
					$(".previewContainer:last").addClass("lastDay");
				}

				console.log(row.visitdate);
				console.log(lastDate);

				bookmarked = false;
				first = true;
				lastDomain = row.domain;

				// our image
				var previewImage = $("<img />");
				previewImage.addClass("previewImage");
				previewImage.attr("src", row.screenshotURL);
				previewImage.attr("title", row.url);
				previewImage.mousemove(function(event){
					var image = $(event.target);
					var container = image.parent();
					var domain = container.attr("title");
					var domainPreviewImages = previewImages[domain];
					mousemoveCallback(event.offsetX, image, domainPreviewImages);
				});
				previewImage.mouseleave(function(event){
					var image = $(event.target);
					var container = image.parent();
					var domain = container.attr("title");
					var domainPreviewImages = previewImages[domain];
					mouseresetCallback(image, domainPreviewImages[0]);
				});
				previewImage.mouseup(function(event){
					var image = $(event.target);
					var domain = image.parent().attr("title");
					clickCallback(domain);
				});
				previewImage.dblclick(function(event){
					var image = $(event.target);
					var url = image.attr("title");
					doubleClickCallback(url);
				});

				// create the div that holds everything for this domain
				var previewContainer = $("<div />");
				previewContainer.addClass("previewContainer");
				previewContainer.addClass("small");
				if(i != 0 && newDay){
					previewContainer.addClass("newDay");
				}

				// this holds the container that will hold the image
				var previewImageContainer = $("<div />");
				previewImageContainer.addClass("previewImageContainer");
				previewImageContainer.attr("title", row.domain);

				// add the preview image container to the preview container
				previewContainer.append(previewImageContainer);

				// add these things to the document
				previewContainer.append(previewImageContainer);
				previewContainer.append("<p>" + row.domain + "</p>");
				previewImageContainer.append(previewImage);
				previewImageContainer.append("&nbsp;");

				body.append(previewContainer);
			}

			if(row.bookmarked == 1 && !bookmarked){
				bookmarked = true;
				var star = $("<img />");
				star.attr("src", "/img/star.png");
				star.attr("class", "bookmark");
				previewImageContainer.append(star);
			}
		}
	}

	this.showDomainHistory = function(domain, clickCallback){
		// actually remove the preview images from the dom
		$(".previewContainer").remove();

		// get the set of thumbnails for this domain
		var images = previewImages[domain];
		
		for(var i = 0 ; i < images.length ; i++){
			// our image
			var previewImage = $("<img />");
			previewImage.addClass("previewImage");
			previewImage.attr("src", images[i].screenshotUrl);
			previewImage.attr("title", images[i].url);
			previewImage.click(function(){
				var image = $(event.target);
				var url = image.parent().attr("title");
				clickCallback(url);
			});
			// create the div that holds everything for this url
			var previewContainer = $("<div />");
			previewContainer.addClass("previewContainer");
			previewContainer.addClass("wide");

			// this holds the container that will hold the image
			var previewImageContainer = $("<div />");
			previewImageContainer.addClass("previewImageContainer");
			previewImageContainer.attr("title", images[i].url);

			// add the preview image container to the preview container
			previewContainer.append(previewImageContainer);

			// add these things to the document
			previewContainer.append(previewImageContainer);
			previewContainer.append("<p>" + images[i].url + "</p>");
			previewImageContainer.append(previewImage);
			previewImageContainer.append("&nbsp;");
			
			if(images[i].bookmarked == 1){
				var star = $("<img />");
				star.attr("src", "/img/star.png");
				star.attr("class", "bookmark");
				previewImageContainer.append(star);
			}

			body.append(previewContainer);
		}
		$("#toolbar div.center").text(domain);
		$("#toolbar").show();

		//var others = $(".previewContainer .previewImageContainer:not([title='" + domain + "'])");
		//others.parent(".previewContainer").fadeOut();
	}

	this.updatePreviewImage = function(offsetX, image, domainPreviewImages){
		var percentOffset = offsetX/image.width();
		var index = Math.ceil(percentOffset * (domainPreviewImages.length-1));
		image.attr("src", domainPreviewImages[index].screenshotUrl);
		image.attr("title", domainPreviewImages[index].url);
	}

	this.resetPreviewImage = function(image, previewImage){
		image.attr("src", previewImage.screenshotUrl);
		image.attr("title", previewImage.url);
	}
}