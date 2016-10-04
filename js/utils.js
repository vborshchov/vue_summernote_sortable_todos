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
  xobj.open('GET', 'headlines-small-list.json', true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        }
  };
  xobj.send(null);
}

function highlightHashTags(text, remove) {
  var res = '';
  if (remove) {
    //support russian lang
    //var patt = new RegExp('<span class="hash_tags_item">(#[\\wа-яА-ЯёЁ]+)</span>', 'ig' );
    //var patt = new RegExp('<span class="hash_tags_item">(#\\w+)</span>', 'ig' );
    var patt = new RegExp('<mark>|</mark>', 'ig');
    res = text.replace(patt, '');
  }
  else {
    //exclude color from hash tags
    function replacer(str, p1, p2, offset, s) {
      var res = (p2 != ';') ? ("<span><mark>" + p1 + "</mark>" + p2 +"</span>") : (p1 + p2);
      return res;
    }
    //support russian lang
    res = text.replace(/(#[a-zA-Z0-9_ЁёéÄäÖöÜüß\u00DF]+)(\W|$)/gi, replacer);
    //res = text.replace(/(#\w+)(\W|$)/gi, replacer);
  }
  return res;
}

function extractContent(s) {
  var span= document.createElement('span');
  span.innerHTML= s;
  return span.textContent || span.innerText;
};