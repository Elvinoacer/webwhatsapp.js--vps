import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { getClient } from "./src/whatsapp/client.ts";
import QRCode from "qrcode";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("a user connected");

    const client = getClient();

    client.on("qr", async (qr) => {
      console.log("QR RECEIVED", qr);
      const qrCodeUrl = await QRCode.toDataURL(qr);
      socket.emit("qr", qrCodeUrl);
    });

    client.on("ready", () => {
      console.log("Client is ready!");
      socket.emit("ready");
    });

    socket.on("sendMessage", ({ to, message }) => {
      client.sendMessage(to, message);
    });

    client.initialize();
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
