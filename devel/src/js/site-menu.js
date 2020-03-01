/**
 * --------------------------------------------------------------------------
 * Admin Site Menu (v0.0.1): site-menu.js
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
// import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME               = 'sitemenu'
const VERSION            = '0.0.1'
const DATA_KEY           = 'bs.sitemenu'
const EVENT_KEY          = `.${DATA_KEY}`
const DATA_API_KEY       = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]


const Default = {}
const DefaultType = {}

const Event = {
    LOAD_DATA_API           : `load${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {}

const Selector = {
    editor: '.site-menu-editor'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class SiteMenu {

    constructor(element) {
        this._element = element
        this._model   = document.querySelector(element.dataset.model)
        this._form    = document.querySelector(element.dataset.form)
        this._value   = []
        this._active  = null

        if(this._model.value)
            this._value   = JSON.parse(this._model.value) || []

        if(!this._value)
            this._model.value = ''
        else
            this.render(this._value, this._element)

        this.addElementsListener()

        $(this._element)
        .nestable({
            collapseBtnHTML : '',
            dragClass       : 'site-menu-item-drag',
            expandBtnHTML   : '',
            handleClass     : 'site-menu-item-handle',
            itemClass       : 'site-menu-item',
            listClass       : 'site-menu-list',
            maxDepth        : 100,
            placeClass      : 'site-menu-item-placeholder',
            rootClass       : 'site-menu-editor'
        })
        .on('change', () => {
            this.updateModel()
        })
    }

    addElementsListener(){
        $(this._element)
            .on('click', '.btn-menu-edit', e => {
                this._active = e.currentTarget.parentNode.parentNode
                this.editMenu(this._active.dataset.label, this._active.dataset.link)
            })
            .on('click', '.btn-menu-add', () => {
                this._active = null
                this.editMenu('', '')
            })
            .on('click', '.btn-menu-remove', e => {
                this._active = e.currentTarget.parentNode.parentNode

                $.dialog.confirm('Remove Confirmation', 'Are you sure want to remove this menu?', res => {
                    if(!res)
                        return

                    $(this._active).slideUp(() => {
                        $(this._active).remove()
                        this._active = null
                        this.updateModel()
                    })
                })
            })

        $(this._form)
            .on('show.bs.modal', () => this._form.classList.remove('was-validated'))
            .on('shown.bs.modal', () => this._form.label.select())
            .on('submit', e => {
                e.preventDefault()

                let value = {
                    label: this._form.elements.label.value,
                    link : this._form.elements.link.value
                }

                if(!value.label || !value.link)
                    return

                // update exists menu
                if(this._active){
                    this._active.dataset.label = value.label
                    this._active.dataset.link  = value.link
                    // $(this._active).data('label', value.label)
                    // $(this._active).data('link', value.link)
                    $(this._active).find('> .site-menu-item-handle > .site-menu-item-label').text(value.label)
                    $(this._active).find('> .site-menu-item-handle > .site-menu-item-link').text(value.link)

                    this._active = null
                }else{
                    let parent = $(this._element).children('.site-menu-list')[0]
                    if(parent)
                        this.makeItem(value).appendTo(parent)
                    else
                        this.render([value])
                }

                $(this._form).modal('hide')
                this.updateModel()
            })
    }

    editMenu(label, link){
        this._form.label.value = label
        this._form.link.value  = link
        $(this._form).modal('show')
    }

    hs(str){
        let map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
        return str.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    makeItem(item){
        let safe = {
                label : this.hs(item.label),
                link  : this.hs(item.link)
            },
            tmpl = `
                <li class="site-menu-item" data-label="${safe.label}" data-link="${safe.link}">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Menu Action">
                        <button type="button" class="btn btn-light btn-menu-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-light btn-menu-remove" title="Remove">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="site-menu-item-handle">
                        <div class="site-menu-item-label">${safe.label}</div>
                        <small style="display:block" class="text-truncate site-menu-item-link">${safe.link}</small>
                    </div>
                </li>`,
            eItem = $(tmpl)

        if(item.children)
            this.render(item.children, eItem)

        return eItem
    }

    render(items, cont){
        let eList = $('<ol class="site-menu-list"></ol>').appendTo(cont)
        items.forEach(item => this.makeItem(item).appendTo(eList))
    }

    updateModel(){
        this._value = $(this._element).nestable('serialize')
        this._model.value = this._value.length ? JSON.stringify(this._value) : ''
    }

    // Static

    static _jQueryInterface(config, relatedTarget) {
        return this.each(function () {
            let data = $(this).data(DATA_KEY)
            if(data)
                return
            $(this).data(DATA_KEY, new SiteMenu(this))
        })
    }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = SiteMenu._jQueryInterface
$.fn[NAME].Constructor = SiteMenu
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return SiteMenu._jQueryInterface
}

$(window).on(Event.LOAD_DATA_API, () => {
    $(Selector.editor).sitemenu()
})

export default SiteMenu