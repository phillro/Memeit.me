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
var im = require('imagemagick');


module.exports = memeifier = function (app) {
    var self = this
    var s3Client = knox.createClient(configSettings.aws.s3)
    var s3Headers = {
        'Content-Type':'image/jpg',
    }


    //self.processImage =

    //var out = fs.createWriteStream(localFileFullPath)

    /*
     stream.on('data', function (chunk) {
     out.write(chunk);
     });
     stream.on('end', function () {
     makeMemeCallback(undefined, fileName)
     })*/


    function convertImage(fileBuffer, localFileFullPath, callback) {
        console.log('converting image')
        fs.open(localFileFullPath, 'w', function (err, fd) {
            if (err) {
                console.log('error opening file for write')
                console.log(err)
                callback(err, {errorMessage:err})
            } else {
                console.log('opened file for write')
                var imgStr = fileBuffer.toString()
                imgStr = imgStr.slice(imgStr.indexOf(',') + 1);
                fileBuffer = new Buffer(imgStr, 'base64');
                var result = fs.writeSync(fd, fileBuffer, 0, fileBuffer.length, null)
                console.log(result + ' written to ' + localFileFullPath)
                var newFileName = '/Users/philliprosen/Documents/dev/memeit/public/memes/' + path.basename(localFileFullPath).replace('.jpg', '.png')
                im.convert(['/Users/philliprosen/Documents/dev/memeit/public/memes/' + path.basename(localFileFullPath), newFileName],
                    function (err, metadata) {
                        console.log('convert complete')
                        if (err) {
                            console.log(err)
                            callback(err, {errorMessage:err})
                        } else {
                            console.log(metadata)
                            callback(err, newFileName)
                        }
                    })
                /*
                 im.identify('/Users/philliprosen/Documents/dev/memeit/public/memes/' + path.basename(localFileFullPath), function (err, features) {
                 if (err) {
                 console.log(err)
                 makeMemeCallback(err, {errorMessage:err})
                 } else {
                 console.log(features)
                 makeMemeCallback(err, {errorMessage:'error loading immage'})
                 }

                 // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
                 })*/
            }

        })
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

    function splitText(text, maxLength) {
        var parts = []
        if (text.length > maxLength) {
            var splitChars = ['?', '!', '.', ',', ' ', '@', '#', '"', ';']
            var i = Math.abs(maxLength / 2)
            var found = false
            var offSet = 0
            //tired, not seeing straight. doing stupid shit now


            do {


                if (splitChars.indexOf(text.charAt(i)) > -1) {
                    found = true
                }
                i++
            } while ((i < text.length) && (!found))
            //console.log(i + '/' + text.length + ' offset' + offSet)
            //no obvious splits
            if (!found) {
                i = Math.abs(text.length / 2)
            }


            parts[0] = text.substring(0, i)
            parts[1] = text.substring(i, text.length)
        } else {
            parts[0] = text
        }
        return parts
    }

    function calculateMaxFontSize(ctx, text) {
        var size = 150;
        do {
            ctx.font = size + 'px Impact';
            ctx.lineWidth = size / 32;
            size--;
        } while (ctx.measureText(text).width > ctx.canvas.width)
        return size
    }

    function writeCaption(ctx, text, y) {

        var maxLineLength = 35
        var width = ctx.canvas.width
        var height = ctx.canvas.height

        if (text.length <= maxLineLength) {
            var size = calculateMaxFontSize(ctx, text)
            ctx.font = size + 'px Impact';
            ctx.lineWidth = size / 32;
            ctx.fillText(text, width / 2, y);
            ctx.strokeText(text, width / 2, y);
        } else {
            var parts = splitText(text, maxLineLength)
            var size = calculateMaxFontSize(ctx, parts[0])
            ctx.font = size + 'px Impact';
            ctx.lineWidth = size / 32;
            ctx.fillText(parts[0], width / 2, y);
            ctx.strokeText(parts[0], width / 2, y);

            var size = calculateMaxFontSize(ctx, parts[1])
            ctx.font = size + 'px Impact';
            ctx.lineWidth = size / 32;
            ctx.fillText(parts[1], width / 2, y + size + 4);
            ctx.strokeText(parts[1], width / 2, y + size + 4);

        }

    }

    self.makeMeme = function (imgSrc, topText, bottomText, streamId, options, makeMemeCallback) {
        var date = new Date()
        fileName = streamId.toString() + date.getTime().toString();
        fileName = fileName.replace(/\-/g, '') + path.extname(imgSrc)
        var localFileFullPath = __dirname + configSettings.memeImagePath + fileName
        //localFileFullPath = '/Users/philliprosen/Documents/dev/memeit/lib/../public/memes/13302110041251330211004125.jpg'
        try {
            //downloadFile(imgSrc, streamId, localFileFullPath, function (err, imageName) {
            downloadFile(imgSrc, streamId, localFileFullPath, function (err, fileBuffer) {
                    if (err) {
                        console.log('error downloading')
                        console.log(err)
                        makeMemeCallback(err)
                    } else {


                        console.log('Loading file ' + localFileFullPath)


                        //var squid = fs.readFileSync(localFileFullPath);

                        //fs.readFile(localFileFullPath,function (err, data) {

                        img = new Image;
                        img.onload = function () {
                            console.log('captions written')
                            var canvas = new Canvas(options.width, options.height)
                            var ctx = canvas.getContext('2d')

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
                            writeCaption(ctx, bottomText, height - (Math.abs(height / 4)))


                            var tempStream = canvas.createPNGStream();
                            var tempBody = ''
                            tempStream.on('data', function (chunk) {
                                tempBody += chunk
                            });
                            tempStream.on('end', function () {
                                var contentSize = new Buffer(tempBody, 'binary').length
                                var stream = canvas.createPNGStream();
                                s3Client.putPngStream(stream, configSettings.memeUrlPath + '/' + path.basename(fileName), s3Headers, contentSize, function (err, res) {
                                    if (err) {
                                        makeMemeCallback(err)
                                    } else {
                                        var url = 'http://s3.amazonaws.com/' + configSettings.aws.s3.bucket + configSettings.memeUrlPath + '/' + path.basename(fileName)
                                        console.log(url)
                                        makeMemeCallback(err, url)

                                    }

                                })
                            })
                        }


                        img.onerror = function (err) {
                            console.log("Error loading image to canvas")
                            console.log(err)
                            convertImage(fileBuffer, localFileFullPath, function (err, newFileName) {
                                if (err) {
                                    makeMemeCallback(err)
                                } else {
                                    img2 = new Image;
                                    img2.onload = function () {
                                        console.log(newFileName)

                                        var canvas = new Canvas(options.width, options.height)
                                        var ctx = canvas.getContext('2d')

                                        //ctx.drawImage(img, 0, 0);

                                        var width = ctx.canvas.width = options.width || img2.width
                                        var height = ctx.canvas.height = options.height || img2.height

                                        console.log('captions written')
                                        ctx.strokeStyle = "#000000"
                                        ctx.textAlign = 'center'
                                        ctx.fillStyle = "#ffffff"
                                        ctx.lineCap = "round"


                                        ctx.clearRect(0, 0, width, height);
                                        ctx.drawImage(img2, 0, 0, width, height);

                                        ctx.textBaseline = 'top';
                                        writeCaption(ctx, topText, 0)

                                        ctx.textBaseline = 'bottom';
                                        writeCaption(ctx, bottomText, height - (Math.abs(height / 4)))



                                        var tempStream = canvas.createPNGStream();
                                        var tempBody = ''
                                        tempStream.on('data', function (chunk) {
                                            tempBody += chunk
                                        });
                                        tempStream.on('end', function () {
                                            var contentSize = new Buffer(tempBody, 'binary').length
                                            var stream = canvas.createPNGStream();
                                            s3Client.putPngStream(stream, configSettings.memeUrlPath + '/' + path.basename(fileName), s3Headers, contentSize, function (err, res) {
                                                if (err) {
                                                    makeMemeCallback(err)
                                                } else {
                                                    var url = 'http://s3.amazonaws.com/' + configSettings.aws.s3.bucket + configSettings.memeUrlPath + '/' + path.basename(fileName)
                                                    console.log(url)
                                                    makeMemeCallback(err, url)

                                                }

                                            })
                                        })
                                    }
                                    /*function () {
                                     console.log('processing image second pass')
                                     //console.log(topText + ' ' + bottomText)
                                     self.processImage(topText, bottomText, filename, options, makeMemeCallback)
                                     }*/
                                    img2.onerror = function (err) {
                                        console.log("Error reprocessing image for canvas")
                                        makeMemeCallback(err)
                                    }
                                    img2.src = newFileName;
                                }
                            })


                        }
                        img.src = fileBuffer;
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

