const { Telegraf } = require('telegraf')
const fs = require('fs')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

let dir = ctx => {
    let roomId = ctx.message.chat.id
    let dirName = `data/${roomId}`
    if (!fs.existsSync(dirName)) fs.mkdirSync(`data/${roomId}`);
    return dirName
}

let userData = ctx => {
    let sender = ctx.message.from
    return {
        id: sender.id,
        handle: sender.first_name || sender.username || sender.id
    }
}

bot.command('all', ctx => {
    let room_id = ctx.message.chat.id
    let directory = dir(ctx)
    let users = fs.readdirSync(directory)
        .filter(file => !file.startsWith('.'))
        .map(file => {
            let userData = JSON.parse(fs.readFileSync(`${directory}/${file}`).toString())
            return `[${userData.handle}](tg://user?id=${userData.id})`
        })
    ctx.replyWithMarkdown(`Hey, ${users.join(' ')}`)
})

bot.command('alertme', ctx => {
    let user = userData(ctx)
    let directory = dir(ctx)
    fs.writeFile(`${directory}/${user.id}`, JSON.stringify(user), e => {
        if (e) {
            ctx.reply(`I'm Ill and I couldn't save your preferences, [${user.handle}](tg://user?id=${user.id})! 🤒`)
            console.log(e)
        } else {
            ctx.reply(`I'll notify you, [${user.handle}](tg://user?id=${user.id})! 👍`)
        }
    })
})

bot.command('dontalertme', ctx => {
    let user = userData(ctx)
    let directory = dir(ctx)
    fs.unlink(`${directory}/${user.id}`, e => {
        if (e) {
            ctx.reply(`I'm Ill and I couldn't save your preferences, [${user.handle}](tg://user?id=${user.id})! 🤒`)
            console.log(e)
        } else {
            ctx.reply(`I won't notify you anymore, [${user.handle}](tg://user?id=${user.id})! 👍`)
        }
    })
})

bot.on('left_chat_member', ctx => {
    let userId = ctx.message.from.id
    let directory = dir(ctx)
    if (fs.existsSync(`${directory}/${userId}`)) {
        fs.unlinkSync(`${directory}/${userId}`)
    }
})

bot.launch()