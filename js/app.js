'use strict'

function getSelectionStart() {
  var node = document.getSelection().anchorNode;
  return (node.nodeType == 3 ? node.parentNode : node);
}

function isMacintosh() {
  return navigator.platform.indexOf('Mac') > -1
}

if (isMacintosh()) {
  shortcut.add("Meta+Enter",function() {
    splitThought();
  });
} else {
  shortcut.add("Ctrl+Enter",function() {
    splitThought();
  });
}

function splitThought() {
  // var thought_id = $(getSelectionStart().closest('li')).data('id');
  vm.splitThought(vm.focus_coordinates.headline_id, vm.focus_coordinates.thought_id);
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
          if (lines === 0 || vm.headlines[scope.$parent.$index].thoughts[scope.$index].name === "<p><br></p>" || vm.headlines[scope.$parent.$index].thoughts[scope.$index].name === "<br>") {
            if (e.keyCode == 8) { // if `Backspace` key pressed
              vm.setFocus(scope.$parent.$index, scope.$index-1);
              vm.removeThought(scope.$parent.$index, scope.$index);
            } else if (e.keyCode == 46){ // if `Delete` key pressed
              vm.setFocus(scope.$parent.$index, scope.$index + 1, true);
              vm.removeThought(scope.$parent.$index, scope.$index);
            }
          }
        },
        onFocus: function() {
          vm.focus_coordinates = {
            "headline_id": scope.$parent.$index,
            "thought_id": scope.$index
          }
        },
        onBlur: function() {
          vm.focus_coordinates = {};
        },
        onPaste: function (e) {
          var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
          var bufferTextWithHashtags = highlightHashTags(bufferText);
          e.preventDefault();
          if (bufferText.length === bufferTextWithHashtags.length) {
            document.execCommand('insertHTML', false, bufferText);
          } else {
            document.execCommand('insertHTML', false, bufferTextWithHashtags);
          }
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
    loadJSON(function(response) {
      // Parse JSON string into object
      vm.headlines = JSON.parse(response);
    });
    console.log(this.$el.firstChild);
    Sortable.create(this.$el.firstChild, {
      handle: ".glyphicon-move",
      draggable: 'li',
      animation: 500,
      onUpdate: function(e) {
        vm.headlines.splice(e.newIndex, 0, vm.headlines.splice(e.oldIndex, 1)[0]);
      }
    });

  },

  components: {
    "vue-summernote": VueSummernote
  },

  data: {
    headlines: [],
    focus_coordinates: {},
    newThought: ''
  },

  methods: {
    addThought: function (e) {
      e.preventDefault();
      this.thoughts.push({ name: this.newThought, imageUrl: null, author: null, focused: false });
      this.newThought = '';
    },

    removeThought: function (headline_index, thought_index) {
      this.headlines[headline_index].thoughts.splice(thought_index, 1);
    },

    splitThought: function (headline_index, thought_index) {
      var name_parts,
          new_thought = {imageUrl: null, author: null, focused: false},
          current_thought = this.headlines[headline_index].thoughts[thought_index];

      name_parts = current_thought.name.split('<hr>');
      current_thought.name = name_parts[0];
      current_thought.focused = false;
      new_thought.name = name_parts[1];
      this.headlines[headline_index].thoughts.splice(thought_index + 1, 0, new_thought);
      this.$nextTick(function() {
        this.setFocus(headline_index, thought_index + 1, true);
      });
    },

    setFocus: function (headline_index, thought_index, atStart) {
      // atStart = atStart || true;
      var length = vm.headlines[headline_index].thoughts.length;
      if (length > 0) {
        if (thought_index > length) {
          thought_index = length - 1;
        } else if (thought_index < 0) {
          thought_index = 1;
          atStart = true;
        }
        if (atStart) {
          $(".headlines-list > li").eq(headline_index).find("[data-thought-id='" + thought_index + "'] textarea").summernote('focus');
        } else {
          $(".headlines-list > li").eq(headline_index).find("[data-thought-id='" + thought_index + "'] .note-editable").placeCursorAtEnd();
        }
      }
    }
  }
});

// Sortable.create($('.thoughts-list')[0], {
//   handle: ".glyphicon-move",
//   group: "thoughts",
//   draggable: 'li',
//   animation: 500,
//   onUpdate: function(e) {
//     vm.headlines.splice(e.newIndex, 0, vm.headlines.splice(e.oldIndex, 1)[0]);
//   }
// });

Vue.config.debug = true;