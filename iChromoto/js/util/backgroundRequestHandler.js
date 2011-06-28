chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		var func = eval(request.func);
		var response = func.apply( this, request.args );
		if(sendResponse != undefined){
			sendResponse(response);
		}
	}
);