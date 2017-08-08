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
      '&response_type=token';
    //adds approve everytime
    // TODO: remove
    // '&show_dialog=true';

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
      getAlbum();
      var refresh = setInterval(getAlbum, 500);
      backgroundArt();
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
          // artist: response.item.album.artists["0"].name,
          // album: response.item.album.name,
          // track: response.item.name,
          // albumImg: response.item.album.images["0"].url
        };

        if (holdAlbumImg != playing.albumImg) {
          // $("#cover").css("background-image", "url('" + playing.albumImg + "')");
          // holdAlbumImg = playing.albumImg;
        }
      }
    },
    error: function(response) {
      if (response.status == 401) {
        console.log(true);
        // TODO change this to stop album check and popup spotify login
        window.location.replace('http://localhost:7880/');
      } else {
        // console.log(response);
      }
    }
  });

}

// get user's top albums
// save id's in array
// lookup id's and get album art
// create grid or bricks, maybe random sizes



function backgroundArt() {

  // ---------------------------------------------------------

  // function 1
  //    loop
  //      gets album id
  //      add to var
  //    call 2

  // function 2
  //    reduces to 20 in array
  //    loop
  //      gets album art
  //      adds to array
  //    sends to grid

  //calls getArtID then sends multiTrack to getArtUrl
  getArtID(getArtUrl);

  function getArtID(callback) {

    //.when compleates only after both ajax calls pass
    $.when(
      $.ajax({
        url: 'https://api.spotify.com/v1/me/top/tracks/',
        data: {
          'limit': 50
        },
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {},
        error: function(response) {
          console.log(response);
        }
      }),
      $.ajax({
        url: 'https://api.spotify.com/v1/me/player/recently-played',
        data: {
          'limit': 1
        },
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {},
        error: function(response) {
          console.log(response);
        }
      })
      //done pushes all ids together and filters for duplicates then callback
    ).done(function(arr1, arr2) {

      var multiTrack = [];
      // pushes the ids from top tracks into and array
      for (var i = 0; i < arr1["0"].items.length; i++) {
        multiTrack.push(arr1["0"].items[i].album.id);
      }
      // pushes the ids from last played into and array
      for (var j = 0; j < arr2["0"].items.length; j++) {
        multiTrack.push(arr2["0"].items[j].track.album.id);
      }

      // fillter the array for duplicates
      multiTrack = multiTrack.filter(function(elem, pos) {
        return multiTrack.indexOf(elem) == pos;
      });
      callback(multiTrack);

    });

  }

  function getArtUrl(multiTrack, callback) {
    holdID = multiTrack;
    var times = 2;
    var start = 0;
    var test = 0;
    var tempARR = [];
    var idARR = [];
    var tempStringArr = [];
    var itt = Math.ceil(holdID.length / 20);

    if (holdID.length > 19) {
      for (var i = 0; i < itt; i++) {
        if (holdID.length > 19) {
          tempStringArr[i] = holdID.splice(0, 20);
        } else {
          tempStringArr[i] = holdID.splice(0, holdID.length);
        }
        idARR[i] = tempStringArr[i].join(',');
      }
    } else {
      idARR[0] = holdID.join(',');
    }

    function loop(idARR, test, itt, callback) {
      if (test < idARR.length) {
        $.ajax({
          url: 'https://api.spotify.com/v1/albums',
          data: {
            'ids': idARR[test]
          },
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            // get the tracks images and push to array multiTrackImg (300px)
            for (var j = 0; j < response.albums.length; j++) {
              tempARR.push(response.albums[j].images["0"].url);
            }
            test = test + 1;
            loop(idARR, test, times, callback);
          },
          error: function(response) {
            console.log(response);
          }
        });
      } else {
        callback(tempARR);
      }
    }

    loop(idARR, test, itt, function(reData) {

      //  shuffles the array and reasignes it
      //  anonymous self-invoking function so all vars are contained
      reData = (function(imageArray) {

        // suffles the reData array
        var ran, temp, i;
        for (i = imageArray.length; i; i--) {
          ran = Math.floor(Math.random() * i);
          temp = imageArray[i - 1];
          imageArray[i - 1] = imageArray[ran];
          imageArray[ran] = temp;
        }
        return imageArray;
      })(reData);

      grid(reData);
    });

  }



  // -------------------------------------------------------------

  // create grid using masonry.js
  // https://masonry.desandro.com/
  function grid(multiTrackImg) {
    // console.log(multiTrackImg);
    var currentWidth = window.innerWidth;
    var currentHeight = window.innerHeight;

    function random(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }


    var columnSize = currentHeight/6;
    // var columnSize = 184; //smallest size for image 75px
    var numberOfColumns = Math.ceil(currentWidth / columnSize);
    console.log(currentHeight);

    var newWidth = columnSize * numberOfColumns;
    var gridStyles = {
      'width': newWidth+'px',
      'left': -random(0, (newWidth - currentWidth) / 2) + 'px'
    };

    $('#container').css(gridStyles);




    // appends images
    for (var i = 0; i < multiTrackImg.length; i++) {
      $('.grid').append('<div class="grid-item"><img src="' + multiTrackImg[i] + '"></div>');
    }

    // TODO test height of grid, if < screen height kill mason reload
    //currently set at 600px images and need to change columnSize, make response
    // TODO use last played 50 tracks as filler items, and posiably aimate some to fade over first array

    // starts packery after all the images are loaded
    $('.grid').imagesLoaded()
      .done(function(instance) {
        // console.log('all images successfully loaded');
        $(".grid").mason({
          itemSelector: '.grid-item',
          ratio: 1,
          sizes: [
            [2, 2],
            [1, 1],
          ],
          columns: [
            [0, 3000, numberOfColumns],
          ],
          filler: {
            itemSelector: '.grid-item',
            filler_class: 'mason_filler',
            keepDataAndEvents: false
          },
          randomSizes: true,
          randomFillers: true,
          layout: 'fluid',
          gutter: 2
        });
        $('#container').css('top', -random(0, $('.grid').height()-currentHeight) / 2  + 'px');
      });
  }

}

$(document).foundation();
