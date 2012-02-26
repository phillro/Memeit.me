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


module.exports = memeifier = function (app) {
    var self = this


    function downloadFile(imgSrc, streamId, localFileFullPath, callback) {
        console.log('Saving at ' + localFileFullPath)
        var downloader = new Downloader()
        downloader.set_remote_file(imgSrc)
        downloader.set_local_file(localFileFullPath)

        downloader.run(function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log(result)
            }
            if (typeof callback == 'function') {
                if (result)
                    callback(undefined, localFileFullPath)
                else
                    callback(err)
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
        downloadFile(imgSrc, streamId, localFileFullPath, function (err, imageName) {
            if (err) {
                makeMemeCallback(err)
            } else {

                var canvas = new Canvas(options.width, options.height)
                var ctx = canvas.getContext('2d')


                console.log('Loading file ' + localFileFullPath)

                var squid = fs.readFileSync(localFileFullPath);
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
                    ctx.drawImage(img, 0, 0,width, height);
                    ctx.textBaseline = 'top';
                    writeCaption(ctx,topText, 0)

                    ctx.textBaseline = 'bottom';
                    writeCaption(ctx,bottomText, height)


                    //ctx.drawImage(img, 0, 0, width, height);
                    //ctx.font = 'bold 20px Impact';
                    //ctx.lineWidth = 1;
                    //ctx.fillStyle = '#000';
                    //ctx.fillText("WAHOO", 20, 20);
                    var out = fs.createWriteStream(localFileFullPath)
                        , stream = canvas.createPNGStream();

                    stream.on('data', function (chunk) {
                        out.write(chunk);
                    });
                    stream.on('end', function () {
                        makeMemeCallback(undefined, fileName)
                    })
                }
                img.onerror = function (err) {
                    console.log(err)
                    makeMemeCallback(err, {errorMessage:err})
                }
                img.src = squid;
            }

        })
    }

    return self


}

