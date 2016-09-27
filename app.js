Vue.directive('summernote', {
  terminal: true,
  bind: function() {
    var scope = this._scope;
    var it = this;
    this.editor = $(this.el).summernote({
      airMode: true,
      disableDragAndDrop: true,
      popover: {
        air: [
          ['style', ['bold', 'italic', 'underline', 'clear']]
        ]
      },
      callbacks: {
        onInit: function() {
          // this.innerHTML = scope.thought.title;
          $(this).next().find('.note-editable').html(scope.thought.name);
        },
        onKeyup: function(e) {
          var $it = $(this);
          var $editor = $it.next('.note-editor').find('.note-editable');
          var lines = $editor.getLines();
          console.log(lines);
        },
        onChange: function(contents, $editable) {
          scope.thought.name = contents;
        }
      }
    });
  }
});

var vm = new Vue({
  el: '#todos',

  ready: function (value) {
    Sortable.create(this.$el.firstChild, {
      handle: ".glyphicon-move",
      draggable: 'li',
      animation: 500,
      onUpdate: function(e) {
        var oldPosition = e.item.getAttribute('data-id');
        var newPosition = this.toArray().indexOf(oldPosition);
        vm.thoughts.splice(newPosition, 0, vm.thoughts.splice(oldPosition, 1)[0]);
      }
    });
  },

  data: {
    thoughts: [
      {
        imageUrl: null,
        name: 'First thought',
        author: null
      },
      {
        imageUrl: null,
        name: '<b>Second</b> thought',
        author: null
      },
      {
        imageUrl: null,
        name: 'Third thought',
        author: null
      },
      {
        imageUrl: null,
        name: 'Fourth thought',
        author: null
      }
    ],
    newThought: ''
  },

  methods: {
    addThought (e) {
      e.preventDefault();
      this.thoughts.push({ name: this.newThought, imageUrl: null, author: null });
      this.newThought = '';
    },

    removeThought (index) {
      this.thoughts.splice(index, 1);
    }
  }
});

Vue.config.debug = true;

$.fn.extend({
  getLines: function() {
    var it = this[0];
    var lastChild = it.lastChild;
    var range = document.createRange();
    var lineHeight = parseInt(this.css('line-height'));
    if (isNaN(lineHeight)) {
      return 0;
    } else {
      if (lastChild) {
        range.setStart(it, 0);
        range.setEndAfter(lastChild);
        return Math.round(range.getBoundingClientRect().height / lineHeight);
      } else {
        return 0;
      }
    }
  }
});