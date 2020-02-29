var jsonfile = require('jsonfile')
var fs = require('fs')
var path = require('path')
var replace = require('replace')
var http_request = require('http-request')
var mkpath = require('mkpath')
var chalk = require('chalk')
var spawn = require('child_process').execSync

const excludeDomains = [
  'i.ytimg.com',
  'www.google-analytics.com',
  'www.google.com',
  'www.youtube.com',
  'youtube.com',
  '127.0.0.1'
];

const verbose = false;

const harFile = process.argv[2];
const folder = process.argv[3];
const mainDomain = process.argv[4]; // TODO: get from first entry
const replaceOnly = process.argv[5] == 'replace';

if ([harFile, folder, mainDomain].indexOf(undefined) != -1) {
  console.error(chalk.red('harFile folder mainDomain [replace]'));
  process.exit(1);
}

function urlFilter (url) {
  domain = url.replace(/https?:\/\/([^\/\?]+).*$/, '$1');
  return excludeDomains.indexOf(domain) == -1;
}

function getStorePath (url) {
  const isRoot = urls.indexOf(url) == 0;
  var url = url.replace(/^https?:\/\//, '');
  url = url.replace(/\?.*/, ''); // remove query string
  url = unescape(url);
  if (isRoot)
    url = mainDomain + '/';
  var folder = path.dirname(url).replace(':', '_');
  var slashPos = url.lastIndexOf('/');
  var file = url.substring(slashPos + 1);
  if (file.length == 0)
    file = 'index.html';
  return {
    folder: folder,
    file: file
  };
}

function downloadUrl (url, folder, cb) {
  var loc = getStorePath(url);
  mkpath(path.join(folder, loc.folder), err => {
    if (err)
      cb(err);
    http_request.get(url, path.join(folder, loc.folder, loc.file), (err, res) => {
        if (err) {
          cb(err, loc.file)
        } else {
          cb(null, loc.file)
        }
    });
  });
}

function storeContent (entry, folder, cb) {

}

var har = jsonfile.readFileSync(harFile)
var urls = har.log.entries.reduce((filtered, entry) => {
  if (entry.response.status >= 200
      && entry.response.status < 400
      && entry.request.method.toLowerCase() == 'get'
      && urlFilter(entry.request.url)
      && filtered.indexOf(entry.request.url) == -1
    ) {
      filtered.push(entry.request.url);
      //console.log(entry.request.url);
  }
  return filtered;
}, []);
var entries = har.log.entries.filter(entry => {
  return (
      entry.response.status >= 200
      && entry.response.status < 400
      && entry.request.method.toLowerCase() == 'get'
      && urlFilter(entry.request.url)
  );
});

var success = [];
var fail = [];

if (!replaceOnly) {
  console.log('Downloading ' + urls.length + ' files');
  if (!fs.existsSync(folder))
    fs.mkdirSync(folder);
  urls.forEach(url => {
    downloadUrl(url, folder, (err, file) => {
      if (err) {
        fail.push(url);
        console.error(chalk.red(url))
        //console.error("\t" + chalk.red(file))
        console.error("\t" + chalk.red(err))
      }
      else {
        success.push(url);
        if (verbose)
          console.log(file)
      }
      if (success.length + fail.length == urls.length)
        downloadingDone();
    });
  });
} else {
  downloadingDone();
}

function downloadingDone () {
  console.log(success.length + " successful, " + fail.length + " failed downloads");
  var domains = urls.reduce((domains, url) => {
    var domain = url.replace(/https?:\/\/([^\/\?]+).*$/, '$1');
    if (domains.indexOf(domain) == -1)
      domains.push(domain);
    return domains;
  }, []);
  domains.forEach(domain => {
    replace({
      regex: new RegExp("(https?:)?//" + domain, "gi"),
      replacement: "/" + domain,
      paths: [folder],
      recursive: true,
      silent: false,
    });
  });
  try {
    spawn('mv ' + path.join(folder, mainDomain, '*') + ' ' + folder);
  } catch (exception) {
    //console.log(exception);
  }
}

module.exports = {
  fail: fail,
  success: success
}
