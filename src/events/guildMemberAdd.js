const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { getGuildData } = require('../utils/cache');
const { parseMessage } = require('../utils/messageParser');
const { addCardToQueue } = require('../utils/welcomeQueue');
const { t } = require('../utils/language');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const data = await getGuildData(member.guild.id);
            if (!data) return;

            const lang = data.language || 'tr';
            const logChannel = data.logChannel ? member.guild.channels.cache.get(data.logChannel) : null;

            // 1. Fake Hesap Kontrolü
            const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
            
            if (accountAgeDays < data.fakeAccountDays) {
                if (logChannel) {
                    const warnEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(t('suspicious_account', lang))
                        .setDescription(t('suspicious_desc', lang, { user: member.user.id, days: accountAgeDays }));
                    await logChannel.send({ embeds: [warnEmbed] }).catch(() => {});
                }
                
                if (data.fakeAction === 'kick' && member.kickable) {
                    await member.send(t('fake_account_kick', lang, { server: member.guild.name })).catch(()=>{});
                    return await member.kick('Fake hesap tespiti');
                } else if (data.fakeAction === 'timeout' && member.moderatable) {
                    await member.timeout(24 * 60 * 60 * 1000, 'Fake hesap tespiti (24 Saat)');
                }
            }

            // 2. Otomatik Rol (Hiyerarşi Korumalı!)
            if (data.autoRole) {
                const role = member.guild.roles.cache.get(data.autoRole);
                if (role && member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    // Botun en yüksek rolü, verilecek rolden yüksek mi? Değilse hata fırlatma, log at.
                    if (role.position < member.guild.members.me.roles.highest.position) {
                        await member.roles.add(role).catch(() => {});
                    } else if (logChannel) {
                        const errEmbed = new EmbedBuilder()
                            .setColor('Orange')
                            .setDescription(`⚠️ **Oto-Rol Hatası:** \`${role.name}\` rolü benim en yüksek rolümden daha yukarıda olduğu için kullanıcılara veremiyorum. Lütfen rolümü yukarı taşıyın.`);
                        await logChannel.send({ embeds: [errEmbed] }).catch(() => {});
                    }
                }
            }

            if (!data.welcomeChannel) return;
            const channel = member.guild.channels.cache.get(data.welcomeChannel);
            if (!channel) return;

            // 3. Mesajı Hazırlama
            const parsedMessage = parseMessage(data.welcomeMessage, member);
            const messageOptions = {};
            
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('read_rules').setLabel(t('rules_button', lang)).setStyle(ButtonStyle.Primary).setEmoji('📜')
            );
            messageOptions.components = [row];

            // 'welcome' tipi ile kuyruğa ekle
            if (data.useImageCard) {
                const attachment = await addCardToQueue('welcome', member, member.guild.memberCount, data.customBackground);
                messageOptions.files = [attachment];
            }

            if (data.useEmbed) {
                const embed = new EmbedBuilder().setColor('#A688FA').setDescription(parsedMessage);
                if (data.useImageCard) embed.setImage('attachment://welcome-card.png');
                messageOptions.embeds = [embed];
            } else {
                messageOptions.content = parsedMessage;
            }

            // 4. Webhook Gönderimi
            if (data.useWebhook && channel.permissionsFor(member.guild.members.me).has(PermissionsBitField.Flags.ManageWebhooks)) {
                const webhooks = await channel.fetchWebhooks();
                let webhook = webhooks.find(wh => wh.owner.id === member.client.user.id);
                
                if (!webhook) {
                    webhook = await channel.createWebhook({
                        name: `${member.guild.name} Karşılama`,
                        avatar: member.guild.iconURL() || member.client.user.displayAvatarURL()
                    });
                }
                
                await webhook.send({
                    ...messageOptions,
                    username: `${member.guild.name} Yönetim`,
                    avatarURL: member.guild.iconURL() || member.client.user.displayAvatarURL()
                }).catch(() => {});
            } else {
                if (channel.permissionsFor(member.guild.members.me).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles])) {
                    await channel.send(messageOptions).catch(() => {});
                }
            }

        } catch (error) {
            console.error(`[Event Error] guildMemberAdd:`, error);
        }
    }
};