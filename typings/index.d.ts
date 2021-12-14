declare module "discord-hook" {

    type Component = {
        type: number;
        components: Button[];
    };

    type ButtonStyle = 'Primary' | 'Secondary' | 'Success' | 'Danger' | 'Link'

    type Button = {
        type: number;
        style: ButtonStyle|number;
        custom_id?: string;
        label?: string;
        disabled?: boolean;
        url?: string;
        emoji?: { name?: string, id?: string, animated?: boolean };
    };

    type Embed = {
        title?: string;
        description?: string;
        color?: string|number;
        fields?: { name?: string, value?: string, inline?: boolean }[];
        footer?: { text?: string, icon_url?: string };
        author?: { name?: string, icon_url?: string, url?: string };
        timestamp?: Date|string;

    };

    class Webhook {
        public constructor(url: string, options?: { username?: string, avatar_url?: string, threadId?: string });
        private url: string;
        public helpers: {
            blank: string;
        };
        private req: {
            username: string;
            avatar_url: string;
            content: string;
            embeds: Embed[];
            components: Component[];
            thread_id: string;
        };
        public both(username: string, avatar: string): this;
        public content(text: string): this;
        public mention(text: string): this;
        public username(name: string): this;
        public avatar(url: string): this;
        public embed(embed: Embed): this;
        public embeds(embeds: Embed[]): this;
        public button(data: Component): this;
        public buttons(data: Component[]): this;
        public field(name: string, value: string, inline?: boolean): { name: string, value: string, inline: boolean };
        public send(force?: boolean, authorization?: string): Promise<any>;
        public edit(messageID: string): Promise<any>;

        /** @deprecated - Use .username() */
        public name(name: string): this;

        /** @deprecated - Use .avatar() */
        public icon(url: string): this;

        /** @deprecated - Use .button() */
        public addbutton(data: Component): this;
        
        /** @deprecated - Use .buttons() */
        public addButtons(data: Component[]): this;
        
        /** @deprecated - Use .embed() */
        public addEmbed(embed: Embed): this;
        
        /** @deprecated - Use .embeds() */
        public addEmbeds(embeds: Embed[]): this;
    };

    export = Webhook;

    export class old {
        public constructor(url: string);

        private webhook: string;
        private embed: Embed|object;
        private request: {
            content: string;
            embeds: Embed[];
            avatar_url: string;
            username: string
        };

        public setMention(id: string): this;
        public setTitle(text: string): this;
        public setDescription(text: string): this;
        public setContent(text: string): this;
        public setImage(icon: string): this;
        public setThumbnail(icon: string): this;
        public setColor(color: string): this;
        public setColour(colour: string): this;
        public setURL(url: string): this;
        public addTitle(title: string, url: string): this;
        public setTimestamp(date: Date|string): this;
        public setAuthor(name: string, icon: string, url?: string): this;
        public setFooter(name: string, icon: string): this;
        public setUsername(name: string): this;
        public setAvatar(icon: string): this;
        public addField(name: string, value: string, inline?: boolean): this;
        public addBlankField(inline?: boolean): this;
        public send(): Promise<any>;
    };
};
