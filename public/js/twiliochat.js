var GENERAL_CHANNEL_UNIQUE_NAME = 'general';
var GENERAL_CHANNEL_NAME = 'General Channel';
var MESSAGES_HISTORY_LIMIT = 30;
var accessManager;
var messagingClient;
var generalChannel;
var currentChannel;
var currentChannelContainer;
var channelArray;

var username;

var messageList;
var channelList;
var inputText;
var usernameInput;
var usernameSpan;
var statusRow;
var connectPanel;
var connectImage;
var addChannelImage;
var leaveSpan;
var newChannelInputRow;
var newChannelInput;
var isLoadingChannels;

$(document).ready(function() {
  messageList = $('#message-list');
  channelList = $('#channel-list');
  inputText = $('#input-text');
  usernameInput = $('#username-input');
  usernameSpan = $('#username-span');
  statusRow = $('#status-row');
  connectPanel = $('#connect-panel');
  connectImage = $('#connect-image');
  leaveSpan = $('#leave-span');
  addChannelImage = $('#add-channel-image');
  newChannelInputRow = $('#new-channel-input-row');
  newChannelInput = $('#new-channel-input');
  usernameInput.focus();
  setupListeners();
});

setupListeners = function() {
  usernameInput.keypress(handleUsernameInputKeypress);
  inputText.keypress(handleInputTextKeypress);
  newChannelInput.keypress(handleNewChannelInputKeypress);
  connectImage.click(function() {
    connectClientWithUsername(usernameInput.val());
  });
  addChannelImage.click(function() {
    showAddChannelInput();
  });
  leaveSpan.click(function() {
    disconnectClient();
  });
}

handleUsernameInputKeypress = function(event) {
  if (event.keyCode == 13){
   connectClientWithUsername(usernameInput.val());
  }
}

handleInputTextKeypress = function(event) {
  if (event.keyCode == 13) {
    currentChannel.sendMessage($(this).val());
    $(this).val('');
    event.preventDefault();
  }
}

handleNewChannelInputKeypress = function(event) {
  if (event.keyCode == 13) {
    alert(newChannelInput.val());
    messagingClient.createChannel({
      friendlyName: newChannelInput.val()
    }).then(function(channel) {
      hideAddChannelInput();
    });
    $(this).val('');
    event.preventDefault();
  }
}

showAddChannelInput = function() {
  if (messagingClient) {
    newChannelInputRow.css('display', 'block');
    channelList.css('max-height', '69vh');
    newChannelInput.focus();
  }
}

hideAddChannelInput = function() {
  newChannelInputRow.css('display', 'none');
  channelList.css('max-height', '75vh');
  newChannelInput.val('');
}

connectClientWithUsername = function(usernameText) {
  usernameInput.val('');
  if (usernameText == '') {
    alert('Username cannot be empty');
    return;
  }
  username = usernameText;
  fetchAccessToken(username, connectMessagingClient);
  usernameSpan.text(username);
  statusRow.css('visibility', 'visible');
  messageList.css('height', '95%');
  connectPanel.css('display', 'none');
  inputText.addClass('with-shadow');
}

addMessageToList = function(message) {
  var rowDiv = $('<div>').addClass('row no-margin');
  rowDiv.loadTemplate($("#message-template"), {
    username: message.author,
    date: getTodayDate(message.timestamp),
    body: message.body
  });
  if (message.author == username) {
    rowDiv.addClass('own-message');
  }

  messageList.append(rowDiv);
  scrollToMessageListBottom();
};

scrollToMessageListBottom = function() {
  messageList.scrollTop(messageList[0].scrollHeight);
};

loadChannelList = function(handler) {
  if (messagingClient === undefined) {
    console.log('Client is not initialized');
    return;
  }

  if (isLoadingChannels) {
    return;
  }
  isLoadingChannels = true;
  messagingClient.getChannels().then(function(channels) {
    channelArray = $.map(channels, function(value, index) {
      return value;
    });
    channelArray = sortChannelsByName(channelArray);
    channelList.text('');
    $.each(channelArray, function(index, channel) {
      if (channel.uniqueName == GENERAL_CHANNEL_UNIQUE_NAME) {
        generalChannel = channel;
      }
      var rowDiv = $('<div>').addClass('row channel-row');
      rowDiv.click(selectChannel);
      var colDiv = $('<div>').addClass('col-md-12');
      var channelP = $('<p>').addClass('channel-element').text(channel.friendlyName);
      channelP.data('sid', channel.sid);
      if (currentChannel && channel.sid == currentChannel.sid) {
        currentChannelContainer = channelP;
        channelP.addClass('selected-channel');
      }
      else {
        channelP.addClass('unselected-channel')
      }

      colDiv.append(channelP);
      rowDiv.append(colDiv);
      channelList.append(rowDiv);
    });
    if (handler) {
      handler();
    }
    isLoadingChannels = false;
  });
};

