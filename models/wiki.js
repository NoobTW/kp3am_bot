const request = require('request');
const OpenCC = require('opencc');
const ua = require('./user-agent');
const Google = require('./google');

const opencc = new OpenCC('s2twp.json');
const openss = new OpenCC('t2s.json');

function Wikipedia(query){
	return new Promise((resolve, reject) => {
		let keyword = '';
		Object.keys(query).forEach((i) => {
			keyword += `${query[i]} `;
		});
		request({
			url: 'https://zh.wikipedia.org/w/api.php',
			method: 'GET',
			headers: {
				'User-Agent': ua.random(),
			},
			qs: {
				action: 'opensearch',
				search: keyword,
				limit: 1,
				namespace: 0,
				format: 'json',
				exinfo: null,
				prop: 'extracts',
				lang: 'zh-tw',
			},
		}, (error, r, b) => {
			if(error || !b){
				reject();
			}else{
				const data = JSON.parse(b)[2];
				let desc = '';
				Object.keys(data).forEach((i) => {
					desc += data[i];
					if(i!==data.length-1) desc += '\n\n';
				});
				if(desc.trim() !== ''){
					desc = opencc.convertSync(desc);
					if(desc.startsWith('簡繁重定向')){
						Wikipedia(openss.convertSync(keyword))
						.then((result) => {
							resolve(result);
						})
						.catch(() => {
							reject();
						});
					}else{
						resolve(desc);
					}
				}else{
					Google(keyword)
					.then((result) => {
						resolve(result);
					})
					.catch(() => {
						reject();
					});
				}
			}
		});
	});
}

module.exports = Wikipedia;
