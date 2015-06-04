var nodecr = require('nodecr');
 
// Recognise text of any language in any format
nodecr.process(__dirname + '/test.png',function(err, text) {
    if(err) {
        console.error(err);
    } else {
        console.log(text);
    }
});