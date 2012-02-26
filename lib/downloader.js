var path = require('path');
var url = require('url');
var http = require('http');
var fs = require('fs');
var knox = require('./knox')


//create the downloader 'class'
module.exports = downloader = function () {

    var self = this
    var write_file;
    //what global variable do we have?
    var complete = false;
    var content_length = 0;
    var downloaded_bytes = 0;

    //we will need to be able to set the remote file to download
    self.set_remote_file = function (file) {
        remote_file = file;
        local_file = path.basename(remote_file);
    }

    //we want to set the local file to write to
    self.set_local_file = function (file) {
        local_file = file;
    }
//run this fukker!
    self.run = function (callback) {
        //start the download
        self.download(remote_file, local_file, 0, callback);
    }

    self.download = function (remote, local, num, callback) {
        console.log(remote);
        if (num > 10) {
            console.log('Too many redirects');
        }
        //remember who we are
        var self = this;
        //set some default values
        var redirect = false;
        var new_remote = null;
        var write_to_file = false;
        var write_file_ready = false;
        //parse the url of the remote file
        var u = url.parse(remote);
        //set the options for the 'get' from the remote file
        var opts = {
            host:u.hostname,
            port:u.port,
            path:u.pathname
        };
        //get the file
        var request = http.get(opts, function (response) {
            var type = response.headers["content-type"];
            var prefix = "data:" + type + ";base64,";

            var body = ''

            switch (response.statusCode) {
                case 200:
                    //what is the content length?
                    content_length = response.headers['content-length'];
                    break;
                case 302:
                    new_remote = response.headers.location;
                    self.download(new_remote, local_file, num + 1);
                    return;
                    break;
                case 404:
                    if (typeof callback == 'function') {
                        callback('404')
                    }
                    console.log("File Not Found");
                default:
                    request.abort();
                    if (typeof callback == 'function') {
                        callback('404')
                    }
            }

            response.setEncoding('binary');
            response.on('data', function (chunk) {
                body += chunk
            });
            response.on('end', function () {
                if (typeof callback == 'function') {
                    var base64 = new Buffer(body, 'binary').toString('base64')
                    data = prefix + base64;
                    callback(undefined, data)
                }
            });
        });
        request.on('error', function (e) {
            if (typeof callback == 'function') {
                callback(e)
            }
            console.log("Got error: " + e.message);
        });
    }

    return self;
}
