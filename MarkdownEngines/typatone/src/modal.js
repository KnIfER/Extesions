(function() {

  var root = this;
  var previousModal = root.Modal || {};

  var Modal = root.Modal = function() {

    this.domElement = document.createElement('div');
    this.domElement.classList.add('modal');
    this.$ = { domElement: $(this.domElement) };

    this.close = document.createElement('div');
    this.close.classList.add('close');
    this.$.close = $(this.close).html('&times;');

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.$.content = $(this.content);

    this.domElement.appendChild(this.content);
    this.domElement.appendChild(this.close);

    this.$.close.bind('click', _.bind(this.hide, this));

  };

  _.extend(Modal.prototype, {

    append: function(elem, clear) {

      if (!!clear) {
        // Remove previous dom elements in the space.
        for (var i = 0; i < this.content.children.length; i++) {
          var child = this.content.children[i];
          $(child).detach();
        }
      }
      this.content.appendChild(elem);
      return this;

    },

    set: function(template) {

      this.content.innerHTML = template;
      return this;

    },

    show: function(callback) {
      this.$.domElement.fadeIn(callback);
      return this;
    },

    hide: function(callback) {
      this.$.domElement.fadeOut(callback);
      return this;
    },

    appendTo: function(elem) {
      elem.appendChild(this.domElement);
      return this
    }

  });

})();