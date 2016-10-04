'usee strict';

function Thought(id, name, author, hashtags, picture, repetition) {
  this._id = id || GUID();
  this.name = name || "<p><br></p>";
  this.author = author || "";
  this.hashtags = hashtags || [];
  this.picture = picture;
  this.repetition = repetition || 0;
  this.created_at = (function () {
                var now = new Date();
                var isoDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
                return isoDate;
              })();
}