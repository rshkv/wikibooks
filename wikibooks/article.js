var request = require('request');
var cheerio = require('cheerio');


var options = {decodeEntities: false};

var Article = exports.Article = function (html) {
  var $ = this.$ = cheerio.load(html, options);
  this.body = $('#mw-content-text');
  this.title = $('#section_0').text();
};

Article.fromUrl = function (url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(new Article(body));
      }
      reject(error);
    });
  });
};

Article.prototype.clean = function () {
  var $ = cheerio.load(this.body.html(), options);
  // TODO: Tags
  // 'div', 'p', 'b', 'a', 'sup', 'h2',
  // 'span', 'i', 'blockquote', 'ul', 'li',
  // 'ol', 'cite', 'q', 'table', 'tr', 'td',
  // 'noscript', 'img'
  $('div#toc').remove();
  $('div.hatnote').remove();
  $('a.edit-page').parent('span').remove();
  $('div.indicator').remove();
  $('noscript').remove();
  $('*').removeAttr('title');
  $('span.mw-headline').each((i, el) => {
    $(el).parent()
      .attr('id', $(el).attr('id'))
      .text($(el).text());
  });
  $('a.new').each((i, el) => $(el).replaceWith($(el).text()));

  return $.html();
};

Article.prototype.toKindleHtml = function () {
  var $ = cheerio.load(emptyDom(this.title), options);
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
    .each(function (i) {
      // Append content of each section to new dom
      var sec = $(this);
      var section = {
        name: $('.mw-headline', sec.prev()).text(),
        id: $('.mw-headline', sec.prev()).attr('id')
      };
      if (i > 0)
        body.append(`<h2 id="${section.id}">${section.name}</h2>`);

      sec.children().each(function () {
        var elem = $(this);
        elem.appendTo(body);
      });
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
