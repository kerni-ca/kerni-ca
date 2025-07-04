import { getGeoInfo } from './getGeoInfo.js';

/**
 * Sends a message to a Telegram chat using the Bot API.
 *
 * @param {Object} data - The data to send.
 * @param {string} data.name - The name of the person submitting the form.
 * @param {string} data.email - The email address of the person.
 * @param {string} data.phone - The phone number of the person.
 * @param {string} data.message - The message content.
 * @param {string} data.ip - The IP address of the person.
 * @returns {Promise<Object>} The response from the Telegram API.
 */

export async function sendToTelegram(data) {
  const config = window.TELEGRAM_CONFIG;
  const botToken = config?.botToken;
  const chatId = config?.chatId;

  if (!botToken || !chatId || botToken === 'YOUR_BOT_TOKEN_HERE') {
    console.error('Telegram config missing or not configured.');
    throw new Error('Telegram bot not configured');
  }

  const geo = data.ip ? await getGeoInfo(data.ip) : null;

  const text = `
        📨 *New KERNI Customer Contact Form Submission*
        👤 Name: *${data.name}*
        📧 Email: *${data.email}*
        📞 Phone: *${data.phone}*
        📝 Message: *${data.message}*
        🖥️ IP: *${data.ip}*
        ${geo ? `🌎 Location: *${geo.country}, ${geo.regionName}, ${geo.city}*` : ''}
    `.trim();

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Telegram API error:', errorText);
    throw new Error('Failed to send message to Telegram');
  }

  return await res.json();
} 