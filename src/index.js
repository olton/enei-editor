import {
    Editor,
    ContentEdit,
    Paste,
    HyperLink,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikethrough,
    toggleListType,
    setAlignment,
    toggleBlockQuote,
    toggleCodeBlock, toggleHeader,
} from 'roosterjs';
import "./index.less"
import "./icons.less"

if (!globalThis.eneiEditorKey) {
    globalThis.eneiEditorKey = `ctrl+alt+k`
}
if (!globalThis.eneiEditorEndpoint) {
    globalThis.eneiEditorEndpoint = ''
}

const ENEI_EDITOR_MODE_CLASS = 'enei_editor_mode'
const ENEI_EDITOR_TARGET_CLASS = '[enei]'
const storage = sessionStorage

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
    <span class="enei__tool-divider"></span>
    <button class="enei__tool-button js-enei-quote"><span class="ei-quotes-left"></span></button>
    <button class="enei__tool-button js-enei-code"><span class="ei-embed2"></span></button>
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
    current = null

    constructor() {
        this.addEvents()
        this.body = document.querySelector("body")
        this.restoreBlocks()
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

    openEditor(){
        const self = this, forElement = this.current
        const content = forElement.innerHTML
        const rect = forElement.getBoundingClientRect()
        this.createOverlay()
        this.createEditor()
        this.editor.style.top = `${rect.top - 32}px`
        this.editor.style.left = `${rect.left}px`
        this.editor.style.width = `${rect.width}px`
        this.content = this.editor.querySelector(".enei__text")
        const editor = new Editor(this.content, {
            plugins: [
                new ContentEdit(),
                new Paste(true /*useDirectPaste*/),
                new HyperLink(href => 'Ctrl+click to open link ' + href),
            ],
            initialContent: content
        })
        // editor.setContent(content)
        this.content.focus()
        this.editor.style.height = `${this.content.scrollHeight + 70}px`

        const updateEditorHeight = () => {
            self.editor.style.height = `${this.content.scrollHeight + 70}px`
        }

        const focus = () => {
            this.content.focus()
        }

        this.content.addEventListener("input", () => {
            updateEditorHeight()
        })

        const addEvent = (btn, fun) => {
            this.editor.querySelector(`.js-enei-${btn}`).addEventListener("click", fun)
        }

        addEvent('cancel', () => {
            this.closeEditor()
        })

        addEvent('ok', async () => {
            await this.saveEditor()
        })

        addEvent("bold", () => {
            toggleBold(editor)
            focus()
            updateEditorHeight()
        })

        addEvent("italic", () => {
            toggleItalic(editor)
            focus()
            updateEditorHeight()
        })

        addEvent("underline", () => {
            toggleUnderline(editor)
            focus()
            updateEditorHeight()
        })

        addEvent("strike", () => {
            toggleStrikethrough(editor)
            focus()
            updateEditorHeight()
        })

        addEvent("list-num", () => {
            toggleListType(editor, 1)
            focus()
            updateEditorHeight()
        })

        addEvent("list-def", () => {
            toggleListType(editor, 2)
            focus()
            updateEditorHeight()
        })

        addEvent("p-left", () => {
            setAlignment(editor, 0)
            focus()
            updateEditorHeight()
        })

        addEvent("p-center", () => {
            setAlignment(editor, 1)
            focus()
            updateEditorHeight()
        })

        addEvent("p-right", () => {
            setAlignment(editor, 2)
            focus()
            updateEditorHeight()
        })

        addEvent("quote", () => {
            toggleBlockQuote(editor)
            focus()
            updateEditorHeight()
        })

        addEvent("code", () => {
            toggleCodeBlock(editor)
            focus()
            updateEditorHeight()
        })
    }

    async saveEditor(){
        const newContent = this.content.innerHTML
        const forElement = this.current
        forElement.innerHTML = newContent
        await this.commitBlock(forElement.getAttribute('enei'), newContent)
        this.overlay.remove()
    }

    closeEditor(){
        this.overlay.remove()
    }

    addEvents(){
        const self = this

        window.addEventListener("keydown", async function(event){
            if (event.repeat) return

            const keys = []

            if (event.ctrlKey || event.metaKey) keys.push('ctrl')
            if (event.altKey) keys.push('alt')
            if (event.shiftKey) keys.push('shift')
            if (event.key) keys.push(event.key)

            const keySeq = keys.join("+")

            console.log(keySeq)

            if ( "ctrl+Enter" === keySeq && self.editor) {
                await self.saveEditor()
            }

            if ( "Escape" === keySeq && self.editor) {
                self.closeEditor()
            }

            if ( eneiEditorKey === keySeq ) {
                self.switchMode()
            }
        })

        const elements = document.querySelectorAll(ENEI_EDITOR_TARGET_CLASS)

        const clickHandler = function(event) {
            if(!self.inEditMode()) return
            self.current = this
            self.openEditor()
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

    async commitBlock(id, content){
        const command = 'commit-block'
        const res = await fetch(`${eneiEditorEndpoint}/${command}`, {
            method: "POST",
            body: JSON.stringify({
                id,
                content
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!res.ok) {
            alert(`Block not committed!`)
            return
        }

        this.saveBlock(id, content)
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
        storage.setItem('ENEI', data)
    }
}

new EneiEditor()
