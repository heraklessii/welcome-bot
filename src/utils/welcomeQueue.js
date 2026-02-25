const { AttachmentBuilder } = require('discord.js');
const { generateWelcomeCard, generateLeaveCard } = require('./welcomeCard');

const queue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    while (queue.length > 0) {
        const { type, member, memberCount, customBackground, resolve, reject } = queue.shift();
        try {
            let buffer;
            let fileName;

            if (type === 'welcome') {
                buffer = await generateWelcomeCard(member, memberCount, customBackground);
                fileName = 'welcome-card.png';
            } else if (type === 'leave') {
                buffer = await generateLeaveCard(member, memberCount);
                fileName = 'leave-card.png';
            }

            const attachment = new AttachmentBuilder(buffer, { name: fileName });
            resolve(attachment);
        } catch (error) {
            reject(error);
        }
    }
    isProcessing = false;
}

// type parametresi eklendi ('welcome' veya 'leave')
function addCardToQueue(type, member, memberCount, customBackground = null) {
    return new Promise((resolve, reject) => {
        queue.push({ type, member, memberCount, customBackground, resolve, reject });
        processQueue();
    });
}

module.exports = { addCardToQueue };