import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { getClient, formatNumber } from "./src/whatsapp/client.ts";
import QRCode from "qrcode";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  let qrCodeUrl = null;
  let isReady = false;

  const client = getClient();

  client.on("qr", async (qr) => {
    console.log("QR RECEIVED", qr);
    qrCodeUrl = await QRCode.toDataURL(qr);
    isReady = false;
    io.emit("qr", qrCodeUrl);
  });

  client.on("authenticated", () => {
    console.log("AUTHENTICATED");
  });

  client.on("auth_failure", (msg) => {
    console.error("AUTHENTICATION FAILURE", msg);
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    qrCodeUrl = null;
    isReady = true;
    io.emit("ready");
  });

  client.on("loading_screen", (percent, message) => {
    console.log("LOADING SCREEN", percent, message);
  });

  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
    isReady = false;
    client.destroy();
    client.initialize();
  });

  client.initialize();

  io.on("connection", (socket) => {
    console.log("a user connected");

    if (isReady) {
      socket.emit("ready");
    } else if (qrCodeUrl) {
      socket.emit("qr", qrCodeUrl);
    }

    socket.on("sendMessage", ({ to, message }) => {
      const formattedTo = formatNumber(to);
      console.log(`Sending message to: ${formattedTo}, message: ${message}`);
      client.sendMessage(formattedTo, message);
    });
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
