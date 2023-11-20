import {
    Editor,
    ContentEdit,
    Paste,
    HyperLink,
    ImageEdit,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikethrough,
    toggleListType,
    setAlignment,
    toggleBlockQuote,
    toggleCodeBlock,
    setDirection,
    clearFormat, toggleSuperscript, toggleSubscript, setIndentation,
    createElement,
    insertImage,
    getFormatState,
    createLink, removeLink,
    setHeadingLevel,
} from 'roosterjs';

import EN_US from "./i18n/en-US"
import UK_UA from "./i18n/uk-UA"

import "./index.less"
import "./icons.less"

const BUILD_VERSION = "__version__"

const locales = {
    "en-US": EN_US,
    "uk-UA": UK_UA,
}

const isObject = item => (item && typeof item === 'object' && !Array.isArray(item))
const merge = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                merge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return merge(target, ...sources);
}

const css = (el, prop) => window.getComputedStyle(el, null)[prop]

const EditorDefaultOptions = {
    shortcut: "alt+ctrl+k",
    serverEndpoint: '',
    maxHeight: 0,
    locale: "en-US"
}

const ENEI_EDITOR_MODE_CLASS = 'enei_editor_mode'
const ENEI_EDITOR_TARGET_CLASS = '[enei]'
const storage = sessionStorage

const DLG_LINK = `
<dialog id="enei-dialog-link" class="enei-dialog js-enei-dialog-link">
    <form method="dialog">
        <header>
            <h3>Create Link</h3>        
        </header>
        <main>    
            <div>
                <label>Web Address (URL)</label>
                <input type="url" name="enei-dialog-link__url" placeholder="https://domain.com">
            </div>
            
            <div style="margin-top: 10px">
                <label>Display as</label>
                <input type="text" name="enei-dialog-link__display">
            </div>
        </main>
        <div class="enei-dialog__actions">
            <button class="enei__button js-enei-dialog-link__button-ok" type="submit" value="ok">OK</button>
            <button class="enei__button js-enei-dialog-link__button-cancel" type="reset" value="cancel">Cancel</button>
        </div>
    </form>
</dialog>
`

const EDITOR_HTML = `
${DLG_LINK}
<div class="enei__toolbar">
    <button class="enei__tool-button js-enei-bold" title="Bold"><span class="ei-bold"></span></button>
    <button class="enei__tool-button js-enei-italic" title="Italic"><span class="ei-italic"></span></button>
    <button class="enei__tool-button js-enei-underline" title="Underline"><span class="ei-underline"></span></button>
    <button class="enei__tool-button js-enei-strike" title="Strike"><span class="ei-strike"></span></button>

    <button class="enei__tool-button js-enei-superscript" title="Superscript"><span class="ei-superscript"></span></button>
    <button class="enei__tool-button js-enei-subscript" title="Subscript"><span class="ei-subscript"></span></button>

    <button class="enei__tool-button js-enei-list-num" title="Numbered List"><span class="ei-list1"></span></button>
    <button class="enei__tool-button js-enei-list-bull" title="Bulleted List"><span class="ei-list2"></span></button>
    
    <div class="enei__dropdown">
        <button class="enei__tool-button js-enei-heading" title="Heading">R</button>
        <ul>
            <li class="js-enei-heading1" value="1">Heading 1</li>
            <li class="js-enei-heading2" value="2">Heading 2</li>
            <li class="js-enei-heading3" value="3">Heading 3</li>
            <li class="js-enei-heading4" value="4">Heading 4</li>
            <li class="js-enei-heading5" value="5">Heading 5</li>
            <li class="js-enei-heading6" value="6">Heading 6</li>
            <li class="divider"></li>
            <li class="js-enei-regular" value="0">Regular Text</li>
        </ul>
    </div>

    <button class="enei__tool-button js-enei-p-left" title="Align Left"><span class="ei-paragraph-left"></span></button>
    <button class="enei__tool-button js-enei-p-center" title="Align Center"><span class="ei-paragraph-center"></span></button>
    <button class="enei__tool-button js-enei-p-right" title="Align Right"><span class="ei-paragraph-right"></span></button>

    <button class="enei__tool-button js-enei-link" title="Insert Link"><span class="ei-link"></span></button>
    <button class="enei__tool-button js-enei-unlink" title="Remove Link"><span class="ei-switch"></span></button>
    <button class="enei__tool-button js-enei-image" title="Insert Image"><span class="ei-image"></span></button>
    <button class="enei__tool-button js-enei-quote" title="Quoted text"><span class="ei-quotes-right"></span></button>
    <button class="enei__tool-button js-enei-code" title="Code"><span class="ei-embed"></span></button>

    <button class="enei__tool-button js-enei-indent-increase" title="Increase Indent"><span class="ei-indent-increase"></span></button>
    <button class="enei__tool-button js-enei-indent-decrease" title="Decrease Indent"><span class="ei-indent-decrease"></span></button>

    <button class="enei__tool-button js-enei-ltr" title="LTR Text"><span class="ei-ltr"></span></button>
    <button class="enei__tool-button js-enei-rtl" title="RTL Text"><span class="ei-rtl"></span></button>

    <button class="enei__tool-button js-enei-clear-format" title="Clear Format"><span class="ei-paint-format"></span></button>

    <button class="enei__tool-button js-enei-undo" title="Undo Operation"><span class="ei-undo"></span></button>
    <button class="enei__tool-button js-enei-redo" title="Redo Operation"><span class="ei-redo"></span></button>
    <button class="enei__tool-button js-enei-revert" title="Revert Content"><span class="ei-revert"></span></button>

</div>
<div class="enei__text"></div>
<div class="enei__actions">
    <button class="enei__button js-enei-save">Save</button>
    <button class="enei__button js-enei-cancel">Cancel</button>
    <div style="margin-left: auto;">
        <span style="font-size: 10px;">v${BUILD_VERSION}</span>
        <a href="https://github.com/olton/enei-editor" target="_blank" class="enei__button js-enei-github" style="background-color: transparent;"><span class="ei-github"></span></a>
    </div>
</div>
`

