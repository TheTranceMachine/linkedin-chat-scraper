const refresh = document.getElementById('refreshData');

refresh.addEventListener('click', () => {
  location.reload();
});

(async () => {
  const data = document.querySelector('#displayData');
  if (data) {
    let { chats: currentChats } = await chrome.storage.local.get(["chats"]);
    currentChats.forEach((element) => {
      const senderFormatted = element.sender.replace(/[^\w\s]|\s/gi, '');

      const badge = document.createElement("div");
      badge.classList.add("badge");

      const title = document.createElement("h3");
      title.textContent = element.sender;
      badge.appendChild(title);

      if (element.subject) {
        const subject = document.createElement("p");
        subject.textContent = element.subject;
        badge.appendChild(subject);
      }

      const inner = document.createElement("div");
      inner.id = 'badge__inner'

      const list = document.createElement("ul");
      list.style.display = 'none';

      const showListButton = document.createElement("button");
      showListButton.textContent = 'Show/Hide Messages';
      inner.appendChild(showListButton);

      showListButton.addEventListener("click", () => {
        list.style.display = list.style.display === 'none' ? '' : 'none';
      });

      const toggleSchedulerButton = document.createElement("button");
      toggleSchedulerButton.id = 'toggleShowScheduler';
      toggleSchedulerButton.textContent = 'Show/Hide Scheduler';
      inner.appendChild(toggleSchedulerButton);

      const schedulerWrapper = document.createElement("div");
      schedulerWrapper.id = 'scheduler';
      schedulerWrapper.style.display = 'none';
      inner.appendChild(schedulerWrapper);

      const schedulerDateTimeInput = document.createElement("INPUT");
      schedulerDateTimeInput.setAttribute("type", "datetime-local");
      schedulerDateTimeInput.id = 'alarm-date-time';
      schedulerWrapper.appendChild(schedulerDateTimeInput);

      const schedulerText = document.createElement("TEXTAREA");
      schedulerText.id = `${senderFormatted}-alarm-text`;
      schedulerWrapper.appendChild(schedulerText);

      const toggleAlarmButton = document.createElement("button");
      toggleAlarmButton.id = 'toggleAlarm';
      toggleAlarmButton.dataset.alarm = `${senderFormatted}-alarm`;
      toggleAlarmButton.textContent = 'Activate Alarm';
      schedulerWrapper.appendChild(toggleAlarmButton);

      const alarmExistsError = document.createElement("div");
      alarmExistsError.id = 'alarmExistsError';
      alarmExistsError.style.display = 'none';
      schedulerWrapper.appendChild(alarmExistsError);

      alarmExistsError.addEventListener("click", () => {
        alarmExistsError.style.display = 'none';
        alarmExistsError.innerHTML = "";
      });

      toggleSchedulerButton.addEventListener("click", () => {
        schedulerWrapper.style.display = schedulerWrapper.style.display === 'none' ? '' : 'none';
      });

      element.messages.forEach(message => {
        const item = document.createElement("li");

        const user = document.createElement("h4");
        user.textContent = message.user;
        item.appendChild(user);

        const body = document.createElement("div");
        body.textContent = message.body;
        item.appendChild(body);

        list.appendChild(item);
      });

      inner.appendChild(list);
      badge.appendChild(inner);
      data.appendChild(badge);
    });
  }
})();
