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

        this.data = Utils.merge({ mainObj: Env.globalContainer, refObj: data });

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

             // so we can append 'ludr_component_end' without getting unwanted results
            let content = component.content.trim()

            this.content = this.content.replace(
                new RegExp(`@ludr_component${components[i]}end`, 'gi'),
                `${parent != 'none' ? content : 'ludr_component_start ' + componentName + ';' + content + ' ludr_component_end'}`
            )

            if (nestedComponents)
                await this.parseComponents(nestedComponents, component);

            component.linkActiveClass = component.linkActiveClass || Utils.extractLinkActiveClass(component.content).trim();
        }
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

            const { blueprint: _blueprint, events, layout } = blueprint.makeBlueprint();

            this.content = layout;

            router.blueprint = _blueprint
            router.events = events

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

    getElement (element) {
        return element.id.type == 'id' ?
            document.getElementById(element.id.value) :
            document.getElementsByClassName(element.id.value)[0]
    }

    /**
     * Removes old elements not used by current blueprint
     * @date 2022-08-08
     * @param {object} oldBlueprint
     * @param {object} currentBlueprint
     */
    removeUnusedElements (oldBlueprint, currentBlueprint) {
        let removedParents = [];

        // get element indices
        let currentElementIndex = Utils.getLastElement(currentBlueprint)

        for (let i = 0; i < oldBlueprint.length - 1; i++) {
            let element = oldBlueprint[i],
                id = element.id.value;

            if (currentElementIndex[id] >= 0 && (
                this.haveSameParent(
                    element.parent.id, 
                    currentBlueprint[currentElementIndex[id]].parent.id
                )
            )) continue;

            if (element.isParent)
                removedParents.push(id)

            if (!removedParents.includes(element.parent.id.value))
                this.getElement(element).remove();
        }
    }

    getParent (element) {
        return element.parent.id.value == 'root' ?
            document.getElementsByClassName('ludr-container')[0] :
            this.getElement(element.parent)
    }

    haveSameParent (parent1Id, parent2Id) {
        return (
            parent1Id.value == parent2Id.value &&
            parent1Id.type == parent2Id.type 
        )
    }

    /**
     * Adds new elements not used by old blueprint
     * @date 2022-08-08
     * @param {object} oldBlueprint
     * @param {object} currentBlueprint
     */
    addNewElements (oldBlueprint, currentBlueprint) {
        let currentElementIndex = Utils.getLastElement(currentBlueprint),
            oldElementIndex = Utils.getLastElement(oldBlueprint);

        for (let i = 0; i < currentBlueprint.length - 1; i++) {
            const element = currentBlueprint[i],
                id = element.id.value,
                oldElement = oldBlueprint[oldElementIndex[id]];

            if (!(oldElementIndex[id] >= 0) || oldElementIndex[id] >= 0 &&
                !this.haveSameParent(element.parent.id, oldElement.parent.id)) {

                let previousElement = currentBlueprint[currentElementIndex[id] - 1]

                const newElement = document.createElement(element.element.type);

                this.getModifierKeyValuePair(element.modifiers.trim(), (key, value) => {
                    key = key.trim();

                    if (key)
                        newElement.setAttribute(key, value);
                })

                newElement.innerHTML = element.element.innerText;

                if (previousElement && element.hierachy == previousElement.hierachy) {
                    let sibling = this.getElement(previousElement)

                    sibling.parentNode.insertBefore(newElement, sibling.nextSibling)
                }

                else {
                    let parent = this.getParent(element)

                    parent.append(newElement);
                }
            }

            else if (oldElement && (oldElement.element.innerText != element.element.innerText)) {
                const elementToChange = this.getElement(element)

                elementToChange.innerHTML = element.element.innerText;
            }
        }
    }
}

/**
 * Creates and returns a new layout
 * @date 2022-08-08
 * @param {string} name
 * @param {string} path
 * @return {Layout}
 */
export default (name, path) => Layouts.add(name, new Layout(name, path || name));