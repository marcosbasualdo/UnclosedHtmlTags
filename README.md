# UnclosedHtmlTags
node module to analyze every html in a given directory and reports a list of files with unclosed html tags.

### Installation:
```sh
$ npm install unclosedhtmltags
```

### Usage:
```js
var unclosedhtmltags = require("unclosedhtmltags");
unclosedhtmltags.analyze('.'); //Analyze html in current directory (Recursively analizes children directories too)

// You can also analyze a single file by using the findUnclosed method passing 
// the html file content as string
var fs = require('fs');

var fileContent = fs.readFileSync('./myFile.html').toString();
var result = unclosedhtmltags.findUnclosed(fileContent);
if(result.passed){
    console.log('OK');
}else{
    result.errors.forEach(function(e){console.log('ERROR:', e.message)});
}
```