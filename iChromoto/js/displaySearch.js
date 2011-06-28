
iChromodo_search = null;
iChromodo_documentScroll = null;

displaySearch = function(url){
	if(iChromodo_search == null){
		// add our iframe
		iChromodo_search = document.createElement("iframe");
		iChromodo_search.id = "iChromodo_search";
		iChromodo_search.style.position = "absolute";
		iChromodo_search.style.top = "0px";
		iChromodo_search.style.left = "0px";
		iChromodo_search.style.width = "100%";
		iChromodo_search.style.height = "100%";
		iChromodo_search.style.zIndex = "99999";
		iChromodo_search.style.border = "0px";
		iChromodo_search.style.margin = "0px";
		iChromodo_search.style.padding = "0px";
		document.body.appendChild(iChromodo_search);

		// make some tweaks to the underlying document
		iChromodo_documentScroll = document.body.style.overflow;
		document.body.style.overflow = "hidden";
	}
	iChromodo_search.src = url;
}

removeSearch = function(){
	document.body.style.overflow = iChromodo_documentScroll;
	document.body.removeChild(iChromodo_search);
	iChromodo_documentScroll = null;
	iChromodo_search = null;
}