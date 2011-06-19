Eventify = function(){

	var handlers = {};

	this.listen = function(eventName, listener){
		if(handlers[eventName] == undefined){
			handlers[eventName] = [];
		}
		handlers[eventName].push(listener);
	}

	this.raise = function(eventName, values){
		var event = new Event(eventName);
		for(var value in values){
			event.setValue(value, values[value]);
		}
		if(handlers[eventName] != undefined){

			for(var i = 0 ; i < handlers[eventName].length ; i++){
				handlers[eventName][i](event);
			}
		}
	}

}


Event = function(eventName){
	var eventName = eventName;
	var values = {};

	this.getEventName = function(){
		return eventName;
	}

	this.setValue = function(name, value){
		values[name] = value;
	}

	this.valueExists = function(name){
		return name in values;
	}

	this.getValue = function(name){
		return values[name];
	}

	this.getAllValues = function(){
		return values;
	}

}