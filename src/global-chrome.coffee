
TabState::send = (message, data={}) ->
  chrome.tabs.sendMessage @tab, [message, data]

TabState::bundledScriptURI = -> chrome.runtime.getURL('livereload.js')

LiveReloadGlobal.isAvailable = (tab) -> yes

LiveReloadGlobal.initialize()


ToggleCommand =
  invoke: ->
  update: (tabId) ->
    status = LiveReloadGlobal.tabStatus(tabId)
    chrome.browserAction.setTitle { tabId, title: status.buttonToolTip }
    chrome.browserAction.setIcon { tabId, path: { '19' : status.buttonIcon, '38' : status.buttonIconHiRes } }

getParts = (url) ->
  matches = url.match(/^(https?)\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
  protocol = matches && matches[1]
  domain = matches && matches[2]
  [protocol, domain.split(':')[0]]

chrome.browserAction.onClicked.addListener (tab) ->
  parts = getParts(tab.url)
  LiveReloadGlobal.toggle(tab.id, parts[0], parts[1])
  ToggleCommand.update(tab.id)

chrome.tabs.onSelectionChanged.addListener (tabId, selectInfo) ->
  ToggleCommand.update(tabId)

chrome.tabs.onRemoved.addListener (tabId) ->
  LiveReloadGlobal.killZombieTab tabId


chrome.runtime.onMessage.addListener ([eventName, data], sender, sendResponse) ->
  # console.log "#{eventName}(#{JSON.stringify(data)})"
  switch eventName
    when 'status'
      host = getParts(sender.tab.url)[1]
      LiveReloadGlobal.updateStatus(sender.tab.id, data, host)
      ToggleCommand.update(sender.tab.id)
    else
      LiveReloadGlobal.received(eventName, data)
