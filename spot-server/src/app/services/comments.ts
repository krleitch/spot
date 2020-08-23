export { addProfilePicture, getTags, generateLink, validContent }

const shortid = require('shortid');

// services
const badwords = require('@services/badwords');
const aws = require('@services/aws');

// db
const comments = require('../db/comments');
const accounts = require('../db/accounts');
const tags = require('../db/tags');

// error
const CommentsError = require('@exceptions/comments');

// constants
const comments_constants = require('@constants/comments');
const COMMENTS_CONSTANTS = comments_constants.COMMENTS_CONSTANTS;

function validContent(content: string): Error | null {

	if ( content.length < COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH || content.length > COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH ) {
		return new CommentsError.InvalidPostLength(400);
	}

	// Only ASCII characters allowed currently
	// content field is setup as utf8mb4 so emoji can be added later
	if ( ! /^[\x00-\x7F]*$/.test(content) ) {
		return new CommentsError.InvalidPostContent(400);
	};

	if ( badwords.checkProfanity(content) ) {
		return new CommentsError.InvalidPostProfanity(400);
	}

	return null;

}

// Combine the 2 strings by xor them
function combineStrings(a: string, b: string): string {

    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    const result = Buffer.alloc(aBuffer.length);

    for ( let i = 0; i < aBuffer.length; i++ ) {
        result[i] = aBuffer[i] ^ bBuffer[i];
    }

    return result.toString();

}

// Turn the string to an int [lowerbound, upperbound]
function stringToInt(str: string, lowerbound: number, upperbound: number, ) {

    let result = 0;
    for (let i = 0; i < str.length; i++) {
      result = result + str.charCodeAt(i);
    }

    return (result % (upperbound - lowerbound)) + lowerbound;

}

async function addProfilePicture( comments: any, postCreator: string) {

    for (let i = 0; i < comments.length; i++ ) {

        let profilePictureIndex;
        if ( comments[i].account_id == postCreator ) {
            profilePictureIndex = -1;
        } else {
            profilePictureIndex = stringToInt( combineStrings(comments[i].account_id, comments[i].post_id), 1, COMMENTS_CONSTANTS.PROFILE_PICTURES_COUNT);
        }

        // Get the image and save the Index
        comments[i].profilePictureSrc = await getProfilePictureFromBucket(profilePictureIndex);
        comments[i].profilePicture = profilePictureIndex;
        delete comments[i].account_id;

    }

    return comments;

}

async function getProfilePictureFromBucket( index: number ) {

    // TODO: REMOVE
    // SAVE on requests to the bucket
    // Uncomment when not poor :(

    if ( index === -1 ) {
        return aws.getUrlFromBucket('profile/op.png');
    }

    const urls = [
        'profile/icons/icons8-avocado-48.png',
        'profile/icons/icons8-banana-split-48.png',
        'profile/icons/icons8-bao-bun-48.png',
        'profile/icons/icons8-beet-48.png',
        'profile/icons/icons8-cheese-48.png',
        'profile/icons/icons8-cute-pumpkin-48.png',
        'profile/icons/icons8-kawaii-french-fries-48.png',
        'profile/icons/icons8-kawaii-sushi-48.png'
    ];

    return aws.getUrlFromBucket(urls[index % urls.length])

    // var params = { 
    //     Bucket: 'spot',
    //     Delimiter: '/',
    //     Prefix: 'profile/icons/',
    // }

    // const s3Response = await aws.s3.listObjectsV2(params).promise();

    // if ( index === -1 ) {
    //     return aws.getUrlFromBucket('profile/op.png');
    // } else {
    //     // the first index is a dud /profile/icons/
    //     return aws.getUrlFromBucket(s3Response.Contents[index].Key);
    // }

}

async function getTags( comments: any, accountId: string ): Promise<any[]> {

    // get tags for each reply
    for ( let index = 0; index < comments.length; index++ ) {
        await tags.getTagsByCommentId(comments[index].id).then( async (tagList: any) => {

            // The required properties
            let tagObject: {
                owned: boolean;
                numTagged: number;
                tagged: boolean;
                tagger?: string; // only filled if tagged == true
                tags: any[];
            } = {
                owned: false,
                numTagged: tagList.length,
                tagged: false,
                tags: []
            };

            if ( accountId == comments[index].account_id ) {
                // You are the tagger

                tagObject.owned = true;

            }
            
            if ( tagList.map( (t: any) => t.account_id ).includes( accountId )) {
                // you got tagged

                tagObject.tagged = true;

                await accounts.getAccountById(comments[index].account_id).then( (account: any) => {
                    tagObject.tagger = account[0].username;
                });

            }

            // add the tags, only include username if you won tag, or its you
            let tags: any[] = [];
            for ( let tagIndex = 0; tagIndex < tagList.length; tagIndex++ ) {
                await accounts.getAccountById(tagList[tagIndex].account_id).then( (account: any) => {
                    tags.push({username: (tagObject.owned || accountId == tagList[tagIndex].account_id) ? account[0].username : '', offset: tagList[tagIndex].offset});
                });
            }
            tagObject.tags = tags;


            comments[index].tag = tagObject;

        }, (err: any) => {

        });

    }

    return comments;

}

async function generateLink(): Promise<string> {

	// Need to make sure the link isnt already taken

	let link;
	let exists;
	do {
		link = shortid.generate();
		exists = await comments.linkExists(link)
	} while (exists)

	return link

}
