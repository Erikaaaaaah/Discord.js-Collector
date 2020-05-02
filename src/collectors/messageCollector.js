const {validateOptions} = require('../util/validate');
const { Message, MessageCollectorOptions , User, Message } = require('discord.js');
module.exports = class MessageCollector{
    /**
     * @description This method create easier message collector, then collected, will execute your custom function.
     * @param  {Object} options
     * @param {Message} options.botMessage - Message sent from bot.
     * @param  {UserResolvable} options.user - UserResolvable who will react. 
     * @param {MessageCollectorOptions} options.collectorOptions - Message sent from bot.
     */
    static question(options) {
        return this.__createMessageCollector(validateOptions(options, 'messageQuestion'));
    }

    /**
     * @description This method create easier message collector returning Promise<Message> when collected.
     * @param  {Object} options
     * @param {Message} options.botMessage - Message sent from bot.
     * @param  {UserResolvable} options.user - UserResolvable who will react. 
     * @param {MessageCollectorOptions} options.collectorOptions - Message sent from bot.
     * 
     * @returns {Promise<Message>}
     */
    static asyncQuestion(options) {
        return this.__createAsyncMessageCollector(validateOptions(options, 'messageAsyncQuestion'))
    }

    static __createMessageCollector(_options) {
        const { botMessage, user, collectorOptions, onMessage, deleteMessage } = validateOptions(_options, 'messageCollector');
        const filter = (message) => message.author.id === user.id && !message.author.bot;
        const collector = botMessage.channel.createMessageCollector(filter, collectorOptions);
        collector.on('collect', async (message) => {
            if (deleteMessage)
                await message.delete();
            await onMessage(botMessage, message);
        });
        return collector;
    }
    
    static async __createAsyncMessageCollector(_options) {
        return new Promise(async(resolve, reject) => {
            const { botMessage, user, collectorOptions, deleteMessage } = validateOptions(_options, 'messageCollector');
            const filter = (message) => message.author.id === user.id && !user.bot;
            const caughtMessages = await botMessage.awaitReactions(filter, collectorOptions);
            if (caughtMessages.size > 0) {
                const message = caughtMessages.first();
                if (deleteMessage)
                    await message.delete();
                return resolve(message);
            }
            return reject(false);
        });
    }
}