MemeGenClient = require('memegenclient');


module.exports = memeGeneratorWorker = {}
var memeGenClient = new MemeGenClient(configSettings.memegenerator);
memeGeneratorWorker.createMemeGeneratorMeme = function (data) {
    self = this

    var trollMeImageObj = {
        imageUrl : 'http://b.images.memegenerator.net/instances/400x/15042809.jpg',
        imageSource : 'memegenerator.net'
    }
    data.trollMeImages.push(trollMeImageObj)
    resque.enqueue('troll_factory','publishMessage',data)

    self.succeed()


}
