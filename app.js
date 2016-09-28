var VueSummernote = Vue.extend({
  replace: true,
  inherit: false,
  template: "<textarea class='form-control' :name='name'></textarea>",
  props: {
    thought: {
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
    toolbar: {
      type: Array,
      required: false,
      default: function() {
        return [
          ["font", ["bold", "italic", "underline", "clear"]],
          ["fontsize", ["fontsize"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["color", ["color"]],
          ["insert", ["link", "picture", "hr"]]
        ];
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
    this.control = $(this.$el);
    this.control.summernote({
      lang: this.language,
      height: this.height,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight,
      airMode: this.airMode,
      toolbar: this.toolbar,
      callbacks: {
        onInit: function() {
          me.control.summernote("code", me.model);
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
        me.model = (code === null || code.length === 0 ? null : code);
        me.$nextTick(function () {
          me.isChanging = false;
        });
      }
    });
  },
  watch: {
    "model": function (val, oldVal) {
      console.log(this.thought);
      console.log(this.thought.index);
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

  // components: {
  //   "vue-summernote": VueSummernote
  // },

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
    newThought: '',
    text: "Hello world!"
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


// Vue.component('vue-html-editor', VueHtmlEditor);

var vm_bower = new Vue({
  el: "#app",
  data: {
    text: "Hello World!"
  }
});