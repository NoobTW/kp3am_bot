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

bot.onText(/^[pP][iI][nN][gG]$/, (msg) => {
	bot.sendMessage(msg.chat.id, 'pong');
});

bot.onText(/^(\\(.*)\/)$/, (msg) => {
	bot.sendMessage(msg.chat.id, msg.text, {reply_to_message_id: msg.message_id});
});

bot.onText(/(幫|[bB][aA][nN][gG]\s)[qQ][qQ]/, (msg) => {
	bot.sendMessage(msg.chat.id, '幫QQ', {reply_to_message_id: msg.message_id});
});

bot.onText(/^[gG][oO][oO][gG][lL][eE]\s(.*)/, (msg) => {
	const query = msg.text.replace(/^[gG][oO][gG][lL][eE]/, '').split(' ');
	Google(query)
	.then((result) => {
		bot.sendMessage(msg.chat.id, `${result.title}
${result.link}`, {reply_to_message_id: msg.message_id});
	})
	.catch(() => {
		bot.sendMessage(msg.chat.id, '無法載入搜尋結果');
	});
});

bot.onText(/^([yY][oO][uU][tT][uU][bB][eE]|我想聽)(.*)/, (msg) => {
	const query = msg.text.replace('//^([yY][oO][uU][tT][uU][bB][eE]|我想聽)/', '').split(' ');
	YouTube(query)
	.then((result) => {
		bot.sendMessage(msg.chat.id, result, {reply_to_message_id: msg.message_id});
	})
	.catch(() => {
		bot.sendMessage(msg.chat.id, '無法載入搜尋結果');
	});
});

bot.onText(/^([wW][iI][kK][iI]|什麼是)/, (msg) => {
	const query = msg.text.replace(/^([wW][iI][kK][iI]|什麼是)/, '').split(' ');
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

process.on('SIGINT', () => {
	/* eslint-disable  no-console */
	console.log('Mongodb disconnected on app termination');
	/* eslint-enable  no-console */
	db.close();
	process.exit();
});

