const Welcome = require('../models/Welcome');
const { getGuildData, updateGuildCache } = require('../utils/cache');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        const data = await getGuildData(role.guild.id);
        if (!data) return;

        if (data.autoRole === role.id) {
            data.autoRole = null;
            await Welcome.findOneAndUpdate({ guildId: role.guild.id }, { $set: { autoRole: null } });
            updateGuildCache(role.guild.id, data);
        }
    }
};