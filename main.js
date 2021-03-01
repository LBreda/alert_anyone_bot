const { Telegraf } = require('telegraf')
const fs = require('fs')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

/**
 * Gets the db directory name
 * @param {NarrowedContext} ctx 
 */
let getDirName = ctx => {
    let roomId = ctx.message.chat.id
    let dirName = `data/${roomId}`
    if (!fs.existsSync(dirName)) fs.mkdirSync(`data/${roomId}`);
    return dirName
}

/**
 * Gets sender's data
 * @param {NarrowedContext} ctx 
 */
let getRequestorData = ctx => {
    let sender = ctx.message.from
    return {
        id: sender.id,
        handle: sender.first_name || sender.username || sender.id
    }
}

/**
 * `/all` command listener. Alerts all the registered users in the current
 * chat, except for the command issuer
 */
bot.command('all', ctx => {
    let directory = getDirName(ctx)
    let sender = getRequestorData(ctx)
    let users = fs.readdirSync(directory)
        .filter(file => !file.startsWith('.') && file != sender.id)
        .map(file => {
            let userData = JSON.parse(fs.readFileSync(`${directory}/${file}`).toString())
            return `[${userData.handle}](tg://user?id=${userData.id})`
        })
    if(users.length){
        ctx.replyWithMarkdown(`Hey! ${users.join(', ')}`)
    } else {
        ctx.replyWithMarkdown(`Noone to alert 😕`)
    }
})

/**
 * `alertme` command listener. Subscribes the command issuer for the current
 * chat
 */
bot.command('alertme', ctx => {
    let user = getRequestorData(ctx)
    let directory = getDirName(ctx)
    fs.writeFile(`${directory}/${user.id}`, JSON.stringify(user), e => {
        if (e) {
            ctx.replyWithMarkdown(`I'm Ill and I couldn't save your preferences, [${user.handle}](tg://user?id=${user.id})! 🤒`)
            console.log(e)
        } else {
            ctx.replyWithMarkdown(`I'll notify you, [${user.handle}](tg://user?id=${user.id})! 👍`)
        }
    })
})

/**
 * `dontalertme` command listener. Remove the subscription for the command
 * issuer in the current chat
 */
bot.command('dontalertme', ctx => {
    let user = getRequestorData(ctx)
    let directory = getDirName(ctx)
    fs.unlink(`${directory}/${user.id}`, e => {
        if (e) {
            if(e.code === 'ENOENT') {
                ctx.replyWithMarkdown(`You were not subscribed, [${user.handle}](tg://user?id=${user.id})!`)
            } else {
                ctx.replyWithMarkdown(`I'm Ill and I couldn't save your preferences, [${user.handle}](tg://user?id=${user.id})! 🤒`)
            }
        } else {
            ctx.replyWithMarkdown(`I won't notify you anymore, [${user.handle}](tg://user?id=${user.id})! 👍`)
        }
    })
})

/**
 * `left_chat_member` event listener. Removes a leaving issuer from the
 * subscribed users list for the current chat
 */
bot.on('left_chat_member', ctx => {
    let userId = ctx.message.from.id
    let directory = getDirName(ctx)
    if (fs.existsSync(`${directory}/${userId}`)) {
        fs.unlinkSync(`${directory}/${userId}`)
    }
})

bot.launch()