export class EneiEditor {
    body = null
    editorContainer = null
    editor = null
    overlay = null
    content = null
    current = null
    toolbar = null
    options = {}
    originalContent = null
    canSave = false

    constructor(options) {
        this.options = merge({}, EditorDefaultOptions, options)
        this.addEvents()
        this.body = document.querySelector("body")
        this.restoreBlocks()
    }

    createOverlay(){
        this.overlay = document.createElement("div")
        this.overlay.classList.add("enei__overlay")
        this.body.append(this.overlay)
        this.overlay.addEventListener('wheel', e => {
            e.stopPropagation()
        })
    }

    createEditor(){
        this.editorContainer = document.createElement("div")
        this.editorContainer.className = 'enei__editor'
        this.editorContainer.innerHTML = EDITOR_HTML
        for (let key in locales[this.options.locale]) {
            this.editorContainer.querySelector(`.js-enei-${key}`).setAttribute("title", locales[this.options.locale][key])
        }
        this.editorContainer.querySelector(`.js-enei-save`).innerHTML = locales[this.options.locale]["save"]
        this.editorContainer.querySelector(`.js-enei-cancel`).innerHTML = locales[this.options.locale]["cancel"]
        this.overlay.append(this.editorContainer)
    }

    openEditor(){
        const self = this, o = this.options, forElement = this.current
        let {top, left, width} = forElement.getBoundingClientRect()
        if (top < 56) {
            top = 112
        }
        top -= 56
        this.createOverlay()
        this.createEditor()
        this.originalContent = forElement.innerHTML
        this.linkDialog = document.querySelector("#enei-dialog-link")
        this.content = this.editorContainer.querySelector(".enei__text")
        this.toolbar = this.editorContainer.querySelector(".enei__toolbar")
        this.editorContainer.style.top = `${top}px`
        this.editorContainer.style.left = `${left}px`
        this.editorContainer.style.width = `${width}px`
        this.editorContainer.style.maxHeight = `${o.maxHeight || window.innerHeight - top - 56}px`
        this.editor = new Editor(this.content, {
            plugins: [
                new ContentEdit(),
                new Paste(true /*useDirectPaste*/),
                new HyperLink(href => 'Ctrl+click to open link ' + href),
                new ImageEdit(),
            ],
            initialContent: this.originalContent,
            inDarkMode: false,
        })

        const updateEditorHeight = () => {
            self.editorContainer.style.height = `${this.content.height + this.toolbar.scrollHeight + 70}px`
        }

        const updateButtonState = editorState => {
            /*
            * {
                "isMultilineSelection": false,
                "canAddImageAltText": false,
                "isInTable": false,
                "tableFormat": {},
                "canMergeTableCell": false,
                "fontName": "-apple-system, system-ui, BlinkMacSystemFont, \"Segoe UI\", Roboto, Ubuntu, \"Helvetica Neue\", sans-serif",
                "fontSize": "12pt",
                "textColor": "rgb(0, 0, 0)",
                "backgroundColor": "rgb(255, 255, 255)",
                "lineHeight": "24px",
                "marginTop": "0px",
                "marginBottom": "0px",
                "fontWeight": "400",
                "isDarkMode": false,
                "zoomScale": 1
            }
            * */
            const button = name => this.editorContainer.querySelector(`.js-enei-${name}`)
            const setButtonState = (name, state) => button(name).classList[state ? 'add' : 'remove']('active')

            const {isBold, isItalic, isUnderline, isStrikeThrough, isSubscript, isSuperscript, isBlockQuote,
            isCodeInline, isCodeBlock, direction, canUndo, canRedo, textAlign, isBullet, isNumbering, canUnlink, headingLevel, headerLevel} = editorState

            setButtonState('bold', isBold)
            setButtonState('italic', isItalic)
            setButtonState('underline', isUnderline)
            setButtonState('strike', isStrikeThrough)
            setButtonState('subscript', isSubscript)
            setButtonState('superscript', isSuperscript)
            setButtonState('quote', isBlockQuote)
            setButtonState('code', isCodeBlock || isCodeInline)
            setButtonState('ltr', direction === 'ltr')
            setButtonState('rtl', direction === 'rtl')
            setButtonState('p-left', ['start', 'left'].includes(textAlign))
            setButtonState('p-center', textAlign === 'center')
            setButtonState('p-right', ['end', 'right'].includes(textAlign))
            setButtonState('list-num', isNumbering)
            setButtonState('list-bull', isBullet)

            button('unlink').disabled = !canUnlink
            button('undo').disabled = !canUndo
            button('redo').disabled = !canRedo
            button('revert').disabled = !(canRedo || canUndo)

            button('heading').innerHTML = headingLevel > 0 ? `H${headingLevel}` : "R"
            button('heading').setAttribute("title", headingLevel === 0 ? locales[this.options.locale]["regular"] : locales[this.options.locale][`heading${headingLevel}`])

            this.canSave = canRedo || canUndo
            button('save').disabled = !this.canSave
        }

        ;["keyup", "mouseup", "input", "click", "contentchanged"].forEach( ev => {
            this.content.addEventListener(ev, () => {updateButtonState(getFormatState(this.editor))})
        })

        const focus = () => {
            this.content.focus()
            updateEditorHeight()
            updateButtonState(getFormatState(this.editor))
        }

        focus()

        this.content.addEventListener("input", () => {
            updateEditorHeight()
        })

        const addEvent = (btn, fun) => {this.editorContainer.querySelector(`.js-enei-${btn}`).addEventListener("click", fun)}

        addEvent('cancel', () => {
            this.closeEditor()
        })

        addEvent('save', async () => {
            await this.saveEditor()
        })

        addEvent('heading', (e) => {
            const btn = e.target
            btn.classList.toggle('active')
        })

        this.toolbar.querySelectorAll(".js-enei-heading + ul > li").forEach(el => {
            el.addEventListener("click", () => {
                const level = +el.getAttribute('value')
                setHeadingLevel(this.editor, level)
                this.toolbar.querySelector(`.js-enei-heading`).classList.remove("active")
                focus()
            })
        })

        addEvent("bold", () => {
            toggleBold(this.editor)
            focus()
        })

        addEvent("italic", () => {
            toggleItalic(this.editor)
            focus()
        })

        addEvent("underline", () => {
            toggleUnderline(this.editor)
            focus()
        })

        addEvent("strike", () => {
            toggleStrikethrough(this.editor)
            focus()
        })

        addEvent("superscript", () => {
            toggleSuperscript(this.editor)
            focus()
        })

        addEvent("subscript", () => {
            toggleSubscript(this.editor)
            focus()
        })

        addEvent("list-num", () => {
            toggleListType(this.editor, 1)
            focus()
        })

        addEvent("list-bull", () => {
            toggleListType(this.editor, 2)
            focus()
        })

        addEvent("p-left", () => {
            setAlignment(this.editor, 0)
            focus()
        })

        addEvent("p-center", () => {
            setAlignment(this.editor, 1)
            focus()
        })

        addEvent("p-right", () => {
            setAlignment(this.editor, 2)
            focus()
        })

        addEvent("quote", () => {
            toggleBlockQuote(this.editor)
            focus()
        })

        addEvent("code", () => {
            toggleCodeBlock(this.editor)
            focus()
        })

        addEvent("indent-increase", () => {
            setIndentation(this.editor, 0)
            focus()
        })

        addEvent("indent-decrease", () => {
            setIndentation(this.editor, 1)
            focus()
        })

        addEvent("undo", () => {
            this.editor.undo()
            focus()
        })

        addEvent("redo", () => {
            this.editor.redo()
            focus()
        })

        addEvent("ltr", () => {
            setDirection(this.editor, 0)
            focus()
        })

        addEvent("rtl", () => {
            setDirection(this.editor, 1)
            focus()
        })

        addEvent("clear-format", () => {
            clearFormat(this.editor, 0)
            focus()
        })

        addEvent('unlink', () => {
            removeLink(this.editor)
            focus()
        })

        addEvent("link", () => {
            this.linkDialog.querySelector('[name=enei-dialog-link__display]').value = this.editor.getSelectionRange()
            this.linkDialog.showModal()
            focus()
        })

        this.linkDialog.querySelector(".js-enei-dialog-link__button-cancel").addEventListener("click", () => {
            this.linkDialog.close();
        })

        this.linkDialog.addEventListener("close", () => {
            if (this.linkDialog.returnValue !== "ok") {
                return
            }
            let link = this.linkDialog.querySelector('[name=enei-dialog-link__url]').value.trim()
            let display = this.linkDialog.querySelector('[name=enei-dialog-link__display]').value.trim()
            if (!link) {
                return
            }
            if (!display) {
                display = link
            }
            createLink(this.editor, link, display, display, "_blank")
        })

        addEvent("image", () => {
            const document = this.editor.getDocument()
            const fileInput = createElement({
                tag: "input",
                attributes: {
                    type: "file",
                    accept: "image/*",
                    display: "none"
                }
            }, this.editor.getDocument())
            document.body.appendChild(fileInput)
            fileInput.addEventListener('change', () => {
                if (fileInput.files) {
                    for (let i = 0; i < fileInput.files.length; i++) {
                        insertImage(this.editor, fileInput.files[i]);
                    }
                }
            })
            try {
                fileInput.click()
            } finally {
                document.body.removeChild(fileInput)
            }

            focus()
        })

        addEvent('revert', () => {
            this.editor.setContent(this.originalContent)
        })
    }

