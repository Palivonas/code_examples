const Slack = require('@slack/client');
const storage = require('node-persist');
const express = require('express');
const Lunchy = require('./lunchy');
const fs = require('fs');
const config = require('./config');

const web = new Slack.WebClient(config.botToken);
const rtm = new Slack.RtmClient(config.botToken, {
    dataStore: new Slack.MemoryDataStore()
});

storage.init({
	dir: (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.lunchSubscribers',
	stringify: JSON.stringify,
	parse: JSON.parse,
	encoding: 'utf8',
	logging: false,  // can also be custom logging function
	continuous: true, // continously persist to disk
	interval: false, // milliseconds, persist to disk on an interval
	ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
	expiredInterval: 2 * 60 * 1000, // [NEW] every 2 minutes the process will clean-up the expired cache
    // in some cases, you (or some other service) might add non-valid storage files to your
    // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
    forgiveParseErrors: false // [NEW]
})
.then(() => {
    const app = express();
    app.post('/lunchtime', (req, res) => {
        broadcast()
            .then(() => res.send("k"))
            .catch((err) => {
                if (err === 'not_a_lunch_day') {
                    res.send("Not a lunch day!");
                } else {
                    res.send('something dieded. sorry. here it is: ' + err);
                }
            });
    });
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });
    app.listen(process.env.LUNCHY_PORT || 3000, () => {
        rtm.start();
    });
})
.catch(() => console.log("Fuck."));

const subs = {
    users: {},
    add (userId, name) {
        return storage.setItem(userId, {
            userId: userId,
            name: name
        });
    },
    remove (userId) {
        return storage.removeItem(userId);
    },
    get (userId) {
        return storage.getItem(userId);
    },
    getAll () {
        return storage.values();
    }
};

function sendMessage (recipient, message) {
    web.chat.postMessage(recipient, message, {as_user: true}, (err, res) => {
        if (err) {
            console.log('Failed sending message:', err);
        }
    });
}

rtm.on(Slack.RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    if (isDirectMessage(message)) {
        handleDirectMessage(message);
    }
});

function isDirectMessage (message) {
    if (!message.user) {
        return false;
    }
    const authorDM = rtm.dataStore.getDMByUserId(message.user);
    if (!authorDM) {
        return false;
    }
    return isDM = authorDM.id === message.channel;
}

function handleDirectMessage (message) {
    console.log('OH BOY I GOT A DM:', message.text);
    const addMeRequest = message.text.match(/^add me ?(.*)/i);
    if (addMeRequest) {
        const name = addMeRequest[1].trim();
        console.log("Adding", message.user, "with name", name);
        subs.add(message.user, name || null).then(() => {
            sendMessage(message.channel, `I'll let you know when lunch arrives${name ? ' and will remind you your order' : ''}!`);
        });
    }
    if (message.text === "doit") {
        broadcast();
    }
    if (message.text === "remove me") {
        subs.remove(message.user).then(() => {
            sendMessage(message.channel, `You've been removed from my dearest subscribers list. Boohoo.`);
        });
    }
};

function broadcast () {
    return Lunchy.getData().then(orders => {
        for (const sub of subs.getAll()) {
            const name = sub.name;
            let userChoice = `Next time get your personal order reminders with "add me MyAwesomeNameInTheOrderDoc" command`;
            if (name) {
                const matched = orders.find((order) => {
                    return order.name.toLowerCase().trim() === name.toLowerCase();
                });
                if (matched) {
                    if (matched.soup || matched.main) {
                        userChoice = `You've ordered "${matched.soup}" and "${matched.main}" :banana_dance:`;
                    } else {
                        userChoice = `However, it seems you, ${name}, haven't ordered anything :scream:`
                    }
                } else {
                    userChoice = `However, your saved name, ${name}, wasn't found in the order sheet :suspect:`
                }
            }
            sendMessage(sub.userId, `It's lunchtime!\n${userChoice}`);
        }
        sendMessage(config.channelId, "Ladies and gentlemen (and helicopters), its... LUNCHTIME!!! :partyparrot:");
    });
}