updateChannelUI = function(selectedChannel) {
  var channelElements = $('.channel-element');
  channelElements = $.map(channelElements, function(value, index) {
    return value;
  });
  var channelElement = channelElements.filter(function(element) {
    return $(element).data().sid === selectedChannel.sid;
  });
  channelElement = $(channelElement);
  if (currentChannelContainer == undefined && selectedChannel.uniqueName == GENERAL_CHANNEL_UNIQUE_NAME) {
    currentChannelContainer = channelElement;
  }
  currentChannelContainer.removeClass('selected-channel').addClass('unselected-channel');
  channelElement.removeClass('unselected-channel').addClass('selected-channel');
  currentChannelContainer = channelElement;

}

selectChannel = function(event) {
  var target = $(event.target);
  var channelSid = target.data().sid;
  var selectedChannel = channelArray.filter(function(channel) {
    return channel.sid === channelSid;
  })[0];
  if (selectedChannel == currentChannel) {
    return;
  }
  setupChannel(selectedChannel);
};

leaveCurrentChannel = function() {
  if (currentChannel) {
    currentChannel.leave().then(function(leftChannel) {
      console.log('left ' + leftChannel.friendlyName);
      leftChannel.removeListener('messageAdded', onMessageAdded);
    });
  }
}

disconnectClient = function() {
  leaveCurrentChannel();
  channelList.text('');
  messageList.text('');
  channels = undefined;
  statusRow.css('visibility', 'hidden');
  messageList.css('height', '80%');
  connectPanel.css('display', 'block');
  inputText.removeClass('with-shadow');
}

setupChannel = function(channel) {
  // Join the channel
  channel.join().then(function(joinedChannel) {
    console.log('Joined channel ' + joinedChannel.friendlyName);
    leaveCurrentChannel();
    updateChannelUI(channel);
    currentChannel = channel;
    loadMessages();
    channel.on('messageAdded', onMessageAdded);
    inputText.prop('disabled', false).focus();
    messageList.text('');
  });
};

loadMessages = function() {
  currentChannel.getMessages(MESSAGES_HISTORY_LIMIT).then(function (messages) {
    messages.forEach(addMessageToList);
  });
}

onMessageAdded = function(message) {
  addMessageToList(message);
}

sortChannelsByName = function(channels) {
  return channels.sort(function(a, b) {
    if (a.friendlyName == GENERAL_CHANNEL_NAME) {
      return -1;
    }
    if (b.friendlyName == GENERAL_CHANNEL_NAME) {
      return 1;
    }
    return a.friendlyName.localeCompare(b.friendlyName);
  });
};

fetchAccessToken = function (username, handler) {
  $.post('/token', {
    identity: username,
    deviceId: 'browser'
  }, function(data) {
    handler(data);
  }, 'json');
};

connectMessagingClient = function(tokenResponse) {
  // Initialize the IP messaging client
  accessManager = new Twilio.AccessManager(tokenResponse.token);
  messagingClient = new Twilio.IPMessaging.Client(accessManager);
  messagingClient.on('channelAdded', loadChannelList);
  loadChannelList(joinGeneralChannel);
};



joinGeneralChannel = function() {
  // Get the general chat channel, which is where all the messages are
  // sent in this simple application
  console.log('Attempting to join "general" chat channel...');
  if (!generalChannel) {
    // If it doesn't exist, let's create it
    messagingClient.createChannel({
      uniqueName: GENERAL_CHANNEL_UNIQUE_NAME,
      friendlyName: GENERAL_CHANNEL_NAME
    }).then(function(channel) {
      console.log('Created general channel');
      generalChannel = channel;
      loadChannelList(joinGeneralChannel);
    });
  }
  else {
    console.log('Found general channel:');
    setupChannel(generalChannel);
  }
};
