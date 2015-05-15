var fs = require('fs'),
pjson = require('./package.json');

function getFilesFromDirectory(dir,callback) {
    var files = [];
    fs.readdir(dir, function(err, childs) {
        if(err) return callback(err,files);
        var dirs = [];
        childs.forEach(function(child) {
            var child = [dir, child].join('/');
            var stats = fs.statSync(child);
            if (stats.isDirectory()) {
                dirs.push(child);
            } else {
                files.push(child);
            }
        });
        var dirsCount = dirs.length;
        if (dirsCount == 0) {
            callback(null,files);
        }
        dirs.forEach(function(dir) {
            getFilesFromDirectory(dir, function(err,f) {
                dirsCount--;
                files = files.concat(f);
                if (dirsCount == 0) {
                    callback(null,files);
                }
            });
        });
    });
}

function removeComments(string, preserveSpace){
    var preserveSpace = preserveSpace || true;
    var reg = /<![ \r\n\t]*(?:--(?:[^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/;
    return string.replace(reg,function(m){
        return preserveSpace ? m.split('\n').map(function(){return ''}).join('\n') : '';
    });
}

function removeTag(tag,string,preserveSpace){
    var preserveSpace = preserveSpace || true;
    var reg = new RegExp('<'+tag+'[^>]*>([^<]*(?:(?!<\/'+tag+'>)<[^<]*)*)<\/'+tag+'>','ig');
    return string.replace(reg,function(m){
        return preserveSpace ? m.split('\n').map(function(){return ''}).join('\n') : '';
    });	
}

function cleanHtml(string){
    var tagsToRemove = ['style','script','noscript','svg'];
    tagsToRemove.forEach(function(tag){
        string = removeTag(tag,string);
    });
    string = removeComments(string);
    return string;
}

function isClosingTagOf(tag){
    var spl = tag.split('/');
    return spl.length === 2 && spl[1];
}

function isSelfClosingTag(tag){
    var selfClosingTags = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'comment',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
    ];
    return (selfClosingTags.indexOf(tag) > -1);
}

function findUnclosed(string){
    var reg = /(<(\/?[a-z]*)[^>]*)/igm,
    tagsStack = [],
    tags = [],
    string = cleanHtml(string),
    errors = [];

    string.split('\n').forEach(function(line,i){        
        while ((match = reg.exec(line)) !== null) {
            tags.push({name:match[2],tag:match[1],line:i+1});
        }		
    });

    tags.forEach(function(tag){
        var tagName = tag.name;
        if(!tagName || isSelfClosingTag(tagName)) return;
        if(closing = isClosingTagOf(tagName)){
            if(tagsStack.length == 0){
                errors.push(['Closing tag',tag.tag, 'defined on line',tag.line,'doesn\'t have corresponding open tag'].join(' '));
                return;
            }
            var op = tagsStack.pop();
            if(closing != op.name){
                errors.push(['Close tag',tag.tag, 'defined on line',tag.line,'doesn\'t match open tag',op.tag,'defined on line',op.line].join(' '));
                return;
            }
        }else{
            tagsStack.push(tag);
        }
    });

    tagsStack.forEach(function(tag){
        errors.push(['Unclosed tag',tag.tag,'defined on line',tag.line].join(' '));
    });

    return {passed:!errors.length, errors: errors};
}

function analyze(path){
    getFilesFromDirectory(path,function(err,files){
        var errorCount = 0;
        var filesCount = 0;
        files.forEach(function(f){
            if(f.split('.').pop() != 'html') return;
            console.log('html',f);
            filesCount++;
            var content = fs.readFileSync(f,'utf-8');
            console.log('Analyzing file: '+f);
            var result = findUnclosed(content);
            if(result.passed){
                console.log('OK:',f);
            }else{
                errorCount++;
                result.errors.forEach(function(e){console.log('ERROR:',f,e)});
            }
        });
        console.log([errorCount,filesCount].join('/'), 'html files with errors');
    });
}

module.exports = {
    analyze: analyze
}