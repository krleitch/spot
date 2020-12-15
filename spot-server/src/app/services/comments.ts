export { addProfilePicture, getTags, addTagsToContent, generateLink, validContent, inRange }

const shortid = require('shortid');

// services
const badwords = require('@services/badwords');
const locations = require('@services/locations');
const aws = require('@services/aws');

// db
const posts = require('@db/posts');
const comments = require('@db/comments');
const accounts = require('@db/accounts');
const tags = require('@db/tags');

// error
const CommentsError = require('@exceptions/comments');

// constants
const comments_constants = require('@constants/comments');
const COMMENTS_CONSTANTS = comments_constants.COMMENTS_CONSTANTS;

// sources
const profileImages = require('@src/app/profileImages');

function validContent(content: string): Error | null {

	if ( content.length < COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH || content.length > COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH ) {
		return new CommentsError.InvalidCommentLength(400);
	}

	// Only ASCII characters allowed currently
	// content field is setup as utf8mb4 so emoji can be added later
	if ( ! /^[\x00-\x7F]*$/.test(content) ) {
		return new CommentsError.InvalidCommentContent(400);
	};

	if ( badwords.checkProfanity(content) ) {
		return new CommentsError.InvalidCommentProfanity(400);
	}

	return null;

}

// Profile Pictures

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

    // TODO: Can take a better look behind the math of this to ensure its actually random enough

    return (result % (upperbound - lowerbound)) + lowerbound;

}

async function getProfilePictureFromBucket( index: number ) {

    // TODO: REMOVE
    // SAVE on requests to the bucket
    // Uncomment when not poor :(

    if ( index === -1 ) {
        return aws.getUrlFromBucket('profile/op.png');
    }

    return aws.getUrlFromBucket(profileImages[index % profileImages.length])

    // This code should be moved somewhere else

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

async function addProfilePicture( comments: any, postCreator: string) {

    for (let i = 0; i < comments.length; i++ ) {

        let index;
        if ( comments[i].account_id == postCreator ) {
            index = -1;
        } else {
            index = stringToInt( combineStrings(comments[i].account_id, comments[i].post_id), 0, profileImages.length * COMMENTS_CONSTANTS.PROFILE_COLORS_COUNT);
        }

        // Get the image and save the Index
        comments[i].profilePictureSrc = await getProfilePictureFromBucket(index % profileImages.length);
        comments[i].profilePicture = index % COMMENTS_CONSTANTS.PROFILE_COLORS_COUNT;
        delete comments[i].account_id;

    }

    return comments;

}

// Tags

async function getTags( comments: any, accountId: string ): Promise<any[]> {

    // get tags for each reply
    for ( let index = 0; index < comments.length; index++ ) {
        await tags.getTagsByCommentId(comments[index].id).then( async (tagList: any) => {

            // The required properties
            let tagObject: {
                owned: boolean; // you own the tag
                numTagged: number; // how many people were tagged
                tagged: boolean; // you were  tagged
                tagger?: string; // only filled if tagged == true, who the tagger is
                tags: any[]; // list of the tags
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

async function addTagsToContent( commentId: string, accountId: string, commentAccountId: string, commentContent: string ): Promise<string> {
    
    let ret = '';

    await tags.getTagsByCommentId(commentId).then( async (tagList: any) => {

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

        if ( accountId == commentAccountId ) {
            // You are the tagger

            tagObject.owned = true;

        }
        
        if ( tagList.map( (t: any) => t.account_id ).includes( accountId )) {
            // you got tagged

            tagObject.tagged = true;

            await accounts.getAccountById(commentAccountId).then( (account: any) => {
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

        // replace the content

        let myindex = 0;
    
        tagObject.tags.forEach( (tag: any) => {
            ret += commentContent.substring(myindex, tag.offset);
            ret += '@' + tag.username;
            myindex += tag.offset
        });

        ret += commentContent.substring(myindex, commentContent.length);

    }, (err: any) => {

    });

    return ret;

}

// Links

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

// Location

// is the user in range to make a comment
async function inRange( postId: string, latitude: number, longitude: number): Promise<boolean> {

    return posts.getPostByIdNoAccount(postId).then( (rows: any) => {

        if ( rows.length < 1 ) {
            return false;
        }

        const post = rows[0];
        const distance = locations.distanceBetween(post.latitude, post.longitude, latitude, longitude, 'm');

        return distance <= COMMENTS_CONSTANTS.MAX_DISTANCE;

    })
}
