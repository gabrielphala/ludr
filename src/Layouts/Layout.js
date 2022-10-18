import Config from "../Config";
import Url from "../Url";
import Utils from "../Utils";
import Layouts from "./index";
import Components from "../Components";
import Env from "../Env";
import Middleware from "../Middleware";
import Blueprint from "../Lexer/Blueprint";
import Router from "../Router";

class Layout {
    constructor (name, path, data = {}) {
        this.name = name;
        this.content = '';
        this.componentCallStack = {};
        this.data = { ...Env.globalContainer, ...data };

        path = Utils.hasExt(path) ? path : `${path}.${Config.viewsExt}`;

        this.path = Url.cleanURL(`${Config.layoutViews}/${path}`);
    }

    /**
     * Removes all labels from the content
     * @date 2022-08-08
     */
    removeLabels () {
        this.content = this.content.replace(/ludr_component_start(.*?);/g, '');
        this.content = this.content.replace(/ludr_link_active_class(.*?);/g, '');
        this.content = this.content.replace(/ludr_component_end/g, '');
    }

    /**
     * Caches component content and resolves nested components
     * @date 2022-08-08
     * @param {object} components
     * @param {string | object} parent
     */
    async parseComponents (components, parent = 'none') {
        for (let i = 0; i < components.length; i++) {
            const componentName = components[i].trim(),
                component = Components.use(componentName);

            // if component has no content, fetch it and compile it
            component.content = !component.content ?
                Env.handlebars.compile(await Utils.fetch(component.path))(component.data) :
                component.content;

            const nestedComponents = Utils.extractComponentNames(component.content);

            this.componentCallStack[componentName] = this.componentCallStack[componentName] || ``;

            this.componentCallStack[componentName] += parent != 'none' ?
                ` ${parent.name + ' ' + this.componentCallStack[parent.name]}` :
                '';

            if (this.componentCallStack[componentName].split(' ').indexOf(componentName) > 0)
                throw `Recursive inclusion of component: (${componentName})`;

            this.content = this.content.replace(
                new RegExp(`@ludr_component${components[i]}end`, 'gi'),
                `${parent != 'none' ? component.content : 'ludr_component_start ' + componentName + ';' + component.content + ' ludr_component_end'}`
            )

            if (nestedComponents)
                await this.parseComponents(nestedComponents, component);

            component.linkActiveClass = component.linkActiveClass || Utils.extractLinkActiveClass(component.content).trim();
        }
    }

    /**
     * Removes event descriptions from layout
     * @date 2022-08-08
     * @param {array} eventsPositions
     */
    removeEventDefinitions (eventsPositions) {
        let removedLength = 0;

        eventsPositions.forEach(event => {
            const eventDefinition = this.content.substring(event.start - removedLength, event.end - removedLength);
            this.content = this.content.replace(eventDefinition, '');

            removedLength += eventDefinition.length;
        });
    }

    /**
     * Populates layout with components' content
     * and assigns a blueprint to current route
     * @date 2022-08-08
     */
    build () {
        Middleware.once(async next => {
            const layoutContent = await Utils.fetch(this.path);

            this.content = Env.handlebars.compile(layoutContent)(this.data);

            const components = Utils.extractComponentNames(this.content);

            await this.parseComponents(components);

            const router = Router.use(Router.currentRoute.name);

            const blueprint = new Blueprint(this.name, this.content);

            router.blueprint = blueprint.makeBlueprint();

            this.removeEventDefinitions(blueprint.eventPositions)
            this.removeLabels();

            next();
        })
    }

    /**
     * extracts key-value pairs from modifiers
     * @date 2022-08-08
     * @param {string} modifiers
     * @param {function} callback
     */
    getModifierKeyValuePair (modifiers, callback) {
        let isInQuotes = false, key = '', value = '';
        
        for (let i = 0; i < modifiers.length; i++) {
            if (modifiers[i] == '=' && `"'`.includes(modifiers[i + 1]))
                continue;

            if (isInQuotes) {
                if (`"'`.includes(modifiers[i])) {
                    callback(key, value)

                    isInQuotes = false;
                    key = '';
                    value = '';

                    continue;
                }

                value += modifiers[i];

                continue;
            }

            if (`"'`.includes(modifiers[i]) && !isInQuotes) {
                isInQuotes = true;
                
                continue;
            }

            key += modifiers[i];

            if (key && (modifiers[i + 1] == ' ' || modifiers[i + 1] == '' || !modifiers[i + 1])) {
                callback(key, true)

                key = '';
                value = '';
            }
        }
    }

    /**
     * removes element by classname
     * @date 2022-08-08
     * @param {string} className
     */
    removeClassElement (className) {
        document.getElementsByClassName(className)[0].remove();
    }

    /**
     * removes element by id
     * @date 2022-08-08
     * @param {string} idName
     */
    removeIdElement (idName) {
        document.getElementById(idName).remove();
    }

    /**
     * Removes old elements not used by current blueprint
     * @date 2022-08-08
     * @param {object} oldBlueprint
     * @param {object} currentBlueprint
     */
    removeUnusedElements (oldBlueprint, currentBlueprint) {
        let removedParents = [];

        Utils.iterate(oldBlueprint, element => {
            if (!currentBlueprint[element]) {
                if (oldBlueprint[element].isParent)
                    removedParents.push(element)

                if (!removedParents.includes(oldBlueprint[element].parent.id.value)) {
                    if (oldBlueprint[element].id.type == 'class')
                        return this.removeClassElement(oldBlueprint[element].id.value);

                    return this.removeIdElement(oldBlueprint[element].id.value);
                }
            }
        })
    }

    /**
     * Adds new elements not used by old blueprint
     * @date 2022-08-08
     * @param {object} oldBlueprint
     * @param {object} currentBlueprint
     */
    addNewElements (oldBlueprint, currentBlueprint) {
        Utils.iterate(currentBlueprint, elementName => {
            const element = currentBlueprint[elementName],
                oldElement = oldBlueprint[elementName];

            if (!oldElement) {
                let parent = element.parent.id.value == 'root' ?
                    document.body :
                    (
                        element.parent.id.type == 'id' ?
                            document.getElementById(element.parent.id.value) :
                            document.getElementsByClassName(element.parent.id.value)[0]
                    )

                const newElement = document.createElement(element.element.type);

                this.getModifierKeyValuePair(element.modifiers.trim(), (key, value) => {
                    newElement.setAttribute(key.trim(), value);
                })

                if (element.component.isComponent)
                    newElement.innerHTML = element.component.innerHTML;

                else
                    newElement.innerHTML = element.element.innerText;

                parent.append(newElement);
            }
            else if (oldElement && (oldElement.element.innerText != element.element.innerText)) {
                const elementToChange = element.id.type == 'id' ?
                    document.getElementById(element.id.value) :
                    document.getElementsByClassName(element.id.value)[0]

                elementToChange.innerHTML = element.element.innerText; 
            }
        })
    }
}

/**
 * Creates and returns a new layout
 * @date 2022-08-08
 * @param {string} name
 * @param {string} path
 * @return {Layout}
 */
export default (name, path) => Layouts.add(name, new Layout(name, path));