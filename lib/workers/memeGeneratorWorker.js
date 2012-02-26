MemeGenClient = require('memegenclient');


module.exports = memeGeneratorWorker = {}
var memeGenClient = new MemeGenClient(configSettings.memegenerator);
memeGeneratorWorker.createMemeGeneratorMeme = function (data) {
    self = this
    memeGenClient.instanceCreate({
        languageCode:'en',
        generatorId:'45',
        imageId:20,
        text0:data.text
    }).on('data', function (memeResponse) {
            console.log(memeResponse);
            if (typeof memeResponse == 'string')
                memeResponse = JSON.parse(memeResponse)

            var instanceId = memeResponse.result.instanceID
            var imageUrl = 'http://b.images.memegenerator.net/instances/400x/' + instanceId + '.jpg'
            var trollMeImageObj = {
                imageUrl : 'http://b.images.memegenerator.net/instances/400x/' + instanceId + '.jpg',
                memeGeneratorInstanceId : instanceId,
                imageSource : 'memegenerator.net'
            }
            data.trollMeImages.push(trollMeImageObj)
            resque.enqueue('troll_factory','publishMessage',data)

            self.succeed()
        })
        .exec()


}
