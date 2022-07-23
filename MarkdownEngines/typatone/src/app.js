(function() {

  var root = this;
  var previousApp = root.App || {};
  var warn = function() {
    return [
      'Your download is in progress. If you leave this page you will lose',
      'your download.'
      ].join(' ');
  };

  var App = root.App = function(model) {

    this.domElement = document.createElement('div');
    this.domElement.classList.add('typatone');
    this.$ = { domElement: $(this.domElement), body: $(document.body) };

    this.model = model || new App.Models.Message();
    this.published = this.model.get('published');

    this.view = (_.isObject(model) && this.published)
      ? new Viewer(App.LineHeight) : new Editor(App.LineHeight);

    this.view.set({
      timestamp: this.model.get('timestamp'),
      message: this.model.get('message') || ''
    });

    this.modal = new Modal();

    this.view.appendTo(this.domElement);
    this.modal.appendTo(this.domElement)

    this.elems = {
      send: document.createElement('div'),
      embed: document.createElement('div'),
      paste: document.createElement('div'),
      charge: document.createElement('div')
    };

    this.elems.send.innerHTML = App.Templates.send;
    this.elems.embed.innerHTML = App.Templates.embed;
    this.elems.paste.innerHTML = App.Templates.paste;
    this.elems.charge.innerHTML = App.Templates.charge;

    $(this.elems.paste).find('button.submit')
      .bind('click', _.bind(function(e) {

        e.preventDefault();

        var domElement = $(this.elems.paste).find('#paste-text');

        if (domElement.hasClass('pasting')) {
          return;
        }

        domElement.addClass('pasting');
        $(this.elems.paste).find('button').html('Pasting');

        var message = $(this.elems.paste).find('textarea').val();
        this.view.paste(message, _.bind(function() {
          this.modal.hide(function() {
            domElement.removeClass('pasting');
          });
        }, this));

      }, this));

    this.view
      .bind(Viewer.Events.replay, _.bind(function() {

        if (_.isFunction(this.view.replay)) {
          this.view.replay();
          _gaq.push(['_trackEvent', Viewer.Events.replay, 'change', true]);
        }

      }, this))
      .bind(Editor.Events.about, _.bind(function() {

        $('#view-about').appendTo(document.body);
        _.defer(function() {
          $('#view-about').css('opacity', 1);
        });

      }, this))
      .bind(Editor.Events.filter, _.bind(function(elem, forcedIndex) {

        if (elem.classList.contains('in-progress')) {
          return;
        }

        elem.classList.add('in-progress');
        var index = _.isUndefined(forcedIndex)
          ? Sequencer.Palette.index + 1 : forcedIndex;

        _gaq.push(['_trackEvent', Editor.Events.filter, 'change', index]);

        Sequencer.load(index, _.bind(function(index) {

          _.each(Sequencer.Palette.list, function(name, i) {
            if (index === i) {
              this.view.$.domElement.addClass(name);
            } else if(this.view.$.domElement.hasClass(name)) {
              this.view.$.domElement.removeClass(name);
            }
          }, this);
          var palette = Sequencer.Palette.list[index];
          this.view.visualization.setColor(Visualization.Colors[palette]);
          elem.classList.remove('in-progress');

        }, this));

      }, this))
      .bind(Editor.Events.paste, _.bind(function() {

          var textarea = $(this.elems.paste).find('textarea').val(
            this.view.getMessage()
          );
          $(this.elems.paste).find('button').html('Paste');

          this.modal.append(this.elems.paste, true);
          this.modal.show(function() {

            if (!has.mobile) {
              textarea.select();
            }

          });

      }, this))
      .bind(Editor.Events.download, _.bind(function(elem) {

        var message = this.view.getMessage();

        if (!message) {
          alert('Hold on there! You need to write something first.');
          return;
        } else if (message.length > 3000) {
          alert('Sorry, but this Typatone message is too long to generate an audio file. The maximum length is 3000 characters.');
          return;
        }

        _gaq.push(['_trackEvent', 'request-download', 'change', true]);

        elem.classList.add('in-progress');
        window.onbeforeunload = warn;

        this.publish(_.bind(function() {

          // this.charge(_.bind(function() {

            _gaq.push(['_trackEvent', Viewer.Events.download, 'change', true]);
            this.router.navigate('/m/' + this.model.id, { trigger: false, replace: true });
            _.bind(download, this)();

          // }, this));

        }, this));

        function download() {

          var socket = io('//download-dot-typatone.appspot.com');
          var requested = false;

          socket.on('progress', console.log);

          socket.on('download', _.bind(function(resp) {

            window.onbeforeunload = null;
            elem.classList.remove('in-progress');

            if (socket.connected) {
              socket.disconnect();
            }

            var a = document.createElement('a');
            a.href = resp.wav;
            a.target = '_blank';
            a.download = this.model.id + '.wav';
            a.textContent = 'Download';
            a.style.display = 'none';

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);

          }, this));

          socket.on('connect', _.bind(function() {

            if (!requested) {
              socket.emit('download', {
                id: this.model.id
              });
              requested = true;
            }

          }, this));

        }

      }, this))
      .bind(Editor.Events.save, _.bind(function(elem) {

        if (!this.view.getMessage()) {
          alert('Hold on there! You need to write something first.');
          return;
        }

        if (elem.classList.contains('in-progress')) {
          return;
        }

        elem.classList.add('in-progress');
        this.save(_.bind(function() {
          this.router.navigate('/m/' + this.model.id, { trigger: false, replace: true });
          elem.classList.remove('in-progress');
        }, this));

      }, this))
      .bind(Editor.Events.send, _.bind(function(elem) {

        if (!this.view.getMessage()) {
          alert('Hold on there! You need to write something first.');
          return;
        }

        if (elem.classList.contains('in-progress')) {
          return;
        }

        elem.classList.add('in-progress');
        this.publish(_.bind(function() {

          this.router.navigate('/m/' + this.model.id, { trigger: false, replace: true });

          var send = $(this.elems.send);
          var url = 'http://typatone.com' + window.location.pathname;// + 'm/' + this.model.id;
          var text = 'Check out this message on Typatone';

          var input = send.find('input')
            .val(url);

          var qr = send.find('.qr')
            .html('<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + url + '" width="150" height="150" />');

          send.find('.facebook').attr('href', 'http://www.facebook.com/sharer.php?u=' + url);
          send.find('.twitter').attr('href', 'https://twitter.com/share?text=' + text + '&url=' + url);
          // send.find('.gplus').attr('href', 'https://plus.google.com/share?url=' + url);
          send.find('.email').attr('href', 'mailto:?subject='
              + '[Typatone] A message for you.'
              + '&body=' + text + ': '
              + url
            );

          this.modal.append(this.elems.send, true);
          if (!has.mobile) {
            this.modal.append(this.elems.embed);
            var iframe = '<iframe src="' + url.replace('http\:', '')
              + '" width="320" height="540" frameborder="0" border="0" style="border: 6px solid #ccc; border-radius: 3px;"></iframe>'
            $(this.elems.embed).find('input').val(iframe);
          }
          this.modal.show(function() {
            if (!has.mobile) {  // Select the input on desktop.
              input.scrollLeft(input.outerWidth()).select();
            }
          });

          elem.classList.remove('in-progress');

        }, this));

      }, this));

    this.$.filter = this.view.$.domElement.find('.filter');

    // Load initial audio files

    this.$.body.addClass('loading');
    Sequencer.load(this.model.get('filter') || 0, _.bind(function(index) {

      _.each(Sequencer.Palette.list, function(name, i) {
        if (index === i) {
          this.view.$.domElement.addClass(name);
        } else if(this.view.$.domElement.hasClass(name)) {
          this.view.$.domElement.removeClass(name);
        }
      }, this);

      var palette = Sequencer.Palette.list[index];
      this.view.visualization.setColor(Visualization.Colors[palette]);
      this.view.lerpBPM(this.view.fade.timestamp / 24);

      this.$.body.removeClass('loading');

      setTimeout(function() {
        $('#lobby').css('display', 'none');
      }, 500);

      this.view.trigger('ready');

    }, this));

  };

  _.extend(App, {

    LineHeight: 50,

    Payments: {
      Info: {
        name: 'Typatone • Download',
        description: 'audio to your computer as a .wav file',
        amount: 99
      }
    },

    Models: {
      Message: Parse.Object.extend('Message'),
      fetch: function(id, callback) {

        var query = new Parse.Query(App.Models.Message);
        query.get(id, {
          success: callback,
          error: callback
        });

        return this;

      }
    },

    Templates: {
      // TODO: Have a mobile check and if not then add embed code.
      send: '<div class="qr"></div><p>Share this message:</p><p class="social"><a class="facebook" href="#" target="_blank"></a><a class="twitter" href="#" target="_blank"></a><a class="email" href="#"></a></p><input type="text" id="share-url">',
      embed: '<br /><br /><p>Embed this message:</p><input type="text" id="embed-url">',
      paste: '<div id="paste-text"><p>Paste text from your clipboard:</p><p class="paste-content"><textarea style="resize:vertical; box-shadow: none;"></textarea></p><p><button class="submit"></button></p></div>',
      charge: '<div id="stripe-charge"><div class="form"></div><div class="submit"></div></div>'
    }

  });

  _.extend(App.prototype, {

    published: false,

    appendTo: function(elem) {
      elem.appendChild(this.domElement);
      return this;
    },

    publish: function(callback) {

      this.published = true;
      this.save(callback);

      _gaq.push(['_trackEvent', Editor.Events.send, 'change', true]);

      return this;

    },

    save: function(callback) {

      var model = this.model;

      if (this.view instanceof Editor) {

        // TODO: Only save if different

        model.save({
          filter: Sequencer.Palette.index,
          published: this.published,
          timestamp: this.view.fade.timestamp,
          message: this.view.getMessage()
        }).then(callback);
        return this;

      }

      callback();
      return this;

    },

    charge: function(callback) {

      var stripe = this.stripe.sdk;

      this.modal.append(this.elems.charge, true);

      /**
       * Payment Request Element
       */
      var request = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          amount: 199,
          label: 'Total'
        },
        displayItems: [
          {
            amount: 199,
            label: 'Encoded WAV File: ' + this.model.id
          }
        ],
        requestPayerName: true,
        requestPayerEmail: true
      });

      var button = this.stripe.elements.create('paymentRequestButton', {
        paymentRequest: request,
        style: {
          paymentRequestButton: {
            theme: 'light'
          }
        }
      });

      request.canMakePayment().then(_.bind(function(result) {
        console.log('canMakePayment', result);
        if (result) {
          button.mount(this.elems.charge.querySelector('div.submit'));
        }
      }, this));

      request.on('token', _.bind(function(result) {
        if (result) {
          this.modal.hide(callback);
        }
      }, this));

      this.modal.show();

      _gaq.push(['_trackEvent', Viewer.Events.charge, 'change', true]);

      return this;

    },

    setRouter: function(router) {
      this.router = router;
      return this;
    }

  });

})();
