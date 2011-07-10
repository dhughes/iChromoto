
function OptionsService(){

	var defaults = {
		smallThumbnailSize: 200,
		largeThumbnailSize: 400,
		noSSL: false,
		domainBlock: "",
		regexBlock: "",
		groupByFulldomain: true,
		showWebStore: false,
		showAppsMenuWhenEmpty: false
	};

	// set any items missing in localstorage
	for(var key in defaults){
		if(localStorage.getItem(key) == null || localStorage.getItem(key) == undefined){
			localStorage.setItem(key, defaults[key]);
		}
	}

	this.isBlocked = function(url){
		// if SSL is blocked, check if we're accessing an SSL site.
		if(this.getItem("noSSL") == "true" && url.substr(0, 5).toLowerCase() == "https"){
			console.log("ssl blocked: " + url);
			return true;
		}

		// check to see if the domain is blocked
		var blockedDomains = this.getItem("domainBlock");
		blockedDomains = blockedDomains.length == 0 ? [] : blockedDomains.split("\n");
		var domain = url.split("/")[2].split(".");
		//console.log(blockedDomains);
		for(var i = 0 ; i < blockedDomains.length ; i++){
			var blockedDomain = blockedDomains[i].split(".");
			var blocked = true;
			
			if(domain.length == blockedDomain.length || domain.length >= blockedDomain.length && blockedDomain[0] == "*"){

				for(var x = domain.length-1 ; x >= 0 ; x--){
					if(blockedDomain[x] == "*"){
						break;
					}
					if(domain[x] != blockedDomain[x]){
						blocked = false;
						break;
					}
				}

				if(!blocked){
					continue;
				}

				// if we get here this IS blocked
				console.log(blockedDomain.join(".") + " blocked: " + domain.join("."));
				return true;
			}
		}

		// check to see if the url is blocked by regex
		var regexBlocks = this.getItem("regexBlock");
		regexBlocks = regexBlocks.length == 0 ? [] : regexBlocks.split("\n");
		//console.log(regexBlocks);
		for(var i = 0 ; i < regexBlocks.length ; i++){
			var regex = regexBlocks[i];
			
			try{
				var pattern = new RegExp(regex);
				if(url.match(pattern) != null){
					console.log(pattern + " blocked: " + url);
					return true;
				}
			} catch(e){
				console.log(e);
			}
		}

		// it looks like this is not blocked!
		return false;
	}

	this.setItem = function(item, value){
		localStorage.setItem(item, new String(value).replace( /^\s+/, "" ).replace( /\s+$/, "" ));
	}

	this.getItem = function(item){
		return localStorage.getItem(item).replace( /^\s+/, "" ).replace( /\s+$/, "" );
	}

}
