import { ajax } from "rxjs/ajax";
import {
  switchMap,
  catchError,
  distinctUntilChanged,
  map,
} from "rxjs/operators";
import { fromEvent, interval, of } from "rxjs";

export class MailInterface {
  constructor(element) {
    this.element = element;
    this.readedUids = new Set();
    this.messages = new Set();
    this.initialize();
  }

  async initialize() {
    await this.fetchReadedUids();
    this.getMessages(false);
    this.getUnreadMessages();
  }

  fetchReadedUids() {
    return new Promise((resolve, reject) => {
      fetchReadedUids$()
        .pipe(
          map((response) =>
            response.readedUids.forEach((uid) => this.readedUids.add(uid)),
          ),
        )
        .subscribe({
          next: () => {
            resolve();
          },
          error: (error) => {
            console.error("Ошибка при получении прочитанных UIDs:", error);
            reject(error);
          },
        });
    });
  }

  async getMessages(onlyUnread = false) {
    const queryParam = onlyUnread ? "?onlyUnread=true" : "";
    this.element.innerHTML = "";
    fetchMessages$(queryParam)
      .pipe(
        catchError((error) => {
          console.error("Ошибка при получении сообщений:", error);
          return of({ messages: [] });
        }),
      )
      .subscribe({
        next: (response) => {
          this.renderHTML(response.messages || []);
        },
      });
  }

  async getUnreadMessages() {
    const unreadMessages$ = interval(10000).pipe(
      switchMap(() =>
        fetchUnreadMessages$().pipe(
          catchError((error) => {
            console.error(
              "Ошибка при получении непрочитанных сообщений:",
              error,
            );
            return of({ messages: [] });
          }),
          map((response) =>
            response.messages.filter(
              (m) => !this.readedUids.has(m.id) && !this.messages.has(m.id),
            ),
          ),
        ),
      ),
    );

    unreadMessages$.subscribe({
      next: (newMessages) => {
        this.renderHTML(newMessages);
      },
    });
  }

  renderHTML(messages) {
    messages.forEach((mess) => {
      this.messages.add(mess.id);

      const mailDiv = document.createElement("div");
      mailDiv.classList.add("mail");
      if (this.readedUids.has(mess.id)) mailDiv.classList.add("readed");
      const date = new Date(mess.received * 1000);

      mailDiv.innerHTML = `
                <div class="mail-from">${mess.from}</div>
                <div class="ellipses">${mess.body}</div>
                <div>${formatDate(date)}</div>
            `;
      this.element.insertAdjacentElement("afterbegin", mailDiv);
      fromEvent(mailDiv, "click")
        .pipe(
          switchMap(() =>
            fetchReadMessages$(mess.id).pipe(
              catchError((error) => {
                console.error("Ошибка отметке прочтения:", error);
                return of({ messages: [] });
              }),
            ),
          ),
          distinctUntilChanged(),
        )
        .subscribe(() => {
          mailDiv.classList.add("readed");
          this.readedUids.add(mess.id);
        });
    });
  }
}

const fetchMessages$ = (queryParam = "") => {
  return ajax.getJSON("http://localhost:3000/messages" + queryParam);
};

const fetchUnreadMessages$ = () => {
  return ajax.getJSON("http://localhost:3000/messages/unread");
};

const fetchReadMessages$ = (id) => {
  return ajax.getJSON("http://localhost:3000/messages/read/" + id);
};

const fetchReadedUids$ = () => {
  return ajax.getJSON("http://localhost:3000/messages/getReadedUids/");
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const formattedDate = `${hours}:${minutes} ${day}.${month}.${year}`;
  return formattedDate;
};
