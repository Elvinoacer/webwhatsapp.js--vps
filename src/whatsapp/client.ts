import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import type { Client as ClientType } from 'whatsapp-web.js';


let client: ClientType | null = null;

export function getClient() {
  if (!client) {
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: "client-one"
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
  }
  return client;
}

// Function to format the number
export function formatNumber(number: string) {
  // 1. Remove non-digit characters
  let formattedNumber = number.replace(/\D/g, '');

  // 2. Add the '@c.us' suffix
  formattedNumber = `${formattedNumber}@c.us`;

  return formattedNumber;
}
