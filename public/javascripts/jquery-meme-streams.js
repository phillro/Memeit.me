(function ($) {


    var methods = {
        followStream:function (params) {
            $(document).socketEventHandler('_trigger', {ns:'streams', event:'followStream', data:{streamId:params.streamId, options:params.options}});
        },

        loadStreamHistory:function (streamId, options) {
            $(document).socketEventHandler('_trigger', {ns:'streams', event:'loadStreamHistory', data:{streamId:params.streamId, options:params.options}});
        },
        testSocket : function(){
            $(document).socketEventHandler('_trigger', {ns:'streams', event:'testSocket', data:{}});
        }
    }


    $.fn.memeStreams = function (method) {
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.meme-streams');
        }
    }


})(jQuery);