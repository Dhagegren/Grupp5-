
        const swiper = new Swiper('.swiper', {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 10,
            breakpoints: {
                
                700: {
                  slidesPerView: 3,
                  slidesPerGroup: 3,
                  spaceBetween: 15,
                },
                1000: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                  spaceBetween: 15,
                },
              },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  });


    