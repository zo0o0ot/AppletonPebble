var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Settings = require('settings');

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

// Set a configurable with just the close callback
Settings.config(
  { url: 'http://zo0o0ot.github.io/PebblePages/' },
  function(e) {
    console.log('closed configurable');

    // Show the parsed response
    console.log(JSON.stringify(e.options));

    Settings.option('propertyId', e.options.propertyId);
    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);

// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Downloading trash data...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'white'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

var propertyId = Settings.option('propertyId');

if (propertyId === null || propertyId === undefined)
  {
    propertyId = 315427100;
  }
else
  {
    console.log('Property Id is: ' + propertyId);
  }
// Make request to Appleton API
ajax(
  {
    //Proof of Concept - hard coded URL
    url:'http://appletonapi.appspot.com/property/' + propertyId,
    type:'json'
  },
  function(data) {
    // The location of the recycling day is data[1].recycleday; 
    var recycleDay = data[1].recycleday;
    // Create a Card with title and subtitle
    var card = new UI.Card({
      title:'Next Recycle Day:',
      subtitle:recycleDay
    });

    // Display the Card
    card.show();
  },
  function(error) {
    console.log('Download failed: ' + error);
  }
);
