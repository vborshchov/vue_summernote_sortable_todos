describe("Html Splitter", function() {

  var validHtml = '<div id="wmd-preview-section-2" class="wmd-preview-section preview-content"><h1 id="vue-summernote-sortable-todo-list">Vue summernote <br>sortable todo list</h1><p>Todos list with rich text editing and DnD sorting</p><hr><p>This is example of useing <a href="http://vuejs.org">Vue.js</a></p><p>And yes this is another todo list but it has extended options(<a href="https://codepen.io/vborshchov/full/NRvLqo/">demo</a>): </p><ol><li><p>Use <code>ctrl+enter</code> to split todo</p></li><li><p>To add new todo:</p><ul><li>press <code>enter</code> in headline to add new todo</li><li>place cursor at the end of todo and press <code>ctrl+enter</code></li></ul></li><li><p>You can drag and drop todos and headlines for sorting</p></li><li><p>To delete headline just delete all its content</p></li></ol></div><p>corporis, voluptas sequi atque ‘’‚“”„†‡‰‹›♠♣♥♦‾←↑→↓™-!"#$%&amp;\'()*+,-./-:&lt;=&gt;?@-[]^_`-{|}~…–—-¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσΤτΥυΦφΧχΨψΩω●</p>';
  var textFromValidHtml = "Vue summernote sortable todo listTodos list with rich text editing and DnD sortingThis is example of useing Vue.jsAnd yes this is another todo list but it has extended options(demo): Use ctrl+enter to split todoTo add new todo:press enter in headline to add new todoplace cursor at the end of todo and press ctrl+enterYou can drag and drop todos and headlines for sortingTo delete headline just delete all its contentcorporis, voluptas sequi atque ‘’‚“”„†‡‰‹›♠♣♥♦‾←↑→↓™-!\"#$%&'()*+,-./-:<=>?@-[]^_`-{|}~…–—-¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσΤτΥυΦφΧχΨψΩω●"

  var invalidHtml = "thi@<<#$%>s is invalid html < / li?><p>corporis, voluptas sequi atque !@#$%#@$%%^%^&amp;^&amp;*(&lt;&gt;&lt;&gt;&lt;&gt;d</p>corporis, voluptas sequi atque !@#$%#@$%%^%^&^&*(<><><>d";

  describe("isHtmlValid()", function() {

    it("should return true if string is valid", function() {
      expect(isHtmlValid(validHtml)).toBeTruthy();
    });

    it("should return false if string is not valid", function() {
      expect(isHtmlValid(invalidHtml)).toBeFalsy();
    });
  });

  describe("squizeTags()", function() {
    var tags = ['<div id="wmd-preview-section-2" class="wmd-preview-section preview-content">', '<h1 id="vue-summernote-sortable-todo-list">', '<br>', '</h1>', '<p>', '</p>', '<hr>', '<p>', '<a href="http://vuejs.org">', '</a>', '</p>', '<p>', '<a href="https://codepen.io/vborshchov/full/NRvLqo/">', '</a>', '</p>', '<ol>', '<li>', '<p>', '<code>', '</code>', '</p>', '</li>', '<li>', '<p>', '</p>', '<ul>', '<li>', '<code>', '</code>', '</li>', '<li>', '<code>', '</code>', '</li>', '</ul>', '</li>', '<li>', '<p>', '</p>', '</li>', '<li>', '<p>', '</p>', '</li>', '</ol>', '</div>', '<p>', '</p>',];

    it("should return array", function() {
      expect(squizeTags(tags)).toBeArray();
    });

    it("should return empty array if all tags have closed pair", function() {
      var tags_pairs = ['<p>', '<br>','</p>', '<span>', '</span>'];
      expect(squizeTags(tags_pairs)).toEqual([]);
    });
  });

  describe("getMatches()", function() {
    var result = getMatches(validHtml, regex.HTML_TAGS);
    var tags = ['<div id="wmd-preview-section-2" class="wmd-preview-section preview-content">', '<h1 id="vue-summernote-sortable-todo-list">', '<br>', '</h1>', '<p>', '</p>', '<hr>', '<p>', '<a href="http://vuejs.org">', '</a>', '</p>', '<p>', '<a href="https://codepen.io/vborshchov/full/NRvLqo/">', '</a>', '</p>', '<ol>', '<li>', '<p>', '<code>', '</code>', '</p>', '</li>', '<li>', '<p>', '</p>', '<ul>', '<li>', '<code>', '</code>', '</li>', '<li>', '<code>', '</code>', '</li>', '</ul>', '</li>', '<li>', '<p>', '</p>', '</li>', '<li>', '<p>', '</p>', '</li>', '</ol>', '</div>', '<p>', '</p>',];

    it("should return array", function() {
      expect(result).toBeArray();
    });

    it("should return tags array", function() {
      expect(result).toEqual(tags);
    });

    it("should return empty array after processing empty string", function() {
      expect(getMatches("", regex.HTML_TAGS)).toEqual([]);
    });
  });

  describe("binSearchLineWrap()", function() {
    var font = "normal 14px Helvetica";
    var width = 254.594;

    it("should return string length", function() {
      var text = "text";
      var result = binSearchLineWrap(text, font, width);
      expect(result).toEqual(text.length);
    });

    it("should process empty string", function() {
      var text = "";
      var result = binSearchLineWrap(text, font, width);
      expect(result).toEqual(0);
    });

    it("should find line wrap position at 39", function() {
      var result = binSearchLineWrap(textFromValidHtml, font, width);
      expect(result).toEqual(38);
    });

    it("should find line wrap position at 28", function() {
      var text = "ÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλ"
      var result = binSearchLineWrap(text, font, width);
      expect(result).toEqual(28);
    });
  });

  describe("splitHtmlByVisibleText()", function() {
    it("should return array", function() {
      var result = splitHtmlByVisibleText(validHtml, 5);
      expect(result).toBeArray();
    });

    it("should return the same html string if offset < 0", function() {
      var result = splitHtmlByVisibleText(validHtml, -5);
      expect(result).toEqual([validHtml]);
    });

    it("should return the same html string if offset = 0", function() {
      var result = splitHtmlByVisibleText(validHtml, 0);
      expect(result).toEqual([validHtml]);
    });

    function makeTest(n) {
      it("should split html string into two parts after " + n + " char(s)", function() {
        var offset = n;
        var result = splitHtmlByVisibleText(validHtml, n);

        var dummy_element = document.createElement('span');
        $(dummy_element).html(validHtml);
        var left_part_text_from_result = $(dummy_element).html(result[0]).text();
        var right_part_text_from_result = $(dummy_element).html(result[1]).text();
        var left_part_text = textFromValidHtml.substring(0, offset);
        var right_part_text = textFromValidHtml.substring(offset, textFromValidHtml.length);

        expect([left_part_text_from_result, right_part_text_from_result]).toEqual([left_part_text, right_part_text]);
      });
    }

    for (var i = textFromValidHtml.length - 1; i >= 1; i--) {
      makeTest(i);
    }

  });

});