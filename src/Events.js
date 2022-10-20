import Utils from "./Utils";

export default class Events {
    /**
     * Stores event handlers 
     * @date 2022-08-08
     * @param {object | null} obj
     * @return {Events}
     */
    constructor (obj = null) {
        this.eventHandlers = !Events.instance ? {} : Events.instance.eventHandlers;

        if (obj)
            this.addEventHandlers(obj);

        Events.instance = !Events.instance ? this : Events.instance;

        return Events.instance;
    }

    /**
     * Stores event handlers 
     * @date 2022-08-08
     * @param {object} obj
     */
    addEventHandlers (obj) {
        Object.getOwnPropertyNames(obj.prototype).forEach(eventHandler => {
            if (eventHandler == 'constructor')
                return;

            this.eventHandlers[`${obj.name + '.' + eventHandler}`] = obj.prototype[eventHandler];   
        });
    }

    getTargets () {
        this.targets = Array.from(document.querySelectorAll('[data-eventid]'));
    }

    sortTargets () {
        this.sortedTargets = {};

        Array.from(this.targets).forEach(element => {
            this.sortedTargets[element.dataset.eventid] = element;
        });
    }

    /**
     * Sets event listeners
     * @date 2022-08-08
     * @param {object} events
     */
    setEventListeners (events) {
        this.getTargets()
        this.sortTargets()

        const len = Object.getOwnPropertyNames(this.sortedTargets).length;

        for (let i = 0; i < len; i++) {
            Utils.iterate(events[i], event => {
                // Remove the 'on' prefix, and set event
                const eventType = events[i][event][0].substring(2);
                const params = events[i][event][1];

                if (!params[0])
                    params.shift()

                const originalParams = params.length

                const eventHandler = (e) => {
                    // remove old event object
                    if (params.length > originalParams)
                        params.shift()
                    
                    params.push(e)

                    this.eventHandlers[event](...params)
                }

                // remove prior event
                this.sortedTargets[i].removeEventListener(eventType, eventHandler);

                // add new event
                this.sortedTargets[i].addEventListener(eventType, eventHandler);
            })
        }
    }
}