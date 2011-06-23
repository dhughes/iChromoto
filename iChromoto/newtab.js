eventify = new Eventify();
db = null;
previews = {};

$(document).ready(function(){
	getHistory();
});

getHistory = function(){
	dbTransaction(function(tx){
		tx.executeSql(
			"SELECT h1.domain, h1.url, h1.dataUrl, h1.width, h1.height, h1.bookmarked, h2.visitdate, h2.totalvisits " +
			"FROM history as h1 JOIN ( " +
			"	SELECT h1.domain, max(h1.visitdate) as visitdate, sum(h1.visits) as totalvisits " +
			"	FROM history as h1 " +
			"	GROUP BY h1.domain " +
			") as h2 " +
			"ON h1.domain = h2.domain " +
			"ORDER BY h2.visitdate DESC, h1.visitdate DESC ",
			[],
			function(tx, result){
				eventify.raise("retreivedHistory", {history: result, tx: tx});
			},
			log
		);
	});
}

showHistory = function(event){
	var history = event.getValue("history");

	var lastDomain = "";
	for(var i = 0 ; i < history.rows.length ; i++){
		var row = history.rows.item(i);
		
		if(row.domain != lastDomain){
			previews[row.domain] = [];
			showDomain(row);
			lastDomain = row.domain;
		}

		var img = $("<img src='" + row.dataUrl + "' />");

		img.attr("src", row.dataUrl);

		if(row["width"] >= row["height"]){
			img.addClass("wideDetail");
		} else {
			img.addClass("tallDetail");
		}
		
		previews[row.domain].push({
			row: row,
			img: img
		});
	}
}

hoverDomain = function(event){
	//console.log("enter");
	var preview = $(event.currentTarget);
	var snapshot = preview.children("img.snapshot");
	var thumb = preview.children("img.thumb");
	snapshot.show();
	thumb.hide();

	setImage(event.offsetX, snapshot, previews[preview.attr("title")]);

}

endHoverDomain = function(event){
	console.log("exit");
	var preview = $(event.currentTarget);
	var snapshot = preview.children("img.snapshot");
	var thumb = preview.children("img.thumb");
	
	thumb.show();
	snapshot.hide();
}

moveOverDomain = function(event){
	var preview = $(event.currentTarget);
	var snapshot = preview.children("img.snapshot");
	setImage(event.offsetX, snapshot, previews[preview.attr("title")]);
}

setImage = function(offsetX, snapshot, snapshots){
	// figure out the percent we are from the left
	var percentFromLeft = offsetX/150;

	// how many items we have in this domain
	var count = snapshots.length;

	// get our index
	var index = Math.ceil(count * percentFromLeft) - 1;

	if(index < 0){
		index = 0;
	}
	try{
		snapshots[index].row.dataUrl
	}catch(e){
		return;
	}

	if(snapshot.attr("src") != snapshots[index].row.dataUrl){
		// set the url
		snapshot.attr("title", snapshots[index].row.url);

		// set the source
		snapshot.load(function(){
			var width = snapshots[index].row.width;
			var height = snapshots[index].row.height;

			if(width >= height){
				// scale to width
				snapshot.removeClass("tall");
				snapshot.addClass("wide");
				// what's the percentage we're scaling by?
				var scale = 150 / width;

				//get the offsets
				var offsetY = Math.round((150 - (height * scale))/2);
				var offsetX = 0;
			} else {
				snapshot.removeClass("wide");
				snapshot.addClass("tall");
			}

			// set the offsets
			snapshot.css("margin-left", offsetX + "px");
			snapshot.css("margin-top", offsetY + "px");
		});
		snapshot.attr("src", snapshots[index].row.dataUrl);
	}
}


showDomain = function(data){
	// create the over-all container
	var previewContainer = $("<div />");
	previewContainer.addClass("previewContainer");

	// create the div to hold the preview image
	var preview = $("<div />");
	preview.addClass("preview");
	preview.attr("title", data.domain);
	preview.hover(hoverDomain, endHoverDomain);
	previewContainer.append(preview);

	// create the preview image
	var previewImage = $("<img class='thumb' />");
	previewImage.attr("src", data.dataUrl);
	previewImage.load(function(){
		var width = previewImage.width();
		var height = previewImage.height();
		if(width >= height){
			var toHeight = 150;
			var toWidth = width * 0.5;
			var offsetX = (150 - toWidth) / 2;
			var offsetY = 0;
		} else {
			var toWidth = 150;
			var toHeigth = height * 0.5;
			var offsetX = 0;
			var offsetY = (150 - toHeight) / 2;
		}
		previewImage.attr("width", toWidth);
		previewImage.attr("height", toHeight);
	});
	preview.append(previewImage);
	preview.dblclick(gotoUrl);
	preview.click(showDomainDetail);

	var snapshot = $("<img class='snapshot' />");
	preview.mousemove(moveOverDomain);
	preview.append(snapshot);

	// add the domain name
	var domain = $("<div><a href='http://" + data.domain +"'>" + data.domain + "</a></div>");
	previewContainer.append(domain);

	$("#previewImages").append(previewContainer);
	$("#details").hide();
}

showDomainDetail = function(event){
	if(event.srcElement.tagName == "IMG"){
		var snapshot = $(event.srcElement);
		var preview = snapshot.parent();
	} else {
		var preview = $(event.srcElement);
		var snapshot = preview.children("img");
	}
	$("body").addClass("details");

	var previewImages = $("#previewImages");
	var detail = $("#details");
	detail.empty();
	
	var rowSet = previews[preview.attr("title")];
	
	for(var i = 0 ; i < rowSet.length ; i++){
		var div = $("<div class='detailContainer' />");
		var a = $("<a href='" + rowSet[i].row.url + "' />");
		var img = rowSet[i].img;
		var url = $("<div><a href=" + rowSet[i].row.url +"'>" + rowSet[i].row.url + "</a></div>");
		a.append(img);
		div.append(a);
		div.append(url);

		// get the class from the image
		var className = img.attr("class");
	
		if(className == "wideDetail"){
			var scale = 300 / rowSet[i].row.width;
			var offsetY = Math.round((300 - (rowSet[i].row.height * scale))/2) + 20;
			img.css("margin-top", offsetY + "px");
		}

		detail.append(div);
	}

	detail.show();
	previewImages.hide();
}

gotoUrl = function(event){
	var snapshot = $(event.srcElement);
	location.href = snapshot.attr("title");
}

eventify.listen("retreivedHistory", showHistory);