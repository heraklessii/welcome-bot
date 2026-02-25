const tr = require('../locales/tr.json');
const en = require('../locales/en.json');

const locales = { tr, en };

function t(key, lang = 'tr', variables = {}) {
    // İstenilen dildeki metni bul (nokta notasyonu destekli örn: "errors.not_found")
    let text = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), locales[lang]);
    
    // Eğer o dilde yoksa İngilizceye(veya key'in kendisine) dön
    if (!text) text = key;

    // Değişkenleri yerleştir (örn: {{server}})
    for (const [varName, varValue] of Object.entries(variables)) {
        text = text.replace(new RegExp(`{{${varName}}}`, 'g'), varValue);
    }

    return text;
}

module.exports = { t };