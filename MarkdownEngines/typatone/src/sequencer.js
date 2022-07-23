/**
 * @author jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousSequencer = root.Sequencer || {};
  var callbacks = [];
  var characters = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u',
    'v', 'w', 'x', 'y', 'z', 'punctuation',
    'space', 'symbols'
  ];
  var keys = {
    punctuation: /(\.|\;|\,|\?|\!|\&|\||\(|\)|\-|\–|\—|\'|\:|\"|\/|\<|\>|\[|\]|\{|\}|\’|\“|\”)/i,
    space: /\s/i,
    symbols: /(\@|\#|\$|\%|\^|\*|\+|\=|\_|\\|\~|\€|\£|\¥|\•)/i
  };

  var Sequencer = root.Sequencer = function() {

    var scope = this;

    this.volume = Sound.ctx.createGain();
    this.volume.connect(Sound.ctx.destination);

    var ping = _.bind(this.ping, this);
    this._ping = _.bind(function() {

      var now = Date.now();
      var atomic = this.bpmToMillis(this.atomicBPM);
      var next = atomic * Math.floor(now / atomic) + this.bpmToMillis();
      var dest = next - now;

      this.timeout = setTimeout(ping, this.bpmToMillis());

    }, this);

    Sequencer.Instances.push(this);

  };

  _.extend(Sequencer, {

    Instances: [],

    Characters: characters,

    Palette: {
      list: ['natural', 'sustain', 'beeps', 'spooky', 'boards', 'flutter'],
      speed: {
        natural: 240,
        boards: 40,
        flutter: 80,
        beeps: 400,
        spooky: 100,
        seasick: 120,
        bongorhodes: 240,
        sustain: 100
      },
      index: - 1
    },

    getSound: function(key) {
      var property = getProperty(key);
      var palette = Sequencer.Palette.list[Sequencer.Palette.index];
      return Sequencer.Palette[palette][property] || null;
    },

    load: function(i, callback) {

      var index = mod(i, Sequencer.Palette.list.length);
      var palette = Sequencer.Palette.list[index];

      var complete = function() {
        _.each(Sequencer.Instances, function(sequencer) {
          sequencer.baseBPM = Sequencer.Palette.speed[palette];
          sequencer.trigger('bpm');
        });
        if (_.isFunction(callback)) {
          Sequencer.Palette.index = index;
          Sequencer.Palette[palette].loaded = true;
          callback(index);
        }
      };
      var soundsLoaded = _.after(characters.length, complete);;
      var soundLoaded = function() {
        soundLoaded.index++;
        if (_.isFunction(Sequencer._onLoad)) {
          Sequencer._onLoad(soundLoaded.index / characters.length);
        }
        soundsLoaded();
      };
      soundLoaded.index = 0;

      if (Sequencer.Palette[palette].loaded) {
        complete();
        return;
      }

      _.each(characters, function(c, i) {

        var path = window.location.href.match(/localhost/i) ? '/assets/' : '//storage.googleapis.com/cdn.typatone.com/';
        path += palette + '/' + c + '.mp3';

        var sound = new Sound(path, soundLoaded);

        Sequencer.Palette[palette][c] = sound;

      });

    },

    onLoad: function(f) {
      Sequencer._onLoad = f;
      return Sequencer;
    }

  });

  _.each(Sequencer.Palette.list, function(name) {
    Sequencer.Palette[name] = {};
  });

  _.extend(Sequencer.prototype, Backbone.Events, {

    offsetBPM: Math.PI * 1.5, // In radians for `editor.js`

    atomicBPM: 400,

    breadthBPM: 0,

    baseBPM: 240,

    bpm: 0,

    playing: false,

    index: - 1,

    interval: null,

    message: '',

    loop: true,

    timeout: null,

    ping: function() {

      if (!this.playing) {
        return this;
      }

      var index = this.index + 1;
      if (index >= this.message.length && !this.loop) {
        this.stop();
        return this;
      }
      this.update(index);

      requestAnimationFrame(this._ping);

      return this;

    },

    play: function() {

      if (this.playing) {
        return this;
      }

      this.playing = true;
      this._ping();

      this.trigger('play');

      return this;

    },

    pause: function(silent) {

      if (!this.playing) {
        return this;
      }

      if (_.isNumber(this.timeout)) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }

      this.playing = false;

      if (!silent) {
        this.trigger('pause');
      }

      return this;

    },

    stop: function() {

      if (this.playing) {
        this.pause(true);
      }

      this.index = - 1;

      this.trigger('stop');

      return this;

    },

    update: function(index) {

      this.index = index % (this.message.length || 1);//mod(index, this.message.length);
      var key = this.message[this.index];
      var name = getProperty(key);

      if (!name) {
        return this;//.update(this.index + 1);
      }

      var sound = Sequencer.getSound(name);
      if (sound) {
        sound.play({
          destination: this.volume
        });
      }

      this.trigger('update', this.index, key);

      return this;

    },

    bpmToMillis: function(v) {
      return 60000 / (v || this.bpm);
    },

    export: function(callback) {

      var node = Sound.ctx.createGain();
      var rec = new Recorder(node, {
        workerPath: '/third-party/recorder-worker.js',
        bufferLen: 1024,
        numChannels: 1
      });
      var timeStep = this.bpmToMillis();

      rec.record();

      _.each(this.message, function(key, i) {
        var name = getProperty(key);
        var sound = Sequencer.getSound(name);
        if (!sound) {
          return;
        }
        sound.play({
          destination: node,
          time: Sound.ctx.currentTime + i * timeStep / 1000
        });
      }, this);

      setTimeout(_.bind(function() {

        rec.stop();
        rec.exportWAV(_.bind(function(blob) {

          // console.log('exported .wav', arguments);
          if (_.isFunction(callback)) {
            callback(blob);
            return;
          }

          // Default a forced download
          Recorder.forceDownload(blob);

        }, this));

      // TODO: The `1` on the next line might need to be parameterized.
      }, this), Sound.ctx.currentTime + (this.message.length + 1) * timeStep);

    }

  });

  function getProperty(v) {
    if (keys.punctuation.test(v)) {
      return 'punctuation';
    }
    if (keys.space.test(v)) {
      return 'space';
    }
    if (keys.symbols.test(v)) {
      return 'symbols';
    }
    return v;
  }

  function mod(v, l) {
    while (v < 0) {
      v += l;
    }
    return v % l;
  }

})();
