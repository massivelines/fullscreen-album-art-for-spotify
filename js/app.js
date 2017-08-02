// login
// get current album cover
//    if none display spotify logo
//   when album changes update
//    how often to test?
//   background last 50 albums played
//  when mouse moves
//    display artist album track names
//    display spotify icon for profile top right
//      profile contains info and logout button?

var access_token;

function spotifyLogin() {

  var client_id = 'e2087600e83c43e6844e6babfd3c3a5c'; // Your client id
  var redirect_uri = 'http://localhost:7880/'; // Your redirect uri

  //create the login url
  function getLoginURL() {
    // permissions needed
    var scopes = ['user-read-email', 'user-read-currently-playing', 'user-read-playback-state', 'user-read-recently-played', 'user-top-read'];
    // url
    var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
      '&redirect_uri=' + encodeURIComponent(redirect_uri) +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      '&response_type=token' +
      //adds approve everytime
      // TODO: remove
      '&show_dialog=true';

    // passes the url to the window
    window.location = url;
  }


  function spotifyHash(event) {
    var hash = window.location.hash.substring(1);
    var hashSplit = hash.split('&');
    for (var i = 0; i < hashSplit.length; i++) {
      hashSplit[i] = hashSplit[i].split('=');
    }
    if (hashSplit[0][0] == 'access_token') {
      access_token = hashSplit[0][1];
      $("#login").fadeOut('slow');
      // getAlbum();
      // var refresh = setInterval(getAlbum, 500);
      last50();
      loggedin = true;
    }
  }

  window.onhashchange = spotifyHash();


  document.getElementById('login-button').addEventListener('click', function() {

    getLoginURL();
  }, false);
}


spotifyLogin();


// TODO: when art changes send current to art_container background and fade new in
// TODO: see if can refresh token somehow or alert the user to it expiring soon
// TODO check if a track is playing, if true get art



$(document).foundation();

//holder to check if art needs to change
var holdAlbumImg = null;

function getAlbum() {

  $.ajax({
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    success: function(response) {
      if (response.item == null) {
        // TODO cange to error
        // TODO: add in some image or item
        console.log("commercial");
      } else {
        var playing = {
          artist: response.item.album.artists["0"].name,
          album: response.item.album.name,
          track: response.item.name,
          albumImg: response.item.album.images["0"].url
        };

        if (holdAlbumImg != playing.albumImg) {
          $("#cover").css("background-image", "url('" + playing.albumImg + "')");
          holdAlbumImg = playing.albumImg;
        }
      }
    }
  });

}
// get user's recently played
// save id's in array
// lookup id's and get album art
// create grid or bricks, maybe random sizes
function last50() {
  var multiTrack = []; // holds the last that were listened to
  var multiTrackImg = []; // holds the multiTrack Images images


  // console.log(width);
  // console.log(height);

  // calls getRecent function with a callback to make sure it can get the tracks
  getRecent(function() {
    // joins the ids and looks up the tracks
    var holdID = multiTrack.join(',');
    $.ajax({
      url: 'https://api.spotify.com/v1/tracks',
      data: {
        'ids': holdID
      },
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response) {
        for (var j = 0; j < response.tracks.length; j++) {
          // get the tracks images and push to array multiTrackImg (300px)
          multiTrackImg.push(response.tracks[j].album.images[1].url);
        }
        grid(multiTrackImg);
      },
      error: function(response) {
        console.log(response);
      }
    });

  });

  function getRecent(callback) {
    // gets user's recently played
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player/recently-played',
      data: {
        'limit': 50
      },
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response) {
        // pushes the ids of all the tracks into and array
        for (var i = 0; i < response.items.length; i++) {
          multiTrack.push(response.items[i].track.id);
        }
        callback();
      },
      error: function(response) {
        console.log(response);
      }
    });
  }

  // create grid using masonry.js
  // https://masonry.desandro.com/
  function grid(multiTrackImg) {
    var currentWidth = window.innerWidth;
    var currentHeight = window.innerHeight;
    var biggestImgSize = 300;
    var columns = Math.ceil(currentWidth/biggestImgSize);
    var rows = Math.ceil(currentHeight/biggestImgSize);
    var marginLeft = ((columns * biggestImgSize)-currentWidth)/2;
    var marginTop = ((rows * biggestImgSize)-currentHeight)/2;
    // console.log(currentWidth +" x " +currentHeight);
    // console.log(columns+" x "+rows);

    var containerStyles = {
      width : columns * biggestImgSize,
      height: rows * biggestImgSize,
      top: -marginTop,
      left: -marginLeft
    };

    $('#container').css(containerStyles);

    // TODO filter array for duplicate ablumes, recently-played pulls from tracks

    //  shuffles the array and reasignes it
    //  anonymous self-invoking function so all vars are contained
    multiTrackImg = (function(imageArray) {



      var ran, temp, i;
      for (i = imageArray.length; i; i--) {
        ran = Math.floor(Math.random() * i);
        temp = imageArray[i - 1];
        imageArray[i - 1] = imageArray[ran];
        imageArray[ran] = temp;
      }
      return imageArray;
    })(multiTrackImg);

    // TODO see if need imagesloaded
    function randomSize() {
      var sizes = {
        // 1: 300,
        // 2: 150,
        // 3: 75
        1: 'img1',
        2: 'img2',
        3: 'img3'
      };
      var random = Math.floor((Math.random() * Object.keys(sizes).length) + 1);
      return sizes[random];
    }

    for (var i = 0; i < multiTrackImg.length; i++) {
      var px = randomSize();
      $('.grid').append('<div class="grid-item '+px+'"><img src="' + multiTrackImg[i]+'"></div>');
    }

    // starts packery after all the images are loaded
    var $grid = $('.grid').imagesLoaded( function() {
      $grid.packery({
        // options...
              percentPosition: true,
              itemSelector: '.grid-item',
              gutter: 0
      });
    });


  }

  $.ajax({
    url: 'https://api.spotify.com/v1/me/top/tracks',
    data: {
      'limit': 50
    },
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    success: function(response) {
      console.log(response);
    },
    error: function(response) {
      console.log(response);
    }
  });

}
