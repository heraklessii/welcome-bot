const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getGuildData } = require('../utils/cache');
const { parseMessage } = require('../utils/messageParser');
const { addCardToQueue } = require('../utils/welcomeQueue');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        try {
            const data = await getGuildData(member.guild.id);
            if (!data || !data.leaveChannel) return;

            const channel = member.guild.channels.cache.get(data.leaveChannel);
            if (!channel) return;

            // Yetki kontrolü
            if (!channel.permissionsFor(member.guild.members.me).has([PermissionsBitField.Flags.SendMessages])) return;

            const parsedMessage = parseMessage(data.leaveMessage, member);
            const messageOptions = {};

            // 'leave' tipi ile kuyruğa ekle
            if (data.useLeaveImageCard && channel.permissionsFor(member.guild.members.me).has(PermissionsBitField.Flags.AttachFiles)) {
                const attachment = await addCardToQueue('leave', member, member.guild.memberCount);
                messageOptions.files = [attachment];
            }

            if (data.useEmbed) {
                const embed = new EmbedBuilder().setColor('#FA8888').setDescription(parsedMessage);
                if (data.useLeaveImageCard) embed.setImage('attachment://leave-card.png');
                messageOptions.embeds = [embed];
            } else {
                messageOptions.content = parsedMessage;
            }

            await channel.send(messageOptions).catch(() => {});
            
            if (data.logChannel) {
                const logChan = member.guild.channels.cache.get(data.logChannel);
                if(logChan) {
                    await logChan.send({ content: `🚪 Kullanıcı ayrıldı: \`${member.user.tag}\` (${member.user.id})` }).catch(()=>{});
                }
            }

        } catch (error) {
            console.error(`[Event Error] guildMemberRemove:`, error);
        }
    }
};