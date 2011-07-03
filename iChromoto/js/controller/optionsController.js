
function OptionsController(eventify){

	new Requireify().require([
		"/js/service/persistenceService.js",
		"/js/service/optionsService.js",
		"/js/util/jquery-1.6.1.min.js",
		"/js/util/jquery-ui-1.8.13.custom.min.js"
	], function(){
		// create service(s)
		persistenceService = new PersistenceService();
		optionsService = new OptionsService();

		// setup the form
		$(".thumbnails img.small").css("width", optionsService.getItem("smallThumbnailSize"));
		$("#smallThumbnailSize").val(optionsService.getItem("smallThumbnailSize"));
		$(".thumbnails img.large").css("width", optionsService.getItem("largeThumbnailSize"));
		$("#largeThumbnailSize").val(optionsService.getItem("largeThumbnailSize"));
		$("#domainBlock").val(optionsService.getItem("domainBlock"));
		$("#regexBlock").val(optionsService.getItem("regexBlock"));

		if(optionsService.getItem("noSSL") == "true"){
			$("#noSSL").prop("checked", "checked");
		}

		$("#domainBlock").val(optionsService.getItem("domainBlock"));
		$("#regexBlock").val(optionsService.getItem("regexBlock"));
		
		// setup the events for the slider
		$(".thumbnailSlider").slider({
			range: true,
			min: 100,
			max: 500,
			step: 10,
			values: [ optionsService.getItem("smallThumbnailSize"), optionsService.getItem("largeThumbnailSize") ],
			slide: function( event, ui ) {
				eventify.raise("options_changedThumbnailSize", {small: ui.values[0], large: ui.values[1]});
			}
		});

		// setup the events for the thumbnail size text boxes
		$(".thumbnails input").change(function(event){
			var small = $("#smallThumbnailSize").val();
			var large = $("#largeThumbnailSize").val();
			eventify.raise("options_changedThumbnailSize", {small: small, large: large});
		})

		// setup the event for the ssl checkbox
		$("#noSSL").click(function(){
			eventify.raise("options_changedSSL", {noSSL: this.checked});
		});

		// setup events for Blocks
		$("#domainBlock").keyup(function(event){
			eventify.raise("options_changedDomainBlock", {domainBlock: $(this).val()});
		});
		$("#regexBlock").keyup(function(event){
			eventify.raise("options_changedRegexBlock", {regexBlock: $(this).val()});
		});
	});

	this.updateDomainBlockSettings = function(state){
		optionsService.setItem("domainBlock", state.domainBlock);
	}

	this.updateRegexBlockSettings = function(state){
		optionsService.setItem("regexBlock", state.regexBlock);
	}

	this.updateNoSSLSetting = function(state){
		optionsService.setItem("noSSL", state.noSSL);
	}

	this.updateThumbnailSettings = function(state){
		// update the form values
		$("#smallThumbnailSize").val(state.small);
		$("#largeThumbnailSize").val(state.large);
		$(".thumbnailSlider").slider("values", 0, [state.small]);
		$(".thumbnailSlider").slider("values", 1, [state.large]);

		// resize the image
		$(".thumbnails img.small").css("width", state.small);
		$(".thumbnails img.large").css("width", state.large);

		// save the thumbnail sizes
		optionsService.setItem("smallThumbnailSize", state.small);
		optionsService.setItem("largeThumbnailSize", state.large);
	}



}
