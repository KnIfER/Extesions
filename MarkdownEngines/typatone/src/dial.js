(function() {

  var root = this;
  var previousDial = root.Dial || {};

  var Dial = root.Dial = function(domElement, width, height) {

    var two = this.two = new Two({
        width: width * 2,
        height: height * 2
      })
      .appendTo(domElement);

    _.extend(two.renderer.domElement.style, {
      display: 'block',
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: - two.width / 2 + 'px',
      marginLeft: - two.height / 2 + 'px'
    });

    var resolution = Two.Resolution;
    Two.Resolution = Dial.Resolution;

    var circle = this.circle = two.makeCircle(
      two.width / 2, two.height / 2,
      (this.linewidth + width) * 0.5, (this.linewidth + height) * 0.5);

    circle.closed = false;
    Two.Resolution = resolution;

    circle.noFill().stroke = '#aaa';
    circle.linewidth = this.linewidth;

    circle.ending = 0.0;
    two.update();

  };

  _.extend(Dial, {

    Resolution: 64

  });

  _.extend(Dial.prototype, {

    linewidth: 3,

    update: function(pct) {

      this.circle.ending = pct;
      this.two.update();

      return this;

    }

  });

})();