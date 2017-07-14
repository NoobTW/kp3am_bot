const TelegramBot = require('node-telegram-bot-api');
const mongo = require('mongodb');
const config = require('./config');
const Google = require('./models/google');
const Wikipedia = require('./models/wiki');
const YouTube = require('./models/youtube');

const token = config.token;
const bot = new TelegramBot(token, { polling: true });
const mc = mongo.MongoClient;
let db;

mc.connect('mongodb://127.0.0.1/tg_log', (err, database) => {
	if(!err){
		db = database;
		bot.on('message', (msg) => {
			db.collection('log').insert(msg);
		});
	}else{
		/* eslint-disable  no-console */
		console.log(err);
		/* eslint-enable no-console */
	}
});

bot.onText(/^ping$/i, (msg) => {
	bot.sendMessage(msg.chat.id, 'pong');
});

bot.onText(/^(\\(.*)\/)$/, (msg) => {
	bot.sendMessage(msg.chat.id, msg.text, {reply_to_message_id: msg.message_id});
});

bot.onText(/(幫|bang\s)QQ/i, (msg) => {
	bot.sendMessage(msg.chat.id, '幫QQ', {reply_to_message_id: msg.message_id});
});

bot.onText(/^google\s.+/i, (msg) => {
	const query = msg.text.replace(/^google/i, '').split(' ');
	Google(query)
		.then((result) => {
			bot.sendMessage(msg.chat.id, `${result.title}
	${result.link}`, {reply_to_message_id: msg.message_id});
		})
		.catch(() => {
			bot.sendMessage(msg.chat.id, '無法載入搜尋結果');
		});
});

bot.onText(/^(youtube\s|我想聽).+/, (msg) => {
	const query = msg.text.replace(/^(youtube\s|我想聽)/i, '').split(' ');
	YouTube(query)
		.then((result) => {
			bot.sendMessage(msg.chat.id, result, {reply_to_message_id: msg.message_id});
		})
		.catch(() => {
			bot.sendMessage(msg.chat.id, '無法載入搜尋結果');
		});
});

bot.onText(/^(wiki\s|什麼是).+/i, (msg) => {
	const query = msg.text.replace(/^(wiki\s|什麼是)/i, '').split(' ');
	Wikipedia(query)
		.then((result) => {
			if(result.src === 'Google'){
				bot.sendMessage(msg.chat.id, `${result.title}
	${result.link}`, {reply_to_message_id: msg.message_id});
			}else{
				bot.sendMessage(msg.chat.id, result, {reply_to_message_id: msg.message_id}) ;
			}
		})
		.catch(() => {
			bot.sendMessage(msg.chat.id, '無法載入 Wikipedia 資料');
		});
});

bot.onText(/^(err(or)?(:|\s)+)?utg$/i, (msg) => {
	bot.sendMessage(msg.chat.id, 'ERROR: User too gay.');
});

bot.onText(/https?:\/\/m.facebook.com(.*)/i, (msg) => {
	const regexMobilePost = /https?:\/\/m.facebook.com.*story_fbid=([0-9]*)&id=([0-9]*)/;
	if(regexMobilePost.test(msg.text)){
		bot.sendMessage(msg.chat.id, msg.text.replace(regexMobilePost, 'https://www.facebook.com/$2/posts/$1'));
	}else{
		bot.sendMessage(msg.chat.id, msg.text.replace(/https?:\/\/m.facebook.com(.*)/, 'https://www.facebook.com$1'));
	}
});

bot.onText(/^\/randomColor/i, (msg) => {
	bot.sendMessage(msg.chat.id, `#${Math.floor(Math.random()*16777215).toString(16)}`);
});

bot.onText(/^suicide$/i, (msg) => {
	bot.sendMessage(msg.chat.id, '自殺不能解決問題，但可以解決掉你自己。\n        — kp3am');
});

process.on('SIGINT', () => {
	/* eslint-disable  no-console */
	console.log('Mongodb disconnected on app termination');
	/* eslint-enable  no-console */
	db.close();
	process.exit();
});

