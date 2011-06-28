
requestText = function(){
	// get the content of this page
	var content = document.body.innerHTML;
	content = content.replace(/(<script)((.|\r|\n)+?)(<\/script)((.|\r|\n)*?)(>)/igm, "");
	content = content.replace(/(<link)((.|\r|\n)+?)(<\/link)((.|\r|\n)*?)(>)/igm, "");
	content = content.replace(/(<style)((.|\r|\n)+?)(<\/style)((.|\r|\n)*?)(>)/igm, "");
	content = content.replace(/(<(.|\r|\n)*?>)/ig, "");
	content = content.replace(/(\s|\r|\n)+/igm, " ");
	return content;
}
