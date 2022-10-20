import { alpha, elements } from "./Chars";
import eventTypes from "./EventTypes";
import Utils from "../Utils";
import Lexer from "./Lexer";


export default class Blueprint extends Lexer {
    constructor (name, layout) {
        super(layout);

        this.layoutName = name;
        this.blueprint = {};
        this.events = []
        this.componentTree = [];
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
                value: 'root'
            }
        };

        let parentName;

        Utils.iterate(this.blueprint, elementName => {
            if (this.blueprint[elementName].hierachy == hierachy) {
                parent = {
                    id: {
                        type: this.blueprint[elementName].id.type,
                        value: this.blueprint[elementName].id.value
                    }
                };

                parentName = elementName;
            }
        })

        if (parentName)
            this.blueprint[parentName].isParent = true; 

        return parent;
    }

    getNonParents (callback) {
        Utils.iterate(this.blueprint, element => {
            if (!this.blueprint[element].isParent) {
                callback(this.blueprint[element])
            }
        })
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

    makeBlueprint () {
        let previousToken,
            previousElemFOID,
            hierachy = 0,
            isInsideComponent = false,
            totalComponentLines = 1,
            classes = [],
            eventPositions = [];

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

            else if (eventTypes.includes(token) && this.lookAhead() != '=') {
                let outsideParam = true, mainQuotes, end = false, index = this.pos.index, strevents = '';

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

                        eventPositions.push({ start: this.pos.index - token.length, end: index + 1 });

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

                this.blueprint[previousElemFOID].modifiers =
                    this.blueprint[previousElemFOID].modifiers.
                    replace(`${token}${this.lookAhead() == ' ' ? ' ' : ''}${mainQuotes + strevents + mainQuotes}`, '');

                this.events.push(events)
            }
            
            else if (token == 'ludr_component_end') {
                if (this.currentComponent.parent == 'none')
                    isInsideComponent = false;
                
                this.componentTree.pop();
            }

            else if (elements.includes(token) && this.lookBehind(token) == '<') {
                ++hierachy;

                if (isInsideComponent && hierachy != this.currentComponent.rootHierachy) 
                    continue;

                const lastCharPosOTag = this.layout.indexOf('>', this.pos.index);
                const modifiers = this.layout.substring(this.pos.index, lastCharPosOTag);

                let { modifier: id, pos: idPod } = this.getModifier('id', lastCharPosOTag);
                let { modifier: _class, pos: classPos } = this.getModifier('class', lastCharPosOTag);

                _class = _class ? _class.split(' ')[0] : null;

                let classIsUniq = false;

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

                const parent = this.getParent(hierachy - 1);

                if (isInsideComponent && this.currentComponent.hasRoot)
                    throw `Root element count exeeded: Component (${this.currentComponent.name}) has a root element.`;

                const firstOrderId = id ? id : _class;

                let componentInnerHTML;

                let elementStartPos = this.layout.indexOf(`<${token + modifiers}>`, this.pos.index - token.length - 2) + `<${token + modifiers}>`.length;

                if (isInsideComponent) {
                    let componentEndPos = this.layout.indexOf(` ludr_component_end`, elementStartPos) - `</${token}>`.length - 2;
                    
                    componentInnerHTML = this.layout.substring(elementStartPos, componentEndPos)
                }

                this.blueprint[firstOrderId] = {
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
                };

                previousElemFOID = firstOrderId;

                if (this.currentComponent)
                    this.currentComponent.hasRoot = true;
            }

            if (elements.includes(token) && this.lookBehind(token) == '/' && this.lookBehind(token, 2) == '<')
                hierachy--;
            
            previousToken = token;

            this.next()
        }

        this.getNonParents((element) => {
            let endPos = this.layout.indexOf(`</${element.element.type}>`, element.element.startPos);

            element.element.innerText = this.layout.substring(element.element.startPos, endPos);
        })

        this.eventPositions = eventPositions;

        return { blueprint: this.blueprint, events: this.events };
    }
};
