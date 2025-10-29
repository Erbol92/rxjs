import express from "express";
import { faker } from "@faker-js/faker";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

let messages = [];
let readedUids = [];

app.use(cors());

function generateRandomMessages() {
  const count = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < count; i++) {
    const message = {
      id: faker.string.uuid(),
      from: faker.internet.email(),
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(),
      received: Math.floor(Date.now() / 1000),
    };
    messages.push(message);
  }
  return messages;
}

function unreadMessages() {
  return messages.filter((mess) => !readedUids.includes(mess.id));
}

generateRandomMessages();
setInterval(generateRandomMessages, 10000);

app.get("/messages", (req, res) => {
  const onlyUnread = req.query.onlyUnread === "true";
  const filteredMessages = onlyUnread
    ? messages.filter((m) => !readedUids.includes(m.id))
    : messages;
  res.json({
    status: "ok",
    timestamp: Math.floor(Date.now() / 1000),
    messages: filteredMessages,
  });
});

app.get("/messages/unread", (req, res) => {
  res.json({
    status: "ok",
    timestamp: Math.floor(Date.now() / 1000),
    messages: unreadMessages(),
  });
});

app.get("/messages/read/:id", (req, res) => {
  const messageId = req.params.id;
  readedUids.push(messageId);
  res.json({
    status: "ok",
  });
});

app.get("/messages/getReadedUids", (req, res) => {
  res.json({
    status: "ok",
    readedUids: readedUids,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
