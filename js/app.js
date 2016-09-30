'use strict'

function getSelectionStart() {
  var node = document.getSelection().anchorNode;
  return (node.nodeType == 3 ? node.parentNode : node);
}

function isMacintosh() {
  return navigator.platform.indexOf('Mac') > -1
}

if (isMacintosh()) {
  shortcut.add("Command+Enter",function() {
    splitThought();
  });
} else {
  shortcut.add("Ctrl+Enter",function() {
    splitThought();
  });
}

function splitThought() {
  var id = $(getSelectionStart().closest('li')).data('id');
  vm.splitThought(id);
}

var VueSummernote = Vue.extend({
  replace: true,
  inherit: false,
  template: "<textarea class='form-control' :name='name'></textarea>",
  props: {
    content: {
      required: true,
      twoWay: true
    },
    language: {
      type: String,
      required: false,
      default: "en-US"
    },
    height: {
      type: Number,
      required: false,
      default: 160
    },
    minHeight: {
      type: Number,
      required: false,
      default: 160
    },
    maxHeight: {
      type: Number,
      required: false,
      default: 800
    },
    name: {
      type: String,
      required: false,
      default: ""
    },
    airMode: {
      type: Boolean,
      required: false,
      default: true
    },
    disableDragAndDrop: {
      type: Boolean,
      required: false,
      default: true
    },
    toolbar: {
      type: Array,
      required: false,
      default: function() {
        return [
          ["font", ["bold", "italic", "underline"]]
        ];
      }
    },
    popover: {
      type: Object,
      required: false,
      default: function() {
        return {
          air: [
                ['style', ['bold', 'italic', 'underline']]
              ]
          };
      }
    }
  },
  beforeCompile: function() {
    this.isChanging = false;
    this.control = null;
  },
  ready: function() {
    //  initialize the summernote
    if (this.minHeight > this.height) {
      this.minHeight = this.height;
    }
    if (this.maxHeight < this.height) {
      this.maxHeight = this.height;
    }
    var me = this;
    var scope = this._scope;
    this.control = $(this.$el);
    this.control.summernote({
      lang: this.language,
      height: this.height,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight,
      airMode: this.airMode,
      toolbar: this.toolbar,
      popover: this.popover,
      callbacks: {
        onInit: function() {
          me.control.summernote("code", me.content);
        },
        onKeydown: function(e) {
        },
        onKeyup: function(e) {
          var $it = $(this);
          var lines = $(e.target).getLines();
          console.log(lines);
          if (lines === 0 || vm.thoughts[scope.$index].name === "<p><br></p>") {
            if (e.keyCode == 8) { // if `Backspace` key pressed
              vm.setFocus(scope.$index-1);
              vm.removeThought(scope.$index);
            } else if (e.keyCode == 46){ // if `Delete` key pressed
              vm.setFocus(scope.$index + 1, true);
              vm.removeThought(scope.$index);
            }
          }
        },
        onFocus: function() {
          if (vm.thoughts[scope.$index] !== undefined)
            vm.thoughts[scope.$index].focused = true;
        },
        onBlur: function() {
          if (vm.thoughts[scope.$index] !== undefined)
            vm.thoughts[scope.$index].focused = false;
        }
      }
    }).on("summernote.change", function() {
      // Note that we do not use the "onChange" options of the summernote
      // constructor. Instead, we use a event handler of "summernote.change"
      // event because that I don't know how to trigger the "onChange" event
      // handler after changing the code of summernote via ".summernote('code')" function.
      if (! me.isChanging) {
        me.isChanging = true;
        var code = me.control.summernote("code");
        me.content = (code === null || code.length === 0 ? null : code);
        me.$nextTick(function () {
          me.isChanging = false;
        });
      }
    });
  },
  watch: {
    "content": function (val, oldVal) {
      if (! this.isChanging) {
        this.isChanging = true;
        var code = (val === null ? "" : val);
        this.control.summernote("code", code);
        this.isChanging = false;
      }
    }
  }
});

Vue.component('vue-summernote', VueSummernote);

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
    loadJSON(function(response) {
      // Parse JSON string into object
      vm.thoughts = JSON.parse(response);
      vm.thoughts[0].focused = true;
    });
  },

  components: {
    "vue-summernote": VueSummernote
  },

  data: {
    thoughts: [],
    newThought: '',
    text: "Hello world!",
    order: -1
  },

  methods: {
    addThought: function (e) {
      e.preventDefault();
      this.thoughts.push({ name: this.newThought, imageUrl: null, author: null, focused: false });
      this.newThought = '';
    },

    removeThought: function (index) {
      this.thoughts.splice(index, 1);
    },

    splitThought: function (index) {
      var name_parts,
          new_thought = {imageUrl: null, author: null, focused: false},
          current_thought = this.thoughts[index];

      name_parts = current_thought.name.split('<hr>');
      current_thought.name = name_parts[0];
      current_thought.focused = false;
      new_thought.name = name_parts[1];
      this.thoughts.splice(index+1, 0, new_thought);
      this.$nextTick(function() {
        this.setFocus(index + 1, true);
      });
    },

    setFocus: function (index, atStart) {
      // atStart = atStart || true;
      var length = vm.thoughts.length;
      if (length > 0) {
        if (index > length) {
          index = length - 1;
        } else if (index < 0) {
          index = 1;
          atStart = true;
        }
        if (atStart) {
          $("[data-id='" + index + "']").find('textarea').summernote('focus');
        } else {
          $("[data-id='" + index + "']").find('.note-editable').placeCursorAtEnd();
        }
      }
    }
  }
});

Vue.config.debug = true;