import { MailInterface } from "./client";

const mailInterface = new MailInterface(document.getElementById("root"));

const allMessagesButton = document.querySelector(".allMessagesBtn");
const unreadMessagesButton = document.querySelector(".unreadMessagesBtn");

allMessagesButton.addEventListener("click", () => mailInterface.getMessages());
unreadMessagesButton.addEventListener("click", () =>
  mailInterface.getMessages(true),
);
