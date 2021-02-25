const { Telegraf } = require('telegraf')
const fs = require('fs')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

let dir = ctx => {
    let roomId = ctx.message.chat.id
    let dirName = `data/${roomId}`
    if(!fs.existsSync(dirName)) fs.mkdirSync(`data/${roomId}`);
    return dirName
}

bot.command('all', ctx => {
    let room_id = ctx.message.chat.id
    let directory = dir(ctx)
    let users = fs.readdirSync(directory).filter(file => !file.startsWith('.')).map(user => `@${user}`)
    ctx.reply(`Hey, ${users.join(' ')}`)
})

bot.command('notifyme', ctx => {
    let username = ctx.message.from.username
    let directory = dir(ctx)
    if(username) {
        fs.writeFile(`${directory}/${username}`, '', e => {
            if(e) {
                ctx.reply(`I'm Ill and I couldn't save your preferences, @${username}! 🤒`)
                console.log(e)
            } else {
                ctx.reply(`I'll notify you, @${username}! 👍`)
            }
        })
    } else {
        ctx.reply('You need to set a username for me to notify you! 🆔')
    }
})

bot.command('dontnotifyme', ctx => {
    let username = ctx.message.from.username
    let directory = dir(ctx)
    if(username) {
        fs.unlink(`${directory}/${username}`, e => { 
            if(e) {
                ctx.reply(`I'm Ill and I couldn't save your preferences, @${username}! 🤒`)
                console.log(e)
            } else {
                ctx.reply(`I won't notify you anymore, @${username}! 👍`)
            }
        })
        
    } else {
        ctx.reply('You don\'t have a username, and you aren\t probably subscribed! 🆔')
    }
})

bot.on('left_chat_member', ctx => {
    let username = ctx.message.from.username
    let directory = dir(ctx)
    if(username && fs.existsSync(`${directory}/${username}`)){
        fs.unlinkSync(`${directory}/${username}`)
    }
})

bot.launch()