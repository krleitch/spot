export { checkProfanity, checkProfanityIndex }

const Filter = require("badwords-filter");

// TODO: languages

// this list should be better and populated from various sources
const badwordsList = [
    "n1gger",
    "n1gg3r",
    "n1ggers",
    "n1gg3rs",
    "nigger",
    "niggers",
    "chink",
    "chinks",
    "faggot",
    "fag",
    "fags",
    "spick",
    "spicks",
];

const config = {
    list: badwordsList,
    cleanWith: "*",
    useRegex: false,
};

const filter = new Filter(config);

function checkProfanity(text: string): boolean {
    return filter.isUnclean(text);
}

// Return the first word that is profane
function checkProfanityIndex(text: string): string | null {
    const index = filter.getUncleanWordIndexes(text);

    if ( index.length < 0 ) {
        return null;
    }

    return text.split(/\b\s+/)[index[0]];
}
