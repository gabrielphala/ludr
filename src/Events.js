export default class Events {
    constructor (obj) {
        this.eventCBs = !Events.instance ? [] : Events.instance.eventCBs;

        this.addEventCBs(obj);

        Events.instance = !Events.instance ? this : Events.instance;

        return Events.instance;
    }

    addEventCBs (obj) {
        Object.getOwnPropertyNames(obj.prototype).forEach(eventCB => {
            if (eventCB == 'constructor')
                return;

            this.eventCBs.push(`${obj.name + '.' + eventCB}`)            
        });
    }
}