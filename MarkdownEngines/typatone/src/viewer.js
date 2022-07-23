/**
 * Depends on `/src/editor.js`
 * @author jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousViewer = root.Viewer || {};

  var Viewer = root.Viewer = function(lineheight) {

    var scope = this;

    this.domElement = document.createElement('div');
    this.$ = { domElement: $(this.domElement), root: $(root) };

    this.domElement.id = 'viewer';
    this.lineheight = lineheight;

    this.fade = new Fade(true);
    this.fade.bind('update', _.bind(this.lerpBPM, this));

    this.stage = document.createElement('div');
    this.stage.classList.add('stage');
    this.$.stage = $(this.stage);

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.$.content = $(this.content);

    this.sequencer = new Sequencer();
    this.sequencer.loop = false;

    this.visualization = new Visualization(this);

    this._resizeBackdrop = _.bind(function() {

      var height = Math.max(
        this.$.content.outerHeight(), this.$.stage.height()
      );

      if (height !== this.visualization.canvas.renderer.height) {
        width = this.$.stage.width();
        this.visualization.resize(width, height);
      }

    }, this);

    this.visualization.appendTo(this.stage);
    this.stage.appendChild(this.content);

    this.navigation = document.createElement('div');
    this.navigation.classList.add('navigation');
    this.$.navigation = $(this.navigation);

    var navlist = [
      Viewer.Events.about, Viewer.Events.create, Viewer.Events.replay,
      Viewer.Events.download, Viewer.Events.send
    ];

    // if (has.iOS) {
    //   navlist.splice(_.indexOf(navlist, Viewer.Events.download), 1);
    // }

    var preventDefault = function(e) {
      e.preventDefault();
      return false;
    };

    _.each(navlist, function(key) {

      var elem = document.createElement('a');
      elem.classList.add(key);
      elem.setAttribute('href', '#');

      switch (key) {

        case Viewer.Events.create:
          elem.setAttribute('href', 'http://typatone.com/');
          elem.setAttribute('target', '_blank');
          break;

        default:
          $(elem)
            .bind('click', preventDefault)
            .bind('mousedown touchstart', _.bind(function(e) {
              e.preventDefault();
              this.trigger(key, elem);
              return false;
            }, this));

      }

      this.navigation.appendChild(elem);

    }, this);

    this.playButton = document.createElement('div');
    this.playButton.classList.add('play-button');
    this.$.playButton = $(this.playButton)
      .bind('click', _.bind(function() {
        Sound.enabled = true;
        this.$.playButton.removeClass('enabled');
        this.replay();
      }, this));

    var fb_callout = document.createElement('a');
    fb_callout.setAttribute('href', 'https://www.facebook.com/typatone');
    fb_callout.setAttribute('target', '_blank');
    fb_callout.innerHTML = '<div id="facebook-callout"></div>';

    this.domElement.appendChild(this.fade.domElement);
    this.domElement.appendChild(this.stage);
    this.domElement.appendChild(this.navigation);
    this.domElement.appendChild(this.playButton);
    this.domElement.appendChild(fb_callout);

    this.sequencer.bind('update', _.bind(function(index, key) {

      var elem = this.content.children[index];

      if (!elem) {
        return;
      }

      elem.classList.add('enabled');

    }, this));

    this.bind('ready', _.bind(function() {
      this.$.playButton.addClass('enabled');
    }, this));

  };

  _.extend(Viewer, {

    Events: {
      about: 'about',
      create: 'create',
      replay: 'replay',
      embed: 'embed',
      download: 'download',
      charge: 'charge',
      send: 'send'
    },

    noConflict: function() {
      root.Viewer = previousViewer;
      return Viewer;
    }

  });

  _.extend(Viewer.prototype, Editor.prototype, {

    appendTo: function(elem) {
      elem.appendChild(this.domElement);
      return this;
    },

    init: function(width, height, silent) {

      if (!silent) {
        this.sequencer.play();
      }

      this.resize(width, height);
      this.visualization.resize(
        this.$.stage.width(),
        this.$.stage.height()
      );

      return this;

    },

    resize: function(width, height) {

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

      this.$.stage.css({
        width: width,
        height: height - this.$.navigation.height()
      });
      this._resizeBackdrop();

      return this;

    },

    set: function(model) {

      this.fade.update(model.timestamp);

      var message = model.message;

      this.sequencer.message = message.toLowerCase();
      this.$.content.html('');

      for (var i = 0; i < message.length; i++) {

        var character = message.charAt(i);
        var span = document.createElement('span');
        var isCarriageReturn = Editor.Regex.return.test(character); // TODO: Test

        if (isCarriageReturn) {
          span.appendChild(document.createElement('br'));
        } else if (Editor.Regex.space.test(character)) {
          span.innerHTML = Editor.getHTMLEntity(' ');
        } else {
          span.innerHTML = Editor.getHTMLEntity(character);
        }

        span.setAttribute('key', character);

        if (isCarriageReturn) {
          $(span).addClass('carriage-return');
        } else if (Editor.Regex.space.test(character)) {
          $(span).addClass('breaking');
        }

        this.$.content.append(span);

      }

      return this;

    },

    replay: function() {
      this.sequencer.stop().play();
      _.each(this.$.stage.find('.enabled'), function(elem) {
        elem.classList.remove('enabled');
      });
      return this;
    },

    clear: function(callback) {

      this.$.content.fadeOut(150, _.bind(function() {

        while (this.$.content.children().length > 0) {
          this.remove();
        }

        this._resizeBackdrop();
        this.$.content.css('display', 'block');

        if (_.isFunction(callback)) {
          callback();
        }

      }, this));

      this.sequencer.stop();

      return this;

    }

  });

})();
