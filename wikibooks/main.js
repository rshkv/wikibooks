const {Article} = require('./article.js');
const pretty = require('pretty');
const fs = require('fs');

const urls = [
	// 'https://en.m.wikipedia.org/wiki/List_of_cognitive_biases',
	// 'https://en.m.wikipedia.org/wiki/Hanlon%27s_razor',
	'https://en.m.wikipedia.org/wiki/Occam%27s_razor',
	// 'https://de.m.wikipedia.org/wiki/Eurokrise'
];
// Article.fromUrl('Occam%27s_razor')

urls.forEach(url => {
	Article.fromUrl(url)
		.then(a => {
			const html = a.getCleanHTML();
			console.log(a.getSections());
			//console.log(pretty(html));
			//const cleanedHtml = a.clean();
			//console.log(pretty(cleanedHtml));
			//fs.writeFile('examples/output.html', pretty(html));
		})
		.catch(error => {
			console.log(error);
		});
});
