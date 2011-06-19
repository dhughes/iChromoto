eventify = new Eventify();
db = null;

$(document).ready(function(){
	getHistory();
});

getHistory = function(){
	dbTransaction(function(tx){
		tx.executeSql(
			"SELECT domain, dataUrl, max(visitdate) as visitdate, sum(visits) as totalvisits " +
			"FROM history as h JOIN content as c " +
				"ON h.url = c.url " +
			"GROUP BY domain " +
			"ORDER BY visitdate DESC",
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
	console.log(history);
	for(var i = 0 ; i < history.rows.length ; i++){
		var row = history.rows.item(i);
		showDomain(row);
	}
}

showDomain = function(data){
	var canvas = $("<canvas />");
	canvas.addClass("preview");
	var ctx = canvas[0].getContext('2d');

	// prepare an image
	var img = new Image();
	img.src = data.dataUrl;
	img.onload = function(){
		
		var width = event.srcElement.width;
		var height = event.srcElement.height;
		// is the image wider or taller?
		if(width >= height){
			console.log("wide");
			// wide - max dimension we WANT is the height
			var size = height;
			var offsetX = (width - size)/2;
			var offsetY = 0;
		} else {
			// tall - max dimension we WANT is the width
			console.log("tall");
			var size = width;
			var offsetY = (height - size)/2;
			var offsetX = 0;
		}

		// draw the image into the canvas
		console.log("w: " + width);
		console.log("h: " + height);
		console.log("offsetX: " + offsetX);
		console.log("offsetY: " + offsetY);
		console.log("size: " + size);

		ctx.drawImage(event.srcElement, offsetX, offsetY, size, size, 0, 0, 300, 150);
		$(document.body).append(canvas);

	};

}

eventify.listen("retreivedHistory", showHistory);