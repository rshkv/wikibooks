var {Article} = require('./article.js');
var pretty = require('pretty');

// Article.fromHandle('Occam%27s_razor')
Article.fromHandle('Hanlon%27s_razor')
  .then(function (a) {
    var html = a.toKindleHtml();
    console.log(pretty(html));
  });
