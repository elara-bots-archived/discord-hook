const pack = require(`../../package.json`);
module.exports = {
    Colors: {
        DEFAULT: 0x000000,
        WHITE: 0xFFFFFF,
        AQUA: 0x1ABC9C,
        GREEN: 0x2ECC71,
        BLUE: 0x3498DB,
        YELLOW: 0xFFFF00,
        PURPLE: 0x9B59B6,
        LUMINOUS_VIVID_PINK: 0xE91E63,
        GOLD: 0xF1C40F,
        ORANGE: 0xE67E22,
        RED: 0xE74C3C,
        GREY: 0x95A5A6,
        NAVY: 0x34495E,
        DARK_AQUA: 0x11806A,
        DARK_GREEN: 0x1F8B4C,
        DARK_BLUE: 0x206694,
        DARK_PURPLE: 0x71368A,
        DARK_VIVID_PINK: 0xAD1457,
        DARK_GOLD: 0xC27C0E,
        DARK_ORANGE: 0xA84300,
        DARK_RED: 0x992D22,
        DARK_GREY: 0x979C9F,
        DARKER_GREY: 0x7F8C8D,
        LIGHT_GREY: 0xBCC0C0,
        DARK_NAVY: 0x2C3E50,
        BLURPLE: 0x7289DA,
        GREYPLE: 0x99AAB5,
        DARK_BUT_NOT_BLACK: 0x2C2F33,
        NOT_QUITE_BLACK: 0x23272A,
    },
    resolveColor: (color) => {
        if (typeof color === 'string') {
          if (color === 'RANDOM') return Math.floor(Math.random() * (0xFFFFFF + 1));
          if (color === 'DEFAULT') return 0;
          color = Colors[color] || parseInt(color.replace('#', ''), 16);
        } else if (Array.isArray(color)) {
          color = (color[0] << 16) + (color[1] << 8) + color[2];
        }
        if (color < 0 || color > 0xFFFFFF) color = 0;
        else if (color && isNaN(color)) color = 0;
    
        return color;
    },
    /**
     * @param {string} url
     * @returns {boolean}
     */
    validateURL: (url) => {
        if(!url) return false;
        if(typeof url !== "string") return false
        let i = url.match(/http?s?:\/\/(www.discord.com|www.discordapp.com|discord.com|discordapp.com)\/api\/webhooks\//gi);
        if(!Array.isArray(i)) return false;
        return i.length === 0 ? false : true
    },
    error: (e) => {
        throw new Error(`[${pack.name}, ${pack.version}]: ${e}`);
    },
    emptyEmbed: {
        title: null,
        color: null,
        description: null,
        timestamp: null,
        url: null,
        thumbnail: {
          url: null
        },
        image: {
          url: null
        },
        author: {
          name: null,
          icon_url: null,
          url: null
        },
        footer: {
          text: null,
          icon_url: null
        },
        fields: []
    },
    limits: { // These are the limits by Discord themselves.
        content: 2000,
        title: 256,
        description: 2048,
        username: 80,
        fields: {
            name: 256,
            value: 1024
        }
    },
    /**
     * @param {string} url
     */
    split: (url) => {
        let t = url.replace(/http?s?:\/\/(discord.com|discordapp.com)\/api\/webhooks\//gi, "").replace("www.", "").split("/");
        if(!t[0]) return null;
        if(!t[1]) return null;
        return {
            id: t[0],
            token: t[1]
        }
    },
    /**
     * @param {boolean} status
     * @param {object|string} data
     */
    status: (status, data) => {
      return {status, data};
    }
}