var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

function getData() {
    // Load client secrets from a local file.
    return new Promise((resolve, reject) => {
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                reject(err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Drive API.
            authorize(JSON.parse(content), (auth) => resolve(getLunchOrders(auth)));
        });
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     *
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
        if (!credentials.installed) {
            credentials.installed = credentials.web;
        }
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function (err, token) {
            if (err) {
                getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client);
            }
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    function getNewToken(oauth2Client, callback) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oauth2Client.getToken(code, function (err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                oauth2Client.credentials = token;
                storeToken(token);
                callback(oauth2Client);
            });
        });
    }

    /**
     * Store token to disk be used in later program executions.
     *
     * @param {Object} token The token to store to disk.
     */
    function storeToken(token) {
        try {
            fs.mkdirSync(TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EEXIST') {
                throw err;
            }
        }
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to ' + TOKEN_PATH);
    }

    function getLunchOrders(auth) {
        var sheets = google.sheets('v4');
        let spreadsheetId = '1PjQAuOWsmhnurVjtygB845nzasjqZcBN1JzkRv2VNtk';
        const now = new Date();
        const dateString = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`
        const sheetMappings = {
            1: 'Pirmadienis',
            2: 'Antradienis',
            3: 'Tre%C4%8Diadienis',
            4: 'Ketvirtadienis',
            5: dateString
        };
        let currentDay = (new Date()).getDay();
        const sheetName = sheetMappings[currentDay];
        if (!sheetName) {
            reject('not_lunch_day');
        }
        let range = sheetName + '!B3:D';
        if (currentDay === 5) {
            spreadsheetId = '1jYiJDmKcSJMiLSxjXX_IY86qmW3PVpQ7AdqNjWdpIDk';
            range = sheetName + '!A3:C';
        }
        return new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                auth: auth,
                spreadsheetId: spreadsheetId,
                range: range,
            }, function (err, response) {
                if (err) {
                    reject(err);
                    return;
                }
                var rows = response.values;
                if (rows.length == 0) {
                    resolve([]);
                } else {
                    resolve(rows
                        .map((row) => {
                            return {
                                name: row[0],
                                soup: row[1],
                                main: row[2]
                            }
                        })
                        .filter((order) => !!order.name)
                    );
                }
            });
        });
    }
}

module.exports = {
    getData: getData
}