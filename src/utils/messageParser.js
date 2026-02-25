/**
 * Kullanıcı mesajındaki değişkenleri gerçek verilerle değiştirir.
 */
function parseMessage(text, member) {
    if (!text || !member) return text;

    const guild = member.guild;
    const user = member.user;
    
    // Hesap yaşını gün olarak hesaplama
    const accountAgeMs = Date.now() - user.createdTimestamp;
    const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));
    
    // Tarihi formatlama (Örn: 15/10/2023)
    const createdAt = new Date(user.createdTimestamp).toLocaleDateString('tr-TR');

    let parsedText = text
        .replace(/{user}/g, `<@${user.id}>`)
        .replace(/{username}/g, user.username)
        .replace(/{tag}/g, user.discriminator === '0' ? user.username : `${user.username}#${user.discriminator}`)
        .replace(/{server}/g, guild.name)
        .replace(/{memberCount}/g, guild.memberCount)
        .replace(/{accountAge}/g, accountAgeDays)
        .replace(/{createdAt}/g, createdAt);

    return parsedText;
}

module.exports = { parseMessage };