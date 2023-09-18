window.addEventListener('DOMContentLoaded', () => {
  'use strict';
  // const toggleAlarmButton = document.querySelectorAll('#toggleAlarm');
  const badges = document.querySelectorAll('.badge');
  console.log(badges);

  function checkAlarm(button, callback) {
    const alarmName = button.getAttribute('data-alarm');

    // const { activeAlarms } = await chrome.storage.local.get(["activeAlarms"]);
    // console.log(activeAlarms);
    // const alarmsSet = new Set(activeAlarms);
    chrome.alarms.getAll((alarms) => {
      const hasAlarm = alarms.some((a) => a.name == alarmName);
      console.log(hasAlarm);
      let newLabel;
      if (hasAlarm) {
        newLabel = 'Cancel alarm';
      } else {
        newLabel = 'Activate alarm';
      }
      button.innerText = newLabel;
      if (callback) callback(hasAlarm);
    });
  }
  async function createAlarm(badge, button) {
    const alarmName = button.getAttribute('data-alarm');
    const alarmDateTime = badge.querySelector('#alarm-date-time');
    const when = Date.parse(alarmDateTime.value);

    const { activeAlarms } = await chrome.storage.local.get(["activeAlarms"]);
    console.log(activeAlarms);
    const alarmsSet = new Set(activeAlarms);
    const newArray = [...alarmsSet];

    const findAlarm = newArray.find(o => o.alarmName === alarmName);
    if (findAlarm) {
      const alarmExistsError = badge.querySelector('#alarmExistsError');
      alarmExistsError.style.display = 'flex';
    } else {
      alarmsSet.add({ alarmName });
      await chrome.storage.local.set({ activeAlarms: [...alarmsSet] });
      chrome.alarms.create(alarmName, {
        // delayInMinutes: 0.1, periodInMinutes: 0.1
        when
      });
    }

  }
  function cancelAlarm(button) {
    const alarmName = button.getAttribute('data-alarm');
    chrome.alarms.clear(alarmName);
  }
  function doToggleAlarm(badge, button) {
    checkAlarm(button, (hasAlarm) => {
      console.log(hasAlarm);
      if (hasAlarm) {
        cancelAlarm(button);
      } else {
        createAlarm(badge, button);
      }
      checkAlarm(button);
    });
  }

  [...badges].forEach(badge => {
    const button = badge.querySelector('#toggleAlarm');
    button.addEventListener("click", () => {
      doToggleAlarm(badge, button);
      checkAlarm(button);
    });
  });
}, false);