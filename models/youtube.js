const request = require('request');
const cheerio = require('cheerio');
const ua = require('./user-agent');

function YouTube(query){
	return new Promise((resolve, reject) => {
		let keyword = '';
		Object.keys(query).forEach((i) => {
			keyword += `${query[i]} `;
		});
		request({
			url: 'https://www.youtube.com/results',
			method: 'GET',
			headers: {
				'User-Agent': ua.random(),
			},
			qs: {
				search_query: keyword,
			},
		}, (error, r, b) => {
			if(error || !b){
				reject('無法載入 YouTube 資料');
			}else{
				const jQuery = cheerio.load(b);
				let link;
				if(jQuery(jQuery('.yt-lockup-content')[0]).text().includes('廣告')){
					link = jQuery(jQuery('.yt-lockup-title')[1]).find('a');
				}else{
					link = jQuery(jQuery('.yt-lockup-title')[0]).find('a');
				}
				const title = link.text();
				link = `https://www.youtube.com${link.attr('href')}`;

				resolve(`${title}\n${link}`);
			}
		});
	});
}

module.exports = YouTube;
