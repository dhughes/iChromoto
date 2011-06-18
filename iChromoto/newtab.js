$(document).ready(function(){
	$("#clear").click(function(){
		localStorage.clear();
	});

	var history = [];
	for(var key in localStorage){
		var data = JSON.parse(localStorage.getItem(key));

		data.date = new Date(data.date);

		var img = $("<img src='" + data.dataUrl +  "' />");

		var width = img.clientWidth;
		var height = img.clientHeight;

		if(width >= height){
			img.addClass("wide");
		} else {
			img.addClass("tall");
		}

		$("body").append(img);

	}
});