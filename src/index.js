const { validateURL, error, limits, resolveColor, status } = require("./util/util");

module.exports = class Webhook{
    constructor(url, options = { username: "", avatar_url: ""}){
        if(!validateURL(url)) return error(`You didn't provide any webhook url or you provided an invalid webhook url`);
        this.url = url;
        this.helpers = { blank: "\u200b" };
        this.req = {
            username: options?.username ?? null,
            avatar_url: options?.avatar_url ?? null,
            embeds: [],
            content: null,
            components: []
        };
    };
    name(name = ""){ return this.username(name) };
    icon(url = ""){ return this.avatar(url); };
    embed(embed){ return this.addEmbed(embed); };
    embeds(embeds){ return this.addEmbeds(embeds); };
    buttons(data = []) { return this.addButtons(data); };
    button(data) { return this.addButton(data); };
    mention(text = ""){
        if(typeof text !== "string") return this;
        if(!(text.startsWith("<@") && text.endsWith(">"))) return this;
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
        if(!url) return this;
        if(!url.match(/https?:\/\//g)) return this;
        this.req.avatar_url = url;
        return this;
    };
    both(name = "", avatar = "") {
        this.name(name).avatar(avatar);
        return this;
    }
    content(text = ""){
        if(typeof text !== "string") return this;
        if(text.length > limits.content) text = text.slice(0, limits.content);
        this.req.content = this.req.content += text;
        return this;
    };
    addEmbed(embed){
        if(this.req.embeds.length > 10) return this;
        if("color" in embed && typeof color === "string") embed.color = resolveColor(embed.color)
        this.req.embeds.push(embed);
        return this;
    };
    addEmbeds(embeds = {}){
        for (const embed of embeds) this.addEmbed(embed);
        return this;
    };
    addButtons(data = []) {
        for (const d of data) this.addButton(d);
        return this;
    };
    addButton(data) {
        this.req.components.push(data);
        return this;
    };

    field(name, value, inline = false){
        if(!name) name = this.helpers.blank;
        if(!value) name = this.helpers.blank;
        return { name, value, inline };
    };
    
    async send(force = false, authorization = ""){
        force = Boolean(force);
        if(!this.req.content?.length && !this.req.embeds?.length && !this.req.components?.length) return error(`You didn't add anything to be sent.`)
        let djs = null;
        try{ 
            djs = require("discord.js").WebhookClient; 
        }catch{
            
        };
        if(typeof djs === "function" && !force){
            let hook = new djs({ url: this.url })
            let s = await hook.send({
                content: this.req.content ?? null,
                embeds: this.req.embeds ?? null, 
                username: this.req.username ?? null, 
                avatarURL: this.req.avatar_url ?? null,
                components: this.req.components ?? null
            })
            .then(r => status(true, r))
            .catch(err => status(false, err));
            if(s.status !== true) return error(s.data);
            return s.data;
        }else{
            let s = await require("superagent")
            .post(this.url)
            .query({ wait: true })
            .set(authorization ? { "Authorization": `Bot ${authorization}` } : {})
            .send(this.req)
            .then(r => status(true, r.body))
            .catch(err => status(false, err));
            if(s.status !== true) return error(s.data);
            return s.data;
        }
    };
    async edit(messageID){
        if(!messageID) return error(`You didn't provide a message ID`);
        if(!this.req.content?.length && !this.req.embeds?.length && !this.req.components?.length) return error(`You didn't add anything to be sent.`)
        return await require("superagent")
        .patch(`${this.url}/messages/${messageID}`)
        .send(this.req)
        .then((r) => status(true, r.body))
        .catch((e) => error(e.stack));
    }
};


module.exports.old = require("./util/old");
