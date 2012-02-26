/**
 * Created by JetBrains PhpStorm.
 * User: philliprosen
 * Date: 2/25/12
 * Time: 3:04 PM
 * To change this template use File | Settings | File Templates.
 */

var Canvas = require('canvas')
    , Image = Canvas.Image
var fs = require('fs');
var path = require('path')
var Downloader = require('./downloader')
var knox = require('./knox')

module.exports = memeifier = function (app) {
    var self = this
    var s3Client = knox.createClient(configSettings.aws.s3)
    var s3Headers = {
        'Content-Type':'image/jpg',
    }


    function downloadFile(imgSrc, streamId, localFileFullPath, callback) {
        console.log('Saving at ' + localFileFullPath)
        var downloader = new Downloader()
        downloader.set_remote_file(imgSrc)
        downloader.set_local_file(localFileFullPath)

        downloader.run(function (err, result) {
            if (err) {
                console.log(err)
            } else {
                if (typeof callback == 'function') {
                    if (result)
                    //callback(undefined, localFileFullPath)
                        callback(undefined, result)
                    else
                        callback(err)
                }
            }

        })
    }

    function writeCaption(ctx, text, y) {
        var size = 150;
        var width = ctx.canvas.width
        var height = ctx.canvas.height
        do {
            size--;
            ctx.font = size + 'px Impact';
            ctx.lineWidth = size / 32;
        } while (ctx.measureText(text).width > width)

        ctx.fillText(text, width / 2, y);
        ctx.strokeText(text, width / 2, y);

    }

    self.makeMeme = function (imgSrc, topText, bottomText, streamId, options, makeMemeCallback) {
        var date = new Date()
        var fileName = streamId.toString() + date.getTime().toString();
        fileName = fileName.replace(/\-/g, '') + path.extname(imgSrc)
        var localFileFullPath = __dirname + configSettings.memeImagePath + fileName
        //localFileFullPath = '/Users/philliprosen/Documents/dev/memeit/lib/../public/memes/13302110041251330211004125.jpg'
        try {
            //downloadFile(imgSrc, streamId, localFileFullPath, function (err, imageName) {
            downloadFile(imgSrc, streamId, localFileFullPath, function (err, fileBuffer) {
                    if (err) {
                        makeMemeCallback(err)
                    } else {

                        var canvas = new Canvas(options.width, options.height)
                        var ctx = canvas.getContext('2d')


                        console.log('Loading file ' + localFileFullPath)


                        //var squid = fs.readFileSync(localFileFullPath);

                        //fs.readFile(localFileFullPath,function (err, data) {
                        if (err) {
                            makeMemeCallback(err)
                        } else {
                            img = new Image;

                            img.onload = function () {
                                //ctx.drawImage(img, 0, 0);
                                var width = ctx.canvas.width = options.width || img.width
                                var height = ctx.canvas.height = options.height || img.height
                                ctx.strokeStyle = "#000000"
                                ctx.textAlign = 'center'
                                ctx.fillStyle = "#ffffff"
                                ctx.lineCap = "round"


                                ctx.clearRect(0, 0, width, height);
                                ctx.drawImage(img, 0, 0, width, height);
                                ctx.textBaseline = 'top';
                                writeCaption(ctx, topText, 0)

                                ctx.textBaseline = 'bottom';
                                writeCaption(ctx, bottomText, height)


                                var tempStream = canvas.createPNGStream();
                                var tempBody = ''
                                tempStream.on('data', function (chunk) {
                                    tempBody += chunk
                                });
                                tempStream.on('end', function () {
                                    var contentSize = new Buffer(tempBody, 'binary').length
                                    var stream = canvas.createPNGStream();
                                    s3Client.putPngStream(stream, configSettings.memeUrlPath + '/' + path.basename(fileName), s3Headers,contentSize, function (err, res) {
                                        if (err) {
                                            makeMemeCallback(err)
                                        } else {
                                            var url = 'http://s3.amazonaws.com/' + configSettings.aws.s3.bucket + configSettings.memeUrlPath + '/' + path.basename(fileName)
                                            console.log(url)
                                            makeMemeCallback(err, url)

                                        }

                                    })
                                })

                                //var out = fs.createWriteStream(localFileFullPath)

                                /*
                                 stream.on('data', function (chunk) {
                                 out.write(chunk);
                                 });
                                 stream.on('end', function () {
                                 makeMemeCallback(undefined, fileName)
                                 })*/
                            }
                            img.onerror = function (err) {
                                console.log(err)
                                makeMemeCallback(err, {errorMessage:err})
                            }
                            img.src = fileBuffer;
                        }
                        //})
                    }

                }
            )
        }
        catch
            (ex) {
            makeMemeCallback(ex)
        }
    }

    return self


}

