QUnit.assert.contains = function( needle, haystack, message ) {
 var actual = haystack.indexOf(needle) > -1;
 this.push(actual, actual, needle, message);
};

QUnit.test("should sort channels by name", function(assert) {
  var channels = [
    {friendlyName: "BBB"},
    {friendlyName: "BBA"}
  ];

  var result = sortChannelsByName(channels)

  assert.deepEqual(result, [{friendlyName: "BBA"}, {friendlyName: "BBB"}]);
});

QUnit.test("should be able to sort an empty list of channels", function(assert) {
  var channels = [];

  var result = sortChannelsByName(channels)

  assert.deepEqual(result, []);
});

QUnit.test("should sort channels when they have same name", function(assert) {
  var channels = [
    {friendlyName: "BBB"},
    {friendlyName: "BBA"},
    {friendlyName: "BBA"}
  ];

  var result = sortChannelsByName(channels);

  assert.deepEqual(result, [{friendlyName: "BBA"}, {friendlyName: "BBA"}, {friendlyName: "BBB"}]);
});

QUnit.test("should be able to add messages to chat", function(assert) {
  var message = {
    body: "just a test message",
    author: "me",
    timestamp: new Date()
  }

  username = "me";
  addMessageToList(message);

  assert.ok($("#message-list").html().indexOf("just a test message") > -1, $("#message-list").html());
});
