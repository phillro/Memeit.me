var ElasticSearchClient = require('elasticsearchclient')
var conf = require('../etc/conf.js');
MemeGenClient = require('memegenclient');
var memeGenClient = new MemeGenClient(conf.memegenerator);
var memeItEsParams = {
    hosts:[
        {

        }
    ]
}

var memeitEs = new ElasticSearchClient(memeItEsParams)
var indexName = 'meme_it'
var documentType = 'generators'
var pages = 104
var pageSize = 24
var currentPage = 1;


var pageHandler = function (page, callback) {
    if (page.success) {
        var indexedCount = 0
        for (var r = 0; r < page.result.length; r++) {
            var generator = page.result[r]
            memeitEs.index(indexName, documentType, generator)
                .on('error', function (err) {
                    console.log("ERROR " + err)
                    indexedCount++
                    if (indexedCount < page.result.length - 1) {
                        callback()
                    }
                })
                .on('data', function (result) {
                    console.log(result)
                    indexedCount++
                    if (indexedCount < page.result.length - 1) {
                        callback()
                    }
                })
                .exec()
        }
    }else{
        callback()
    }

}

var getPages = function (pageIndex, pageSize, callback) {
    var getPagesCallback = callback
    getPage(currentPage, pageSize, function (error, data, pageIndex, pageSize) {
        if (error) {
            console.log(error)
        }
        if (data) {
            pageHandler(data, function () {
                currentPage++
                if (currentPage < pages) {
                    getPages(pageIndex, pageSize, getPagesCallback)
                } else {
                    getPagesCallback()
                }
            })
        }
    })
}

var getPage = function (pageIndex, pageSize, callback) {
    console.log('')
    console.log('Getting next page')
    memeGenClient.generatorsSelectByNew({pageIndex:pageIndex, pageSize:pageSize})
        .on('data', function (data) {
            if (typeof data == 'string') {
                data = JSON.parse(data)
            }
            callback(undefined, data, pageIndex, pageSize)
        })
        .on('error', function (error) {
            callback(error, undefined, pageIndex, pageSize)
        })
        .exec()
}

getPages(pages, pageSize, function () {
    console.log('done')
})