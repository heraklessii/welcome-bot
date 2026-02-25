require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const antiCrash = require('./utils/antiCrash');
const { getGuildData } = require('./utils/cache');
const { t } = require('./utils/language');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection(); // Cooldown'ları tutacağımız koleksiyon

antiCrash();

const commandsPath = path.join(__dirname, 'commands/welcome');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on('interactionCreate', async interaction => {

    if (interaction.isModalSubmit()) {
        const Welcome = require('./models/Welcome');
        const { getGuildData, updateGuildCache } = require('./utils/cache');
        const data = await getGuildData(interaction.guildId);
        if (!data) return interaction.reply({ content: 'Hata: Veri bulunamadı.', ephemeral: true });

        let isUpdated = false;

        if (interaction.customId === 'modal_fake_days') {
            const days = parseInt(interaction.fields.getTextInputValue('input_days'));
            if (!isNaN(days)) { data.fakeAccountDays = days; isUpdated = true; }
        }
        else if (interaction.customId === 'modal_welmsg') {
            data.welcomeMessage = interaction.fields.getTextInputValue('input_msg');
            isUpdated = true;
        }
        else if (interaction.customId === 'modal_lvmsg') {
            data.leaveMessage = interaction.fields.getTextInputValue('input_msg');
            isUpdated = true;
        }
        else if (interaction.customId === 'modal_bg') {
            const url = interaction.fields.getTextInputValue('input_url');
            if (url === '' || url.startsWith('http')) {
                data.customBackground = url === '' ? null : url;
                isUpdated = true;
            }
        }
        else if (interaction.customId === 'modal_color') {
            const color = interaction.fields.getTextInputValue('input_color').trim();
            // Basit bir HEX Code doğrulaması (Regex)
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

            if (hexRegex.test(color)) {
                data.cardColor = color;
                isUpdated = true;
            } else {
                return interaction.reply({ content: '❌ Geçersiz bir HEX kodu girdiniz. Lütfen `#` ile başlayan geçerli bir renk kodu girin (Örn: `#FF0000`).', ephemeral: true });
            }
        }

        if (isUpdated) {
            await Welcome.findOneAndUpdate({ guildId: interaction.guildId }, { $set: data });
            updateGuildCache(interaction.guildId, data);

            // Kullanıcıya başarı mesajı dön (Dashboard zaten güncellenecektir)
            await interaction.reply({ content: '✅ Ayar başarıyla kaydedildi! (Değişiklikleri görmek için panelden Ana Menüye dönün)', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Geçersiz bir değer girdiniz.', ephemeral: true });
        }
        return;
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'read_rules') {
            const data = await getGuildData(interaction.guildId);
            const lang = data ? data.language : 'tr';
            return interaction.reply({ content: t('rules_read', lang), ephemeral: true });
        }
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // --- COOLDOWN (SPAM KORUMASI) SİSTEMİ ---
    const { cooldowns } = client;
    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    // Varsayılan cooldown süresi 3 saniye
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return interaction.reply({
                content: `⏳ Lütfen bu komutu tekrar kullanmak için <t:${expiredTimestamp}:R> bekleyin.`,
                ephemeral: true
            });
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    // ----------------------------------------

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const replyObj = { content: '❌ Komutu çalıştırırken bir hata oluştu!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyObj);
        } else {
            await interaction.reply(replyObj);
        }
    }
});

client.once('ready', async () => {
    console.log(`🤖 Bot aktif: ${client.user.tag}`);
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Bağlantısı Başarılı!');
    } catch (err) {
        console.error('❌ MongoDB Hatası:', err);
    }
});

client.login(process.env.TOKEN);