    async saveEditor(){
        const newContent = this.content.innerHTML
        const forElement = this.current
        if (this.canSave) {
            forElement.innerHTML = newContent
            const id = forElement.getAttribute('enei')
            const result = this.options.serverEndpoint ? await this.commitBlock(id, newContent) : id
            if (!result) {
                this.current.innerHTML = this.originalContent
            }
        }
        this.closeEditor()
    }

    closeEditor(){
        this.canSave = false
        this.editor.dispose()
        this.overlay.remove()
    }

    addEvents(){
        const self = this, o = this.options

        window.addEventListener("keydown", async function(event){
            if (event.repeat) return

            const keys = []

            if (event.altKey) keys.push('alt')
            if (event.ctrlKey || event.metaKey) keys.push('ctrl')
            if (event.shiftKey) keys.push('shift')
            if (event.key) keys.push(event.key)

            const keySeq = keys.join("+")

            console.log("You pressed: "+ keySeq)

            if ( "ctrl+Enter" === keySeq && self.editor) {
                await self.saveEditor()
            }

            if ( "Escape" === keySeq && self.editor) {
                self.closeEditor()
            }

            if ( o.shortcut === keySeq ) {
                self.switchMode()
            }

            // event.preventDefault()
        })
    }

    switchMode(){
        const self = this

        this.body.classList.toggle(ENEI_EDITOR_MODE_CLASS)

        const clickHandler = function() {
            if(!self.inEditMode()) return
            self.current = this
            self.openEditor()
        }

        const elements = document.querySelectorAll(ENEI_EDITOR_TARGET_CLASS)

        if (this.inEditMode()) {
            elements.forEach(el => {
                el.addEventListener("click", clickHandler)
            })
        } else {
            elements.forEach(el => {
                el.removeEventListener("click", clickHandler)
            })
        }
    }

