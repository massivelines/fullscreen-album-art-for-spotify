var multiTrack = []; // holds the last that were listened to

//gets users top tracks and pulls the album id
function getArt(callback) {
  // gets user's recently played
  $.ajax({
    url: 'https://api.spotify.com/v1/me/top/tracks/',
    data: {
      'limit': 50
    },
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    success: function(response) {
      console.log(response);
      // TODO access second page
      // pushes the ids of all the tracks into and array
      for (var i = 0; i < response.items.length; i++) {
        multiTrack.push(response.items[i].album.id);
      }

      // fillter the array for duplicates
      multiTrack = multiTrack.filter(function(elem, pos) {
        return multiTrack.indexOf(elem) == pos;
      });

      callback();
    },
    error: function(response) {
      console.log(response);
    }
  });
}

// calls getArt function with a callback to make sure it can get the tracks before processing
getArt(function() {
  var multiTrackImg = []; // holds the multiple Track Images

  //call to return album art url from an album id and pass to multiTrackImg
  function getArtUrl(holdID) {
    console.log(holdID);
    // joins the ids and looks up the tracks
    holdID = holdID.join(',');
    $.ajax({
      url: 'https://api.spotify.com/v1/albums',
      data: {
        'ids': holdID
      },
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response) {
        // get the tracks images and push to array multiTrackImg (300px)
        for (var j = 0; j < response.albums.length; j++) {
          multiTrackImg.push(response.albums[j].images["1"].url);
        }
        grid(multiTrackImg);
      },
      error: function(response) {
        console.log(response);
      }
    });
  }

// TODO grid is gitting called twice

  // determin how many loops to call, pass limit 20
  if (multiTrack.length > 19) {
    // console.log(multiTrack);
    var itt = Math.ceil(multiTrack.length / 20);
    for (var i = 0; i < itt; i++) {
      if (multiTrack.length > 19) {
        var temp = multiTrack.splice(0, 20);
        getArtUrl(temp);
      } else {
        getArtUrl(multiTrack);
      }
    }
  } else {
    getArtUrl(multiTrack);
  }
});
