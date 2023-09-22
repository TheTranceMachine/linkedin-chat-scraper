chrome.notifications.onClicked.addListener(async (alarm) => {
  console.log("Clicked notification!", alarm);
  const linkedInTab = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' });
  if (linkedInTab.length) {
    chrome.tabs.update(linkedInTab[0].id, { selected: true });
  } else {
    const allTabs = await chrome.tabs.query({});
    chrome.tabs.create(
      {
        active: true,
        //  The provided value is clamped to between zero and the number of tabs in the window.
        index: allTabs.length + 1,
        url: 'https://www.linkedin.com/feed/'
      }
    );
  }
});

chrome.notifications.onClosed.addListener((alarm) => {
  console.log("Closed notification!", alarm);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const { activeAlarms } = await chrome.storage.local.get(["activeAlarms"]);
  const alarmsSet = new Set(activeAlarms);
  const newArray = [...alarmsSet];

  const findAlarm = newArray.find(o => o.alarmName === alarm.name);
  if (findAlarm) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/images/linkedin_128.png',
      title: 'LinkedIn contact alert',
      message: findAlarm.alarmText
    });
  } else {
    console.log("Alarm wasn't found in the storage!", alarm);
  }
});