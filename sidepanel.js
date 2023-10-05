function createErrorDiv(alarmExistsError, text) {
  const alarmExistsErrorDivText = document.createElement("div");
  alarmExistsErrorDivText.textContent = text;
  alarmExistsError.appendChild(alarmExistsErrorDivText);

  const alarmExistsErrorDivIcon = document.createElement("div");
  alarmExistsErrorDivIcon.textContent = 'x';
  alarmExistsError.appendChild(alarmExistsErrorDivIcon);
  alarmExistsError.style.display = 'flex';
}

const refreshWrapper = document.querySelector(".refresh-button__wrapper");

const refreshButton = document.createElement('button');
refreshButton.id = "refreshData";
refreshButton.innerText = "Refresh Data";
refreshWrapper.appendChild(refreshButton);

refreshButton.addEventListener('click', () => {
  location.reload();
});

(async () => {
  const data = document.querySelector('#displayData');
  if (data) {
    let { chats: currentChats } = await chrome.storage.local.get(["chats"]);
    currentChats.forEach((element) => {
      const senderFormatted = element.sender.replace(/[^\w\s]|\s/gi, '');

      const badge = document.createElement("div");
      badge.id = `${senderFormatted}-badge`;
      badge.classList.add("badge");

      const titleWrapper = document.createElement("div");
      titleWrapper.classList.add("title__wrapper");
      badge.appendChild(titleWrapper);

      const title = document.createElement("div");
      title.classList.add("user");
      title.textContent = element.sender;
      titleWrapper.appendChild(title);

      const closeBadgeButton = document.createElement("div");
      closeBadgeButton.textContent = 'x';
      closeBadgeButton.id = `${senderFormatted}__badge-close-button`;
      closeBadgeButton.classList.add("badge-close-button");
      titleWrapper.appendChild(closeBadgeButton);

      closeBadgeButton.addEventListener('click', async () => {
        const { activeAlarms } = await chrome.storage.local.get(["activeAlarms"]);
        const alarmsSet = new Set(activeAlarms);
        console.log(`${senderFormatted}-alarm`);

        let alarmExists;
        alarmsSet.forEach(async (alarm) => {
          if (alarm.alarmName === `${senderFormatted}-alarm`) {
            alarmExists = alarm;
          }
        });

        console.log(alarmExists);

        if (alarmExists) {
          createErrorDiv(alarmExistsError, 'You have an active alarm!');
        } else {
          alarmsSet.delete(alarmExists);

          const chatsSet = new Set(currentChats);
          await chrome.storage.local.set({ activeAlarms: [...alarmsSet] });
          chatsSet.forEach(chat => chat.sender === element.sender ? chatsSet.delete(chat) : chat);
          await chrome.storage.local.set({ chats: [...chatsSet] });

          badge.remove();
        }
      })

      if (element.subject) {
        const subject = document.createElement("p");
        subject.textContent = element.subject;
        badge.appendChild(subject);
      }

      const buttonWrapper = document.createElement("div");
      buttonWrapper.id = 'button__wrapper'
      buttonWrapper.classList.add("button__wrapper");

      // START - TOGGLE LIST BUTTON
      const stoggleListWrapperButton = document.createElement("button");
      stoggleListWrapperButton.textContent = 'Toggle Messages';
      buttonWrapper.appendChild(stoggleListWrapperButton);

      stoggleListWrapperButton.addEventListener("click", () => {
        listWrapper.style.display = listWrapper.style.display === 'none' ? '' : 'none';
      });
      // END - TOGGLE LIST BUTTON

      // START - TOGGLE SCHEDULER BUTTON
      const toggleSchedulerButton = document.createElement("button");
      toggleSchedulerButton.id = 'toggleShowScheduler';
      toggleSchedulerButton.textContent = 'Toggle Scheduler';
      buttonWrapper.appendChild(toggleSchedulerButton);

      toggleSchedulerButton.addEventListener("click", () => {
        schedulerWrapper.style.display = schedulerWrapper.style.display === 'none' ? '' : 'none';
      });
      // END - TOGGLE SCHEDULER BUTTON

      // START - SCHEDULER COMPONENT
      const schedulerWrapper = document.createElement("div");
      schedulerWrapper.classList.add("scheduler__wrapper");
      schedulerWrapper.id = 'scheduler';
      schedulerWrapper.style.display = 'none';

      const schedulerDateTimeInput = document.createElement("INPUT");
      schedulerDateTimeInput.setAttribute("type", "datetime-local");
      schedulerDateTimeInput.id = 'alarm-date-time';
      schedulerWrapper.appendChild(schedulerDateTimeInput);

      const schedulerText = document.createElement("TEXTAREA");
      schedulerText.classList.add("scheduler__text-area")
      schedulerText.id = `${senderFormatted}-alarm-text`;
      schedulerText.rows = '4';
      schedulerText.placeholder = "Notification Message";
      schedulerWrapper.appendChild(schedulerText);

      const toggleAlarmButton = document.createElement("button");
      toggleAlarmButton.id = 'toggleAlarm';
      toggleAlarmButton.dataset.alarm = `${senderFormatted}-alarm`;
      toggleAlarmButton.textContent = 'Activate Notification';
      schedulerWrapper.appendChild(toggleAlarmButton);

      const alarmExistsError = document.createElement("div");
      alarmExistsError.id = 'alarmExistsError';
      alarmExistsError.style.display = 'none';
      badge.appendChild(alarmExistsError);

      alarmExistsError.addEventListener("click", () => {
        alarmExistsError.style.display = 'none';
        alarmExistsError.innerHTML = "";
      });
      // END - SCHEDULER COMPONENT

      const listWrapper = document.createElement("div");
      listWrapper.classList.add("list__wrapper");
      listWrapper.style.display = 'none';

      const list = document.createElement("ul");

      element.messages.forEach(message => {
        const item = document.createElement("li");

        const user = document.createElement("div");
        user.classList.add("list__item-user");
        user.textContent = message.user;
        item.appendChild(user);

        const body = document.createElement("div");
        body.textContent = message.body;
        item.appendChild(body);

        list.appendChild(item);
      });

      badge.appendChild(buttonWrapper);
      badge.appendChild(schedulerWrapper);
      listWrapper.appendChild(list);
      badge.appendChild(listWrapper);
      data.appendChild(badge);
    });
  }
})();
