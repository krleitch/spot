export { checkProfanity }

var Filter = require('bad-words');
var filter = new Filter({ replaceRegex:  /(\w+)/gi });

// remove words from filter
filter.removeWords('shit', 'hell');


function checkProfanity(text: string): boolean {
    return filter.isProfane(text);
}
