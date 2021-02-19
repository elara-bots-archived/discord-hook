const {validateURL, error, limits, split, resolveColor, status} = require("./util/util");
    /**
     * @typedef {Object} FooterOptions
     * @property {string} text
     * @property {string} icon_url
     */
    /**
     * @typedef {Object} FieldOptions
     * @property {string} name
     * @property {string} value
     * @property {boolean} inline
     */
    /**
     * @typedef {Object} AuthorOptions
     * @property {string} name
     * @property {string} icon_url
     * @property {string} url
     */
    /**
     * @typedef {Object} ImageOptions
     * @property {string} url
     */
    /**
     * @typedef {Object} Embed
     * @property {string} title
     * @property {string} description
     * @property {string} color
     * @property {string} url
     * @property {Date|string|undefined} timestamp
     * @property {ImageOptions} thumbnail
     * @property {ImageOptions} image
     * @property {FooterOptions} footer
     * @property {AuthorOptions} author
     * @property {FieldOptions[]} fields
     */

module.exports = class WebhookService{
    
    /**
     * @param {string} url 
     * @param {Object} [webhookOptions]
     * @param {string} [webhookOptions.username]
     * @param {string} [webhookOptions.avatar_url
     */
    
    constructor(url, webhookOptions = { username: "", avatar_url: "" }){
        if(!validateURL(url)) return error(`You didn't provide any webhook url or you provided an invalid webhook url`);
        this.url = url;
        this.helpers = {
            blank: "\u200b"
        }
        this.req = {
            username: webhookOptions ? (webhookOptions.username || "") : "",
            avatar_url: webhookOptions ? (webhookOptions.avatar_url || "") : "",
            embeds: [],
            content: ""
        };
    };
    
    /**
     * @param {string} text 
     */
    mention(text){
        if(!text) return this;
        if(typeof text !== "string") return this;
        if(!(text.startsWith("<@") && text.endsWith(">"))) return this;
        this.req.content = `${text}${this.req.content ? `, ${this.req.content}` : ""}`;
        return this;
    };
    
    /**
     * @param {string} name 
     */
    username(name){
        if(!name) return this;
        if(typeof name !== "string") return this;
        if(name.length < 1) return this;
        if(name.length > limits.username) name = name.slice(0, limits.username);
        this.req.username = name;
        return this;
    };
   
    /**
     * @param {string} name 
     */
    name(name){ return this.username(name) };
    
    /**
     * @param {string} url 
     */
    avatar(url){
        if(!url) return this;
        if(!url.match(/http?s:\/\//g)) return this;
        this.req.avatar_url = url;
        return this;
    };
    
    /**
     * @param {string} url 
     */
    icon(url){ return this.avatar(url); }
    
    /**
     * @description This sets the name and icon for the webhook.
     * @param {?string} [name]
     * @param {?string} [avatar]
    */
    both(name = "", avatar = "") {
        this.name(name)
            .avatar(avatar);
        return this;
    }
    
    /**
     * @param {string} text 
     */
    content(text){
        if(!text) return this;
        if(typeof text !== "string") return this;
        if(text.length > limits.content) text = text.slice(0, limits.content);
        this.req.content = this.req.content += text;
        return this;
    };
    
    /**
     * @param {Embed} embed 
     */
    addEmbed(embed){
        if(this.req.embeds.length > 10) return this;
        if("color" in embed){
            if(typeof color === "string") embed.color = resolveColor(embed.color)
        }
        this.req.embeds.push(embed);
        return this;
    };
    
    /**
     * @param {Embed[]} embeds 
     */
    addEmbeds(embeds){
        for (const embed of embeds){ this.addEmbed(embed); };
        return this;
    };
    
    /**
     * @param {Embed} embed
     */
    embed(embed){ return this.addEmbed(embed); };
    
    /**
     * @param {Embed[]} embeds 
     */
    embeds(embeds){ return this.addEmbeds(embeds); };
    
    /**
     * @param {string} name 
     * @param {string} value 
     * @param {boolean} inline 
     * @returns {Object}
     */
    field(name, value, inline = false){
        if(!name) name = this.helpers.blank;
        if(!value) name = this.helpers.blank;
        return { name, value, inline };
    };
    
    async send(){
        if((this.req.content || "").length === 0 && (this.req.embeds || []).length === 0) return error(`You didn't add anything to be sent.`)
        let djs = null;
        try{ djs = require("discord.js").WebhookClient; }catch{};
        if(typeof djs === "function"){
            let r = split(this.url);
            if(!r) return error(`I was unable to fetch the url properly.`);
            let hook = new djs(r.id, r.token)
            let s = await hook.send(this.req.content, {
                embeds: this.req.embeds, 
                username: this.req.username, 
                avatarURL: this.req.avatar_url
            })
            .then(r => {return status(true, r)})
            .catch(err => {return status(false, err)});
            if(s.status !== true) return error(s.data);
            return s.data;
        }else{
            let s = await require("superagent")
            .post(this.url)
            .query({ wait: true })
            .send({
                "username": this.req.username,
                "avatar_url": this.req.avatar_url,
                "content": this.req.content,
                "embeds": this.req.embeds
            })
            .then(r => {return status(true, r.body)})
            .catch(err => {return status(false, err)});
            if(s.status !== true) return error(s.data);
            return s.data;
        }
    };
    
    /**
     * @description This allows you to edit a message for a webhook!
     * @param {string} messageID 
     * @returns {Promise<object>}
     */
    async edit(messageID){
        if(!messageID) return error(`You didn't provide a message ID`);
        if((this.req.content || "").length === 0 && (this.req.embeds || []).length === 0) return error(`You didn't add anything to be sent.`)
        return await require("superagent")
        .patch(`${this.url}/messages/${messageID}`)
        .send(this.req)
        .then((r) => status(true, r.body))
        .catch((e) => error(e.stack));
    }
};


module.exports.old = require("./util/old");
