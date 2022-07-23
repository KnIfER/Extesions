/**
 * @author jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousVisualization = root.Visualization || {};

  var mouse = new Two.Vector();
  var $window, $document;

  $(function() {
    $window = $(window);
    $document = $(document);
  });

  var Visualization = root.Visualization = function(editor) {

    this.editor = editor;
    this.sequencer = editor.sequencer;
    this.canvas = new Two({
      autostart: true
    });

    var points = _.map(_.range(15), function() {
      return new Two.Anchor();
    });
    this.trail = new Two.Trail(points, false, true);
    this.trail.fill = 'rgb(255, 255, 200)';
    this.trail.cap = this.trail.join = 'round';
    this.trail.stroke = 'none';
    this.trail.closed = true;
    this.trail.curved = true;

    this.canvas.add(this.trail);

    this.trail.head = new Two.Ellipse(- 999, - 999, 1, 1);
    this.trail.head.scale = this.trail.distance;
    this.trail.head.fill = this.trail.fill;
    this.trail.head.stroke = 'none';
    this.trail.head.visible = false;

    this.canvas.add(this.trail.head);

    var origin = new Two.Vector();
    var position = new Two.Vector();
    var destination = new Two.Vector();
    var startTime = Date.now();

    position.arcLerp = function(a, b, pct) {

      var r = Math.abs((b.x - a.x) / 2);
      var mx = (b.x - a.x) / 2 + a.x;
      var my = (b.y - a.y) / 2 + a.y;

      var theta = - Math.PI * (1 - pct);

      this.x = r * Math.cos(theta) + mx;
      this.y = r * Math.sin(theta) + my;

      return this;

    };

    this.canvas.bind('update', _.bind(function() {

      if (!this.trail.visible) {
        return;
      }

      var pct = (Date.now() - startTime) / (this.sequencer.bpmToMillis());
      pct = Math.min(Math.max(pct, 0), 1);

      position.arcLerp(origin, destination, pct);
      var x = position.x;
      var y = position.y;

      this.trail.queue(x, y).update();
      this.trail.head.translation.copy(this.trail.destinations[1]);

    }, this));

    var shouldReset = false;

    var queue = _.bind(function(x, y, force) {

      origin.copy(destination);
      destination.set(x, y);
      startTime = Date.now();

    }, this);

    var reset = _.bind(function(x, y) {

      origin.set(x, y);
      destination.set(x, y);
      startTime = Date.now();
      this.trail.reset(x, y);
      this.trail.head.translation.set(x, y);

    }, this);

    var play = _.bind(function() {

      this.trail.head.visible = this.trail.visible = true;

      var children = this.editor.$.content.children();
      var child = $(children[0]);
      var rect = child.position();

      if (!rect) {
        reset(- 999, - 999);
        return;
      }

      var x = rect.left + child.width() / 2;
      var y = rect.top;

      reset(x, y);

    }, this);
    var stop = _.bind(function() {

      this.trail.head.visible = this.trail.visible = false;

    }, this);
    var update = _.bind(function(index, key) {

      var children = this.editor.$.content.children();
      var length = children.length;
      var id = (index + 1) % length;
      var child = $(children[id]);

      if (child.length <= 0) {
        return;
      }

      var rect = child.position();
      var x = rect.left + child.outerWidth() / 2;
      var y = rect.top - this.padding;

      if (id > 0) {
        var prev = $(children[id - 1]);
        if (prev.length > 0 && Math.abs(prev.position().top - y) > this.editor.lineheight / 2) {
          shouldReset = true;
        }
      }

      // Also test if it's just a new line because of string length.
      if (/[\r\n]/i.test(key)) {
        shouldReset = true;
      }

      if (id <= 0 || shouldReset) {
        reset(x, y);
        this.trail.head.visible = false;
      } else {
        queue(x, y);
        this.trail.head.visible = true;
      }

      shouldReset = false;

    }, this);

    this.sequencer
      .bind('play', play)
      .bind('pause', stop)
      .bind('stop', stop)
      .bind('update', update);

  };

  _.extend(Visualization, {

    Colors: {
      natural: 'rgb(255, 255, 200)',
      boards: 'rgb(255, 200, 200)',
      flutter: 'rgb(255, 200, 200)',
      beeps: 'rgb(200, 200, 255)',
      spooky: 'rgb(0, 255, 200)',
      seasick: 'rgb(200, 255, 255)',
      bongorhodes: 'rgb(255, 255, 255)',
      sustain: 'rgb(200, 255, 255)'
    }

  });

  _.extend(Visualization.prototype, {

    padding: - 5,

    appendTo: function(elem) {
      this.canvas.appendTo(elem);
      return this;
    },

    resize: function(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.renderer.setSize(width, height);
      this.trail.head.scale = this.trail.distance = width <= 300 ? 1.5 : 3;
      return this;
    },

    setColor: function(col) {
      this.trail.head.fill = this.trail.fill = col;
      return this;
    }

  });

})();