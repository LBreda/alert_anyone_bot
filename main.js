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

bot.command('alertyme', ctx => {
    let userId = ctx.message.from.id
    let directory = dir(ctx)
    fs.writeFile(`${directory}/${username}`, '', e => {
        if(e) {
            ctx.reply(`I'm Ill and I couldn't save your preferences, [${userId}](tg://user?id=${userId})! 🤒`)
            console.log(e)
        } else {
            ctx.reply(`I'll notify you, [${userId}](tg://user?id=${userId})! 👍`)
        }
    })
})

bot.command('dontalertme', ctx => {
    let userId = ctx.message.from.id
    let directory = dir(ctx)
    fs.unlink(`${directory}/${userId}`, e => { 
        if(e) {
            ctx.reply(`I'm Ill and I couldn't save your preferences, [${userId}](tg://user?id=${userId})! 🤒`)
            console.log(e)
        } else {
            ctx.reply(`I won't notify you anymore, [${userId}](tg://user?id=${userId})! 👍`)
        }
    })
})

bot.on('left_chat_member', ctx => {
    let userId = ctx.message.from.id
    let directory = dir(ctx)
    if(fs.existsSync(`${directory}/${userId}`)){
        fs.unlinkSync(`${directory}/${userId}`)
    }
})

bot.launch()