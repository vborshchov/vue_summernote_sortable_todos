'use strict';

var regex = {
  HTML_TAGS: /(<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>)/gi,
  P_TAGS: /<\/?p((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/gi,
  OPENED_TAGS: /(<\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>)/gi,
  CLOSED_TAGS: /(<\/\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>)/gi,
  SELF_CLOSED_TAGS: /(<(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>)/gi,
  SURROGATE_PAIR: /[\uD800-\uDBFF][\uDC00-\uDFFF]/gi,
  // Match everything outside of normal chars and " (quote character)
  NON_ALPHANUMERIC: /([^\#-~| |!])/g
};

function splitHtmlByVisibleText(html, visible_offset) {
  var match = null,
      indexes= [];
  var dummy_element = document.createElement('span');
  $(dummy_element).html(html);
  var text = $(dummy_element).html(html).text();
  regex.HTML_TAGS.lastIndex = 0;
  while ((match = regex.HTML_TAGS.exec(html)) !== null ) {
      indexes.push([match.index, match.index+match[0].length]);
  }
  if (0 < visible_offset && visible_offset < text.length) {
    var left_part = text.substring(0, visible_offset);
    left_part = encodeEntities(left_part);
    indexes.forEach(function(el, index, array){
      if (left_part.length >= el[0]) {
        left_part = left_part.substr(0, el[0]) + html.substring(el[0], el[1]) + left_part.substr(el[0]);
      }
    });
    var left_part_tags = getMatches(left_part, regex.HTML_TAGS, 1);
    var opened_tags = squizeTags(left_part_tags);
    // Replace `opened_tags.join('')` by next few lines
    var str = "";
    for (var i = 0; i < opened_tags.length; i++) {
      str += opened_tags[i];
    }
    var right_part = str + html.slice(left_part.length);
    // end
    dummy_element.innerHTML = left_part;
    left_part = dummy_element.innerHTML;
    var result_arr = [left_part, right_part];
    var newArray = result_arr.filter(function(v){return v!==''});
    return newArray;
  } else {
    return [html];
  }
}

function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

function isHtmlValid(html_string) {
  var tmp = document.createElement('div');
  tmp.innerHTML = html_string;
  return tmp.innerHTML === html_string;
}

function squizeTags(tags) {
  for (var i = 0; i < tags.length; i++) {
    if (isSelfClosedTag(tags[i])) {
      tags[i] = "<div>";
      tags.splice(i+1, 0, "</div>");
    }
  }
  if ( tags.length === 0 || (!isHtmlValid(tags.join(''))) && (tags.filter(isOpenTag).length === tags.length || tags.filter(isCloseTag).length === tags.length)) {
    return tags;
  } else {
    var test = document.createElement('div');
    for (var i = 0; i < tags.length; i++) {
      test.innerHTML = tags[i] + tags[i + 1];
      if (test.innerHTML === tags[i] + tags[i + 1]) {
        tags.splice(i, 2);
        i = tags.length + 3;
      }
    }
    return squizeTags(tags);
  }
}

function isOpenTag(str) {
  return !!str.match(regex.OPENED_TAGS);
}

function isCloseTag(str) {
  return !!str.match(regex.CLOSED_TAGS);
}

function isSelfClosedTag(str) {
  return !!str.match(regex.SELF_CLOSED_TAGS);
}

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns {string} escaped text
 */
function encodeEntities(value) {
  return value.
    replace(/&/g, '&amp;').
    // replace(regex.SURROGATE_PAIR, function(value) {
    //   var hi = value.charCodeAt(0);
    //   var low = value.charCodeAt(1);
    //   return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
    // }).
    // replace(regex.NON_ALPHANUMERIC, function(value) {
    //   return '&#' + value.charCodeAt(0) + ';';
    // }).
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}

function binSearchLineWrap(str, font, width) {
  var l = 0,
      r = str.length,
      counter = 0,
      middle = r;

  while (r - l > 1) {
    counter += 1;
    if (getTextWidth(str.substring(0, r), font) <= width) {
      l = r;
      middle = 1;
      break;
    }
    var length = r - l;
    middle = Math.floor(length/2);
    if ( getTextWidth(str.substring(0, l + middle), font) >= width ) {
      r = l + middle;
    } else {
      l = l + middle;
    }
  }
  if (getTextWidth(str.substring(0, r), font) <= width) {
    return r;
  } else if (getTextWidth(str.substring(0, l + middle), font) <= width) {
    return l + middle;
  } else {
    return l;
  }

}

function getTextWidth(text, font) {
  // if given, use cached canvas for better performance
  // else, create new canvas
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
  // console.log(getTextWidth("hello there!", "normal 20px gillsans-light"));  // close to 86
}

function lineWrapPositions(row_text, font, width) {
  var lengths = [],
      text = row_text;

  while (getTextWidth(text, font) > width) {
    var position = binSearchLineWrap(text, font, width) - 1;
    lengths.push(position);
    text = text.substring(position);
  }
  return lengths;
}

function getTextFromHtml(html) {
  var dummy_element = document.createElement('span');
  $(dummy_element).html(html);
  return $(dummy_element).html(html).text();
}