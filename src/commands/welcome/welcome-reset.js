const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Welcome = require('../../models/Welcome');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-reset')
        .setDescription('Karşılama sistemini tamamen sıfırlar ve kapatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            await Welcome.findOneAndDelete({ guildId: interaction.guildId });
            await interaction.editReply({ content: '🗑️ Karşılama sistemi bu sunucu için başarıyla **sıfırlandı** ve veriler silindi.' });
        } catch (error) {
            await interaction.editReply({ content: '❌ Sistem sıfırlanırken bir hata oluştu.' });
        }
    }
};