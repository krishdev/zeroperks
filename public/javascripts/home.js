import {
    debounce
} from './helper-functions';

const home = {
    data: {
        scooter: document.querySelector('.c-Home-Banner__scooter')
    },
    initialized () {
        window.addEventListener('scroll', debounce((e)=>{
            const windowWidth = window.innerWidth;
            const addConstant = windowWidth >= 992 ? 500 : windowWidth >= 768 ? 200 : windowWidth >= 579 ? 100 : 50;
            const windowTop = window.scrollY;
            const elementTop = this.data.scooter.offsetTop;
            const leftPosition = addConstant + (elementTop - windowTop);
            this.data.scooter.style.left = leftPosition + 'px';
        }, 5));
    }
}

home.initialized();