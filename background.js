"use strict";

const RELOAD_TRIGGER_HOSTNAME = "http://localhost:1234/";

const reloadExtensions = async () => {
  // find all unpacked extensions and reload them
  chrome.management.getAll(async function (extensions) {
    for (const ext of extensions) {
      if (
        ext.installType === "development" &&
        ext.enabled === true &&
        ext.name !== "Extensions Reloader"
      ) {
        const extensionId = ext.id;
        const extensionType = ext.type;

        await chrome.management.setEnabled(extensionId, false);
        await chrome.management.setEnabled(extensionId, true);

        // re-launch packaged app
        if (extensionType === "packaged_app") {
          chrome.management.launchApp(extensionId);
        }

        console.log(ext.name + " reloaded");
      }
    }
  });

  // Reload the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const current = tabs[0];
      if (current) {
        console.log("comparing ", current.url, " to ", RELOAD_TRIGGER_HOSTNAME);
        if (current.url !== RELOAD_TRIGGER_HOSTNAME) {
          chrome.tabs.reload(current.id);
        }
      }
    }
  });

  // show an "HMR" badge
  chrome.action.setBadgeText({ text: "HMR" });
  setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
  }, 1000);
};

chrome.action.onClicked.addListener(() => {
  reloadExtensions();
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.load == true) {
    reloadExtensions();
  }
});

chrome.action.setBadgeBackgroundColor({ color: "yellow" });
