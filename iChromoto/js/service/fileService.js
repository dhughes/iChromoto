

function FileService(){

	this.saveAsFile = function(dataURL, filename, callback){
		dataBlob = dataURItoBlob(dataURL);
		
		// get the filesystem
		window.requestFileSystem = window.webkitRequestFileSystem;

		// not sure what to put here for storage needs
		window.requestFileSystem(window.PERSISTENT, 5*1024*1024, function(fs){
			//console.log(filename);
			// I've got the file system, now get the file entry
			fs.root.getFile(filename, {create: true}, function(fileEntry) {
				// write to the file
				fileEntry.createWriter(function(fileWriter) {
					fileWriter.onwriteend = function(progressEvent) {
						callback(fileEntry.toURL());
					};
					fileWriter.onerror = fsErrorHandler;

					fileWriter.write(dataBlob);

				}, fsErrorHandler);
			}, fsErrorHandler);
		}, fsErrorHandler);
	}

	fsErrorHandler = function(e){
		console.log("Filesystem error");
		console.log(e);
	}

	// I totally stole this from somewebsite somewhere. Someone worked hard on this and deserves credit.
	// Thanks to that anonymous person!
	dataURItoBlob = function(dataURI) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
		else
			byteString = unescape(dataURI.split(',')[1]);

		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

		// write the bytes of the string to an ArrayBuffer
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		// write the ArrayBuffer to a blob, and you're done
		var bb = new window.WebKitBlobBuilder();
		bb.append(ab);
		return bb.getBlob(mimeString);
	}

}

