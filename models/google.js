const request = require('request');
const cheerio = require('cheerio');
const ua = require('./user-agent');

function getParameterByName(name, url) {
	const n = name.replace(/[[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${n}(=([^&#]*)|&|#|$)`);
	const results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function Google(query, offset){
	return new Promise((resolve, reject) => {
		let keyword = '';
		const start = (typeof offset === 'number') ? Math.floor(offset/10)*10 : 0;
		Object.keys(query).forEach((i) => {
			keyword += `${query[i]} `;
		});
		request({
			url: 'https://www.google.com.tw/search',
			method: 'GET',
			headers: {
				'User-Agent': ua.random(),
			},
			qs: {
				q: keyword,
				start: start
			},
		}, (error, r, b) => {
			if(error || !b){
				reject();
			}else{
				const _offset = (typeof offset === 'number') ? offset - start : 0;
				const jQuery = cheerio.load(b, {decodeEntities: false});
				const title = jQuery(jQuery('h3.r')[_offset]).text().replace(/&#39;/g, '\'');
				let link = jQuery(jQuery(jQuery('h3.r')[_offset]).find('a')).attr('href');
				link = getParameterByName('url', link) || link;
				if(typeof link !== 'string'){
					reject();
				}else if(!link.startsWith('http')){
					link = `http://${link}`;
				}

				const result = {};
				result.title = title;
				result.link = link;
				result.src = 'Google';

				if(result.title.length && result.link.length){
					resolve(result);
				}else{
					reject();
				}
			}
		});
	});
}

module.exports = Google;
