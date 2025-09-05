import { Client } from 'whatsapp-web.js';

let client: Client | null = null;

export function getClient() {
  if (!client) {
    client = new Client({});
  }
  return client;
}