# UnclosedHtmlTags
node module to analyze every html in a given directory and reports a list of files with unclosed html tags.

###Installation:
```sh
$ npm install unclosedhtmltags
```

###Usage:
```js
var unclosedhtmltags = require("unclosedhtmltags");
unclosedhtmltags.analyze('.'); //Analyze html in current directory (Recursively analizes children directories too)
```