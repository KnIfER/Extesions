(function() {

  var root = this;
  var previousFade = root.Fade || {};

  var Fade = root.Fade = function(manual) {

    this.domElement = document.createElement('div');
    this.domElement.classList.add('fade');
    this.$ = { domElement: $(this.domElement) };

    // // For debugging to see colors.
    // var hour = 0;
    // $(window).click(_.bind(function() {
    //   this.update('Wed Jan 14 2015 ' + hour + ':00:00 GMT-0800 (PST)');
    //   hour = (hour + 1) % 24;
    // }, this));

    if (!manual) {
      this.listen();
    }

  };

  _.extend(Fade, {

    Colors: [
      { r: 50, g: 25, b: 175, time: 0 },
      { r: 255, g: 255, b: 150, time: 6 },
      { r: 0, g: 200, b: 255, time: 12 },
      { r: 255, g: 125, b: 125, time: 18 }
    ],

    GradientPrefix: getCssValuePrefix('backgroundImage', 'linear-gradient(left, #fff, #fff)')

  });

  _.extend(Fade.prototype, Backbone.Events, {

    timestamp: 0,

    /**
     * 10 Minute Hold Time
     */
    holdTime: 10 * 60 * 60 * 1000,

    /**
     * Turn off polling to change fade color.
     */
    ignore: function() {

      if (this._interval) {
        clearInterval(this._interval);
        delete this._interval;
      }

      return this;

    },

    /**
     * Automatically poll and update fade color at a given interval.
     */
    listen: function() {

      var update = _.bind(this.update, this);
      this._interval = setInterval(update, this.holdTime);

      this.update();

      return this;

    },

    /**
     * Update fade's color based on the time of day or specific time.
     */
    update: function(d) {

      var date = new Date();

      if (d) {
        var m = d - Math.floor(d);
        date.setHours(d);
        date.setMinutes(m * 60);
      }

      var hour = date.getHours() + date.getMinutes() / 60;
      var length = Fade.Colors.length;
      var index = Math.floor(hour / 6);

      var a = Fade.Colors[index];
      var b = Fade.Colors[(index + 1) % length]

      var pct = (hour - a.time) / ((b.time || 24) - a.time);
      var c = lerp(a, b, pct);

      this.set(c);
      this.timestamp = hour;

      this.trigger('update', hour / 24);  // Send a normalized value of the day.

      return this;

    },

    /**
     * Set a fade's color based on a certain color.
     */
    set: function(color) {

      var c = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', 0.75)';
      this.domElement.style.backgroundImage = Fade.GradientPrefix + 'linear-gradient(bottom, rgba(255, 255, 255, 0), ' + c + ' 75%)';

      return this;

    }

  });

  function lerp(a, b, pct) {
    return {
      r: Math.round(pct * (b.r - a.r) + a.r),
      g: Math.round(pct * (b.g - a.g) + a.g),
      b: Math.round(pct * (b.b - a.b) + a.b),
    }
  }

  function getCssValuePrefix(name, value) {

    var prefixes = ['', '-o-', '-ms-', '-moz-', '-webkit-'];
    var dom = document.createElement('div');

    for (var i = 0; i < prefixes.length; i++) {

      dom.style[name] = prefixes[i] + value;

      if (dom.style[name]) {
        return prefixes[i];
      }

      dom.style[name] = '';

    }

    return '';

  }

})();