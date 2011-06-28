
function ImageService(){

	this.scaleImage = function(image, maxDimension, callback){
		// make an html image to hold the image to scale
		var img = document.createElement("img");
		img.src = image;
		img.onload = function(){
			var width = img.width;
			var height = img.height;

			// crop the screenshot to remove scroll bars

			// make a canvas slightly smaller than the screenshot
			var canvas = document.createElement("canvas");
			canvas.width = width - 16;
			canvas.height = height - 16;

			// draw the image into the canvas such that the canvas crops out the scroll bars
			var context = canvas.getContext("2d");
			context.drawImage(img, 0, 0);

			// reset the image's source to the new data
			var img2 = document.createElement("img");
			img2.src = canvas.toDataURL();
			img2.onload = function(){
				var width = img2.width;
				var height = img2.height;

				if(width >= height && width > maxDimension){
					var scale = maxDimension / width;
				} else if(height > maxDimension) {
					var scale = maxDimension / height;
				} else {
					// no scaling needed, it's already small
					callback(image);
					return;
				}

				var toWidth = Math.round(width * scale);
				var toHeight = Math.round(height * scale);

				// resize the screenshot 
				var canvas = document.createElement("canvas");
				canvas.width = toWidth;
				canvas.height = toHeight;

				var context = canvas.getContext("2d");
				context.drawImage(img2, 0, 0, toWidth, toHeight);

				callback(canvas.toDataURL(), toWidth, toHeight);
			}
		}

	}

}