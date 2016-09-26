Vue.directive('summernote', {
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
          // this.innerHTML = scope.task.title;
          $(this).next().find('.note-editable').html(scope.task.title);
        },
        onKeyup: function(e) {
          // console.log(e.keyCode)
        },
        onChange: function(contents, $editable) {
          scope.task.title = contents;
        }
      }
    });
  }
});

var vm = new Vue({
  el: '#todos',

  ready: function (value) {
    Sortable.create(this.$el.firstChild, {
      draggable: 'li',
      animation: 500,
      onUpdate: function(e) {
        var oldPosition = e.item.getAttribute('data-id');
        var newPosition = this.toArray().indexOf(oldPosition);
        vm.tasks.splice(newPosition, 0, vm.tasks.splice(oldPosition, 1)[0]);
      }
    });
  },

  data: {
    tasks: [
      { title: 'First <b>task</b>', done: true },
      { title: 'Sec<u>ond t</u>ask', done: true },
      { title: 'Third task', done: false }
    ],
    newTask: '',
    editTask: null
  },

  methods: {
    addTask (e) {
      e.preventDefault();
      this.tasks.push({ title: this.newTask, done: false });
      this.newTask = '';
    },

    removeTask (index) {
      this.tasks.splice(index, 1);
    },
    handleEsc(index){
      console.log(index);
    }
  },

  filters: {
    openTasks () {
      return this.tasks.filter(function (item) {
        return item.done;
      });
    }
  }
})