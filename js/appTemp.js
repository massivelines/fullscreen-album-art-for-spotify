($).done(function() {
  // TODO when commercial play dont show details div maybe done

  // adds a timer that shows the track info on a mousemove and delays it until all art it loaded
  setTimeout(function() {

    var timer = null;
    $(document).mousemove(function() {
      // console.log(commercial);
      if (commercial == false) {
        clearTimeout(timer);
        $('#track-details').css('opacity', 1);
        $('#track-text').css('opacity', 1);
        $('#spotify').css('opacity', 1);
        i = setTimeout(function() {
          $('#track-details').css('opacity', 0);
          $('#track-text').css('opacity', 0);
          $('#spotify').css('opacity', 0.4);
        }, 10000);
      }
    }).mouseleave(function() {
      clearTimeout(timer);
      $('#track-details').css('opacity', 0);
      $('#track-text').css('opacity', 0);
      $('#spotify').css('opacity', 0.4);
    });

  }, 5000);

});
