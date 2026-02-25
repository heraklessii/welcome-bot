const Welcome = require('../models/Welcome');

const guildCache = new Map();

async function getGuildData(guildId) {
    if (guildCache.has(guildId)) {
        return guildCache.get(guildId);
    }
    const data = await Welcome.findOne({ guildId });
    if (data) guildCache.set(guildId, data);
    return data;
}

function updateGuildCache(guildId, data) {
    guildCache.set(guildId, data);
}

function deleteGuildCache(guildId) {
    guildCache.delete(guildId);
}

module.exports = { getGuildData, updateGuildCache, deleteGuildCache };