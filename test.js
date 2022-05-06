
        const swiper = new Swiper('.swiper', {
            slidesPerView: 2,
            slidesPerGroup: 2,
            breakpoints: {
                480: {
                  slidesPerView: 4,
                  spaceBetween: 40,
                },
                640: {
                  slidesPerView: 5,
                  spaceBetween: 50,
                }
              },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  });


    