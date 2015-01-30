(function($) {
"use strict";

if (Echo.AppServer.Dashboard.isDefined("Echo.Apps.Text.Dashboard")) return;

var dashboard = Echo.AppServer.Dashboard.manifest("Echo.Apps.Text.Dashboard");

dashboard.inherits = Echo.Utils.getComponent("Echo.AppServer.Dashboards.AppSettings");

dashboard.config = {
	"ecl": [{
		"component": "Textarea",
		"name": "content",
		"type": "string",
		"config": {
			"title": "Text",
			"inputHeight": 45,
			"desc": "Specifies the text to be displayed. Supports full HTML.",
			"data": {
				"sample": "<h1>Hello!</h1><p>Feel free to set any text here.</p>"
			}
		}
	}]
};

dashboard.init = function() {
	var parent = $.proxy(this.parent, this);
	this._getAllAppKeys(this.parent.bind(this));
	this._listenContentChange();
};

dashboard.methods._getAllAppKeys = function(callback) {
	var self = this;
	var customerId = this.config.get("data.customer.id");
	var request = this.config.get("request");
	var keys = this.get("appkeys");

	callback = callback || $.noop;

	if (keys && keys.length > 0) {
		callback.call(this);
	} else {
		request({
			"endpoint": "customer/" + customerId + "/appkeys",
			"success": function(response) {
				self.set("appkeys", response);
				callback.call(self);
			}
		});
	}
};

dashboard.methods._saveConfig = function() {
	Echo.AppServer.API.request({
		"endpoint": "instance/" + this.get("data.instance.id") + "/update",
		"data": {
			"data": {
				"config": this.get("data.instance.config")
			}
		}
	}).send();
};

dashboard.methods.declareInitialConfig = function() {
	var keys = this.get("appkeys");
	var result = {};
	if (keys && keys[0] && keys[0].key) {
		result.appkey = keys[0].key;
	}
	return result;
};

// AppSettings retrieve whole config from configurator when something was changed in properties.
// Due to configurator didn't know anything about appkey (it isn't defined in ECL),
// we declare it in configOverrides (as in initialConfig).
// In this case appkey will be merged to config in every 'update'.
dashboard.methods.declareConfigOverrides = dashboard.methods.declareInitialConfig;

dashboard.methods._listenContentChange = function() {
	var self = this;
	Echo.AppServer.FrameMessages.subscribe(function(data) {
		if (
			data.topic !== "textAppContentChange" ||
			data.appId !== self.config.get("data.instance.name") ||
			!data.content
		) return;
		data.content = Echo.Apps.Text.Utils.filterContent(data.content, {
			"b": {},
			"i": {},
			"h1": {},
			"h2": {},
			"h3": {},
			"h4": {},
			"p": {},
			"br": {},
			"ul": {},
			"ol": {},
			"li": {},
			"hr": {},
			"a": {
				"href": /^(https?\:)?\/\//
			}
		});
		self.set("data.instance.config.content", data.content);
		self.configurator.setValue({
			"content": data.content
		});
		self._saveConfig();
	});
};


Echo.AppServer.Dashboard.create(dashboard);

})(Echo.jQuery);
