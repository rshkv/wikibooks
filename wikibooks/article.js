var request = require('request');
var cheerio = require('cheerio');


var Article = exports.Article = function (html) {
  var $ = cheerio.load(html);
  this.body = $('#mw-content-text');
  this.title = $('#section_0').text();
};

Article.fromHandle = function (handle) {
  var url = 'https://en.m.wikipedia.org/wiki/' + handle;
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(new Article(body));
      }
      reject(error);
    });
  });
};

Article.prototype.toKindleHtml = function () {
  var $ = cheerio.load(emptyDom(this.title));
  var sections = [{
    name: 'Abstract',
    id: '#abstract',
    subsections: []
  }];

  var body = $('body');
  body.append(`<h1 id="abstract">${this.title}</h1>`);

  this.body.children()
    .filter(function () {
      // Get only sections themselves
      return /mf-section/.test($(this).attr('class'))
    })
    .each(function () {
      // Append content of each section to new dom
      var elem = $(this);
      var section = {
        name: $('.mw-headline', elem.prev()).text(),
        id: $('.mw-headline', elem.prev()).attr('id')
      };
      body.append(`<h2 id="${section.id}">${section.name}</h2>`);
    });

  return $.html();
};

function emptyDom(title) {
  return `
<html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
  </head>
  <body></body>
</html>`
}
