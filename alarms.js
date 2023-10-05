function createErrorDiv(alarmExistsError, text) {
  const alarmExistsErrorDivText = document.createElement("div");
  alarmExistsErrorDivText.textContent = text;
  alarmExistsError.appendChild(alarmExistsErrorDivText);

  const alarmExistsErrorDivIcon = document.createElement("div");
  alarmExistsErrorDivIcon.textContent = 'x';
  alarmExistsError.appendChild(alarmExistsErrorDivIcon);
  alarmExistsError.style.display = 'flex';
}

window.onload = () => {
  const badges = document.querySelectorAll('.badge');
  if (badges) {
    async function checkAlarm(button, callback) {
      const alarmName = button.getAttribute('data-alarm');

      const { activeAlarms } = await chrome.storage.local.get(["activeAlarms"]);
      const alarmsSet = new Set(activeAlarms);

      let newLabel;
      let hasAlarm = false;
      alarmsSet.forEach((alarm) => {
        if (alarm.alarmName === alarmName) {
          hasAlarm = true;
        }
      });

      if (hasAlarm) {
        newLabel = 'Cancel Notification';
      } else {
        newLabel = 'Activate Notification';
      }
      button.innerText = newLabel;

      if (callback) callback(hasAlarm);
    }
    async function createAlarm(badge, button) {
      const alarmExistsError = badge.querySelector('#alarmExistsError');
      const alarmName = button.getAttribute('data-alarm');

      const alarmDateTime = badge.querySelector('#alarm-date-time');
      const when = Date.parse(alarmDateTime.value);

      const alarmText = document.querySelector(`#${alarmName}-text`);

      const { activeAlarms } = await chrome.storage.local.get(["activeAlarms"]);
      const alarmsSet = new Set(activeAlarms);
      const newArray = [...alarmsSet];

      const findAlarm = newArray.find(o => o.alarmName === alarmName);
      if (findAlarm) {
        createErrorDiv(alarmExistsError, 'This alarm already exists');
      } else {
        if (alarmText.value.length && when) {
          alarmExistsError.style.display = 'none';
          alarmsSet.add({ alarmName, alarmText: alarmText.value, alarmTime: when });
          await chrome.storage.local.set({ activeAlarms: [...alarmsSet] });
          chrome.alarms.create(alarmName, {
            // delayInMinutes: 0.1, periodInMinutes: 0.1
            when
          });
        } else {
          createErrorDiv(alarmExistsError, 'Provide time and text');
        }
      }

    }
    async function cancelAlarm(button) {
      const alarmName = button.getAttribute('data-alarm');
      const { activeAlarms } = await chrome.storage.local.get(["activeAlarms"]);
      const alarmsSet = new Set(activeAlarms);

      alarmsSet.forEach((alarm) => {
        if (alarm.alarmName === alarmName) {
          alarmsSet.delete(alarm);
          chrome.alarms.clear(alarmName);
        }
      });
      await chrome.storage.local.set({ activeAlarms: [...alarmsSet] });
    }
    async function doToggleAlarm(badge, button) {
      await checkAlarm(button, async (hasAlarm) => {
        if (hasAlarm) {
          await cancelAlarm(button);
        } else {
          await createAlarm(badge, button);
        }
        await checkAlarm(button);
      });
    }

    [...badges].forEach(badge => {
      const button = badge.querySelector('#toggleAlarm');
      button.addEventListener("click", () => {
        doToggleAlarm(badge, button);
        checkAlarm(button);
      });
    });
  }
};