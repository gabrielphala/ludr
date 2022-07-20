export default class Events {
    constructor (_class) {
        this.eventCBs = !Events.instance ? [] : Events.instance.eventCBs;

        this.addEventCBs(_class);

        Events.instance = !Events.instance ? this : Events.instance;

        return Events.instance;
    }

    addEventCBs (_class) {
        Object.getOwnPropertyNames(_class.prototype).forEach(eventCB => {
            if (eventCB == 'constructor')
                return;

            this.eventCBs.push(`${_class.name + '.' + eventCB}`)            
        });
    }
}