const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { request } = require('undici'); // @napi-rs/canvas URL'den resim yüklemek için bunu önerir
const path = require('path');

// Özel Font Yükleme (Poppins)
try {
    GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), 'Poppins');
} catch (e) {
    console.log("⚠️ Özel font (Poppins-Bold) bulunamadı. Sistem fontları kullanılacak.");
}

// Resim Yükleme Yardımcısı (Napi-RS için optimize edilmiş)
async function fetchImage(url) {
    const { body } = await request(url);
    const data = await body.arrayBuffer();
    return await loadImage(data);
}

// --- HOŞ GELDİN KARTI ---
async function generateWelcomeCard(member, memberCount, customBackground = null, cardColor = '#A688FA') {
    const canvas = createCanvas(1000, 400);
    const ctx = canvas.getContext('2d');

    // 1. Arkaplan
    if (customBackground) {
        try {
            const bgImage = await fetchImage(customBackground);
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            fillGradient(ctx, canvas, '#1E1E2E', '#2D2D44'); // Varsayılan Morumsu
        }
    } else {
        fillGradient(ctx, canvas, '#1E1E2E', '#2D2D44');
    }

    // Karartma Overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Metinler
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.font = 'bold 45px "Poppins", sans-serif';
    ctx.fillText('SUNUCUMUZA HOŞ GELDİN', 350, 170);

    ctx.font = 'bold 65px "Poppins", sans-serif';
    ctx.fillStyle = cardColor; // YENİ: Dinamik Renk Kullanımı
    let username = member.user.username;
    if (username.length > 15) username = username.substring(0, 15) + '...';
    ctx.fillText(username.toUpperCase(), 350, 250);

    ctx.fillStyle = '#B3B3D1';
    ctx.font = '30px "Poppins", sans-serif';
    ctx.fillText(`Seninle beraber ${memberCount} kişiyiz!`, 350, 310);

    // 3. Avatar Çizimi
    await drawAvatar(ctx, member, 70, 90, 220, '#A688FA');

    return await canvas.encode('png'); // Napi-RS buffer oluşturma şekli
}

// --- GÖRÜŞÜRÜZ KARTI (YENİ) ---
async function generateLeaveCard(member, memberCount) {
    const canvas = createCanvas(1000, 400);
    const ctx = canvas.getContext('2d');

    // Kırmızımsı Gradient Arkaplan
    fillGradient(ctx, canvas, '#2E1E1E', '#442D2D');

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.font = 'bold 45px "Poppins", sans-serif';
    ctx.fillText('ARAMIZDAN AYRILDI', 350, 170);

    ctx.font = 'bold 65px "Poppins", sans-serif';
    ctx.fillStyle = '#FA8888'; // Kırmızımsı
    let username = member.user.username;
    if (username.length > 15) username = username.substring(0, 15) + '...';
    ctx.fillText(username.toUpperCase(), 350, 250);

    ctx.fillStyle = '#D1B3B3';
    ctx.font = '30px "Poppins", sans-serif';
    ctx.fillText(`Sensiz ${memberCount} kişi kaldık.`, 350, 310);

    // Gri tonlamalı avatar (Opsiyonel ama estetik olur)
    await drawAvatar(ctx, member, 70, 90, 220, '#FA8888');

    return await canvas.encode('png');
}

// Ortak Çizim Fonksiyonları
function fillGradient(ctx, canvas, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 1000, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

async function drawAvatar(ctx, member, x, y, size, borderColor) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    try {
        const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
        const avatar = await fetchImage(avatarUrl);
        ctx.drawImage(avatar, x, y, size, size);
    } catch (e) {
        console.error("Avatar yüklenemedi:", e);
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 8;
    ctx.stroke();
}

module.exports = { generateWelcomeCard, generateLeaveCard };