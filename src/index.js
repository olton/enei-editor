import * as rjs from "roosterjs"
import "./index.less"
import "./icons.less"

if (!globalThis.eneiEditorKey) {
    globalThis.eneiEditorKey = `ctr+alt+k`
}

const ENEI_EDITOR_MODE_CLASS = 'enei_editor_mode'
const ENEI_EDITOR_TARGET_CLASS = '[enei]'

const EDITOR_HTML = `
<div class="enei__toolbar">
    <button class="enei__tool-button js-enei-bold"><span class="ei-bold"></span></button>
    <button class="enei__tool-button js-enei-italic"><span class="ei-italic"></span></button>
    <button class="enei__tool-button js-enei-underline"><span class="ei-underline"></span></button>
    <button class="enei__tool-button js-enei-strike"><span class="ei-strike"></span></button>
    <span class="enei__tool-divider"></span>
    <button class="enei__tool-button js-enei-list-num"><span class="ei-list1"></span></button>
    <button class="enei__tool-button js-enei-list-def"><span class="ei-list2"></span></button>
    <span class="enei__tool-divider"></span>
    <button class="enei__tool-button js-enei-p-left"><span class="ei-paragraph-left"></span></button>
    <button class="enei__tool-button js-enei-p-center"><span class="ei-paragraph-center"></span></button>
    <button class="enei__tool-button js-enei-p-right"><span class="ei-paragraph-right"></span></button>
</div>
<div class="enei__text"></div>
<div class="enei__actions">
    <button class="enei__button js-enei-ok">OK</button>
    <button class="enei__button js-enei-cancel">Cancel</button>
</div>
`

class EneiEditor {
    body = null
    editor = null
    overlay = null
    content = null
    rjs = null

    constructor() {
        this.addEvents()
        this.body = document.querySelector("body")
    }

    createEditor(){
        console.log("Create Editor")
        this.editor = document.createElement("div")
        this.editor.className = 'enei__editor'
        this.editor.innerHTML = EDITOR_HTML
        this.overlay.append(this.editor)
    }

    createOverlay(){
        console.log("Create Overlay")
        this.overlay = document.createElement("div")
        this.overlay.classList.add("enei__overlay")
        this.body.append(this.overlay)
    }

    openEditor(forElement){
        const self = this
        const content = forElement.innerHTML
        const rect = forElement.getBoundingClientRect()
        this.createOverlay()
        this.createEditor()
        this.editor.style.top = `${rect.top - 32}px`
        this.editor.style.left = `${rect.left}px`
        this.editor.style.width = `${rect.width}px`
        this.editor.style.height = `${rect.height + 54}px`
        this.content = this.editor.querySelector(".enei__text")
        const editor = rjs.createEditor(this.content)
        editor.setContent(content)
        this.content.focus()

        this.content.addEventListener("input", () => {
            const h = this.content.scrollHeight + 70
            self.editor.style.height = `${h}px`
        })

        this.editor.querySelector(".js-enei-cancel").addEventListener("click", () => {
            this.overlay.remove()
        })
        this.editor.querySelector(".js-enei-ok").addEventListener("click", () => {
            forElement.innerHTML = this.content.innerHTML
            this.overlay.remove()
        })
        this.editor.querySelector(".js-enei-bold").addEventListener("click", () => {
            rjs.toggleBold(editor)
            this.content.focus()
        })
        this.editor.querySelector(".js-enei-italic").addEventListener("click", () => {
            rjs.toggleItalic(editor)
            this.content.focus()
        })
        this.editor.querySelector(".js-enei-underline").addEventListener("click", () => {
            rjs.toggleUnderline(editor)
            this.content.focus()
        })
        this.editor.querySelector(".js-enei-strike").addEventListener("click", () => {
            rjs.toggleStrikethrough(editor)
            this.content.focus()
        })
        this.editor.querySelector(".js-enei-list-num").addEventListener("click", () => {
            rjs.toggleListType(editor, 1)
            this.content.focus()
        })
        this.editor.querySelector(".js-enei-list-def").addEventListener("click", () => {
            rjs.toggleListType(editor, 2)
            this.content.focus()
        })
        this.editor.querySelector(".js-enei-p-left").addEventListener("click", () => {
            rjs.setAlignment(editor, 0)
            this.content.focus()
        })
        this.editor.querySelector(".js-enei-p-center").addEventListener("click", () => {
            rjs.setAlignment(editor, 1)
            this.content.focus()
        })
        this.editor.querySelector(".js-enei-p-right").addEventListener("click", () => {
            rjs.setAlignment(editor, 2)
            this.content.focus()
        })
    }

    addEvents(){
        const self = this

        window.addEventListener("keydown", function(event){
            if (event.repeat) return

            const keys = []

            if (event.ctrlKey || event.metaKey) keys.push('ctr')
            if (event.altKey) keys.push('alt')
            if (event.shiftKey) keys.push('shift')
            if (event.key) keys.push(event.key)

            if ( eneiEditorKey === keys.join("+") ) {
                self.switchMode()
            }
        })

        const elements = document.querySelectorAll(ENEI_EDITOR_TARGET_CLASS)

        const clickHandler = function(event) {
            if(!self.inEditMode()) return
            self.openEditor(this)
        }

        elements.forEach(el => {
            el.addEventListener("click", clickHandler)
        })
    }

    switchMode(){
        this.body.classList.toggle(ENEI_EDITOR_MODE_CLASS)
    }

    inEditMode(){
        return this.body.classList.contains(ENEI_EDITOR_MODE_CLASS)
    }
}

new EneiEditor()
