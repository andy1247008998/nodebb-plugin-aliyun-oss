(function(){
    "use strict";
    var request = require('request'),
        meta = module.parent.require('./meta'),
        plugins = module.parent.exports,
        fs = require('fs'),
        url = require('url'),
        crypto = require('crypto'),
        ALY = require('aliyun-sdk');

    var NALY = {
        config : {},
        onLoad : function(params, callback) {
            function render(req, res, next) {
                res.render('admin/plugins/aliyunoss', {

                });
            }
            params.router.get('/admin/plugins/aly', params.middleware.admin.buildHeader, render);
            params.router.get('/api/admin/plugins/aly', render);
            meta.settings.get("alyoss",function(err,options) {
                if(err) {
                    return callback(new Error(err))
                }
                NALY.config.accessKeyId = options['accesskeyid'];
                NALY.config.secretAccessKey = options['secretaccesskey'];
                NALY.config.bucket = options['bucket'];
                NALY.config.domain = options['domain'];
            });
            callback();
        },
        upload : function(image, callback) {
            image = image.image;
            if(!NALY.config.accessKeyId) {
                return callback(new Error('invalid-aliyun-oss-access-key-id'));
            }
            if(!NALY.config.secretAccessKey) {
                return callback(new Error('invalid-aliyun-oss-secret-access-key'));
            }
            if(!NALY.config.bucket) {
                return callback(new Error('invalid-aliyun-oss-bucket-name'))
            }
            if(!NALY.config.domain) {
                return callback(new Error('invalid-aliyun-oss-domain'))
            }

            if(!image || !image.path) {
                return callback(new Error('invalid image'));
            }

            var oss = new ALY.OSS({
                accessKeyId:NALY.config.accessKeyId,
                secretAccessKey:NALY.config.secretAccessKey,
                endpoint: NALY.config.domain,
                apiVersion: '2013-10-15'
            });

            fs.readFile(image.path,function(err,fileData){
                if(err) return callback(new Error(err));

                var hash = crypto.createHash('md5'),
                    hex = hash.update(fileData+"").digest('hex'),
                    dir = hex.slice(0,6),
                    sub = hex.slice(6,12),
                    name = hex.slice(12),
                    ext = image.name.split('.')[image.name.split(".").length-1],
                    parser = url.parse(NALY.config.domain),
                    object_name = dir + '/' + sub + '/' + name + '.' + ext,
                    oss_url = parser.protocol+ '//' + NALY.config.bucket + '.' + parser.host + '/' + object_name;

                oss.putObject({
                    Bucket : NALY.config.bucket,
                    Key : object_name,
                    Body : fileData,
                    ContentType : 'image/' + ext
                },function(err,fileData){
                    if(err) {
                        return callback(new Error(err))
                    }
                    callback(null,{
                        url : oss_url,
                        name : image.name
                    })
                })
            });
        },

        admin : {
            menu : function(custom_header,callback) {
                custom_header.plugins.push({
                    route: '/plugins/aly',
                    icon: 'fa-picture-o',
                    name: 'Aliyun OSS'
                });
                callback(null, custom_header);
            }
        }
    };
    module.exports = NALY;
})();