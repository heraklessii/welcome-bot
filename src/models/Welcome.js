const { Schema, model } = require('mongoose');

const welcomeSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    welcomeChannel: { type: String, default: null },
    leaveChannel: { type: String, default: null },
    logChannel: { type: String, default: null },
    welcomeMessage: { type: String, default: '🎉 {user} aramıza katıldı!' },
    leaveMessage: { type: String, default: '👋 {username} aramızdan ayrıldı.' },
    autoRole: { type: String, default: null },
    fakeAccountDays: { type: Number, default: 7 },
    fakeAction: { type: String, default: 'none' },
    sendDM: { type: Boolean, default: false },
    useEmbed: { type: Boolean, default: true },
    useImageCard: { type: Boolean, default: true },
    useLeaveImageCard: { type: Boolean, default: true },
    customBackground: { type: String, default: null },
    cardColor: { type: String, default: '#A688FA' }, // YENİ: Kart Tema Rengi
    language: { type: String, default: 'tr' },
    isPremium: { type: Boolean, default: false },
    useWebhook: { type: Boolean, default: false }
});

module.exports = model('Welcome', welcomeSchema);