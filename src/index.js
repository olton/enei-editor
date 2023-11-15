import "./index.less"

if (!globalThis.eneiEditorKey) {
    globalThis.eneiEditorKey = `ctr+alt+k`
}

const ENEI_EDITOR_MODE_CLASS = 'enei_editor_mode'
const ENEI_EDITOR_TARGET_CLASS = '[enei]'

const EDITOR_HTML = `
<div class="enei__text" contenteditable="true"></div>
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
        this.editor.style.top = `${rect.top}px`
        this.editor.style.left = `${rect.left}px`
        this.editor.style.width = `${rect.width}px`
        this.editor.style.height = `${rect.height + 28}px`
        this.content = this.editor.querySelector(".enei__text")
        this.content.innerHTML = content
        this.content.focus()
        this.content.addEventListener("input", () => {
            const h = this.content.scrollHeight + 42
            self.editor.style.height = `${h}px`
        })
        this.editor.querySelector(".js-enei-cancel").addEventListener("click", () => {
            this.overlay.remove()
        })
        this.editor.querySelector(".js-enei-ok").addEventListener("click", () => {
            forElement.innerHTML = this.content.innerHTML
            this.overlay.remove()
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
