/*!
  * Admin Site Menu v0.0.1 (https://github.com/getmim/admin-site-menu)
  * Copyright 2019-2020 MIM Dev
  * Licensed under MIT (https://github.com/getmim/admin-ui/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
    typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
    (global = global || self, factory(global['site-menu'] = {}, global.jQuery));
}(this, (function (exports, $) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

    /*!
     * Nestable jQuery Plugin - Copyright (c) 2012 David Bushell - http://dbushell.com/
     * Dual-licensed under the BSD or MIT licenses
     */

    (function ($, window, document, undefined$1) {
      var hasTouch = 'ontouchstart' in document;
      /**
       * Detect CSS pointer-events property
       * events are normally disabled on the dragging element to avoid conflicts
       * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
       */

      var hasPointerEvents = function () {
        var el = document.createElement('div'),
            docEl = document.documentElement;

        if (!('pointerEvents' in el.style)) {
          return false;
        }

        el.style.pointerEvents = 'auto';
        el.style.pointerEvents = 'x';
        docEl.appendChild(el);
        var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
        docEl.removeChild(el);
        return !!supports;
      }();

      var defaults = {
        listNodeName: 'ol',
        itemNodeName: 'li',
        rootClass: 'dd',
        listClass: 'dd-list',
        itemClass: 'dd-item',
        dragClass: 'dd-dragel',
        handleClass: 'dd-handle',
        collapsedClass: 'dd-collapsed',
        placeClass: 'dd-placeholder',
        noDragClass: 'dd-nodrag',
        emptyClass: 'dd-empty',
        expandBtnHTML: '<button data-action="expand" type="button">Expand</button>',
        collapseBtnHTML: '<button data-action="collapse" type="button">Collapse</button>',
        group: 0,
        maxDepth: 5,
        threshold: 20
      };

      function Plugin(element, options) {
        this.w = $(document);
        this.el = $(element);
        this.options = $.extend({}, defaults, options);
        this.init();
      }

      Plugin.prototype = {
        init: function init() {
          var list = this;
          list.reset();
          list.el.data('nestable-group', this.options.group);
          list.placeEl = $('<div class="' + list.options.placeClass + '"/>');
          $.each(this.el.find(list.options.itemNodeName), function (k, el) {
            list.setParent($(el));
          });
          list.el.on('click', 'button', function (e) {
            if (list.dragEl) {
              return;
            }

            var target = $(e.currentTarget),
                action = target.data('action'),
                item = target.parent(list.options.itemNodeName);

            if (action === 'collapse') {
              list.collapseItem(item);
            }

            if (action === 'expand') {
              list.expandItem(item);
            }
          });

          var onStartEvent = function onStartEvent(e) {
            var handle = $(e.target);

            if (!handle.hasClass(list.options.handleClass)) {
              if (handle.closest('.' + list.options.noDragClass).length) {
                return;
              }

              handle = handle.closest('.' + list.options.handleClass);
            }

            if (!handle.length || list.dragEl) {
              return;
            }

            list.isTouch = /^touch/.test(e.type);

            if (list.isTouch && e.touches.length !== 1) {
              return;
            }

            e.preventDefault();
            list.dragStart(e.touches ? e.touches[0] : e);
          };

          var onMoveEvent = function onMoveEvent(e) {
            if (list.dragEl) {
              e.preventDefault();
              list.dragMove(e.touches ? e.touches[0] : e);
            }
          };

          var onEndEvent = function onEndEvent(e) {
            if (list.dragEl) {
              e.preventDefault();
              list.dragStop(e.touches ? e.touches[0] : e);
            }
          };

          if (hasTouch) {
            list.el[0].addEventListener('touchstart', onStartEvent, false);
            window.addEventListener('touchmove', onMoveEvent, false);
            window.addEventListener('touchend', onEndEvent, false);
            window.addEventListener('touchcancel', onEndEvent, false);
          }

          list.el.on('mousedown', onStartEvent);
          list.w.on('mousemove', onMoveEvent);
          list.w.on('mouseup', onEndEvent);
        },
        serialize: function serialize() {
          var data,
              list = this,
              step = function step(level, depth) {
            var array = [],
                items = level.children(list.options.itemNodeName);
            items.each(function () {
              var li = $(this),
                  item = $.extend({}, li.data()),
                  sub = li.children(list.options.listNodeName);

              if (sub.length) {
                item.children = step(sub);
              }

              array.push(item);
            });
            return array;
          };

          data = step(list.el.find(list.options.listNodeName).first());
          return data;
        },
        serialise: function serialise() {
          return this.serialize();
        },
        reset: function reset() {
          this.mouse = {
            offsetX: 0,
            offsetY: 0,
            startX: 0,
            startY: 0,
            lastX: 0,
            lastY: 0,
            nowX: 0,
            nowY: 0,
            distX: 0,
            distY: 0,
            dirAx: 0,
            dirX: 0,
            dirY: 0,
            lastDirX: 0,
            lastDirY: 0,
            distAxX: 0,
            distAxY: 0
          };
          this.isTouch = false;
          this.moving = false;
          this.dragEl = null;
          this.dragRootEl = null;
          this.dragDepth = 0;
          this.hasNewRoot = false;
          this.pointEl = null;
        },
        expandItem: function expandItem(li) {
          li.removeClass(this.options.collapsedClass);
          li.children('[data-action="expand"]').hide();
          li.children('[data-action="collapse"]').show();
          li.children(this.options.listNodeName).show();
        },
        collapseItem: function collapseItem(li) {
          var lists = li.children(this.options.listNodeName);

          if (lists.length) {
            li.addClass(this.options.collapsedClass);
            li.children('[data-action="collapse"]').hide();
            li.children('[data-action="expand"]').show();
            li.children(this.options.listNodeName).hide();
          }
        },
        expandAll: function expandAll() {
          var list = this;
          list.el.find(list.options.itemNodeName).each(function () {
            list.expandItem($(this));
          });
        },
        collapseAll: function collapseAll() {
          var list = this;
          list.el.find(list.options.itemNodeName).each(function () {
            list.collapseItem($(this));
          });
        },
        setParent: function setParent(li) {
          if (li.children(this.options.listNodeName).length) {
            li.prepend($(this.options.expandBtnHTML));
            li.prepend($(this.options.collapseBtnHTML));
          }

          li.children('[data-action="expand"]').hide();
        },
        unsetParent: function unsetParent(li) {
          li.removeClass(this.options.collapsedClass);
          li.children('[data-action]').remove();
          li.children(this.options.listNodeName).remove();
        },
        dragStart: function dragStart(e) {
          var mouse = this.mouse,
              target = $(e.target),
              dragItem = target.closest(this.options.itemNodeName);
          this.placeEl.css('height', dragItem.height());
          mouse.offsetX = e.offsetX !== undefined$1 ? e.offsetX : e.pageX - target.offset().left;
          mouse.offsetY = e.offsetY !== undefined$1 ? e.offsetY : e.pageY - target.offset().top;
          mouse.startX = mouse.lastX = e.pageX;
          mouse.startY = mouse.lastY = e.pageY;
          this.dragRootEl = this.el;
          this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.listClass + ' ' + this.options.dragClass);
          this.dragEl.css('width', dragItem.width());
          dragItem.after(this.placeEl);
          dragItem[0].parentNode.removeChild(dragItem[0]);
          dragItem.appendTo(this.dragEl);
          $(document.body).append(this.dragEl);
          this.dragEl.css({
            'left': e.pageX - mouse.offsetX,
            'top': e.pageY - mouse.offsetY
          }); // total depth of dragging item

          var i,
              depth,
              items = this.dragEl.find(this.options.itemNodeName);

          for (i = 0; i < items.length; i++) {
            depth = $(items[i]).parents(this.options.listNodeName).length;

            if (depth > this.dragDepth) {
              this.dragDepth = depth;
            }
          }
        },
        dragStop: function dragStop(e) {
          var el = this.dragEl.children(this.options.itemNodeName).first();
          el[0].parentNode.removeChild(el[0]);
          this.placeEl.replaceWith(el);
          this.dragEl.remove();
          this.el.trigger('change');

          if (this.hasNewRoot) {
            this.dragRootEl.trigger('change');
          }

          this.reset();
        },
        dragMove: function dragMove(e) {
          var list,
              parent,
              prev,
              next,
              depth,
              opt = this.options,
              mouse = this.mouse;
          this.dragEl.css({
            'left': e.pageX - mouse.offsetX,
            'top': e.pageY - mouse.offsetY
          }); // mouse position last events

          mouse.lastX = mouse.nowX;
          mouse.lastY = mouse.nowY; // mouse position this events

          mouse.nowX = e.pageX;
          mouse.nowY = e.pageY; // distance mouse moved between events

          mouse.distX = mouse.nowX - mouse.lastX;
          mouse.distY = mouse.nowY - mouse.lastY; // direction mouse was moving

          mouse.lastDirX = mouse.dirX;
          mouse.lastDirY = mouse.dirY; // direction mouse is now moving (on both axis)

          mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
          mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1; // axis mouse is now moving on

          var newAx = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0; // do nothing on first move

          if (!mouse.moving) {
            mouse.dirAx = newAx;
            mouse.moving = true;
            return;
          } // calc distance moved on this axis (and direction)


          if (mouse.dirAx !== newAx) {
            mouse.distAxX = 0;
            mouse.distAxY = 0;
          } else {
            mouse.distAxX += Math.abs(mouse.distX);

            if (mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
              mouse.distAxX = 0;
            }

            mouse.distAxY += Math.abs(mouse.distY);

            if (mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
              mouse.distAxY = 0;
            }
          }

          mouse.dirAx = newAx;
          /**
           * move horizontal
           */

          if (mouse.dirAx && mouse.distAxX >= opt.threshold) {
            // reset move distance on x-axis for new phase
            mouse.distAxX = 0;
            prev = this.placeEl.prev(opt.itemNodeName); // increase horizontal level if previous sibling exists and is not collapsed

            if (mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass)) {
              // cannot increase level when item above is collapsed
              list = prev.find(opt.listNodeName).last(); // check if depth limit has reached

              depth = this.placeEl.parents(opt.listNodeName).length;

              if (depth + this.dragDepth <= opt.maxDepth) {
                // create new sub-level if one doesn't exist
                if (!list.length) {
                  list = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
                  list.append(this.placeEl);
                  prev.append(list);
                  this.setParent(prev);
                } else {
                  // else append to next level up
                  list = prev.children(opt.listNodeName).last();
                  list.append(this.placeEl);
                }
              }
            } // decrease horizontal level


            if (mouse.distX < 0) {
              // we can't decrease a level if an item preceeds the current one
              next = this.placeEl.next(opt.itemNodeName);

              if (!next.length) {
                parent = this.placeEl.parent();
                this.placeEl.closest(opt.itemNodeName).after(this.placeEl);

                if (!parent.children().length) {
                  this.unsetParent(parent.parent());
                }
              }
            }
          }

          var isEmpty = false; // find list item under cursor

          if (!hasPointerEvents) {
            this.dragEl[0].style.visibility = 'hidden';
          }

          this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));

          if (!hasPointerEvents) {
            this.dragEl[0].style.visibility = 'visible';
          }

          if (this.pointEl.hasClass(opt.handleClass)) {
            this.pointEl = this.pointEl.parent(opt.itemNodeName);
          }

          if (this.pointEl.hasClass(opt.emptyClass)) {
            isEmpty = true;
          } else if (!this.pointEl.length || !this.pointEl.hasClass(opt.itemClass)) {
            return;
          } // find parent list of item under cursor


          var pointElRoot = this.pointEl.closest('.' + opt.rootClass),
              isNewRoot = this.dragRootEl.data('nestable-id') !== pointElRoot.data('nestable-id');
          /**
           * move vertical
           */

          if (!mouse.dirAx || isNewRoot || isEmpty) {
            // check if groups match if dragging over new root
            if (isNewRoot && opt.group !== pointElRoot.data('nestable-group')) {
              return;
            } // check depth limit


            depth = this.dragDepth - 1 + this.pointEl.parents(opt.listNodeName).length;

            if (depth > opt.maxDepth) {
              return;
            }

            var before = e.pageY < this.pointEl.offset().top + this.pointEl.height() / 2;
            parent = this.placeEl.parent(); // if empty create new list to replace empty placeholder

            if (isEmpty) {
              list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass);
              list.append(this.placeEl);
              this.pointEl.replaceWith(list);
            } else if (before) {
              this.pointEl.before(this.placeEl);
            } else {
              this.pointEl.after(this.placeEl);
            }

            if (!parent.children().length) {
              this.unsetParent(parent.parent());
            }

            if (!this.dragRootEl.find(opt.itemNodeName).length) {
              this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');
            } // parent root list has changed


            if (isNewRoot) {
              this.dragRootEl = pointElRoot;
              this.hasNewRoot = this.el[0] !== this.dragRootEl[0];
            }
          }
        }
      };

      $.fn.nestable = function (params) {
        var lists = this,
            retval = this;
        lists.each(function () {
          var plugin = $(this).data("nestable");

          if (!plugin) {
            $(this).data("nestable", new Plugin(this, params));
            $(this).data("nestable-id", new Date().getTime());
          } else {
            if (typeof params === 'string' && typeof plugin[params] === 'function') {
              retval = plugin[params]();
            }
          }
        });
        return retval || lists;
      };
    })(window.jQuery || window.Zepto, window, document);

    var nestable = 'Nestable';

    /**
     * --------------------------------------------------------------------------
     * Admin Site Menu (v0.0.1): site-menu.js
     * --------------------------------------------------------------------------
     */

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    var NAME = 'sitemenu';
    var DATA_KEY = 'bs.sitemenu';
    var EVENT_KEY = "." + DATA_KEY;
    var DATA_API_KEY = '.data-api';
    var JQUERY_NO_CONFLICT = $.fn[NAME];
    var Event = {
      LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY
    };
    var Selector = {
      editor: '.site-menu-editor'
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var SiteMenu = /*#__PURE__*/function () {
      function SiteMenu(element) {
        var _this = this;

        this._element = element;
        this._model = document.querySelector(element.dataset.model);
        this._form = document.querySelector(element.dataset.form);
        this._value = [];
        this._active = null;
        if (this._model.value) this._value = JSON.parse(this._model.value) || [];
        if (!this._value) this._model.value = '';else this.render(this._value, this._element);
        this.addElementsListener();
        $(this._element).nestable({
          collapseBtnHTML: '',
          dragClass: 'site-menu-item-drag',
          expandBtnHTML: '',
          handleClass: 'site-menu-item-handle',
          itemClass: 'site-menu-item',
          listClass: 'site-menu-list',
          maxDepth: 100,
          placeClass: 'site-menu-item-placeholder',
          rootClass: 'site-menu-editor'
        }).on('change', function () {
          _this.updateModel();
        });
      }

      var _proto = SiteMenu.prototype;

      _proto.addElementsListener = function addElementsListener() {
        var _this2 = this;

        $(this._element).on('click', '.btn-menu-edit', function (e) {
          _this2._active = e.currentTarget.parentNode.parentNode;

          _this2.editMenu(_this2._active.dataset.label, _this2._active.dataset.link);
        }).on('click', '.btn-menu-add', function () {
          _this2._active = null;

          _this2.editMenu('', '');
        }).on('click', '.btn-menu-remove', function (e) {
          _this2._active = e.currentTarget.parentNode.parentNode;
          $.dialog.confirm('Remove Confirmation', 'Are you sure want to remove this menu?', function (res) {
            if (!res) return;
            $(_this2._active).slideUp(function () {
              $(_this2._active).remove();
              _this2._active = null;

              _this2.updateModel();
            });
          });
        });
        $(this._form).on('show.bs.modal', function () {
          return _this2._form.classList.remove('was-validated');
        }).on('shown.bs.modal', function () {
          return _this2._form.label.select();
        }).on('submit', function (e) {
          e.preventDefault();
          var value = {
            label: _this2._form.elements.label.value,
            link: _this2._form.elements.link.value
          };
          if (!value.label || !value.link) return; // update exists menu

          if (_this2._active) {
            _this2._active.dataset.label = value.label;
            _this2._active.dataset.link = value.link;
            $(_this2._active).data('label', value.label);
            $(_this2._active).data('link', value.link);
            $(_this2._active).find('> .site-menu-item-handle > .site-menu-item-label').text(value.label);
            $(_this2._active).find('> .site-menu-item-handle > .site-menu-item-link').text(value.link);
            _this2._active = null;
          } else {
            var parent = $(_this2._element).children('.site-menu-list')[0];
            if (parent) _this2.makeItem(value).appendTo(parent);else _this2.render([value]);
          }

          $(_this2._form).modal('hide');

          _this2.updateModel();
        });
      };

      _proto.editMenu = function editMenu(label, link) {
        this._form.label.value = label;
        this._form.link.value = link;
        $(this._form).modal('show');
      };

      _proto.hs = function hs(str) {
        var map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return str.replace(/[&<>"']/g, function (m) {
          return map[m];
        });
      };

      _proto.makeItem = function makeItem(item) {
        var safe = {
          label: this.hs(item.label),
          link: this.hs(item.link)
        },
            tmpl = "\n                <li class=\"site-menu-item\" data-label=\"" + safe.label + "\" data-link=\"" + safe.link + "\">\n                    <div class=\"btn-group btn-group-sm\" role=\"group\" aria-label=\"Menu Action\">\n                        <button type=\"button\" class=\"btn btn-light btn-menu-edit\" title=\"Edit\">\n                            <i class=\"fas fa-edit\"></i>\n                        </button>\n                        <button type=\"button\" class=\"btn btn-light btn-menu-remove\" title=\"Remove\">\n                            <i class=\"fas fa-trash-alt\"></i>\n                        </button>\n                    </div>\n                    <div class=\"site-menu-item-handle\">\n                        <div class=\"site-menu-item-label\">" + safe.label + "</div>\n                        <small style=\"display:block\" class=\"text-truncate site-menu-item-link\">" + safe.link + "</small>\n                    </div>\n                </li>",
            eItem = $(tmpl);
        if (item.children) this.render(item.children, eItem);
        return eItem;
      };

      _proto.render = function render(items, cont) {
        var _this3 = this;

        var eList = $('<ol class="site-menu-list"></ol>').appendTo(cont);
        items.forEach(function (item) {
          return _this3.makeItem(item).appendTo(eList);
        });
      };

      _proto.updateModel = function updateModel() {
        this._value = $(this._element).nestable('serialize');
        console.log(this._value);
        this._model.value = this._value.length ? JSON.stringify(this._value) : '';
      } // Static
      ;

      SiteMenu._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
        return this.each(function () {
          var data = $(this).data(DATA_KEY);
          if (data) return;
          $(this).data(DATA_KEY, new SiteMenu(this));
        });
      };

      return SiteMenu;
    }();
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[NAME] = SiteMenu._jQueryInterface;
    $.fn[NAME].Constructor = SiteMenu;

    $.fn[NAME].noConflict = function () {
      $.fn[NAME] = JQUERY_NO_CONFLICT;
      return SiteMenu._jQueryInterface;
    };

    $(window).on(Event.LOAD_DATA_API, function () {
      $(Selector.editor).sitemenu();
    });

    exports.Nestable = nestable;
    exports.SiteMenu = SiteMenu;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=site-menu.js.map
