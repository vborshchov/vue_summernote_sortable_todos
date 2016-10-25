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
      disableDragAndDrop: this.disableDragAndDrop,
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
          // console.log(lines);
          if (lines === 0 || vm.headlines[scope.$parent.index].thoughts[scope.$index].name === "<p><br></p>" || vm.headlines[scope.$parent.index].thoughts[scope.$index].name === "<br>") {
            if (e.keyCode == 8) { // if `Backspace` key pressed
              vm.removeThought(scope.$parent.index, scope.$index);
              vm.$nextTick(function(){
                vm.setFocus(scope.$parent.index, scope.$index - 1);
              });
            } else if (e.keyCode == 46){ // if `Delete` key pressed
              vm.removeThought(scope.$parent.index, scope.$index);
              vm.$nextTick(function(){
                vm.setFocus(scope.$parent.index, scope.$index, true);
              });
            }
          } else if (lines > 8) {
            clearTimeout(this.timer);
            this.timer = setTimeout(function() {
              // Runs 100 miliseconds after the last change
              var code = e.target.innerHTML
              vm.autoSplitThought(scope.$parent.index, scope.$index, code);
            }, 250);
          }
        },
        onFocus: function() {
          vm.focus_coordinates = {
            "headline_id": scope.$parent.index,
            "thought_id": scope.$index
          }
        },
        onBlur: function() {
          vm.focus_coordinates = {}
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