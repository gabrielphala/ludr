import Router from "../Router";
import Utils from "../Utils";
import Groups from "../Groups";
import { Next } from "../App";

export default new (class Components {
    constructor () {
        if (Components.instance) 
            return Components.instance;
        
        this.components = {};
        this.navComponents = {};
        this.oldNavItems = {};

        this.events = {
            beforeLoad: [],
            loaded: []
        }

        Components.instance = this;
    }

    /**
     * desc
     * @date 2022-08-08
     * @param {string} name
     * @param {object} component
     */
    add (name, component) {
        if (component.nav)
            this.navComponents[name] = component;

        return this.components[name] = component;
    };

    /**
     * Checks whether a component exists
     * @date 2022-08-08
     * @param {string} name
     * @return {boolean}
     */
    exists (name) {
        return this.components[name] ? true : false;
    }

    /**
     * Returns a component that is associated with the given name
     * @date 2022-08-08
     * @param {string} name
     * @return {object}
     */
    use (name) {
        if (this.components[name])
            return this.components[name];

        else if (Groups.exists(name))
            return this.use(Groups.getComponent(name));

        if (!this.components[name])
            throw `Component not found: could not find component with name (${name})`;
    }

    /**
     * Checks whether a given route is within the specified scope
     * @date 2022-08-08
     * @param {string | array} scope
     * @param {string} routeName
     * @return {boolean}
     */
    isInScope (scope, routeName) {
        if (scope && scope.includes(routeName) || scope == 'all')
            return true;

        return false;
    };

    /**
     * Loops through the navigation components
     * @date 2022-08-08
     * @param {function} callback
     */
    iterateOverComponents (callback) {
        Utils.iterate(this.navComponents, component => {
            if (!this.isInScope(this.navComponents[component].scope, Router.currentRoute.name))
                return;

            callback(this.navComponents[component]);
        });
    };

    /**
     * Loops through navigation elements of a given component
     * @date 2022-08-08
     * @param {object} component
     * @param {function} callback
     */
    iterateOverNavItems (component, callback) {
        let { parent, targets: targetClasses } = component.nav;

        const parents = document.getElementsByClassName(parent);

        Array.from(parents).forEach(parent => {
            targetClasses = Array.isArray(targetClasses) ? targetClasses : [targetClasses];

            targetClasses.forEach(targetClass => {
                const targetElements = parent.getElementsByClassName(targetClass);

                Array.from(targetElements).forEach(targetElement => {
                    if (component.linkActiveClass && !targetElement.dataset.linkactive)
                        targetElement.dataset.linkactive = component.linkActiveClass;

                    callback(targetElement);
                });
            });
        });
    };

    /**
     * Highlights a navigation element that matches the current location path
     * @date 2022-08-08
     * @param {object} navItem
     * @param {object} component
     */
    hightlightNavItems (navItem, component) {
        if (!navItem.dataset.linkaddress || !navItem.dataset.linkactive)
            return;

        // if current path matches nav item, activate the item, remember it and return;
        if (navItem.dataset.linkaddress == location.pathname) {
            this.oldNavItems[component.name] = navItem;

            return navItem.classList.add(navItem.dataset.linkactive);
        }

        if (navItem.dataset.linkmultiple && component.nav && component.nav.linkmultiple) {
            // Grouped routes, essentially same page with multiple tabs
            const tabs = component.nav.linkmultiple[navItem.dataset.linkmultiple];

            // if page (route) to render is a tab within @var tabs, make it active
            if (this.isInScope(tabs, Router.currentRoute.name)) {
                navItem.classList.add(navItem.dataset.linkactive);

                this.oldNavItems[component.name] = navItem;
            }
        }
    }

    unhighlightOld () {
        Utils.iterate(this.oldNavItems, navItem => {
            this.oldNavItems[navItem].classList.remove(this.oldNavItems[navItem].dataset.linkactive)
        })
    }

    /**
     * Loops through all navigation components then their elements
     * and highlights the element that matches the current location pathname
     * @date 2022-08-08
     */
    initHighlightNavItems () {
        this.iterateOverComponents((component) => {
            this.iterateOverNavItems(component, (navItem) => {
                this.hightlightNavItems(navItem, component);
            });
        });
    }

    /**
     * Loops through all navigation components then their elements
     * and adds on-click event-listners
     * @date 2022-08-08
     */
    onClick () {
        this.iterateOverComponents((component) => {
            this.iterateOverNavItems(component, (navItem) => {
                if (!navItem.dataset.linkaddress || !navItem.dataset.linkactive || navItem.dataset.eventsadded)
                    return;

                navItem.setAttribute('data-eventsadded', true)

                navItem.addEventListener('click', async (e) => {
                    // replace components with new ones, corresponding to the new page
                    Next(e.currentTarget.dataset.linkaddress);
                    
                    // de-activate previosly activated navItems
                    this.unhighlightOld()

                    // if some nav components have been modified, re-set events
                    this.onClick();

                    // if there are new components that need highlighting, highlight them
                    this.initHighlightNavItems();
                });
            });
        });
    }

    /**
     * Initiates navigation events
     * @date 2022-08-08
     */
    initNavEvents () {
        this.onClick();
    };

    initEvents (type) {
        this.events[type].forEach(componentName => {
            const component = this.components[componentName];

            if (!this.isInScope(component.scope, Router.currentRoute.name))
                return;

            component.events[type](this.components[componentName]);
        });
    }

    beforeLoad (name) {
        this.events.beforeLoad.push(name);
    }

    loaded (name) {
        this.events.loaded.push(name);
    }
});