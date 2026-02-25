const Welcome = require('../models/Welcome');
const { deleteGuildCache } = require('../utils/cache');

module.exports = {
    name: 'guildDelete',
    async execute(guild) {
        // Bot sunucudan atıldığında (veya sunucu silindiğinde) veritabanı kaydını ve cache'i tamamen temizle.
        await Welcome.findOneAndDelete({ guildId: guild.id });
        deleteGuildCache(guild.id);
        console.log(`[Temizlik] Bot ${guild.name} sunucusundan atıldı. Verileri silindi.`);
    }
};