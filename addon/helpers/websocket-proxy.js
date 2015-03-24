import Ember from 'ember';

var events  = ['close', 'error', 'message', 'open'];
var forEach = Ember.EnumerableUtils.forEach;
var filter  = Ember.EnumerableUtils.filter;

export default Ember.ObjectProxy.extend({
	/*
	* Each element in the array is of form:
	*
	* {
	*		url: 'String'
	*		type: 'String' (such as 'open')
	*		callback: The function to envoke
	*		context: The context of the function
	* }
	*/
	listeners: null,

	init() {
		this._super.apply(this, arguments);
		this.listeners = Ember.makeArray();

		forEach(events, eventName => {
			this.socket['on' + eventName] = event => {
				Ember.run(() => {
					var activeListeners = filter(this.listeners, listener => {
						return listener.url === event.currentTarget.url && listener.type === eventName;
					});

					activeListeners.forEach(item => {
						item.callback.call(item.context, event);
					});
				});
			}.bind(this);
		});
	},

	on(type, callback, context) {
		this.listeners.push({
			url: this.socket.url,
			type: type,
			callback: callback,
			context: context
		});
	},

	off(type, callback) {
		this.listeners = filter(this.listeners, listeners => {
			return !(listeners.callback === callback && listeners.type === type);
		});
	},

	close() {
		this.socket.close();
	}
});
