const { Message, ReactionCollector: DjsReactionCollector, CollectorOptions: DjsCollectorOptions, UserResolvable } = require("discord.js");
const {validateOptions} = require('../util/validate');
const editMenu = async (botMessage, isBack, i, pages) => {
    isBack ? (i > 0 ? --i : pages.length - 1) : (i + 1 < pages.length ? ++i : 0);
    await botMessage.edit({ embed: pages[i] });
}

module.exports = class ReactionCollector {
    /**
     * @description This method can be used to create easier react menu, with multiples embeds pages.
     * @param  {MenuOptions} options
     * @note {Function[]?} options.onReact cannot be set in this method. (yet)
     * @returns void
     */
    static async menu(options) {
        const { botMessage, user, pages, collectorOptions, reactions, deleteReaction, deleteAllReactionsWhenCollectorEnd } = validateOptions(options, 'reactMenu');
        if (!pages || pages.length === 0)
            throw 'Invalid input: pages is null or empty';

        let i = 0;
        await botMessage.edit({ embed: pages[0] });
        this.question({
            botMessage,
            user,
            reactions,
            collectorOptions,
            deleteReaction,
            deleteAllReactionsWhenCollectorEnd,
            onReact: [
                async (botMessage) => await editMenu(botMessage, true, i, pages),
                async (botMessage) => await editMenu(botMessage, false, i, pages)
            ]
        });
    }

    /**
     * @description This method can be used in multiples emoji choices.
     * @param  {CollectorOptions} options
     * @param  {Message} options.botMessage - Message from Bot to create reaction collector.
     * @param  {UserResolvable} options.user - UserResolvable who will react. 
     * @param  {string[]} [options.reactions] - Array with reactions (using unicode or emoji id)
     * @param  {DjsCollectorOptions?} [options.collectorOptions] - Default discord.js collector options
     * @param  {Function[]?} [options.onReact] - Corresponding functions when clicking on each reaction
     * @param  {boolean?} [options.deleteReaction] - The Bot will remove reaction after user react?
     * @param  {boolean?} [options.deleteAllReactionsWhenCollectorEnd] - The Bot will remove reaction after collector end?
     * @example 
     * const botMessage = await message.channel.send('Simple yes/no question');
     * ReactionCollector.question({
     *     user: message,
     *     botMessage,
     *     onReact: [
     *         (botMessage) => message.channel.send("You've clicked in yes button!"),
     *         (botMessage) => message.channel.send("You've clicked in no button!")
     *     ]
     * });
     * @note onReact(botMessage?: Message) - onReact functions can use botMessage argument.
     * @returns DjsReactionCollector
     */
    static question(options) {
        return this.__createReactionCollector(validateOptions(options, 'reactQuestion'));
    }

    /**
     * @description This method can be used in async methods, returning only boolean value, more easier to use inside if tratament or two choices.
     * @param  {AsyncCollectorOptions} options
     * @param  {Message} options.botMessage - Message from Bot to create reaction collector.
     * @param  {UserResolvable} options.user - UserResolvable who will react. 
     * @param  {string[]} [options.reactions] - Array with reactions (using unicode or emoji id)
     * @param  {DjsCollectorOptions} [options.collectorOptions] - Default discord.js collector options
     * @param  {boolean} [options.deleteReaction] - The Bot will remove reaction after user react?
     * @param  {boolean} [options.deleteAllReactionsWhenCollectorEnd] - The Bot will remove reaction after collector end?
     * @example 
     * const botMessage = await message.channel.send('Simple yes/no question');
     * if (await ReactionCollector.asyncQuestion({ user: message, botMessage }))
     *     message.channel.send('You\'ve clicked in yes button!');
     * else
     *     message.channel.send('You\'ve clicked in no button!');
     * @returns {Promise<boolean>}
     */
    static async asyncQuestion(options) {
        return this.__createAsyncReactionCollector(validateOptions(options, 'reactAsyncQuestion'));
    }


    /**
     * @param  {CollectorOptions} _options
     * @returns {DjsReactionCollector}
     */
    static __createReactionCollector(_options) {
        const { botMessage, reactions, user, collectorOptions, onReact, deleteReaction, deleteAllReactionsWhenCollectorEnd } = _options;
        Promise.all(reactions.map(r => botMessage.react(r)));
        const filter = (r, u) => u.id === user.id && reactions.includes(r.emoji.name) && !user.bot;
        const collector = botMessage.createReactionCollector(filter, collectorOptions);
        collector.on('collect', async (reaction) => {
            const emoji = reaction.emoji.name;
            if (deleteReaction)
                await reaction.users.remove(user.id);
            await onReact[reactions.indexOf(emoji)](botMessage);
        });
        collector.on('end', async () => { if (deleteAllReactionsWhenCollectorEnd) await botMessage.reactions.removeAll() });
        return collector;
    }

    /**
     * @private
     * @static
     * @param  {AsyncCollectorOptions} _options
     * @returns {DjsReactionCollector}
     */
    static async __createAsyncReactionCollector(_options) {
        return new Promise(async(resolve) => {
            const { botMessage, reactions, user, collectorOptions, deleteReaction, deleteAllReactionsWhenCollectorEnd } = _options;
            await Promise.all(reactions.map(r => botMessage.react(r)));
            const filter = (r, u) => u.id === user.id && reactions.includes(r.emoji.name) && !user.bot;
            const caughtReactions = await botMessage.awaitReactions(filter, collectorOptions);
            if (caughtReactions.size > 0) {
                const reactionCollected = caughtReactions.first();
                if (deleteReaction)
                    await reactionCollected.users.remove(user.id);
                if (deleteAllReactionsWhenCollectorEnd)
                    await reactionCollected.message.reactions.removeAll();
                return resolve(reactions.indexOf(reactionCollected.emoji ? reactionCollected.emoji.name : reactionCollected.name) === 0);
            }
            return resolve(false);
        });
    }
}