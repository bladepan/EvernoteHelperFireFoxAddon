function queryAllActiveTabs(callback) {
  browser.tabs.query({
    active: true
  }).then((tabs) => {
    for(let tab of tabs) {
      callback(tab);
    }
  });
}

function removeHelperLinks() {
  queryAllActiveTabs((tab) => {
    browser.tabs.sendMessage(tab.id, {
      nierEvernoteHelperMessageType: "removeLinks"
    });
  });
}

function resetLinks() {
  queryAllActiveTabs((tab) => {
    browser.tabs.sendMessage(tab.id, {
      nierEvernoteHelperMessageType: "reset"
    });
  });
}

function enableDebugMode() {
  queryAllActiveTabs((tab) => {
    browser.tabs.sendMessage(tab.id, {
      nierEvernoteHelperMessageType: "debug"
    });
  });
}


const removeLinkBtn = document.getElementById('removeHelperLinksBtn');
removeLinkBtn.onclick = removeHelperLinks;
const resetLinksBtn = document.getElementById('resetLinksBtn');
resetLinksBtn.onclick = resetLinks;
const debugBtn = document.getElementById('debugBtn');
debugBtn.onclick = enableDebugMode;