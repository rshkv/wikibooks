var {Article} = require('./article.js');
var pretty = require('pretty');
var fs = require('fs');

var urls = [
  'https://en.m.wikipedia.org/wiki/List_of_cognitive_biases',
  'https://en.m.wikipedia.org/wiki/Hanlon%27s_razor',
  'https://en.m.wikipedia.org/wiki/Occam%27s_razor',
  'https://de.m.wikipedia.org/wiki/Eurokrise'
];
// Article.fromUrl('Occam%27s_razor')

urls.forEach(url => {
  Article.fromUrl(url)
    .then(function (a) {
      // var html = a.toKindleHtml();
      // console.log(pretty(html));
      var cleanedHtml = a.clean();
      // console.log(pretty(cleanedHtml));
      fs.writeFile('../examples/output.html', pretty(cleanedHtml));
    })
    .catch(function (error) {
      console.log(error);
    });
});
