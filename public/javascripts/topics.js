import Swiper, { Navigation, Pagination } from 'swiper';
import 'swiper/css';
// import 'swiper/css/navigation';
import 'swiper/css/pagination';

Swiper.use([Pagination]);
const swiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: true,
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
    autoplay: {
      delay: 2000,
    },
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
  
    // Navigation arrows
    // navigation: {
    //   nextEl: '.swiper-button-next',
    //   prevEl: '.swiper-button-prev',
    // },
  
    // And if we need scrollbar
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });