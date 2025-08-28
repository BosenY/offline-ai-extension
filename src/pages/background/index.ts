console.log('service worker loaded');
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: true
    })
})