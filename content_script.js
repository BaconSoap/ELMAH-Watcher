chrome.extension.onMessage.removeListener(listener);
chrome.extension.onMessage.addListener(listener);

function listener(request, sender, sendResponse) {
    console.log(request.interval);
    chrome.extension.sendMessage({v:'hello'}, function(){})
  }