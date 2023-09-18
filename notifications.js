chrome.notifications.onClicked.addListener((alarm) => {
  console.log("Clicked notification!", alarm);
});

chrome.notifications.onClosed.addListener((alarm) => {
  console.log("Closed notification!", alarm);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const alarmText = document.querySelector(`#${alarm.name}-text`);
  chrome.notifications.create('reminder', {
    type: 'basic',
    iconUrl: '/images/get_started128.png',
    title: 'Don\'t forget!',
    message: alarmText.value
  });
});