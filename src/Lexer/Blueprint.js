import { alpha, elements, singletonElements } from "./Chars";
import eventTypes from "./EventTypes";
import Utils from "../Utils";
import Lexer from "./Lexer";


export default class Blueprint extends Lexer {
    constructor (name, layout) {
        super(layout);

        this.layoutName = name;
        this.blueprint = [];

        this.events = {
            counter: 0,
            list: []
        }

        this.componentTree = [];
        this.elementIndex = {};
    }

    set layout (newLayout) {
        this.str = newLayout
    }

    get layout () {
        return this.str;
    }

    get currentComponent () {
        return this.componentTree[this.componentTree.length - 1];
    }

    getParent (hierachy) {
        let parent = {
            id: {
                type: 'root',
                value: 'root'
            }
        };

        for (let i = this.blueprint.length - 1; i >= 0; i--) {
            const element = this.blueprint[i]

            if (element.hierachy == hierachy) {
                parent = {
                    id: {
                        type: element.id.type,
                        value: element.id.value
                    }
                };

                this.blueprint[this.elementIndex[element.id.value]].isParent = true;

                break;
            }
        }

        return parent;
    }

    getNonParents (callback) {
        this.blueprint.forEach(element => {
            if (!element.isParent) {
                callback(element)
            }
        });
    }

    getModifier (name, endPos) {
        const pos = this.layout.indexOf(`${name}=`, this.pos.index);
        let modifier = '', quotationMarks = 0, index = pos + name.length + 1;

        if (pos == -1 || pos >= endPos)
            return { modifier: null, pos };

        do {
            if (`"'`.includes(this.layout[index])) { quotationMarks++; index++; continue; }

            modifier += this.layout[index];

            index++;
        } while (quotationMarks < 2);

        return { modifier, pos };
    }

    getEvents (str) {
        let events = []

        for (let i = 0; i < str.length; i++) {
            let event = '';

            while (alpha.includes(str[i])) {
                event += str[i];

                i++;
            };

            if (eventTypes.includes(event))
                events.push(event)
        }

        return events
    }    

    parseEvents (token, tokenIndex, currentIndex) {
        let outsideParam = true, mainQuotes, end = false, index = tokenIndex, strevents = '';

        while (!end) {
            ++index;

            if (outsideParam && this.layout[index] == ' ') { continue; }

            else if (mainQuotes && `"'`.includes(this.layout[index]) && this.layout[index] != mainQuotes) {
                outsideParam = !outsideParam;
            }

            else if (!mainQuotes && (this.layout[index] == '\'' || this.layout[index] == '"')) {
                mainQuotes = this.layout[index];

                continue;
            }

            else if (mainQuotes && this.layout[index] == mainQuotes) {
                end = true;

                const eventPointer = `data-eventid="${this.events.counter}"`,
                    defStart = tokenIndex - token.length,
                    defEnd = index + 1;

                const eventDefinition = this.layout.substring(defStart, defEnd);

                this.layout = this.layout.replace(eventDefinition, eventPointer);

                this.pos.index = currentIndex

                this.events.counter++;

                continue;
            }

            strevents += this.layout[index];
        }

        const events = {};

        const eventArr = strevents.trim().split(';');

        eventArr.forEach(event => {
            const lParamPos = event.indexOf('(');

            const params = event.substring(lParamPos + 1, event.length - 1);

            const resolvedParams = [];

            params.split(',').forEach(param => {
                if (`'"`.includes(param.charAt(0)))
                    return resolvedParams.push(param.substring(1, param.length - 1))

                resolvedParams.push(param);
            });

            events[event.substring(0, lParamPos)] = [token, resolvedParams]
        });

        this.events.list.push(events)
    }

