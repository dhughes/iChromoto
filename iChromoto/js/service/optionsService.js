
function OptionsService(){

	var defaults = {
		smallThumbnailSize: 200,
		largeThumbnailSize: 400,
		noSSL: false
	};

	// set any items missing in localstorage
	for(var key in defaults){
		if(localStorage.getItem(key) == null || localStorage.getItem(key) == undefined){
			localStorage.setItem(key, defaults[key]);
		}
	}

	this.setItem = function(item, value){
		localStorage.setItem(item, value);
	}

	this.getItem = function(item){
		return localStorage.getItem(item);
	}

}
