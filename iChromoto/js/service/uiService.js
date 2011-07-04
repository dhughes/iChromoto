
function UiService(optionsService, persistenceService, fileService){

	var body = $("body");

	var previewImages = {};

	this.showHistory = function(history, mousemoveCallback, mouseresetCallback, clickCallback, doubleClickCallback){
		// actually remove the preview images from the dom
		$(".previewContainer, .blockMenu").remove();
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
				previewContainer.css("width", optionsService.getItem("smallThumbnailSize") + "px");
				previewContainer.css("height", optionsService.getItem("smallThumbnailSize") + "px");
				previewContainer.css("max-width", optionsService.getItem("smallThumbnailSize") + "px");
				previewContainer.css("max-height", optionsService.getItem("smallThumbnailSize") + "px");
				previewContainer.css("line-height", optionsService.getItem("smallThumbnailSize") + "px");

				if(i != 0 && newDay){
					previewContainer.addClass("newDay");
				}

				// this holds the container that will hold the image
				var previewImageContainer = $("<div />");
				previewImageContainer.addClass("previewImageContainer");
				previewImageContainer.css("line-height", optionsService.getItem("smallThumbnailSize") + "px");
				previewImageContainer.attr("title", row.domain);

				// add the preview image container to the preview container
				previewContainer.append(previewImageContainer);

				// add these things to the document
				previewContainer.append(previewImageContainer);
				previewContainer.append("<p>" + row.domain + "</p>");
				previewImageContainer.append(previewImage);
				previewImageContainer.append("&nbsp;");
				
				var block = $("<img />");
				block.attr("src", "/img/block.png");
				block.attr("class", "block");
				block.css("top", -((optionsService.getItem("smallThumbnailSize"))/2)+10) + "px";
				block.hover(function(){
					$(this).attr("src", "/img/blockOver.png");
				});
				block.mouseleave(function(){
					$(this).attr("src", "/img/block.png");
				});
				block.click(function(){
					eventify.raise("ui_blockDomainClicked", {
						domain: $(this).parent().attr("title"),
						position: $(this).offset()
					});
				});
				previewImageContainer.append(block);
								
				var pin = $("<img />");
				pin.attr("src", "/img/pin.png");
				pin.attr("class", "pin");
				pin.css("top", -(optionsService.getItem("smallThumbnailSize")/2)+10) + "px";
				pin.click(function(event){
					alert("pinned!!!!");
				})
				previewImageContainer.append(pin);

				body.append(previewContainer);
			}

			if(row.bookmarked == 1 && !bookmarked){
				bookmarked = true;
				var star = $("<img />");
				star.attr("src", "/img/star.png");
				star.attr("class", "bookmark");
				star.css("top", (optionsService.getItem("smallThumbnailSize")/2)-20) + "px";
				previewImageContainer.append(star);
			}
		}
	}

	this.showDomainHistory = function(domain, clickCallback){
		// actually remove the preview images from the dom
		$(".previewContainer, .blockMenu").remove();

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
			previewContainer.css("width", optionsService.getItem("largeThumbnailSize") + "px");
			previewContainer.css("height", optionsService.getItem("largeThumbnailSize") + "px");
			previewContainer.css("max-width", optionsService.getItem("largeThumbnailSize") + "px");
			previewContainer.css("max-height", optionsService.getItem("largeThumbnailSize") + "px");
			previewContainer.css("line-height", optionsService.getItem("largeThumbnailSize") + "px");

			// this holds the container that will hold the image
			var previewImageContainer = $("<div />");
			previewImageContainer.addClass("previewImageContainer");
			previewImageContainer.attr("title", images[i].url);
			previewImageContainer.css("line-height", optionsService.getItem("largeThumbnailSize") + "px");

			// add the preview image container to the preview container
			previewContainer.append(previewImageContainer);

			// add these things to the document
			previewContainer.append(previewImageContainer);
			previewContainer.append("<p>" + images[i].url + "</p>");
			previewImageContainer.append(previewImage);
			previewImageContainer.append("&nbsp;");

			var block = $("<img />");
			block.attr("src", "/img/block.png");
			block.attr("class", "block");
			block.css("top", -((optionsService.getItem("largeThumbnailSize"))/2)+10) + "px";
			block.hover(function(){
				$(this).attr("src", "/img/blockOver.png");
			});
			block.mouseleave(function(){
				$(this).attr("src", "/img/block.png");
			});
			block.click(function(){
				eventify.raise("ui_blockUrlClicked", {
					url: $(this).parent().attr("title"),
					position: $(this).offset()
				});
			});

			previewImageContainer.append(block);

			if(images[i].bookmarked == 1){
				var star = $("<img />");
				star.attr("src", "/img/star.png");
				star.attr("class", "bookmark");
				star.css("top", ((optionsService.getItem("largeThumbnailSize"))/2)-20) + "px";
				previewImageContainer.append(star);
			}

			body.append(previewContainer);
		}
		$("#toolbar div.center").text(domain);
		$("#toolbar").show();

		//var others = $(".previewContainer .previewImageContainer:not([title='" + domain + "'])");
		//others.parent(".previewContainer").fadeOut();
	}

	this.showSearchResults = function(search, results, clickCallback){
		$(".previewContainer, .blockMenu").remove();

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
			previewContainer.css("width", optionsService.getItem("largeThumbnailSize") + "px");
			previewContainer.css("height", optionsService.getItem("largeThumbnailSize") + "px");
			previewContainer.css("max-width", optionsService.getItem("largeThumbnailSize") + "px");
			previewContainer.css("max-height", optionsService.getItem("largeThumbnailSize") + "px");
			previewContainer.css("line-height", optionsService.getItem("largeThumbnailSize") + "px");

			// this is the container that will hold the image
			var previewImageContainer = $("<div />");
			previewImageContainer.addClass("previewImageContainer");
			previewImageContainer.attr("title", row.url);
			previewImageContainer.css("line-height", optionsService.getItem("largeThumbnailSize") + "px");

			// add the preview image container to the preview container
			previewContainer.append(previewImageContainer);

			// add these things to the document
			previewContainer.append(previewImageContainer);
			previewContainer.append("<p>" + row.domain + "</p>");
			previewContainer.append("<p class='snippet'>" + row.snippet + "</p>");

			previewImageContainer.append(previewImage);
			previewImageContainer.append("&nbsp;");

			var block = $("<img />");
			block.attr("src", "/img/block.png");
			block.attr("class", "block");
			block.css("top", -((optionsService.getItem("largeThumbnailSize"))/2)+10) + "px";
			block.hover(function(){
				$(this).attr("src", "/img/blockOver.png");
			});
			block.mouseleave(function(){
				$(this).attr("src", "/img/block.png");
			});
			block.click(function(){
				eventify.raise("ui_blockUrlClicked", {
					url: $(this).parent().attr("title"),
					position: $(this).offset()
				});
			});
			previewImageContainer.append(block);

			if(row.bookmarked == 1){
				var star = $("<img />");
				star.attr("src", "/img/star.png");
				star.attr("class", "bookmark");
				star.css("top", ((optionsService.getItem("largeThumbnailSize"))/2)-20) + "px";
				previewImageContainer.append(star);
			}

			body.append(previewContainer);
		}
	}

	this.updatePreviewImage = function(offsetX, image, domainPreviewImages){
		var percentOffset = offsetX/image.width();
		var index = Math.ceil(percentOffset * (domainPreviewImages.length))-1;
		console.log(index + " of " + domainPreviewImages.length);
		
		image.attr("src", domainPreviewImages[index].screenshotUrl);
		image.attr("title", domainPreviewImages[index].url);
	}

	this.resetPreviewImage = function(image, previewImage){
		image.attr("src", previewImage.screenshotUrl);
		image.attr("title", previewImage.url);
	}

	this.showDomainBlockList = function(domain, position){
		var list = [];

		list.push({
			type: "domain",
			value: domain
		});

		var domainElements = domain.split(".");

		while(domainElements.length-1){
			domainElements[0] = "*";
			// push this as is on to the list
			list.push({
				type: "domain",
				value: domainElements.join(".")
			});
			domainElements.shift();
		}

		showBlockMenu(list, position, domain);
	}

	this.showUrlBlockList = function(url, position){
		var list = [];

		list.push({
			type: "url",
			value: url
		});

		// get the url's domain
		var domain = url.split("/")[2];

		list.push({
			type: "domain",
			value: domain
		});

		var domainElements = domain.split(".");

		while(domainElements.length-1){
			domainElements[0] = "*";
			// push this as is on to the list
			list.push({
				type: "domain",
				value: domainElements.join(".")
			});
			domainElements.shift();
		}

		showBlockMenu(list, position, url);
	}

	showBlockMenu = function(list, position, srcTitle){
		$(".blockMenu").remove();
		
		var menu = $("<ul />");

		var item = $("<li><strong>Block:</strong></li>");
		menu.append(item);

		menu.addClass("blockMenu");
		for(var x = 0 ; x < list.length ; x++){
			var item = $("<li class='blockItem' title='" + list[x].type + "'>" + list[x].value + "</li>");
			item.click(function(){
				var type = $(this).attr("title");
				var value = $(this).text();
				eventify.raise("ui_selectedItemToBlock", {type: type, value: value, srcTitle: srcTitle});
			});
			menu.append(item);
		}

		menu.mouseleave(function(event){
			$(this).remove();
		});

		$(document.body).append(menu);
		menu.css("top", (position.top - 4) + "px");
		menu.css("left", (position.left - menu.width() + 12) + "px");
	}

	this.blockItem = function(type, value, srcTitle){

		if(type == "url"){
			// this is a regex block
			var regexBlock = optionsService.getItem("regexBlock").split("\n");

			// make our value into a regex
			regexBlock.push("^" + value.replace(/(\\|\.|\+|\*|\?|\^|\$|\[|\]|\(|\)|\||\{|\})/g, "\\$1") + "$");
			optionsService.setItem("regexBlock", regexBlock.join("\n"));

			persistenceService.deleteUrl(value, function(screenshotURL){
				// screenshotURL is just one file name as a string
				fileService.deleteFiles([screenshotURL]);
			});

		} else {
			// this is a domain block
			var domainBlock = optionsService.getItem("domainBlock").split("\n");
			domainBlock.push(value);
			optionsService.setItem("domainBlock", domainBlock.join("\n"));

			persistenceService.deleteDomain(value, function(screenshotURL){
				// screenshotURL is just one file name as a string
				fileService.deleteFiles(screenshotURL);
			});
		}



		$(".blockMenu").remove();
		$(".previewContainer .previewImageContainer[title='" + srcTitle + "']").parent().remove();
	}
}