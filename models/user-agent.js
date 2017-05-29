const textUserAgent = [
	'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:20.0) Gecko/20100101 Firefox/20.0',
	'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
	'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.94 Safari/537.36',
];

function getRandomFromArray(a){
	return a[Math.floor(Math.random()*(a.length))];
}

module.exports = {
	random: () => getRandomFromArray(textUserAgent),
};
