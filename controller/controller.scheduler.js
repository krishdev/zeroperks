const SitemapGenerator = require ('sitemap-generator');
const schedule = require('node-schedule');
const {
    sendEmail
} = require ('./controller.email');

function startSitemap () {
    console.log('sitemap started..');
    const generator = SitemapGenerator('https://www.zeroperks.com', {
        stripQuerystring: false
    });

    generator.on('done', () => {
        sendEmail({
            from: 'mailkrishna2@gmail.com',
            to: 'mailkrishna2@gmail.com',
            subj: 'Zeroperks Scheduler - Sitemap completed',
            content: `Zeroperks Scheduler - Sitemap completed apx @ ${new Date().toString()}`
        })
    });
    generator.start();
}

function schedulerOnceAWeek () {
    const job = schedule.scheduleJob({
        hour: 23,
        minute: 00,
        dayOfWeek: 0
    }, function(){
        startSitemap();
    });
}

exports.startSitemap = startSitemap;
exports.schedulerOnceAWeek = schedulerOnceAWeek;