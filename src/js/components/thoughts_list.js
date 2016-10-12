var ThoughtsList = Vue.extend({
  template: "#thoughts-list-template",
  props: {
    index: Number,
    list: {
      type: Array
    }
  },
  methods: {
    makeHeadline: function (headlineId, thoughtId) {
      // extract thought from old headlines list in variable
      var thought = vm.headlines[headlineId].thoughts[thoughtId]
      var upperThoughts = vm.headlines[headlineId].thoughts.slice(0, thoughtId);
      var lowerThoughts = vm.headlines[headlineId].thoughts.slice(thoughtId, vm.headlines[headlineId].thoughts.length);
      vm.headlines[headlineId].thoughts = upperThoughts;
      var newHeadline = {
        "_id": GUID(),
        "name": extractContent(lowerThoughts[0].name).substring(0, 70),
        "created_at": (function () {
                  var now = new Date();
                  var isoDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
                  return isoDate;
                })(),
        "thoughts": lowerThoughts.slice(1, lowerThoughts.length)
      };
      vm.headlines.splice(headlineId + 1, 0, newHeadline);
    }
  },
  beforeCompile: function() {
  },
  ready: function() {
    Sortable.create($(this.$el)[0], {
      handle: ".glyphicon-move",
      group: "thoughts",
      draggable: 'li',
      animation: 500,
      onUpdate: function(e) {
        console.log(e.oldIndex, e.newIndex);
        vm.headlines[$(this.el).data("headline-id")].thoughts.splice(e.newIndex, 0, vm.headlines[$(this.el).data("headline-id")].thoughts.splice(e.oldIndex, 1)[0]);
      },
      onAdd: function (e) {
        var oldThoughtId = e.oldIndex; // if of dragged HTMLElement
        var oldHeadlineId = parseInt($(e.from).attr("data-headline-id"));
        var newThoughtId = e.newIndex;// id of HTMLElement on which have guided
        var newHeadlineId = parseInt($(e.item).closest('ul').attr("data-headline-id"));
        // extract thought from old headlines list in variable
        var thought = vm.headlines[oldHeadlineId].thoughts[oldThoughtId]
        vm.headlines[oldHeadlineId].thoughts.splice(oldThoughtId, 1);
        // insert thought to new headlines list
        vm.headlines[newHeadlineId].thoughts.splice(newThoughtId, 0, thought)
      }
    });
  }
});