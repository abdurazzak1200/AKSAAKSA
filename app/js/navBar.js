$('.burger, .overlay').click(function() {
    $('main').toggleClass('open');
    $('.burger').toggleClass('open');
    $('.overlay').fadeToggle();
  });