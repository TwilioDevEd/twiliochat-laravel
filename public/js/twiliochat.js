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

$(document).ready(function() {
  messageList = $('#message-list');
  channelList = $('#channel-list');
  scrollToMessageListBottom();
  fetchAccessToken('mcelibrowser', connectMessagingClient)
  $('#input-text').keypress(function(event){
    if(event.keyCode == 13) {
      currentChannel.sendMessage($(this).val());
      $(this).val('');
      event.preventDefault();
    }
  });
});

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
      if (channel.sid == currentChannel) {
        channelP.addClass('selected-channel');
        currentChannelContainer = channelP;
      }
      else {
        channelP.addClass('unselected-channel')
      }
      if (currentChannelContainer == undefined) {
        currentChannelContainer = channelP;
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

selectChannel = function(event) {
  var target = $(event.target);
  var channelSid = target.data().sid;
  var selectedChannel = channelArray.filter(function(channel) {
    return channel.sid === channelSid;
  })[0];

  if (currentChannel == undefined) {
    currentChannelContainer.removeClass('selected-channel').addClass('unselected-channel');
    target.removeClass('unselected-channel').addClass('selected-Channel');
    currentChannelContainer = target;
    setupChannel(selectedChannel);
  }
  else {
    currentChannel.leave().then(function(channel) {
      console.log('left ' + channel.friendlyName);
      currentChannelContainer.removeClass('selected-channel').addClass('unselected-channel');
      target.removeClass('unselected-channel').addClass('selected-channel');
      currentChannelContainer = target;
      setupChannel(selectedChannel);
    });
  }
};

setupChannel = function(channel) {
  if (channel) {
    currentChannel = channel;
    // Join the channel
    channel.join().then(function(joinedChannel) {
      console.log('Joined channel ' + joinedChannel.friendlyName);
    });

    // Listen for new messages sent to the channel
    channel.on('messageAdded', function(message) {
      addMessageToList(message.body);
    });
  }
};

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
