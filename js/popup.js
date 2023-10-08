// Initialize button with users' preferred color
const collect = document.getElementById('collectData');
const collectCheckbox = document.querySelector("input");
const sidepanelButton = document.getElementById('displaySidepanel');

// When the button is clicked, inject collectChatData into current page
collect.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.local.get(["collectionIsActive"], async ({ collectionIsActive }) => {
    const nextState = collectionIsActive === true ? false : true;

    await chrome.storage.local.set({ collectionIsActive: nextState });
    console.log('nextState', nextState);
    if (nextState) {
      collect.classList.add("active");
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: collectChatData
      });
    } else {
      collect.classList.remove("active");
    }
  });

});

chrome.storage.local.get(["collectionIsActive"], async ({ collectionIsActive }) => {
  if (collectionIsActive) {
    collect.classList.add("active");
  } else {
    collect.classList.remove("active");
  }
});

sidepanelButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.sidePanel.open({ tabId: tab.id });
});

// helper function to wait

const collectChatData = async () => {

  const conversationList = document.querySelector('.msg-overlay-list-bubble__conversations-list').children;
  [...conversationList].forEach(conversation => {
    const card = conversation.querySelector('.msg-overlay-list-bubble__convo-card-content');
    card.addEventListener("click", async () => {
      let sender;
      let subject;
      let messages = [];

      const { collectionIsActive } = await chrome.storage.local.get(["collectionIsActive"]);
      console.log('collectionIsActive', collectionIsActive);
      if (collectionIsActive) {
        // wait until the "msg-convo-wrapper" is loaded
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(500);

        const chatWindow = document.querySelector('.msg-convo-wrapper');
        // console.log(chatWindow);

        sender = chatWindow.querySelector('.hoverable-link-text');
        sender = sender.textContent.trim();
        // console.log(sender);

        const messageList = chatWindow.querySelectorAll('.msg-s-message-list__event');
        [...messageList].forEach(message => {
          const findSubject = message.querySelector('.msg-s-event-listitem__subject');
          if (findSubject) {
            subject = findSubject.textContent.trim();
          } else {
            subject = undefined;
          }

          let findUser = message.querySelector('.msg-s-message-group__profile-link');
          if (findUser) {
            findUser = findUser.textContent.trim();
          } else {
            findUser = undefined
          }

          let findBody = message.querySelector('.msg-s-event-listitem__body');
          if (findBody) {
            findBody = findBody.textContent.trim();
          } else {
            findBody = undefined
          }

          if (findUser && findBody) messages.push({ user: findUser, body: findBody });
        });

        const { chats: currentChats = [] } = await chrome.storage.local.get(["chats"]);
        const chatsSet = new Set(currentChats);
        const newArray = [...chatsSet];

        console.log(newArray);

        const findSender = newArray.find(o => o.sender === sender);
        if (findSender) {
          console.log("Found the same sender");
        } else {
          chatsSet.add({ sender, subject, messages });
        }

        const matchMessagesLength = newArray.find(o => o.messages.length !== messages.length);
        if (matchMessagesLength) {
          chatsSet.forEach(chat => chat.sender === sender ? chatsSet.delete(chat) : chat);
          chatsSet.add({ sender, subject, messages });
        } else {
          console.log("The messages length match");
        }

        if (chatsSet.size === 0) {
          chatsSet.add({ sender, subject, messages });
        };

        console.log(chatsSet);

        await chrome.storage.local.set({ chats: [...chatsSet] });
      }
    });
  });
}
