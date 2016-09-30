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
          if (lastNode.nodeType === 3) {
            range.setStart(lastNode, lastNode.length);
          } else {
            range.setStart(lastNode, lastNodeChildren);
          }
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
  xobj.open('GET', 'thoughts-small-list.json', true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        }
  };
  xobj.send(null);
}