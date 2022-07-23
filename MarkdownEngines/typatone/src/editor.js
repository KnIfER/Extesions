/**
 * @author jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousEditor = root.Editor || {};

  var Cursor = function(children, parent, lineheight) {

    this.children = children;
    this.domElement = document.createElement('div');
    this.parent = parent;

    this.$ = { domElement: $(this.domElement), parent: $(parent) };

    this.lineheight = lineheight;
    this.$.domElement.addClass('text-cursor');

  };

  _.extend(Cursor, {

    Active: 'cursor-active'

  });

  _.extend(Cursor.prototype, {

    _index: - 1,
    _current: null,
    children: null,

    appendTo: function(elem) {
      elem.appendChild(this.domElement);
      return this;
    },

    stick: function() {

      var rect;

      if (!this.$.domElement.parent().length) {
        return this;
      }

      if (!this._current) {

        if (this.children.length <= 0) {
          rect = this.parent.getBoundingClientRect();
          rect = {
            top: rect.top + this.lineheight + 7,  // WTF 7???
            right: rect.left + this.lineheight,
            height: this.$.domElement.height()
          };
        } else {
          rect = this.children[0].getBoundingClientRect();
          rect = { top: rect.top, right: rect.left, height: rect.height };
        }

      } else if (/\<br\/?\>/i.test(this._current.innerHTML)) {

        rect = this._current.getBoundingClientRect();
        rect = {
          top: rect.top + this.lineheight,
          right: this.parent.getBoundingClientRect().left + this.lineheight,
          height: rect.height
        };

      } else {

        rect = this._current.getBoundingClientRect();

      }

      _.extend(this.domElement.style, {
        top: rect.top + (rect.height - this.$.domElement.height()) / 2 + 'px',
        left: (rect.right - 1) + 'px'
      });

      return this;

    }

  });

  Object.defineProperty(Cursor.prototype, 'children', {
    get: function() {
      return has.Edge ? this.parent.children : this._children;
    },
    set: function(children) {
      this._children = children;
    }
  });

  Object.defineProperty(Cursor.prototype, 'index', {
    get: function() {
      return this._index;
    },
    set: function(index) {
      // if (index === this._index) {
      //   return;
      // }
      this._index = Math.min(Math.max(index, -1), this.children.length - 1);
      this.current = this.children[this._index];
    }
  });

  Object.defineProperty(Cursor.prototype, 'current', {
    get: function() {
      return this._current;
    },
    set: function(current) {
      if (current === this._current) {
        return;
      }
      if (this._current) {
        this._current.classList.remove(Cursor.Active);
      }
      this._current = current;
      if (this._current) {
        this._current.classList.add(Cursor.Active);
      }
      this.stick(this._current);
    }
  });

  var Editor = root.Editor = function(lineheight) {

    var scope = this;

    this.domElement = document.createElement('div');
    this.$ = { domElement: $(this.domElement), root: $(root) };

    this.domElement.id = 'editor';
    this.lineheight = lineheight;

    var path = window.location.href.match(/localhost/i) ? '/assets/' : '//storage.googleapis.com/cdn.typatone.com/';

    var sound = new Sound(path + 'natural/space.mp3', _.bind(function() {

      var enableAudio = _.bind(function() {
        sound.play();
        Sound.enabled = true;
        this.$.domElement.unbind('click', enableAudio);
      }, this);

      this.$.domElement.bind('click', enableAudio);

    }, this));

    this.fade = new Fade();
    this.fade.bind('update', _.bind(this.lerpBPM, this));

    this.stage = document.createElement('div');
    this.stage.classList.add('stage');
    this.$.stage = $(this.stage);

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.$.content = $(this.content);

    this.keyboard = new Keyboard({ hit: this.domElement });
    this.$.keyboard = this.keyboard.$.domElement;

    this.cursor = new Cursor(this.content.children, this.content, lineheight);
    this.sequencer = new Sequencer();
    this.sequencer.bind('bpm', _.bind(this.fade.update, this.fade));

    if (root.localStorage
      && _.isString(root.localStorage.getItem(Editor.Events.volume))) {
      this.sequencer.volume.gain.value = root.localStorage.getItem(Editor.Events.volume);
    }

    this.visualization = new Visualization(this);

    var restartSequencer = this._restartSequencer = _.debounce(_.bind(function() {
      this.sequencer.play();
      if (this.$.domElement.hasClass('active')) {
        this.$.domElement.removeClass('active');
      }
    }, this), 3000);

    this._resizeBackdrop = _.bind(function() {

      var height = Math.max(
        this.$.content.outerHeight(), this.$.stage.height()
      );

      if (height !== this.visualization.canvas.renderer.height) {
        var width = this.$.stage.width();
        this.visualization.resize(width, height);
      }

    }, this);

    /**
     * Navigation on keyboard.
     */
    var navlist = [
      Editor.Events.about, /*Editor.Events.profile,*/ Editor.Events.volume,
      Editor.Events.filter, Editor.Events.paste, Editor.Events.download,
      /*Editor.Events.save,*/ Editor.Events.send
    ];

    if (has.iOS) {
      var index = _.indexOf(navlist, Editor.Events.download);
      if (index >= 0) {
        navlist.splice(index, 1);
      }
    }

    _.each(navlist, function(key) {

      var elem = document.createElement('div');
      elem.classList.add(key);

      var handler;

      switch (key) {

        case Editor.Events.volume:
          if (!this.sequencer.volume.gain.value) {
            elem.classList.add('mute');
          }
          handler = function() {
            elem.classList.toggle('mute');
            this.sequencer.volume.gain.value =
              this.sequencer.volume.gain.value > 0 ? 0 : 1;

            _gaq.push(['_trackEvent', Editor.Events.volume, 'change', this.sequencer.volume.gain.value]);

            if (root.localStorage) {
              root.localStorage.setItem(key, this.sequencer.volume.gain.value);
            }
            this.trigger(key, elem);
          }
          break;

        default:
          handler = function() {
            this.trigger(key, elem);
          };

      }

      this.keyboard.add(elem, _.bind(handler, this));

    }, this);

    this.keyboard
      .bind(Keyboard.Events.change, _.bind(function(key) {

        switch (key) {

          case Keyboard.SpecialKeys.delete:
            this.remove(this.cursor.index);
            break;
          case Keyboard.SpecialKeys.return:
            this.add(document.createElement('br'), this.cursor.index);
            break;
          case Keyboard.SpecialKeys.up:
          case Keyboard.SpecialKeys.down:
            // TODO: Need to account for these.
            break;
          case Keyboard.SpecialKeys.left:
            this.select(this.cursor.index - 1);
            break;
          case Keyboard.SpecialKeys.right:
            this.select(this.cursor.index + 1);
            break;
          case Keyboard.SpecialKeys.space:
            this.add(' ', this.cursor.index);
            break;
          default:
            this.add(key, this.cursor.index);

        }

        this.sequencer.stop();
        restartSequencer();
        if (!this.$.domElement.hasClass('active')) {
          this.$.domElement.addClass('active');
        }

        this.focus();
        _gaq.push(['_trackEvent', 'keyboard', 'change', key]);

        this._resizeBackdrop();

      }, this))
      .bind(Keyboard.Events.listen, _.bind(function() {

        this.$.content.addClass(Editor.Active);
        this.cursor.$.domElement.addClass(Editor.Active);

        this.sequencer.stop();
        restartSequencer();
        if (!this.$.domElement.hasClass('active')) {
          this.$.domElement.addClass('active');
        }

      }, this))
      .bind(Keyboard.Events.ignore, _.bind(function() {

        this.$.content.removeClass(Editor.Active);
        this.cursor.$.domElement.removeClass(Editor.Active);

      }, this));

    this.visualization.appendTo(this.stage);
    this.stage.appendChild(this.content);

    this.domElement.appendChild(this.fade.domElement);
    this.domElement.appendChild(this.stage);
    this.domElement.appendChild(this.cursor.domElement);
    this.domElement.appendChild(this.keyboard.domElement);

    var stick = _.debounce(_.bind(function() {
      this.cursor.stick();
      // this.cursor.domElement.style.display = 'block';
    }, this), 1000);

    this._spanSelect = function() {
      var index = _.indexOf(scope.cursor.children, this);
      scope.select(index);
    };

    this.$.stage
      .bind('scroll', _.bind(function() {
        this.cursor.domElement.style.top = - 999 + 'px';
        this.cursor.domElement.style.left = - 999 + 'px';
        // this.cursor.domElement.style.display = 'none';
        stick();
      }, this));

    if (has.mobile) {
      this.cursor.$.domElement.addClass(Editor.Active);
    }

  };

  _.extend(Editor, {

    noConflict: function() {
      root.Editor = previousEditor;
      return Editor;
    },

    Cursor: Cursor,

    Active: 'editor-active',

    Events: {

      about: 'about',
      profile: 'profile',
      volume: 'volume',
      filter: 'filter',
      download: 'download',
      paste: 'paste',
      save: 'save',
      send: 'send',

      complete: 'complete',
      delimiter: '-'

    },

    Regex: {
      quote: /\”/i,
      space: /\s/i,
      return: /\n/i,
      break: /\<br\>/i,
      nbsp: /\&nbsp\;/i
    },

    Dictionary: {
      quoteIndex: 0,
      ' ': '&nbsp;',
      ' ': '&nbsp;',
      '\'': '&rsquo;'
    },

    getHTMLEntity: function(key) {

      // Opening / closing Double Quotes
      if (Editor.Regex.quote.test(key)) {
        Editor.Dictionary.quoteIndex++;
        return !!(Editor.Dictionary.quoteIndex % 2) ? '&ldquo;' : '&rdquo;';
      }

      return Editor.Dictionary[key] || key;

    }

  });

  _.extend(Editor.prototype, Backbone.Events, {

    appendTo: function(elem) {
      elem.appendChild(this.domElement);
      return this;
    },

    init: function(width, height, silent) {

      this.resize(width, height);
      // this.cursor.stick();

      if (!silent) {
        this.sequencer.play();
      }

      this.visualization.resize(
        this.$.stage.width(),
        this.$.stage.height()
      );

      return this;

    },

    resize: function(width, height) {

      var keyboard = this.keyboard;
      this.width = width || this.$.root.width();
      this.height = height || this.$.root.height();

      // Calculate dimension variables based on device orientation.

      if (_.isNumber(window.orientation)) {
        if (window.orientation === 90 || window.orientation === - 90) {
          this.width = Math.max(width, height);
          this.height = Math.min(width, height);
        } else {
          this.height = Math.max(width, height);
          this.width = Math.min(width, height);
        }
      }

      // Localize variables

      var width = this.width;
      var height = this.height;

      var landscape = width >= height;
      var aspect = width / height;

      // Handler keyboard sizing and placement.

      keyboard.$.domElement.removeClass('small large left right top bottom');
      var position = 'bottom', styles = { paddingTop: 0 };

      if (landscape) {

        if (aspect > 1.66 && height <= 250) {
          position = 'left';
          keyboard.$.domElement.addClass('small left');
          styles.paddingTop = (height - keyboard.$.board.height()) / 2;
        } else if (aspect > 1.66 && height <= 600) {
          position = 'left';
          keyboard.$.domElement.addClass('left');
          styles.paddingTop = (height - keyboard.$.board.height()) / 2;
        } else if (aspect > 1.66) {
          position = 'left';
          keyboard.$.domElement.addClass('large left');
          styles.paddingTop = (height - keyboard.$.board.height()) / 2;
        } else if (aspect <= 1.66 && height <= 300) {
          position = 'bottom';
          keyboard.$.domElement.addClass('small bottom');
        } else if (aspect <= 1.66 && height <= 600) {
          position = 'bottom';
          keyboard.$.domElement.addClass('bottom');
        } else {
          position = 'bottom';
          keyboard.$.domElement.addClass('large bottom');
        }

      } else {

        // Portrait
        if (width <= 300) {
          position = 'bottom';
          keyboard.$.domElement.addClass('small bottom');
        } else if (width <= 600) {
          position = 'bottom';
          keyboard.$.domElement.addClass('bottom');
        } else {
          position = 'bottom';
          keyboard.$.domElement.addClass('large bottom');
        }

      }

      keyboard.$.domElement.css(styles);

      keyboard.width = keyboard.$.domElement.outerWidth();
      keyboard.height = keyboard.$.domElement.outerHeight();

      // Handle stage sizing and placement.

      styles = {};

      switch (position) {

        case 'right':
        case 'left':
          styles.width = width - keyboard.width;
          styles.height = height;
          break;

        case 'top':
        case 'bottom':
        default:
          styles.width = width;
          styles.height = height - keyboard.height;

      }

      this.$.stage.css(styles);

      this.cursor.stick();

      this._resizeBackdrop();

      return this;

    },

    add: function(character, index, silent) {

      var span = document.createElement('span');
      var children = this.$.content.children();
      var current = _.isNumber(index) ? index : Math.max(children.length - 1, 0);

      var message;  // Key char for this.sequencer
      var isCarriageReturn = _.isElement(character);

      $(span).bind('click', this._spanSelect);

      if (isCarriageReturn) {
        // Handles carriage-returns.
        span.appendChild(character);
        message = '\n';
      } else {
        span.innerHTML = Editor.getHTMLEntity(character);
        message = character.toLowerCase();
      }

      span.setAttribute('key', message);

      if (isCarriageReturn) {
        $(span).addClass('carriage-return');
      } else if (Editor.Regex.space.test(character)) {
        $(span).addClass('breaking');
      }

      var sound = Sequencer.getSound(message);
      if (sound && !silent) {
        sound.play({ destination: this.sequencer.volume });
      }

      if ((current < 0 && children.length <= 0) || current >= children.length) {

        this.$.content.append(span);
        this.sequencer.message += message;

      } else if (current < 0) {

        $(children[current + 1]).before(span);
        this.sequencer.message = message + this.sequencer.message;

      } else {

        $(children[current]).after(span);
        this.sequencer.message = this.sequencer.message.substr(0, current + 1) + message + this.sequencer.message.substr(current + 1);

      }

      this.cursor.index++;

      return span;

    },

    remove: function(index) {

      var children = this.$.content.children();
      var current = _.isNumber(index) ? index : (children.length - 1);

      if (current < 0 || current >= children.length) {
        return this;
      }

      var child = children[current];
      var message = this.sequencer.message;

      var key = child.getAttribute('key');
      if (Editor.Regex.quote.test(key)) {
        var quoteIndex = Math.max(Editor.Dictionary.quoteIndex - 1, 0);
        Editor.Dictionary.quoteIndex = quoteIndex;
      }

      child.remove();
      this.sequencer.message = message.substr(0, current) + message.substr(current + 1);
      this.cursor.index--;

      return child;

    },

    select: function(index) {

      this.cursor.index = index;
      return this;

    },

    focus: function() {

      var elem = this.$.content.children()[this.cursor.index];

      if (!elem) {
        return this;
      }

      var rect = elem.getBoundingClientRect();

      var y = this.$.stage.scrollTop() + rect.top - this.$.stage.height() / 2;

      this.$.stage.stop().animate({
        scrollTop: y
      });

      return this;

    },

    clear: function() {

      while (this.$.content.children().length > 0) {
        this.remove();
      }

      this.sequencer.stop();

      return this;

    },

    paste: function(message, callback) {

      this.clear();

      var index = 0;
      var step = 50;
      var loop = _.bind(function() {

        if (index >= message.length) {

          // Spoof sound to activate audio context on mobile.
          Sequencer.getSound(' ').play({ destination: this.volume });
          this._restartSequencer();

          if (_.isFunction(callback)) {
            callback();
          }

          return;
        }

        requestAnimationFrame(loop);

        for (var i = index; i < Math.min(index + step, message.length); i++) {

          var character = message.charAt(i);
          if (Editor.Regex.return.test(character)) {
            character = document.createElement('br');
          } else if (Editor.Regex.space.test(character)) {
            character = ' ';
          }

          this.add(character, undefined, true);

        }

        index += step;

      }, this);

      loop();

      return this;

    },

    set: function(model) {

      this.fade.update(model.timestamp);

      var message = model.message;

      for (var i = 0; i < message.length; i++) {
        var character = message.charAt(i);
        if (Editor.Regex.return.test(character)) {
          character = document.createElement('br');
        } else if (Editor.Regex.space.test(character)) {
          character = ' ';
        }
        this.add(character, undefined, true);
      }

      return this;

    },

    toJSON: function() {
      return {
        // published: // [bool]
        // mode: // string
        timestamp: this.fade.timestamp,
        message: this.getMessage()
      };
    },

    getMessage: function(urlSafe) {

      var children = this.$.content.children();
      var result = [];

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var message = child.innerHTML;
        message = Editor.Regex.break.test(message) ? '\n' : child.textContent;
        result.push(message);
      }

      return urlSafe ?
        result.join('').toLowerCase().replace(/[^a-zA-Z\d]/ig, '-') : result.join('');

    },

    lerpBPM: function(n) {
      var theta = 2 * Math.PI * n + this.sequencer.offsetBPM;
      var variance = this.sequencer.breadthBPM * Math.sin(theta);
      Two.Trail.Drag = this.sequencer.baseBPM / Sequencer.Palette.speed.beeps;
      this.sequencer.bpm = Math.round(variance + this.sequencer.baseBPM);
      return this;
    }

  });

})();
