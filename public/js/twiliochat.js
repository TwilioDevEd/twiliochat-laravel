var GENERAL_CHANNEL_UNIQUE_NAME = 'general';
var GENERAL_CHANNEL_NAME = 'General Channel';
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

$(document).ready(function() {
  messageList = $('#message-list');
  channelList = $('#channel-list');
  inputText = $('#input-text');
  usernameInput = $('#username-input');
  usernameSpan = $('#username-span');
  statusRow = $('#status-row');
  connectPanel = $('#connect-panel');
  connectImage = $('#connect-image');
  scrollToMessageListBottom();
  usernameInput.focus();
  setupListeners();
});

setupListeners = function() {
  usernameInput.keypress(filterKeys);
  inputText.keypress(filterKeys);
  connectImage.click(function() {
    connectClientWithUsername(usernameInput.val());
  });
}

filterKeys = function(event) {
  if(event.keyCode == 13) {
    if (event.target.id == 'username-input') {
      connectClientWithUsername(usernameInput.val());
    }
    if (event.target.id == 'input-text') {
      currentChannel.sendMessage($(this).val());
      $(this).val('');
      event.preventDefault();
    }
  }
}

connectClientWithUsername = function(usernameText) {
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
  var colDiv = $('<div>').addClass('col-md-12 message-item');
  var messageP = $('<p>').text(message);
  colDiv.append(messageP);
  rowDiv.append(colDiv);

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

setupChannel = function(channel) {
  // Join the channel
  channel.join().then(function(joinedChannel) {
    console.log('Joined channel ' + joinedChannel.friendlyName);
    if (currentChannel) {
      currentChannel.leave().then(function(leftChannel) {
        console.log('left ' + channel.friendlyName);
        leftChannel.removeListener('messageAdded', onMessageAdded);
      });
    }
    updateChannelUI(channel);
    currentChannel = channel;
    channel.on('messageAdded', onMessageAdded);
    inputText.prop('disabled', false).focus();
    messageList.text('');
  });
};

onMessageAdded = function(message) {
  addMessageToList(message.body);
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
