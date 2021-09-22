import {
    debounce
} from './helper-functions';
const navbar = {
    data: {
        mobMenu: document.querySelector('#mob-nav'),
        navBar: document.querySelector('.c-Nav'),
        className: 'c-Nav--open',
        isOpen: false
    },
    initialized () {
        const self = this;
        this.data.mobMenu.addEventListener('click', function () {
            self.toggleMenu();
        })
        window.addEventListener('resize', debounce(()=> {
            const windowWidth = window.innerWidth;
            if (windowWidth >= 768) {
                self.data.navBar.classList.remove(self.data.className);
                self.data.isOpen = false;
            }
        }, 250));
    },
    toggleMenu () {
        const self = this;
        const windowWidth = window.innerWidth;
        if (windowWidth < 768) {
            // mobile
            const isOpen = self.data.navBar.classList.contains(self.data.className);
            if (isOpen) {
                self.data.navBar.classList.remove(self.data.className);
                self.data.isOpen = false;
            } else {
                self.data.navBar.classList.add(self.data.className);
                self.data.isOpen = true;
            }
        } else {
            self.data.navBar.classList.remove(self.data.className);
            self.data.isOpen = false;
        }
    }
}

navbar.initialized();