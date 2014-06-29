var http = require('http');
var path = require('path');
var fs = require('fs');

var MIME = {
    '.js':"application/javascript",
    ".css":'text/css'
};

var serverConfig = {
    port:8080,
    root:'.'
};


function compileFiles(files,callback){
    var output = [];
    (function next(i,len){
        if(i < len){
            console.log(files[i],'files[i]');
            fs.readFile(files[i],function(err,data){
                console.log(data,'data------');
                if(err){
                    callback(err);
                }else{
                    output.push(data);
                    next( i + 1,len);
                }
            });
        }else{
            callback(null,Buffer.concat(output));
        }
    })(0,files.length);
};


http.createServer(function(req,res){
    var parseResult = parseURL(req.url);
    compileFiles(parseResult.paths,function(err,data){
        if(err){
            res.writeHead(404);
            res.end(err.message);
        }else{
            res.writeHead(200,{
                'Content-Type': parseResult.mime
            });
            res.end(data);
        }
    });
}).listen(serverConfig.port);



function parseURL(requestUrl){
    var output = [];
    if(requestUrl.indexOf('/??') == -1){
        requestUrl = requestUrl.replace('/','/??');
    }
    var parts = requestUrl.split('??');
    var base = parts[0];
    var files = parts[1].split(',');

    output = files.map(function(file){
        return path.join(serverConfig.root ,base,file);
    });

    return {
        mime: MIME[path.extname(output[0]) ] || 'text/css',
        paths: output
    };
};
