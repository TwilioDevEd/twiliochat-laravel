test("should sort channels by name", function(assert) {
  var channels = [
    {friendlyName: "BBB"},
    {friendlyName: "BBA"}
  ];

  var result = sortChannelsByName(channels)

  assert.deepEqual(result, [{friendlyName: "BBA"}, {friendlyName: "BBB"}]);
});

test("should be able to sort an empty list of channels", function(assert) {
  var channels = [];

  var result = sortChannelsByName(channels)

  assert.deepEqual(result, []);
});

test("should sort channels when they have same name", function(assert) {
  var channels = [
    {friendlyName: "BBB"},
    {friendlyName: "BBA"},
    {friendlyName: "BBA"}
  ];

  var result = sortChannelsByName(channels);

  assert.deepEqual(result, [{friendlyName: "BBA"}, {friendlyName: "BBA"}, {friendlyName: "BBB"}]);
});

test("should be able to add messages to chat", function(assert) {
  var message = {
    body: "just a test message",
    author: "me",
    timestamp: new Date()
  }
  messageList = $("#message-list");
  username = "me";
  addMessageToList(message);

  assert.ok(messageList.html().indexOf("just a test message") > -1, messageList.html());
});

test("should create a general channel when there is not one", function(){
 var messagingClientMock = { createChannel: function () {} };
 var mock = sinon.mock(messagingClientMock);
 messagingClient = messagingClientMock;
 mock.expects("createChannel").once().returns({ then: function(){} });
 generalChannel = undefined;
 joinGeneralChannel();

 mock.verify();
 ok(true);
});

test("should not create a new general channel if it already has one", function(){
 var messagingClientMock = { createChannel: function () {} };
 var mock = sinon.mock(messagingClientMock);
 messagingClient = messagingClientMock;
 mock.expects("createChannel").never().returns({then: function(){} });
 generalChannel = {join: function(){ return {then: function() {}}}};
 joinGeneralChannel();

 mock.verify();
 ok(true);
});

test("should create a new channel when requested by the user", function(){
  var messagingClientMock = { createChannel: function () {} };
  var mock = sinon.mock(messagingClientMock);
  messagingClient = messagingClientMock;
  mock.expects("createChannel").once().returns({ then: function(){} });

  handleNewChannelInputKeypress({keyCode: 13, preventDefault: function() {}});

  mock.verify();
  ok(true);
});

test("should retrieve list of channels", function() {
  var messagingClientMock = {getChannels: function(){} };
  var mock = sinon.mock(messagingClientMock);
  messagingClient = messagingClientMock;
  mock.expects("getChannels").once().returns({then: function(){} });

  loadChannelList();

  mock.verify();
  ok(true);
});
