var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

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

// Make request to Appleton API
ajax(
  {
    //Proof of Concept - hard coded URL
    url:'http://appletonapi.appspot.com/property/315427100',
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
