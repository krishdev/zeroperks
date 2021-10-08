import {
    debounce
} from './helper-functions';

const home = {
    data: {
        scooter: document.querySelector('.c-Home-Banner__scooter')
    },
    initialized () {
        const self = this;
        if (this.data.scooter) {
            window.addEventListener('scroll', debounce((e)=>{
                if (self.data.scooter) {
                    const windowWidth = window.innerWidth;
                    const addConstant = windowWidth >= 992 ? 500 : windowWidth >= 768 ? 200 : windowWidth >= 579 ? 100 : 50;
                    const windowTop = window.scrollY;
                    const elementTop = self.data.scooter.offsetTop;
                    const leftPosition = addConstant + (elementTop - windowTop);
                    self.data.scooter.style.left = leftPosition + 'px';
                }
            }, 5));
        }
    }
}

home.initialized();