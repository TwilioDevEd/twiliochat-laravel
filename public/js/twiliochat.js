var GENERAL_CHANNEL_UNIQUE_NAME = 'general';
var GENERAL_CHANNEL_NAME = 'General Channel';
var accessManager;
var messagingClient;
var generalChannel;
var channelArray;

var messageList;
var channelList;

$(document).ready(function() {
    messageList = $('#message-list');
    channelList = $('#channel-list');
    scrollToMessageListBottom();
    connectMessagingClient('mceli', joinGeneralChannel);
    $('#input-text').keypress(function(event){
        if(event.keyCode == 13)
        {
            generalChannel.sendMessage($(this).val());
            $(this).val('');
            event.preventDefault();
        }
    });
});

addMessageToList = function(message) {
    messageList.append(
        '<div class="row full-width"><div class="col-md-12 message-item"><p>' +
        message +
        '</p></div></div>');
    scrollToMessageListBottom();
}

scrollToMessageListBottom = function() {
    $('#message-list').scrollTop($('#message-list')[0].scrollHeight);
}

loadChannelList = function() {
    if (messagingClient) {
        messagingClient.getChannels().then(function(channels) {
            channelArray = $.map(channels, function(value, index) {
                return [value];
            });
            channelArray = sortChannelsByName(channelArray);
            console.log('channels loading');
            channelList.html('');
            $.each(channelArray, function(index, channel) {
                channelList.append(
                    '<div class="row channel-row" onClick="selectChannel(' +
                    index +
                    ')"><div class="col-md-12"><p class="unselected-channel">' +
                    channel.friendlyName +
                    '</p></div></div>'
                );
            });
        });
    }
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
}

connectMessagingClient = function(username, handler) {
    $.post('/token', {
        identity: username,
        deviceId: 'browser'
    }, function(data) {
        // Initialize the IP messaging client
        accessManager = new Twilio.AccessManager(data.token);
        messagingClient = new Twilio.IPMessaging.Client(accessManager);
        if (handler) {
            handler();
        }
    }, 'json');
}

joinGeneralChannel = function(username) {
    // Get the general chat channel, which is where all the messages are
    // sent in this simple application
    console.log('Attempting to join "general" chat channel...');
    var promise = messagingClient.getChannelByUniqueName(GENERAL_CHANNEL_UNIQUE_NAME);
    promise.then(function(channel) {
        generalChannel = channel;
        if (!generalChannel) {
            // If it doesn't exist, let's create it
            messagingClient.createChannel({
                uniqueName: GENERAL_CHANNEL_UNIQUE_NAME,
                friendlyName: GENERAL_CHANNEL_NAME
            }).then(function(channel) {
                console.log('Created general channel');
                console.log(channel);
                generalChannel = channel;
                setupChannel();
            });
        }
        else {
            console.log('Found general channel:');
            console.log(generalChannel);
            setupChannel();
        }
    });
}

setupChannel = function() {
    if (generalChannel) {
        // Join the general channel
        generalChannel.join().then(function(channel) {
            console.log('Joined channel');
        });

        // Listen for new messages sent to the channel
        generalChannel.on('messageAdded', function(message) {
            addMessageToList(message.body);
        });
    }
    loadChannelList();
}
