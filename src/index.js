const { validateURL, error, limits, resolveColor, status } = require("./util/util");
const fetch = require("@elara-services/fetch");


module.exports = class Webhook{
    constructor(url, options = { username: "", avatar_url: "", threadId: "" }){
        if(!validateURL(url)) return error(`You didn't provide any webhook url or you provided an invalid webhook url`);
        this.url = url;
        this.helpers = { blank: "\u200b" };
        this.req = {
            username: options?.username ?? undefined,
            avatar_url: options?.avatar_url ?? undefined,
            embeds: [],
            content: undefined,
            components: [],
            thread_id: options.threadId ?? undefined
        };
    };
    /** @deprecated Use .username() */
    name(name = ""){ return this.username(name) };
        /** @deprecated Use .avatar() */
    icon(url = ""){ return this.avatar(url); };
    /** @deprecated - Use .embed() */
    addEmbed(embed){ return this.embed(embed); };
    /** @deprecated - Use .embeds() */
    addEmbeds(embeds){ return this.embeds(embeds); };
    /** @deprecated - Use .buttons() */
    addButtons(data = []) { return this.buttons(data); };
    /** @deprecated - Use .button() */
    addButton(data) { return this.button(data); };

    mention(text = ""){
        if(typeof text !== "string" || !text.match(/<@(!|&)?/gi)) return this;
        this.req.content = `${text}${this.req.content ? `, ${this.req.content}` : ""}`;
        return this;
    };
    username(name = ""){
        if(typeof name !== "string") return this;
        if(name.length < 1) return this;
        if(name.length > limits.username) name = name.slice(0, limits.username);
        this.req.username = name;
        return this;
    };
    avatar(url = ""){
        if(!url || !url.match(/https?:\/\//gi)) return this;
        this.req.avatar_url = url;
        return this;
    };
    both(name = "", avatar = "") {
        this.username(name)
        .avatar(avatar);
        return this;
    }
    content(text = ""){
        if(typeof text !== "string") return this;
        if(text.length > limits.content) text = text.slice(0, limits.content);
        if(this.req.content) this.req.content = this.req.content += text;
        else this.req.content = text;
        return this;
    };
    embed(embed){
        if(this.req.embeds.length > 10) return this;
        if("color" in embed && typeof color === "string") embed.color = resolveColor(embed.color)
        this.req.embeds.push(embed);
        return this;
    };
    embeds(embeds = {}){
        for (const embed of embeds) this.embed(embed);
        return this;
    };
    buttons(data = []) {
        for (const d of data) this.button(d);
        return this;
    };
    button(data) {
        this.req.components.push(data);
        return this;
    };

    field(name, value, inline = false){
        if(!name) name = this.helpers.blank;
        if(!value) value = this.helpers.blank;
        return { name, value, inline };
    };
    
    async send(force = false, authorization = ""){
        force = Boolean(force);
        if(!this.req.content?.length && !this.req.embeds?.length && !this.req.components?.length) return error(`You didn't add anything to be sent.`)
        let djs = null;
        try{ djs = require("discord.js").WebhookClient; }catch{ };
        if(typeof djs === "function" && !force){
            if (!this.req.content) this.req.content = undefined;
            let [ id, token ] = this.url.split("/webhooks/")[1].split("/");
            let hook = new djs({ url: this.url, id, token: token?.split?.("?")?.[0] ?? "" })
            let s = await hook.send({
                content: this.req.content,
                embeds: this.req.embeds ?? undefined, 
                username: this.req.username ?? undefined, 
                avatarURL: this.req.avatar_url ?? undefined,
                components: this.req.components ?? undefined,
                threadId: this.req.thread_id ?? undefined
            })
            .then(r => status(true, r))
            .catch(e => status(false, e));
            if(!s.status) return error(s.data);
            return s.data;
        }else{
            let r = await fetch(this.url, "POST")
            .query({ wait: true })
            .header(authorization ? { "Authorization": `Bot ${authorization}` } : {})
            .body(this.req)
            .send()
            .then(r => {
                if (![ 200, 201 ].includes(r.statusCode)) return error(r.json());
                return status(true, r.json())
            })
            .catch(e => status(false, e));
            if (!r.status) return error(s.data);
            return r.data;
        }
    };
    
    async edit(messageID){
        if(!messageID) return error(`You didn't provide a message ID`);
        if(!this.req.content?.length && !this.req.embeds?.length && !this.req.components?.length) return error(`You didn't add anything to be sent.`)
        return await fetch(`${this.url}/messages/${messageID}`, "PATCH")
        .body(this.req)
        .send()
        .then(r => {
            if (![ 200, 201 ].includes(r.statusCode)) return error(r.json());
            return status(true, r.json())
        })
        .catch(e => error(e));
    }
};


module.exports.old = require("./util/old");
