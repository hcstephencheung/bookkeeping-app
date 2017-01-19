/*
* Events
* PubSub model to notify view when Transactions has finished fetching data
* ===
* API
* ===
* addEventListener(eventName, callback) : executes callback when event is fired
* fireEvent(eventName, data) : notifies subscribers when event is triggered
*/

var Events = (function() {
    var subscribedEvents = {};

    return {
        addEventListener: function(event, subscriber) {
            if (!subscribedEvents.hasOwnProperty(event)) {
                subscribedEvents[event] = [];
            }

            subscribedEvents[event].push(subscriber);
        },
        fireEvent: function(event, data) {
            if (subscribedEvents.hasOwnProperty(event)) {
                for(var subbed = 0; subbed < subscribedEvents[event].length; subbed++) {
                    try {
                        subscribedEvents[event][subbed].call(null, data);
                    } catch (e) {
                        console.error('Events error: ', e);
                    }
                }
            }
        }
    }
})();