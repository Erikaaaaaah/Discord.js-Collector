import {
    CollectorOptions,
    MessageCollector as DjsMessageCollector,
    ReactionCollector as DjsReactionCollector,
    EmojiIdentifierResolvable,
    Message,
    MessageEmbed,
    UserResolvable,
    Client,
    Role,
    Collection,
    MessageReaction,
    User,
    Snowflake,
    TextChannel,
    Guild,
    GuildEmoji,
    EmojiResolvable,
    GuildMember
} from "discord.js";

import { EventEmitter } from 'events';

declare module 'discord.js-collector' {

    class ReactionRole {
        constructor(options: IReactionRoleOptions);
        get id(): string;
        public toJSON(): object;
        get message(): string;
        get channel(): string;
        get guild(): string;
        get role(): string;
        get emoji(): string;
        get winners(): string[];
        get max(): number;
        static fromJSON(json: JSON): ReactionRole;
    }

    interface IReactionRoleOptions {
        message: Message | Snowflake;
        channel: TextChannel | Snowflake;
        guild: Guild | Snowflake;
        role: Role | Snowflake;
        emoji: GuildEmoji | EmojiResolvable;
        winners: string[];
        max: number;
    }

    export class ReactionRoleManager extends EventEmitter {
        constructor(client: Client, options?: IReactionRoleManagerOptions);
        public roles: Collection<string, ReactionRole>;
        private __resfreshOnBoot(): Promise<void>;
        private __debug(type: string, message: string, ...args: any);
        public createReactionRole(options: IAddRoleOptions): Promise<void>;
        public deleteReactionRole(role: ReactionRole): void;
        /**
    * @deprecated since 1.4.4, use createReactionRole instead.
    */
        public addRole(options: IAddRoleOptions): Promise<void>;
        /**
    * @deprecated since 1.4.4, use deleteReactionRole instead.
    */
        public removeRole(role: ReactionRole): void;
        private __store(): void;
        private __parseStorage(): Collection<string, any>;
        private __onReactionAdd(msgReaction: MessageReaction, user: User): Promise<void>;
        private __onReactionRemove(msgReaction: MessageReaction, user: User): Promise<void>;
        private __onRemoveAllReaction(message: Message): Promise<void>;

        public on(event: string, listener: (...args: any[]) => void): this;
        public on(event: 'reactionRoleAdd', listener: (member: GuildMember, role: Role) => void): this;
        public on(event: 'reactionRoleRemove', listener: (member: GuildMember, role: Role) => void): this;
        public on(event: 'allReactionsRemove', listener: (message: Message, rolesAffected: Role[], membersAffected: GuildMember[], reactionsTaken: number) => void): this;

    }

    export interface IAddRoleOptions {
        message: Message;
        role: Role;
        emoji: EmojiIdentifierResolvable;
        max: number;
    }

    export interface IReactionRoleManagerOptions {
        store: true;
        storage: true;
        debug: false;
        path: string;
        mongoDbLink: '';
    }

    export class MessageCollector {
        public static question(options: IMessageQuestionOptions): DjsMessageCollector;
        public static asyncQuestion(options: IMessageQuestionOptions): Promise<Message>;
        private __createMessageCollector(_options): DjsMessageCollector;
        private __createAsyncMessageCollector(_options): Promise<Message>;
    }

    export interface IMessageQuestionOptions {
        botMessage: Message;
        user: UserResolvable;
        onReact: (botMessage: Message) => {};
        reactions?: EmojiIdentifierResolvable[];
        collectorOptions?: CollectorOptions;
        deleteMessage?: boolean;
    }

    export interface ITimerOptions {
        time?: number;
        idle?: number;
    }

    export class Controller {
        constructor(botMessage: Message, collector: DjsReactionCollector, pages: IMenuPage);
        public stop(): void;
        public back(): void;
        public restTimer(options?: ITimerOptions): void;
        public goTo(pageId: string | number): void;
        public get canBack(): boolean;
        public update(bool: boolean): Promise<void>;
        get botMessage(): Message;
        get lastPage(): IMenuPage;
        set messagesCollector(value);
        get messagesCollector(): DjsMessageCollector;
        get collector(): DjsReactionCollector;
        get currentPage(): IMenuPage;
        set currentPage(value);
        set lastPage(value);
        get pages(): IMenuPage;
    }

    export class ReactionCollector {
        public static menu(options: IReactMenuOptions): Controller;
        public static paginator(options: IPaginatorOptions): DjsReactionCollector;
        public static question(options: IReactQuestionOptions, ...args: any): DjsReactionCollector;
        public static yesNoQuestion(options: IReactQuestionOptions): Promise<boolean>;
        private static __createReactionCollector(_options, ...args: any): DjsReactionCollector;
        private static __createYesNoReactionCollector(_options): Promise<boolean>;
    }

    export interface IReactQuestionOptions {
        botMessage: Message;
        user: UserResolvable;
        reactions?: IReactionMapAction;
        collectorOptions?: CollectorOptions;
        deleteReaction?: boolean;
        deleteAllOnEnd?: boolean;
    }

    export interface IPaginatorOptions {
        pages: MessageEmbed;
        botMessage: Message;
        user: UserResolvable;
        reactions?: IReactionMapAction;
        collectorOptions?: CollectorOptions;
        deleteReaction?: boolean;
        deleteAllOnEnd?: boolean;
    }

    export interface IReactMenuOptions {
        pages: IMenuPage;
        botMessage: Message;
        user: UserResolvable;
        collectorOptions?: CollectorOptions;
    }

    export interface IReactionMapAction {
        [key: string]: (reaction: MessageReaction, ...args: any) => {};
    }

    export interface IMenuPage {
        [key: string]: {
            id?: string | number;
            embed?: MessageEmbed | object;
            content?: string;
            reactions?: EmojiIdentifierResolvable[];
            backEmoji?: EmojiIdentifierResolvable;
            clearReactions?: boolean;
            pages?: IMenuPage;
            onMessage?: (controller: Controller, message: Message) => {};
            onReact?: (controller: Controller, reaction: MessageReaction) => {};
        };
    }
}