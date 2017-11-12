const request = require('request');
const cheerio = require('cheerio');
const sendmail = require('sendmail')();

const url = 'https://www.mhshop-online.com/c376/prh-18';

check();

function check() {
    request(url, (error, response, body) => {
        if (error) {
            notify(error.message);
            return;
        }
        const $ = cheerio.load(body);
        try {
            if ($('.product_list .pl_item').length !== 2) {
                notify($('.product_list').text());
                return;
            }

            if ($('.product_list .pl_item:nth-child(2) .adaptive_image').attr('data-path') !== 'https://www.mhshop-online.com/media/uploads/PRH/PRH 18.8/PRH_ticket_110.jpg') {
                notify($('.product_list').text());
                return;
            }

            if ($('.product_list .pl_item:nth-child(2) .pli_link').attr('href') !== 'https://www.mhshop-online.com/p376-1706/punk-rock-holiday-18-festival-ticket') {
                notify($('.product_list').text());
                return;
            }
        } catch (err) {
            try {
                notify($('.product_list').text());
            } catch (e) {
                notify(err.message);
            }
            return;
        }
        request('https://www.mhshop-online.com/p376-1706/punk-rock-holiday-18-festival-ticket', (error, response, body) => {
            if (error) {
                notify(error.message);
                return;
            }
            const $ = cheerio.load(body);
            const productText = $('#product') && $('#product').text();
            try {
                if ($('#product_message').text() !== "Not on sale") {
                    notify(productText);
                    return;
                }

                if ($('#product_buttons').length) {
                    notify(productText);
                    return;
                }
            } catch (err) {
                try {
                    notify(productText);
                } catch (e) {
                    notify(err.message);
                }
                return;
            }
            setTimeout(check, 1000 * 45);
        });
    });
}

function notify(text = '') {
    console.log('notifying!');
    sendmail({
        from: 'no-reply@punkrockholidaycheckeris.com',
        to: 'andrius@palivonas.lt',
        subject: 'PUNK ROCK HOLIDAY',
        html: 'Something happened. https://www.mhshop-online.com/c376/prh-18 <br>' + text,
    }, (err, reply) => {
        if (err)
            console.error(err && err.stack);
        process.exit();
    });
}