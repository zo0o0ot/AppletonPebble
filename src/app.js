var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Settings = require('settings');
//moment.js is already there (vendor directory, used by Clock).  I don't need to import it.  CloudPebble doesn't like it, but I can use it simply by typing moment();
//var Moment = require('moment');

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

console.log('Property Id is: ' + propertyId);

if (propertyId === null || propertyId === undefined)
  {
    propertyId = 315427100;
  }

// Check for existing recycle data that is still relevant.
var savedRecycleDay = Settings.option('savedRecycleDay');
console.log('Saved Recycle Day is: ' + savedRecycleDay);
if (savedRecycleDay !== undefined)
  {
    var tomorrow = moment().add(1, 'd');
    var savedRecycleMoment = moment(savedRecycleDay, "dddd, MM-DD-YYYY");
    console.log('Saved Recycle Moment is: ' + moment(savedRecycleMoment).format("dddd, MMMM Do YYYY"));
  }
if (savedRecycleDay !== null && savedRecycleDay !== undefined && savedRecycleMoment.isAfter(tomorrow))
  {
    var card = new UI.Card({
      title:'Next Recycle Day:',
      subtitle:savedRecycleDay
    });
    card.show();
  }
else
  {
    // Make request to Appleton API
    ajax(
      {
        //URL for Appleton API plus the user's property ID.
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
    
        //Save the recycle day to the watch settings storage (Settings.option)
        Settings.option('savedRecycleDay', recycleDay);
        // Display the Card
        card.show();
      },
      function(error) {
        console.log('Download failed: ' + error);
      }
    );    
  }


