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
  console.log('=== SEND TO TELEGRAM START ===');
  
  const config = window.TELEGRAM_CONFIG;
  console.log('Telegram config:', config);
  
  const botToken = config?.botToken;
  const chatId = config?.chatId;

  console.log('Bot token:', botToken);
  console.log('Chat ID:', chatId);

  if (!botToken || !chatId || botToken === 'YOUR_BOT_TOKEN_HERE' || botToken === '${{ secrets.TELEGRAM_BOT_TOKEN }}') {
    console.error('Telegram config missing or not configured properly.');
    console.error('Config object:', config);
    console.error('Bot token:', botToken);
    console.error('Chat ID:', chatId);
    throw new Error('Telegram bot not configured. Please check config.js file.');
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

  console.log('Sending to URL:', url);
  console.log('Message text:', text);

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

  const result = await res.json();
  console.log('Telegram API response:', result);
  return result;
} 