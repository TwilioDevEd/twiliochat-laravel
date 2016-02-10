var twiliochat = (function() {
  var tc = {};

  var GENERAL_CHANNEL_UNIQUE_NAME = 'general';
  var GENERAL_CHANNEL_NAME = 'General Channel';
  var MESSAGES_HISTORY_LIMIT = 50;

  var $channelList;
  var $inputText;
  var $usernameInput;
  var $usernameSpan;
  var $statusRow;
  var $connectPanel;
  var $connectImage;
  var $addChannelImage;
  var $leaveSpan;
  var $newChannelInputRow;
  var $newChannelInput;
  var $deleteChannelSpan;
  var $typingRow;
  var $typingPlaceholder;

  $(document).ready(function() {
    tc.$messageList = $('#message-list');
    $channelList = $('#channel-list');
    $inputText = $('#input-text');
    $usernameInput = $('#username-input');
    $usernameSpan = $('#username-span');
    $statusRow = $('#status-row');
    $connectPanel = $('#connect-panel');
    $connectImage = $('#connect-image');
    $leaveSpan = $('#leave-span');
    $addChannelImage = $('#add-channel-image');
    $newChannelInputRow = $('#new-channel-input-row');
    $newChannelInput = $('#new-channel-input');
    $deleteChannelSpan = $('#delete-channel-span');
    $typingRow = $('#typing-row');
    $typingPlaceholder = $('#typing-placeholder');
    $usernameInput.focus();
    $usernameInput.keypress(handleUsernameInputKeypress);
    $inputText.keypress(handleInputTextKeypress);
    $newChannelInput.keypress(tc.handleNewChannelInputKeypress);
    $connectImage.click(connectClientWithUsername);
    $addChannelImage.click(showAddChannelInput);
    $leaveSpan.click(disconnectClient);
    $deleteChannelSpan.click(deleteCurrentChannel);
  });

  handleUsernameInputKeypress = function(event) {
    if (event.keyCode === 13){
      connectClientWithUsername();
    }
  }

  handleInputTextKeypress = function(event) {
    if (event.keyCode === 13) {
      tc.currentChannel.sendMessage($(this).val());
      event.preventDefault();
      $(this).val('');
    }
    else {
      notifyTyping();
    }
  }

  var notifyTyping = $.throttle(function() {
    tc.currentChannel.typing();
  }, 1000);

  tc.handleNewChannelInputKeypress = function(event) {
    if (event.keyCode === 13) {
      tc.messagingClient.createChannel({
        friendlyName: $newChannelInput.val()
      }).then(hideAddChannelInput);
      $(this).val('');
      event.preventDefault();
    }
  }

  connectClientWithUsername = function() {
    var usernameText = $usernameInput.val();
    $usernameInput.val('');
    if (usernameText == '') {
      alert('Username cannot be empty');
      return;
    }
    tc.username = usernameText;
    fetchAccessToken(tc.username, connectMessagingClient);
  }

  function fetchAccessToken(username, handler) {
    $.post('/token', {
      identity: username,
      device: 'browser'
    }, function(data) {
      handler(data);
    }, 'json');
  };

  connectMessagingClient = function(tokenResponse) {
    // Initialize the IP messaging client
    tc.accessManager = new Twilio.AccessManager(tokenResponse.token);
    tc.messagingClient = new Twilio.IPMessaging.Client(tc.accessManager);
    updateConnectedUI();
    tc.loadChannelList(tc.joinGeneralChannel);
    tc.messagingClient.on('channelAdded', $.throttle(tc.loadChannelList));
    tc.messagingClient.on('channelRemoved', $.throttle(tc.loadChannelList));
    tc.messagingClient.on('tokenExpired', refreshToken);
  };

  refreshToken = function() {
    fetchAccessToken(username, setNewToken);
  }

  setNewToken = function(tokenResponse) {
    tc.accessManager.updateToken(tokenResponse.token);
  }

  function updateConnectedUI() {
    $usernameSpan.text(tc.username);
    $statusRow.css('visibility', 'visible');
    tc.$messageList.css('height', '92%');
    $connectPanel.css('display', 'none');
    $inputText.addClass('with-shadow');
    $typingRow.css('display', 'block');
  }

  tc.loadChannelList = function(handler) {
    if (tc.messagingClient === undefined) {
      console.log('Client is not initialized');
      return;
    }

    tc.messagingClient.getChannels().then(function(channels) {
      tc.channelArray = tc.sortChannelsByName(channels);
      $channelList.text('');
      tc.channelArray.forEach(addChannel);
      if (typeof handler === 'function') {
        handler();
      }
    });
  };

  tc.joinGeneralChannel = function() {
    console.log('Attempting to join "general" chat channel...');
    if (!tc.generalChannel) {
      // If it doesn't exist, let's create it
      tc.messagingClient.createChannel({
        uniqueName: GENERAL_CHANNEL_UNIQUE_NAME,
        friendlyName: GENERAL_CHANNEL_NAME
      }).then(function(channel) {
        console.log('Created general channel');
        tc.generalChannel = channel;
        tc.loadChannelList(tc.joinGeneralChannel);
      });
    }
    else {
      console.log('Found general channel:');
      setupChannel(tc.generalChannel);
    }
  };

  function setupChannel(channel) {
    // Join the channel
    channel.join().then(function(joinedChannel) {
      console.log('Joined channel ' + joinedChannel.friendlyName);
      leaveCurrentChannel();
      updateChannelUI(channel);
      tc.currentChannel = channel;
      tc.loadMessages();
      channel.on('messageAdded', tc.addMessageToList);
      channel.on('typingStarted', showTypingStarted);
      channel.on('typingEnded', hideTypingStarted);
      channel.on('memberJoined', notifyMemberJoined);
      channel.on('memberLeft', notifyMemberLeft);
      $inputText.prop('disabled', false).focus();
      tc.$messageList.text('');
    });
  };

  tc.loadMessages = function() {
    tc.currentChannel.getMessages(MESSAGES_HISTORY_LIMIT).then(function (messages) {
      messages.forEach(tc.addMessageToList);
    });
  }

  function leaveCurrentChannel() {
    if (tc.currentChannel) {
      tc.currentChannel.leave().then(function(leftChannel) {
        console.log('left ' + leftChannel.friendlyName);
        leftChannel.removeListener('messageAdded', tc.addMessageToList);
        leftChannel.removeListener('typingStarted', showTypingStarted);
        leftChannel.removeListener('typingEnded', hideTypingStarted);
        leftChannel.removeListener('memberJoined', notifyMemberJoined);
        leftChannel.removeListener('memberLeft', notifyMemberLeft);
      });
    }
  }

  tc.addMessageToList = function(message) {
    var rowDiv = $('<div>').addClass('row no-margin');
    rowDiv.loadTemplate($('#message-template'), {
      username: message.author,
      date: getTodayDate(message.timestamp),
      body: message.body
    });
    if (message.author === tc.username) {
      rowDiv.addClass('own-message');
    }

    tc.$messageList.append(rowDiv);
    scrollToMessageListBottom();
  };

  notifyMemberJoined = function(member) {
    notify(member.identity + ' joined the channel')
  }

  notifyMemberLeft = function(member) {
    notify(member.identity + ' left the channel');
  }

  notify = function(message) {
    var row = $('<div>').addClass('col-md-12');
    row.loadTemplate('#member-notification-template', {
      status: message
    });
    tc.$messageList.append(row);
    scrollToMessageListBottom();
  }

  showTypingStarted = function(member) {
    $typingPlaceholder.html(member.identity + ' is typing...');
  }

  hideTypingStarted = function(member) {
    $typingPlaceholder.html('');
  }

  function scrollToMessageListBottom() {
    tc.$messageList.scrollTop(tc.$messageList[0].scrollHeight);
  };

  function updateChannelUI(selectedChannel) {
    var channelElements = $('.channel-element').toArray();
    var channelElement = channelElements.filter(function(element) {
      return $(element).data().sid === selectedChannel.sid;
    });
    channelElement = $(channelElement);
    if (tc.currentChannelContainer === undefined && selectedChannel.uniqueName === GENERAL_CHANNEL_UNIQUE_NAME) {
      tc.currentChannelContainer = channelElement;
    }
    tc.currentChannelContainer.removeClass('selected-channel').addClass('unselected-channel');
    channelElement.removeClass('unselected-channel').addClass('selected-channel');
    tc.currentChannelContainer = channelElement;
  }

  showAddChannelInput = function() {
    if (tc.messagingClient) {
      $newChannelInputRow.css('display', 'block');
      $channelList.css('max-height', '69vh');
      $newChannelInput.focus();
    }
  }

  hideAddChannelInput = function() {
    $newChannelInputRow.css('display', 'none');
    $channelList.css('max-height', '75vh');
    $newChannelInput.val('');
  }

  addChannel = function(channel) {
    if (channel.uniqueName === GENERAL_CHANNEL_UNIQUE_NAME) {
      tc.generalChannel = channel;
    }
    var rowDiv = $('<div>').addClass('row channel-row');
    rowDiv.loadTemplate('#channel-template', {
      channelName: channel.friendlyName
    });

    var channelP = rowDiv.children().children().first();

    rowDiv.click(selectChannel);
    channelP.data('sid', channel.sid);
    if (tc.currentChannel && channel.sid === tc.currentChannel.sid) {
      tc.currentChannelContainer = channelP;
      channelP.addClass('selected-channel');
    }
    else {
      channelP.addClass('unselected-channel')
    }

    $channelList.append(rowDiv);
  };

  deleteCurrentChannel = function() {
    if (!tc.currentChannel) {
      return;
    }
    if (tc.currentChannel.sid === tc.generalChannel.sid) {
      alert('You cannot delete the general channel');
      return;
    }
    tc.currentChannel.delete().then(function(channel) {
      console.log('channel: '+ channel.friendlyName + ' deleted');
      setupChannel(tc.generalChannel);
    });
  }

  selectChannel = function(event) {
    var target = $(event.target);
    var channelSid = target.data().sid;
    var selectedChannel = tc.channelArray.filter(function(channel) {
      return channel.sid === channelSid;
    })[0];
    if (selectedChannel === tc.currentChannel) {
      return;
    }
    setupChannel(selectedChannel);
  };

  disconnectClient = function() {
    leaveCurrentChannel();
    $channelList.text('');
    tc.$messageList.text('');
    channels = undefined;
    $statusRow.css('visibility', 'hidden');
    tc.$messageList.css('height', '80%');
    $connectPanel.css('display', 'block');
    $inputText.removeClass('with-shadow');
    $typingRow.css('display', 'none');
  }

  tc.sortChannelsByName = function(channels) {
    return channels.sort(function(a, b) {
      if (a.friendlyName === GENERAL_CHANNEL_NAME) {
        return -1;
      }
      if (b.friendlyName === GENERAL_CHANNEL_NAME) {
        return 1;
      }
      return a.friendlyName.localeCompare(b.friendlyName);
    });
  };

  return tc;
})();
