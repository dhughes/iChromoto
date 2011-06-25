
function Eventify(configPath){
	var me = this;

	// core config, this is the root config for eventify
	me.config = {
		controllers: [
			{
				obj: this,
				listeners: [
					{"eventify_configLoaded": "applyConfig"}
				]
			}
		]
	};
	
	require(configPath, function(){
		me.raise("eventify_configLoaded", {eventifyConfig: eventifyConfig});
	});

	me.raise = function(raisedEventName, values, state){
		console.log("raised: " + raisedEventName);

		// did we get a state object along with this raising?
		if (state == undefined) {
			state = {};
			state.initialEventName = raisedEventName;
		}
		state.currentEventName = raisedEventName;

		// add any attached values into the state
		for(var val in values){
			state[val] = values[val];
		}

		// loop through the controllers and find those that listen for this event
		var controllers = me.config.controllers;

		for(var i = 0 ; i < controllers.length ; i++){
			var controller = controllers[i];

			// let's insure this controller is loaded
			loadController(controller, function(controller){
				// ok, it's loaded now for sure!
				//console.log(controller.obj);

				// loop over this controller's listeners
				var listeners = controller.listeners;

				for(var x = 0 ; x < listeners.length ; x++){
					// get a specific listener
					var listener = listeners[x];
					
					// what does this listener listen for?
					for(var eventName in listener){
						// does this match the specified event?
						if(eventName == state.currentEventName){

							// insure the listener functions are loaded
							loadEventListener(controller, listener, eventName, function(listener){
								listener(state);
							});
						}
					}
				}
			});
		}
	}

	loadController = function(controller, callback){
		if(controller.obj == undefined){
			// require this object
			require(controller.src, function(){
				// ok, we've got the script, let's create the object
				controller.obj = eval("new " + controller.type + "(me)");

				callback(controller);
			});
		} else {
			callback(controller);
		}
	}

	loadEventListener = function(controller, listener, eventName, callback){
		if(typeof(listener[eventName]) == "string"){
			listener[eventName] = controller.obj[listener[eventName]];
			callback(listener[eventName]);
		} else {
			callback(listener[eventName]);
		}
	}

	// this has got to be callable externally, hence the "me"
	me.applyConfig = function(state){
		var configuredControllers = state.eventifyConfig.controllers;

		// loop over the controllers and append them to the existing config
		for(var i = 0 ; i < configuredControllers.length ; i++){
			me.config.controllers.push(configuredControllers[i]);
		}

		me.raise("eventify_loaded");
	}

}