    makeBlueprint () {
        let previousToken,
            hierachy = 0,
            elementCount = 0,
            isInsideComponent = false,
            totalComponentLines = 1,
            classes = [];

        while (this.currentChar != null) {
            if (this.currentChar == "\n" && isInsideComponent) {
                this.currentComponent.line++;
                totalComponentLines++;
            }

            if (" \t\r".includes(this.currentChar)) {
                this.next();

                continue;
            }

            let token = alpha.includes(this.currentChar) ? this.makeString() : this.currentChar;

            if (previousToken == 'ludr_component_start') {
                this.componentTree.push({
                    line: 0,
                    name: token,
                    parent: isInsideComponent ? this.currentComponent.name : 'none',
                    hasRoot: false,
                    rootHierachy: hierachy + 1
                })

                isInsideComponent = true;
            }
            
            else if (token == 'ludr_component_end') {
                if (this.currentComponent.parent == 'none')
                    isInsideComponent = false;
                
                this.componentTree.pop();
            }

            else if (elements.includes(token) && this.lookBehind(token) == '<') {
                ++hierachy;

                let lastCharPosOTag = this.layout.indexOf('>', this.pos.index);
                let modifiers = this.layout.substring(this.pos.index, lastCharPosOTag);

                let { modifier: id, pos: idPod } = this.getModifier('id', lastCharPosOTag);
                let { modifier: _class, pos: classPos } = this.getModifier('class', lastCharPosOTag);

                _class = _class ? _class.split(' ')[0] : null;

                let classIsUniq = false;

                let events = this.getEvents(modifiers)

                let currentTokenIndex = this.pos.index;

                events.forEach(event => {
                    const eventDefPos = modifiers.indexOf(event);

                    if (eventDefPos != -1) {
                        this.parseEvents(
                            event,
                            eventDefPos + event.length + this.pos.index,
                            currentTokenIndex
                        )
                    }
                });

                lastCharPosOTag = this.layout.indexOf('>', this.pos.index);

                modifiers = this.layout.substring(this.pos.index, lastCharPosOTag);

                if (isInsideComponent && hierachy != this.currentComponent.rootHierachy)
                    continue;

                if (!classes.includes(_class)) {
                    classes.push(_class)

                    classIsUniq = true;
                }

                let errorLine = isInsideComponent ? this.currentComponent.line : this.pos.line - totalComponentLines + 1;

                let errorMsg = isInsideComponent ?  
                    `Element: ${token}, at line ${errorLine}, in component: ${this.currentComponent.name}, has no id or unique class` : 
                    `Element: ${token}, at line ${errorLine}, in layout: ${this.layoutName}, has no id or unique class`

                const hasId = !(id == null || id.trim() == '' || idPod > lastCharPosOTag);
                const hasClass = !(_class == null || _class.trim() == '' || classPos > lastCharPosOTag || !classIsUniq);

                if (!hasClass && !hasId)
                    throw errorMsg;

                if (isInsideComponent && this.currentComponent.hasRoot)
                    throw `Root element count exeeded: Component (${this.currentComponent.name}) has a root element.`;

                const firstOrderId = id ? id : _class;

                const parent = this.getParent(hierachy - 1);

                let componentInnerHTML;

                let elementStartPos = this.layout.indexOf(`<${token + modifiers}>`, this.pos.index - token.length - 2) + `<${token + modifiers}>`.length;

                this.elementIndex[firstOrderId] = elementCount++

                this.blueprint.push({
                    id: {
                        type: id ? 'id' : 'class',
                        value: firstOrderId
                    },
                    isParent: false,
                    element: {
                        innerText: '',
                        type: token,
                        startPos: elementStartPos
                    },
                    component: {
                        isComponent: isInsideComponent,
                        innerHTML: componentInnerHTML
                    },
                    hierachy,
                    modifiers,
                    parent
                });

                if (this.currentComponent)
                    this.currentComponent.hasRoot = true;

                if (singletonElements.includes(token))
                    hierachy--;
            }

            if (elements.includes(token) && this.lookBehind(token) == '/' && this.lookBehind(token, 2) == '<')
                hierachy--;
            
            previousToken = token;

            this.next()
        }

        this.getNonParents((element) => {
            let suffix = element.component.isComponent ? ' ludr_component_end' : ''

            let endPos = this.layout.indexOf(`</${element.element.type}>${suffix}`, element.element.startPos);

            element.element.innerText = this.layout.substring(element.element.startPos, endPos);
        })

        this.blueprint.push(this.elementIndex)

        return { 
            blueprint: this.blueprint,
            events: this.events.list,
            layout: this.layout
        };
    }
};
