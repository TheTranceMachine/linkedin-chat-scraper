// Initialize button with users' preferred color
const collect = document.getElementById('collectData');
const sidepanelButton = document.getElementById('displaySidepanel');

// When the button is clicked, inject collectChatData into current page
collect.addEventListener('click', async () => {
  console.log('active');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: collectChatData
  });
});

sidepanelButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.sidePanel.open({ tabId: tab.id });
});

// helper function to wait

const collectChatData = () => {
  const conversationList = document.querySelector('.msg-overlay-list-bubble__conversations-list').children;
  [...conversationList].forEach(conversation => {
    const card = conversation.querySelector('.msg-overlay-list-bubble__convo-card-content');
    card.addEventListener("click", async () => {
      let sender;
      let subject;
      let messages = [];

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

      // console.log(sender);
      // console.log(subject);
      // console.log(messages);

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

      // chatsSet.forEach((chat) => {
      //   console.log(chat.sender);
      //   console.log(sender);
      //   console.log(chat.sender !== sender);
      //   if (chat.sender !== sender) chatsSet.add({ sender, subject, messages });
      // });


      // const iterator1 = chatsSet.entries();


      // for (const entry of iterator1) {
      //   console.log(entry);
      // }
      // if (!(chatsSet.has({ sender, subject, messages }))) chatsSet.add({ sender, subject, messages });

      await chrome.storage.local.set({ chats: [...chatsSet] });

      // console.log(JSON.stringify(currentChats));

      // chrome.storage.local.get(["chats"]).then((result) => {
      //   console.log("Value currently is " + JSON.stringify(result.chat));
      //   chrome.storage.local.set({ chats: { sender, subject, messages }, ...result }).then(() => {
      //     console.log("Value is set");
      //   });
      //   console.log("Value currently is " + JSON.stringify(result.chat));
      // });
    });
    // const closeButton = chatWindow.querySelector('button');
    // const icon = closeButton.querySelector('li-icon');
    // if (icon.getAttribute('type') === "close") closeButton.click();
    // closeButton.click();
    // });
  });
}
