'use strict'

Vue.config.debug = true;

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

Vue.component('vue-summernote', VueSummernote);
Vue.component('thoughts-list', ThoughtsList);

var vm = new Vue({
  el: '#thoughts',

  ready: function (value) {
    loadJSON(function(response) {
      // Parse JSON string into object
      vm.headlines = JSON.parse(response);
    });
    Sortable.create($(this.$el).find('.headlines-list')[0], {
      handle: ".glyphicon-move",
      draggable: 'li',
      animation: 500,
      onUpdate: function(e) {
        vm.headlines.splice(e.newIndex, 0, vm.headlines.splice(e.oldIndex, 1)[0]);
      }
    });

  },

  components: {
    "vue-summernote": VueSummernote,
    "thoughts-list": ThoughtsList
  },

  data: {
    headlines: [],
    focus_coordinates: {},
    save_counter: 0
  },

  watch: {
    'headlines': {
      handler: function (val, oldVal) {
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
          // Runs 2 second (2000 ms) after the last change
          if (vm.save_counter > 0) {
            console.log("saving list...");
          };
          vm.save_counter += 1;
        }, 2000);
      },
      deep: true
    },
    'focus_coordinates': {
      handler: function (val, oldVal) {
        console.log('new headline: %s, old headline: %s', val.headline_id, oldVal.headline_id);
        $('.thought').removeClass('focused')
        $('.headline:eq( ' + val.headline_id + ' ) .thought:eq( ' + val.thought_id + ' )').addClass('focused')
      },
    }
  },

  methods: {
    addThought: function (e) {
      var index = e.target.__v_model._scope.$index;
      vm.headlines[index].thoughts.unshift(new Thought());
      this.$nextTick(function() {
        this.setFocus(index, 0);
        console.log(this.focus_coordinates.thought_id)
      });
    },

    removeThought: function (headline_index, thought_index) {
      this.headlines[headline_index].thoughts.splice(thought_index, 1);
    },

    splitThought: function (headline_index, thought_index) {
      var name_parts,
          new_thought,
          current_thought = this.headlines[headline_index].thoughts[thought_index];

      name_parts = current_thought.name.split('<hr>');
      current_thought.name = name_parts[0];
      current_thought.focused = false;
      new_thought = new Thought(null, name_parts[1]),
      this.headlines[headline_index].thoughts.splice(thought_index + 1, 0, new_thought);
      this.$nextTick(function() {
        this.setFocus(headline_index, thought_index + 1, true);
      });
    },

    autoSplitThought: function(headlineId, thoughtId) {
      var startTime = performance.now();
      var name = vm.headlines[headlineId].thoughts[thoughtId].name;
      var rows = name.split(regex.P_TAGS)
      var lines = [];
      // fibonacci(50) //just calc fibonacci number for spending some time
      rows.forEach(function(element, index, array) {
        while (element !== undefined && element !== null && element !== '') {
          var result,
              text = getTextFromHtml(element),
              splitPosition = binSearchLineWrap(text, "normal 14px Helvetica", 254.594),
              line = text.substring(text, splitPosition),
              lastSpaceIndex = line.regexLastIndexOf(/ /);

          if (lastSpaceIndex > -1) {
            var result = splitHtmlByVisibleText(element, lastSpaceIndex);
          } else {
            var result = splitHtmlByVisibleText(element, splitPosition);
          }
          var tmp_text0 = getTextFromHtml(result[0]);
          var tmp_text1 = getTextFromHtml(result[1]);
          if (tmp_text0[tmp_text0.length - 1] !== ' ' && tmp_text1[0] == ' ') {
            result[0] = result[0] + ' ';
            result[1] = result[1].substring(1);
          }
          lines.push(result[0]);
          element = result[1]
        }
        // var re = new RegExp(String.fromCharCode(160), "g"); // String.fromCharCode(160) === &nbsp;
        // var lastNBSPIndex = text.regexLastIndexOf(re);
        // var lastIndex = Math.max(lastSpaceIndex, lastNBSPIndex);
        // if (lastIndex > -1) {
        //   if (lastIndex == text.length - 1){
        //     positions.push([el, lastIndex-1]);
        //   } else {
        //     positions.push([el, lastIndex]);
        //   }
        // }
      });
      lines = lines.map(function(element) {
        return "<p>" + element + "</p>";
      });
      console.log(lines);
      // vm.headlines[headlineId].thoughts[thoughtId].name = lines.join('');
      var endTime = performance.now();
      console.log("auto splitting thought took " + (endTime - startTime) + " milliseconds.");
    },

    setFocus: function (headline_index, thought_index, atStart) {
      var length = vm.headlines[headline_index].thoughts.length;
      if (length > 0) {
        if (thought_index >= length) {
          thought_index = length - 1;
        } else if (thought_index < 0) {
          thought_index = 0;
          atStart = true;
        }
        if (atStart) {
          $(".headline").eq(headline_index).find("[data-thought-id='" + thought_index + "'] textarea").summernote('focus');
        } else {
          $(".headline").eq(headline_index).find("[data-thought-id='" + thought_index + "'] .note-editable").placeCursorAtEnd();
        }
        this.focus_coordinates = {
          "headline_id": headline_index,
          "thought_id": thought_index
        }
      }
    },

    deleteHeadline: function(index) {
      if (confirm("Are you sure to delete this headline?\nAll thoughts will be deleted too.")) {
        this.headlines.splice(index, 1);
      }
    }
  }
});
