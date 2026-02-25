const Welcome = require('../models/Welcome');
const { getGuildData, updateGuildCache } = require('../utils/cache');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        if (!channel.guild) return; // Sadece sunucu kanallarında çalışır
        
        const data = await getGuildData(channel.guild.id);
        if (!data) return;

        let isUpdated = false;

        // Eğer silinen kanal veritabanına kayıtlıysa, kaydı null yap.
        if (data.welcomeChannel === channel.id) { data.welcomeChannel = null; isUpdated = true; }
        if (data.leaveChannel === channel.id) { data.leaveChannel = null; isUpdated = true; }
        if (data.logChannel === channel.id) { data.logChannel = null; isUpdated = true; }

        if (isUpdated) {
            await Welcome.findOneAndUpdate({ guildId: channel.guild.id }, { $set: data });
            updateGuildCache(channel.guild.id, data);
        }
    }
};