    inEditMode(){
        return this.body.classList.contains(ENEI_EDITOR_MODE_CLASS)
    }

    async commitBlock(id, content){
        const {serverEndpoint} = this.options
        const res = await fetch(`${serverEndpoint}/commit-blocks`, {
            method: "POST",
            body: JSON.stringify([{
                id,
                content
            }]),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!res.ok) {
            alert(`Block not committed!`)
            return null
        }
        const result = await res.json()
        if (result.includes(id)) {
            this.saveBlock(id, content)
            return id
        }
        return null
    }

    saveBlocks(){
        const data = {}
        const blocks = document.querySelectorAll(ENEI_EDITOR_TARGET_CLASS)
        blocks.forEach(el => {
            const id = el.getAttribute("enei")
            data[id] = el.innerHTML.trim()
        })
        storage.setItem('ENEI', JSON.stringify(data))
    }

    restoreBlocks(){
        let data = storage.getItem('ENEI')
        if (!data) {
            return
        }
        data = JSON.parse(data)
        for(let id in data) {
            const el = document.querySelector(`[enei=${id}]`)
            el.innerHTML = data[id]
        }
    }

    restoreBlock(id){
        let data = storage.getItem('ENEI')
        if (!data) {
            return
        }
        const el = document.querySelector(`[enei=${id}]`)
        el.innerHTML = JSON.parse(data)[id]
    }

    saveBlock(id, content){
        let data = storage.getItem('ENEI')
        if (!data) {
            data = {}
        } else {
            data = JSON.parse(data)
        }

        data[id] = content.trim()
        storage.setItem('ENEI', JSON.stringify(data))
    }
}

export const createEneiEditor = (options) => new EneiEditor(options)
