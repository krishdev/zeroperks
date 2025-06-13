import fontawesome from '@fortawesome/fontawesome-free';
import fas from '@fortawesome/fontawesome-free-solid';
import fab from '@fortawesome/fontawesome-free-brands';

// Add all icons to the library so you can use it in your page
try {
    fontawesome.library.add(fas);
    fontawesome.library.add(fab);
} catch (error) {
    // Fontawesome may not be available.
}

import '../stylesheets/entries/all-entries.scss';
import './navbar';
import './login';
import './home';
import './topics';
import './hireme';
import './post';
console.log('hello')