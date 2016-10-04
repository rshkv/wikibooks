const request = require('request');
const cheerio = require('cheerio');

const options = {decodeEntities: false};

exports.Article = class Article {
	constructor(html) {
		this.$ = cheerio.load(html, options);
		this.cleanBody;
	}

	static fromUrl(url) {
		return new Promise((resolve, reject) => {
			request(url, (error, response, body) => {
				if (!error && response.statusCode == 200) {
					resolve(new Article(body));
				}
				reject(error);
			});
		});
	}

	getCleanHTML() {
		const title = this.$('#section_0').text();
		const $ = cheerio.load(emptyDom(title), options);
		const body = $('body');
		const cleanBody = this.getCleanBody();
		body.append(`<h1 id="abstract">${title}</h1>`);
		body.append(cleanBody);
		return $.html();
	}

	getCleanBody() {
		if (this.cleanBody)
			return this.cleanBody;
		// Create a copy of the body
		const $ = cheerio.load(this.$('#mw-content-text').html(), options);
		// Remove table of contents
		$('div#toc').remove();
		// Remove "if you mean..."
		$('div.hatnote').remove();
		// Remove "edit" links
		$('a.edit-page').parent('span').remove();
		// Remove empty divs
		$('div.indicator').remove();
		// Remove noscript tag
		$('noscript').remove();
		// Move span content in header up to headers
		$('span.mw-headline').each((i, el) => {
			$(el).parent()
				.attr('id', $(el).attr('id'))
				.text($(el).text());
		});
		// Remove links to non-existent articles
		$('a.new').each((i, el) => $(el).replaceWith($(el).text()));
		// Remove titles
		$('*').removeAttr('title');
		// Remove links in annotations (e.g. 'citation needed')
		$('.Inline-Template').each((i, el) => {
			$(el).html(`[<i>${$('i', el).text()}</i>]`);
		});
		// Refer links to mobile site
		$('a').each((i, el) => {
			const href = $(el).attr('href');
			if (href.startsWith('/wiki/'))
				$(el).attr('href', 'https://en.m.wikipedia.org' + href);
		});
		this.cleanBody = $.html();
		return this.cleanBody;
	}

	/**
	 * Takes clean body and iterates headers to build a section tree.
	 * H2 tags are considered root level.
	 * Higher h-tags are pushed in the 'sections' of the last lower tag.
	 */
	getSections() {
		const $ = this.$;
		const body = this.getCleanBody();
		const root = [{
			name: 'Abstract',
			id: '#abstract',
			sections: []
		}];

		$('h2, h3, h4, h5, h6', body).each((i, el) => {
			const sec = $(el);
			const currentHValue = +sec.get(0).tagName.slice(1);
			let depth = currentHValue - 2;
			let superSection = root;
			// While the current depth is higher than 2,
			// go to right-most section and select select its subsections
			for (; depth > 0; depth--) {
				superSection = superSection[superSection.length - 1].sections;
			}

			const currentSection = {
				name: sec.text(),
				sections: [],
				id: sec.attr('id')
			};
			superSection.push(currentSection);
		});
		return root;
	}
}

const emptyDom = function(title) {
	return `
		<html>
		<head>
		<meta charset="UTF-8">
		<title>${title}</title>
		</head>
		<body></body>
		</html>`
}
