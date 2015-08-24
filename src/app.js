var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');
//moment.js is already there (vendor directory, used by Clock).  I don't need to import it.  CloudPebble doesn't like it, but I can use it simply by typing moment();
//var Moment = require('moment');

// Set a configurable with just the close callback
Settings.config(
  { url: 'http://mrosack.github.io/AppletonPebble/' },
  function(e) {
    console.log('closed configurable');

    // Show the parsed response
    console.log(JSON.stringify(e.options));

    Settings.option('address', e.options.address);
    Settings.option('zipcode', e.options.zipcode);
    Settings.option('savedRecycleDay', null);
    Settings.option('implementationUrl', null);
    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);

var address = Settings.option('address');
var zipcode = Settings.option('zipcode');

var showRecycleDay = function(recycleDay) {
  // Create a Card with title and subtitle
  new UI.Card({
    title:'Next Recycle Day:',
    subtitle:moment(recycleDay, "YYYY-MM-DD").format('ddd, MMM Do')
  }).show();
};

var loadRecyclingDay = function(implementationUrl) {
  // Make the request to the implementor
  ajax({
    url: implementationUrl + '?addr=' + address,
    type: 'json'
  },
  function(data){
    console.log('Response from implementation: ' + JSON.stringify(data));
    var recycleDay = null;

    for (var i = 0; i < data.length; i++) {
      if (data[i].collectionType === 'recycling') {
        recycleDay = data[i].collectionDate;
        console.log('Found recycling day: ' + recycleDay);
        break;
      }
    }

    if (!recycleDay) {
      new UI.Card({
        title: 'No Recycling Info Found',
        body: 'We couldn\'t find recycling info for your address, please check your address and try again!',
        scrollable: true
      }).show();
    } else {
      //Save the recycle day to the watch settings storage (Settings.option)
      Settings.option('savedRecycleDay', recycleDay);

      showRecycleDay(recycleDay);
    }
  }, function(error) {
    console.log('Implementation Call failed: ' + error);
  });
};

if (!address) {
  new UI.Card({
    title:'No Address Set',
    body:'Please set your address and zipcode in the configuration!',
    scrollable: true
  }).show();
} else {
  var splashCard = new UI.Card({
    title: 'Downloading Trash Data...'
  });
  
  splashCard.on('hide', function() {
    splashCard.hide();
  });
  
  splashCard.show();
  
  // Check for existing recycle data that is still relevant.
  var savedRecycleDay = Settings.option('savedRecycleDay');
  console.log('Saved Recycle Day is: ' + savedRecycleDay);
  
  if (savedRecycleDay !== undefined)
  {
    var tomorrow = moment().add(1, 'd');
    var savedRecycleMoment = moment(savedRecycleDay, "YYYY-MM-DD");
    console.log('Saved Recycle Moment is: ' + moment(savedRecycleMoment).format("dddd, MMMM Do YYYY"));
    if (!savedRecycleMoment.isAfter(tomorrow)) {
      savedRecycleDay = null;
    }
  }
  
  if (savedRecycleDay)
  {
    console.log('Showing cached recycle day...');
    showRecycleDay(savedRecycleDay);
  }
  else
  {
    console.log('Loading new recycle day information...');
    var implementationUrl = Settings.option('implementationUrl');
    
    if (implementationUrl) {
      loadRecyclingDay(implementationUrl);
    } else {
      // Make request to civic hack locator to find implementation
      ajax({
        url: 'http://civic-hack-api-locator.azurewebsites.net:80/api/implementations/byzipcode/' + zipcode,
        type: 'json'
      },
      function(data) {
        console.log('Response from implementations by zipcode: ' + JSON.stringify(data));
        for (var i = 0; i < data.length; i++) {
          if (data[i].contractName === 'upcoming-garbage-recycling-dates') {
            implementationUrl = data[i].implementationApiUrl;
            console.log('Found Implementation URL: ' + data[i].implementationApiUrl);
          }
        }
        
        if (implementationUrl) {
          Settings.option('implementationUrl', implementationUrl);
          loadRecyclingDay(implementationUrl);
        } else {
          // If it's still undefined, tell the user we don't have an API that can serve them :(
          new UI.Card({
            title:'No API Available :(',
            body:'No one has implemented an API that can tell us about the recycling info for your area yet.  Maybe you can do that?',
            scrollable: true
          }).show();
        }
      }, function(error) {
        console.log('Implementation Lookup failed: ' + error);
      });
    }   
  }
}