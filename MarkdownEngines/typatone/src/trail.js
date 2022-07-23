/**
 * @author jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var Polygon = Two.Polygon;
  var max = Math.max, min = Math.min;
  var delta = new Two.Vector();
  var projection = new Two.Vector();

  var Trail = Two.Trail = function(points) {

    this.destinations = _.map(points, function(v) {
      return new Two.Vector().copy(v);
    }, this);

    var length = this.destinations.length;

    var vertices = _.map(_.range(length * 2), function(i) {
      var k = i;
      if (i >= this.destinations.length) {
        k = this.destinations.length - (i % this.destinations.length) - 1;
      }
      var dest = this.destinations[k];
      return new Two.Anchor().copy(dest);
    }, this);

    Two.Path.call(this, vertices);

    this.forwards = _.map(_.range(0, length), function(i) {
      return this.vertices[i];
    }, this);

    this.backwards = _.map(_.range(length, length * 2).reverse(), function(i) {
      return this.vertices[i];
    }, this);

  };

  _.extend(Trail, {

    Drag: 0.00625,

    Easing: 0.25

  });

  _.extend(Trail.prototype, Two.Path.prototype, {

    distance: 3,

    /**
     * TODO: For some reason isn't working
     */
    dispose: function() {

      this.remove.apply(this, arguments);

      _.each(this.vertices, function(v) {
        v.unbind();
      });

      // Trying to remove as many instances as possible.
      _.each(this, function(v, k) {
        delete this[k];
      }, this);

      return this;

    },

    reset: function(x, y) {

      for (var i = this.destinations.length - 1; i >= 0; i--) {

        var v = this.destinations[i];
        var f = this.forwards[i];
        var b = this.backwards[i];

        v.set(x || 0, y || 0);
        f.set(x || 0, y || 0);
        b.set(x || 0, y || 0);

      }

      return this;

    },

    queue: function(x, y) {

      for (var i = this.destinations.length - 1; i >= 0; i--) {

        var u = this.destinations[i - 1];
        var v = this.destinations[i];

        if (!u) {
          v.set(x, y);
          continue;
        }

        delta.copy(u).subSelf(v).multiplyScalar(Trail.Drag);
        v.addSelf(delta);

      }

      return this;

    },

    update: function() {

      var length = 0, last = this.destinations.length - 1;

      for (var i = 0; i < this.destinations.length; i++) {

        var dest = this.destinations[i];
        var prev = this.destinations[i - 1], a, b, f, pct;

        b = this.backwards[i];
        f = this.forwards[i];

        if (prev) {

          delta.copy(prev).subSelf(dest).multiplyScalar(Trail.Easing);
          dest.addSelf(delta);

          a = Math.atan2(prev.y - dest.y, prev.x - dest.x) + Math.PI / 2;

          var pct = 1 - (i / last);

          projection.x = pct * this.distance * Math.cos(a);
          projection.y = pct * this.distance * Math.sin(a);

          f.copy(dest).addSelf(projection);
          b.copy(dest).subSelf(projection);

        } else {

          prev = this.destinations[i + 1];

          a = Math.atan2(dest.y - prev.y, dest.x - prev.x) + Math.PI / 2;

          var pct = 0.5;

          projection.x = pct * this.distance * Math.cos(a);
          projection.y = pct * this.distance * Math.sin(a);

          f.copy(dest).addSelf(projection);
          b.copy(dest).subSelf(projection);

        }

      }

      return this;

    }

  });

  Two.Path.MakeObservable(Trail.prototype);

})();