'use strict'

// function getSelectionStart() {
  // var node = document.getSelection().anchorNode;
  // return (node.nodeType == 3 ? node.parentNode : node);
// }

// function isMacintosh() {
//   return navigator.platform.indexOf('Mac') > -1
// }

// if (isMacintosh()) {
//   keyboardJS.bind('command + enter', function(e) {
//     console.log("bind keyboardJS");
//     vm.splitThought();
//   });
// } else {
//   keyboardJS.bind('ctrl + enter', function(e) {
//     console.log("bind keyboardJS");
//     vm.splitThought();
//   });
// }

// function splitThought() {
//   var $current_thought = $(getSelectionStart().closest('li'));
// }

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
          // var $editor = $it.next('.note-editor').find('.note-editable');
          var lines = $(e.target).getLines();
          console.log(lines);
          if (lines === 0 || vm.thoughts[scope.$index].name === "<p><br></p>") {
            if (e.keyCode == 8) { // if `Backspace` key pressed
              vm.removeThought(scope.$index);
              vm.setFocus(scope.$index-1, false);
            } else if (e.keyCode == 46){ // if `Delete` key pressed
              vm.removeThought(scope.$index);
              vm.setFocus(scope.$index+1, true);
            }
          }
          if ((e.keyCode == 10 || e.keyCode == 13) && (e.ctrlKey || e.metaKey)) {
            vm.splitThought(scope.$index);
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
        onKeydown: function(e) {
          var $it = $(this);
          var $editor = $it.next('.note-editor').find('.note-editable');
          var lines = $(e.target).getLines();
          console.log(lines);
          if (lines === 0 && $(scope.thought.name).text().length === 0) {
            if (e.keyCode === 8) {
              e.preventDefault();
              if (scope.$index === 0) {
                $(vm.thoughts[scope.$index]['__v-for__1']['node'].nextElementSibling).find('.content').summernote('focus');
              } else {
                $(vm.thoughts[scope.$index]['__v-for__1']['node'].previousElementSibling).find('.note-editable').placeCursorAtEnd();
              }
              vm.removeThought(scope.$index);
            } else if (e.keyCode === 46) {
              $(vm.thoughts[scope.$index]['__v-for__1']['node'].nextElementSibling).find('.content').summernote('focus');
              vm.removeThought(scope.$index);
            }
          }
        },
        onKeyup: function(e) {
          if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey) {
            vm.splitThought(scope.$index);
            $(vm.thoughts[scope.$index+1]['__v-for__1']['node'].nextElementSibling).find('.content').summernote('focus');
          }
          // console.log(e.target)
          // console.log(scope.$forContext.factory)
          // console.log(vm.$children[scope.$index].$el)
          // $(vm.$children[scope.$index].$el).summernote('destroy')
          // console.log(scope.$index)
          // console.log("prev: "+ vm.thoughts[scope.$index - 1].name)
          // console.log("next: "+ vm.thoughts[scope.$index + 1].name)
          // var thought = scope.thought;
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

    splitThought: function (index, callback) {
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
      atStart = atStart || true;
      var length = vm.thoughts.length;
      if (length > 0) {
        if (index > length - 1) {
          index = length - 1
        } else if (index < 0) {
          index = 0;
        }
        console.log(index, length)
        if (atStart) {
          console.log($("[data-id='" + index + "']"));
          $("[data-id='" + index + "']").find('textarea').summernote('focus')
        } else {
          $("[data-id='" + index + "']").find('.note-editable').placeCursorAtEnd();
        }
      }
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
  },

  placeCursorAtEnd: function() {
      // Places the cursor at the end of a contenteditable container (should also work for textarea / input)
      if (this.length === 0) {
          throw new Error("Cannot manipulate an element if there is no element!");
      }
      var el = this[0];
      var range = document.createRange();
      var sel = window.getSelection();
      var childLength = el.childNodes.length;
      if (childLength > 0) {
          var lastNode = el.childNodes[childLength - 1];
          var lastNodeChildren = lastNode.childNodes.length;
          range.setStart(lastNode, lastNodeChildren);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
      }
      return this;
  }
});

function loadJSON(callback) {

  var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
  xobj.open('GET', 'thoughts.json', true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        }
  };
  xobj.send(null);
}