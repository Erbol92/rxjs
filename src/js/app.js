import { Mail } from "./client";

const mail = new Mail(document.getElementById("root"));

const allMessagesButton = document.querySelector(".allMessagesBtn");
const unreadMessagesButton = document.querySelector(".unreadMessagesBtn");

allMessagesButton.addEventListener("click", () => mail.getMessages());
unreadMessagesButton.addEventListener("click", () => mail.getMessages(true));
