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

    /**
     * Sets event listeners
     * @date 2022-08-08
     * @param {object} blueprint
     */
    setEventListeners (blueprint) {
        Utils.iterate(blueprint, (element) => {
            let el = blueprint[element];

            const target = el.id.type == 'id' ?
                document.getElementById(el.id.value) :
                document.getElementsByClassName(el.id.value)[0];

            Utils.iterate(el.events, event => {
                Utils.iterate(el.events[event], func => {
                    // Remove the 'on' prefix, and set event
                    const eventType = event.substring(2);

                    const eventHandler = (e) => {
                        if (this.eventHandlers[func]) {
                            el.events[event][func].push(e);

                            this.eventHandlers[func](...el.events[event][func]);
                        }
                    }

                    // remove prior event
                    target.removeEventListener(eventType, eventHandler);

                    // add new event
                    target.addEventListener(eventType, eventHandler);
                })
            })
        })
    }
}