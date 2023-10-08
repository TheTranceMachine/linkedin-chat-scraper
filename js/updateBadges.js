document.onload = (async () => {
  const badges = document.querySelectorAll('.badge');
  const { activeAlarms } = await chrome.storage.local.get(["activeAlarms"]);
  const alarmsSet = new Set(activeAlarms);
  const newArray = [...alarmsSet];

  [...badges].forEach(async (badge) => {
    const button = badge.querySelector('#toggleAlarm');
    const alarmName = button.getAttribute('data-alarm');
    const alarmDateTime = badge.querySelector('#alarm-date-time');
    const alarmTextArea = badge.querySelector(`#${alarmName}-text`);
    // START: Find out if there's already an alarm in the storage and update the values and button
    const findAlarm = newArray.find(o => o.alarmName === alarmName);
    if (findAlarm) {
      const { alarmText, alarmTime } = findAlarm
      const alarmTimeFormatted = new Date(new Date(alarmTime).toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0]; // 2023-09-21T09:34
      console.log(alarmTimeFormatted);
      alarmDateTime.value = alarmTimeFormatted;
      alarmTextArea.value = alarmText;
      button.textContent = 'Cancel Notification';
    } else {
      button.textContent = 'Activate Notification';
    }
    // END
  });
})();