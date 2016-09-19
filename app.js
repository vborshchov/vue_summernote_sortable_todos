Vue.directive('summernote', {
  bind: function() {
    console.log(this.el)
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
          console.log('init summernote')
        },
        onKeyup: function(e) {
          // console.log(e.keyCode)
        },
        onChange: function(contents, $editable) {
          console.log(contents)
          vm.editor = contents;
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
        console.log(oldPosition)
        var newPosition = this.toArray().indexOf(oldPosition);
        vm.tasks.splice(newPosition, 0, vm.tasks.splice(oldPosition, 1)[0]);
      }
    });
  },

  data: {
    tasks: [
      { title: 'First task', done: true },
      { title: 'Second task', done: true },
      { title: 'Third task', done: false }
    ],
    newTask: '',
    editTask: null,
    editor: null
  },

  methods: {
    addTask (e) {
      e.preventDefault()
      this.tasks.push({ title: this.newTask, done: false })
      this.newTask = ''
    },

    removeTask (index) {
      this.tasks.splice(index, 1)
    },
    handleEsc(index){
      console.log(index)
    }
  },

  filters: {
    openTasks () {
      return this.tasks.filter(function (item) {
        return item.done
      })
    }
  }
})




$('#summernote').summernote({
  airMode: true
})