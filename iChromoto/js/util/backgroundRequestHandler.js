chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		console.log(request.func);
		var func = eval(request.func);
		var response = func.apply( this, request.args );
		if(sendResponse != undefined){
			sendResponse(response);
		}
	}
);