var FlickrAPI = require('../../lib/flickrnode/lib/flickrapi');


module.exports = flickrWorker = {}
var flickr = new FlickrAPI('7c75ee5b77d6f68323a1194aadf02a08');

function parseHashTags(text) {
        return text.match(/[#]+[A-Za-z0-9-_]+/g) || [];
    };


flickrWorker.getFlickrImages = function (data) {
    var self = this
    var finalTags = []
    var maxTags = 5
    var finalTags = parseHashTags(data.text)
    if(finalTags.length<maxTags){
        var words = data.text.split(' ')
        for(var w=0; w<words.length;w++){
            if(words[w].length>3&&(finalTags.length<maxTags)){
                finalTags.push(words[w])
            }
        }
    }
    for(var i=0;i<finalTags.length;i++){
        finalTags[i]=finalTags[i].toLowerCase().replace(/(_|\W)/g, '')
    }


    console.log(finalTags)

    tagsStr = finalTags.join(',')//.replace(/(_|\W)/g,'')
    //tagsStr.replace(/\@/g,'')
    //tagsStr.replace(/\#/g,'')

    console.log(tagsStr)
    //search for creative commons images
    flickr.photos.search({tags:tagsStr, license:4}, function (error, searchResults) {
        if (error) {
            console.log(error)
        } else {
            var images = []
            var currentResult = 0
            var maxImages = 10
            var maxImages = searchResults.photo.length > maxImages ? maxImages : searchResults.photo.length
            for (var i = 0; i < maxImages; i++) {
                //console.log('getting info for '+results.photo[i].id)

                flickr.photos.getInfo(searchResults.photo[i].id, '76a3f2da5ab75c67', function (error, photo) {
                    if (error) {
                        console.log(error)
                    } else {
                        //console.log(photo)
                        //console.log(photo.urls.url[0]._content)
                        //build url
                        //var url = 'http://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg'
                        //http://farm7.staticflickr.com/6001/5970284014_ee621993da_b.jpg
                        var url = 'http://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_b.jpg'
                        console.log(photo.urls.url[0])
                        console.log(url)
                        var trollMeImageObj = {
                            imageUrl:url,
                            imageSource:'flickr',
                            //   imageAuthor:photo.owner.username
                        }
                        images.push(trollMeImageObj)
                        if (currentResult == maxImages - 1) {
                            console.log('engueing')
                            console.log(images.length)
                            data.trollMeImages = data.trollMeImages.concat(images)
                            resque.enqueue('troll_factory', 'publishMessage', data)
                            self.succeed()
                        }
                        currentResult++
                    }
                })

            }
        }
    });
}