const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ComponentType
} = require('discord.js');
const Welcome = require('../../models/Welcome');
const { updateGuildCache, getGuildData } = require('../../utils/cache');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-setup')
        .setDescription('Karşılama sistemini interaktif panel üzerinden ayarlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Modal gösterebilmek için deferReply KULLANMIYORUZ. Direkt reply atacağız.
        const guildId = interaction.guildId;

        // Veritabanından mevcut ayarları çek (yoksa varsayılanları oluştur)
        let data = await getGuildData(guildId) || await Welcome.findOneAndUpdate({ guildId }, {}, { upsert: true, new: true });

        // --- YARDIMCI FONKSİYONLAR: UI OLUŞTURUCULAR ---

        // Ana Dashboard Embed'i
        const generateDashboardEmbed = (currentData) => {
            return new EmbedBuilder()
                .setColor('#A688FA')
                .setTitle('⚙️ Karşılama Sistemi Yönetim Paneli')
                .setDescription('Aşağıdaki menüleri kullanarak sistem ayarlarını kolayca yapabilirsiniz.')
                .addFields(
                    { name: '📁 Kanallar', value: `**Hoş Geldin:** ${currentData.welcomeChannel ? `<#${currentData.welcomeChannel}>` : '❌ Yok'}\n**Görüşürüz:** ${currentData.leaveChannel ? `<#${currentData.leaveChannel}>` : '❌ Yok'}\n**Log:** ${currentData.logChannel ? `<#${currentData.logChannel}>` : '❌ Yok'}`, inline: true },
                    { name: '🎭 Rol & Güvenlik', value: `**Oto Rol:** ${currentData.autoRole ? `<@&${currentData.autoRole}>` : '❌ Yok'}\n**Fake Sınırı:** \`${currentData.fakeAccountDays} Gün\`\n**Aksiyon:** \`${currentData.fakeAction.toUpperCase()}\``, inline: true },
                    { name: '🎛️ Aç/Kapat Ayarları', value: `**Embed:** ${currentData.useEmbed ? '✅' : '❌'}\n**HG Kartı:** ${currentData.useImageCard ? '✅' : '❌'}\n**GG Kartı:** ${currentData.useLeaveImageCard ? '✅' : '❌'}\n**Webhook:** ${currentData.useWebhook ? '✅' : '❌'}`, inline: true },
                    { name: '🎨 Görsel & Metin', value: `**Dil:** \`${currentData.language.toUpperCase()}\`\n**Arkaplan:** ${currentData.customBackground ? '[Özel Link](' + currentData.customBackground + ')' : '`Varsayılan`'}`, inline: false }
                )
                .setFooter({ text: 'Ayarlar otomatik olarak kaydedilir.' });
        };

        // 1. Ana Menü (Navigasyon)
        const getMainMenuRow = () => {
            return new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('nav_menu')
                    .setPlaceholder('⚙️ Ayarlamak istediğiniz kategoriyi seçin...')
                    .addOptions(
                        { label: 'Kanal Ayarları', description: 'Hoş geldin, görüşürüz ve log kanalları.', value: 'page_channels', emoji: '📁' },
                        { label: 'Rol Ayarları', description: 'Otomatik verilecek rol.', value: 'page_roles', emoji: '🎭' },
                        { label: 'Aç / Kapat Ayarları', description: 'Embed, resim, webhook vb. özellikleri değiştirin.', value: 'page_toggles', emoji: '🎛️' },
                        { label: 'Gelişmiş Güvenlik', description: 'Fake hesap, dil ve aksiyon ayarları.', value: 'page_advanced', emoji: '🛡️' },
                        { label: 'Metin & Arkaplan (Modal)', description: 'Mesaj metinlerini ve arkaplanı değiştirin.', value: 'page_texts', emoji: '📝' }
                    )
            );
        };

        // Geri Dönüş Butonu
        const getHomeBtnRow = () => new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_home').setLabel('Ana Menüye Dön').setStyle(ButtonStyle.Secondary).setEmoji('🔙'));

        // --- İLK MESAJI GÖNDER ---
        const response = await interaction.reply({
            embeds: [generateDashboardEmbed(data)],
            components: [getMainMenuRow()],
            ephemeral: true, // Sadece komutu yazan görür
            fetchReply: true
        });

        // --- COLLECTOR (ETKİLEŞİM DİNLEYİCİSİ) ---
        const collector = response.createMessageComponentCollector({ time: 600000 }); // 10 dakika aktif

        collector.on('collect', async (i) => {

            // --- NAVİGASYON (ANA MENÜDEN SEÇİM YAPILDIĞINDA) ---
            if (i.customId === 'nav_menu') {
                const page = i.values[0];

                if (page === 'page_channels') {
                    const row1 = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('sel_wel_chan').setPlaceholder('👋 Hoş Geldin Kanalını Seç').setChannelTypes([ChannelType.GuildText]));
                    const row2 = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('sel_lv_chan').setPlaceholder('🚪 Görüşürüz Kanalını Seç').setChannelTypes([ChannelType.GuildText]));
                    const row3 = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('sel_log_chan').setPlaceholder('📋 Log Kanalını Seç').setChannelTypes([ChannelType.GuildText]));
                    await i.update({ embeds: [generateDashboardEmbed(data)], components: [row1, row2, row3, getHomeBtnRow()] });
                }
                else if (page === 'page_roles') {
                    const row1 = new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId('sel_auto_role').setPlaceholder('🎭 Otomatik Verilecek Rolü Seç'));
                    const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_clear_role').setLabel('Rolü Temizle (Kapat)').setStyle(ButtonStyle.Danger));
                    await i.update({ embeds: [generateDashboardEmbed(data)], components: [row1, row2, getHomeBtnRow()] });
                }
                else if (page === 'page_toggles') {
                    const row1 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('tog_embed').setLabel(`Embed: ${data.useEmbed ? 'AÇIK' : 'KAPALI'}`).setStyle(data.useEmbed ? ButtonStyle.Success : ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('tog_img').setLabel(`HG Kartı: ${data.useImageCard ? 'AÇIK' : 'KAPALI'}`).setStyle(data.useImageCard ? ButtonStyle.Success : ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('tog_lvimg').setLabel(`GG Kartı: ${data.useLeaveImageCard ? 'AÇIK' : 'KAPALI'}`).setStyle(data.useLeaveImageCard ? ButtonStyle.Success : ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('tog_webhook').setLabel(`Webhook: ${data.useWebhook ? 'AÇIK' : 'KAPALI'}`).setStyle(data.useWebhook ? ButtonStyle.Success : ButtonStyle.Danger)
                    );
                    await i.update({ embeds: [generateDashboardEmbed(data)], components: [row1, getHomeBtnRow()] });
                }
                else if (page === 'page_advanced') {
                    const row1 = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder().setCustomId('sel_action').setPlaceholder('Fake Hesap Aksiyonu').addOptions(
                            { label: 'Hiçbir Şey Yapma', value: 'none' }, { label: 'Sunucudan At (Kick)', value: 'kick' }, { label: 'Sustur (Timeout)', value: 'timeout' }
                        )
                    );
                    const row2 = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder().setCustomId('sel_lang').setPlaceholder('Bot Dili').addOptions(
                            { label: 'Türkçe', value: 'tr' }, { label: 'English', value: 'en' }
                        )
                    );
                    const row3 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_fake_days').setLabel('Fake Hesap Sınırını (Gün) Değiştir').setStyle(ButtonStyle.Primary).setEmoji('📅'));
                    await i.update({ embeds: [generateDashboardEmbed(data)], components: [row1, row2, row3, getHomeBtnRow()] });
                }
                else if (page === 'page_texts') {
                    const row1 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('btn_edit_welmsg').setLabel('HG Mesajı').setStyle(ButtonStyle.Primary).setEmoji('📝'),
                        new ButtonBuilder().setCustomId('btn_edit_lvmsg').setLabel('GG Mesajı').setStyle(ButtonStyle.Primary).setEmoji('📝'),
                        new ButtonBuilder().setCustomId('btn_edit_color').setLabel('Tema Rengini Değiştir').setStyle(ButtonStyle.Success).setEmoji('🎨')
                    );
                    const row2 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('btn_edit_bg').setLabel('Özel Arkaplan URL').setStyle(ButtonStyle.Secondary).setEmoji('🖼️'),
                        new ButtonBuilder().setCustomId('btn_clear_bg').setLabel('Arkaplanı Sıfırla').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
                        new ButtonBuilder().setCustomId('btn_test_system').setLabel('Sistemi Test Et!').setStyle(ButtonStyle.Success).setEmoji('🚀')
                    );
                    await i.update({ embeds: [generateDashboardEmbed(data)], components: [row1, row2, getHomeBtnRow()] });
                }
            }

            // --- ANA MENÜYE DÖNÜŞ ---
            else if (i.customId === 'btn_home') {
                await i.update({ embeds: [generateDashboardEmbed(data)], components: [getMainMenuRow()] });
            }

            // --- VERİ GÜNCELLEMELERİ (SELECT MENUS & BUTTONS) ---
            else {
                let isUpdated = false;

                // Kanallar
                if (i.customId === 'sel_wel_chan') { data.welcomeChannel = i.values[0]; isUpdated = true; }
                if (i.customId === 'sel_lv_chan') { data.leaveChannel = i.values[0]; isUpdated = true; }
                if (i.customId === 'sel_log_chan') { data.logChannel = i.values[0]; isUpdated = true; }

                // Rol
                if (i.customId === 'sel_auto_role') { data.autoRole = i.values[0]; isUpdated = true; }
                if (i.customId === 'btn_clear_role') { data.autoRole = null; isUpdated = true; }

                // Gelişmiş Ayarlar (Dil & Aksiyon)
                if (i.customId === 'sel_action') { data.fakeAction = i.values[0]; isUpdated = true; }
                if (i.customId === 'sel_lang') { data.language = i.values[0]; isUpdated = true; }
                if (i.customId === 'btn_clear_bg') { data.customBackground = null; isUpdated = true; }

                // Toggles (Aç/Kapat)
                if (i.customId === 'tog_embed') { data.useEmbed = !data.useEmbed; isUpdated = true; }
                if (i.customId === 'tog_img') { data.useImageCard = !data.useImageCard; isUpdated = true; }
                if (i.customId === 'tog_lvimg') { data.useLeaveImageCard = !data.useLeaveImageCard; isUpdated = true; }
                if (i.customId === 'tog_webhook') { data.useWebhook = !data.useWebhook; isUpdated = true; }

                // Veritabanı Kaydı ve UI Güncellemesi (Toggles ve Select'ler için)
                if (isUpdated) {
                    await Welcome.findOneAndUpdate({ guildId }, { $set: data });
                    updateGuildCache(guildId, data);

                    // Bulunduğumuz sayfaya göre butonların renklerini vs. yenilemek için UI'ı tekrar çiziyoruz
                    if (i.customId.startsWith('tog_')) {
                        const row1 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('tog_embed').setLabel(`Embed: ${data.useEmbed ? 'AÇIK' : 'KAPALI'}`).setStyle(data.useEmbed ? ButtonStyle.Success : ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('tog_img').setLabel(`HG Kartı: ${data.useImageCard ? 'AÇIK' : 'KAPALI'}`).setStyle(data.useImageCard ? ButtonStyle.Success : ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('tog_lvimg').setLabel(`GG Kartı: ${data.useLeaveImageCard ? 'AÇIK' : 'KAPALI'}`).setStyle(data.useLeaveImageCard ? ButtonStyle.Success : ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('tog_webhook').setLabel(`Webhook: ${data.useWebhook ? 'AÇIK' : 'KAPALI'}`).setStyle(data.useWebhook ? ButtonStyle.Success : ButtonStyle.Danger)
                        );
                        await i.update({ embeds: [generateDashboardEmbed(data)], components: [row1, getHomeBtnRow()] });
                    } else {
                        // Diğer seçimlerde embed güncellensin yeter
                        await i.update({ embeds: [generateDashboardEmbed(data)] });
                    }
                }

                // --- MODALLAR (METİN GİRİŞLERİ İÇİN) ---
                if (i.customId === 'btn_fake_days') {
                    const modal = new ModalBuilder().setCustomId('modal_fake_days').setTitle('Fake Hesap Sınırı');
                    const input = new TextInputBuilder().setCustomId('input_days').setLabel('Kaç gün? (Örn: 7)').setStyle(TextInputStyle.Short).setValue(data.fakeAccountDays.toString());
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await i.showModal(modal);
                }

                else if (i.customId === 'btn_test_system') {
                    if (!data.welcomeChannel) {
                        return i.followUp({ content: '❌ Lütfen önce bir "Hoş Geldin Kanalı" ayarlayın!', ephemeral: true });
                    }
                    await i.followUp({ content: '🚀 Test başlatıldı! Hoş geldin kanalını kontrol edin.', ephemeral: true });
                    // Geliştirici Tüyosu: Olayı manuel tetikliyoruz!
                    i.client.emit('guildMemberAdd', i.member);
                }

                // --- RENK DEĞİŞTİRME MODALI AÇMA ---
                else if (i.customId === 'btn_edit_color') {
                    const modal = new ModalBuilder().setCustomId('modal_color').setTitle('Tema Rengini Değiştir');
                    const input = new TextInputBuilder().setCustomId('input_color').setLabel('HEX Kodu (Örn: #FF5733)').setStyle(TextInputStyle.Short).setValue(data.cardColor || '#A688FA').setMaxLength(7);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await i.showModal(modal);
                }

                else if (i.customId === 'btn_edit_welmsg') {
                    const modal = new ModalBuilder().setCustomId('modal_welmsg').setTitle('Hoş Geldin Mesajı');
                    const input = new TextInputBuilder().setCustomId('input_msg').setLabel('Mesajınız: ({user}, {server} kullanın)').setStyle(TextInputStyle.Paragraph).setValue(data.welcomeMessage);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await i.showModal(modal);
                }
                else if (i.customId === 'btn_edit_lvmsg') {
                    const modal = new ModalBuilder().setCustomId('modal_lvmsg').setTitle('Görüşürüz Mesajı');
                    const input = new TextInputBuilder().setCustomId('input_msg').setLabel('Mesajınız: ({username}, {server})').setStyle(TextInputStyle.Paragraph).setValue(data.leaveMessage);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await i.showModal(modal);
                }
                else if (i.customId === 'btn_edit_bg') {
                    const modal = new ModalBuilder().setCustomId('modal_bg').setTitle('Özel Arkaplan (URL)');
                    const input = new TextInputBuilder().setCustomId('input_url').setLabel('Resim Linki (http/https...):').setStyle(TextInputStyle.Short).setValue(data.customBackground || '').setRequired(false);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await i.showModal(modal);
                }
            }
        });
    }
};