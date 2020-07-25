export { addProfilePicture, getTags, generateLink, validContent }

const shortid = require('shortid');

// services
const badwords = require('@services/badwords');

// db
const accounts = require('../db/accounts');
const tags = require('../db/tags');

// error
const CommentsError = require('@exceptions/comments');

// constants
const comments_constants = require('@constants/comments');
const COMMENTS_CONSTANTS = comments_constants.COMMENTS_CONSTANTS;

function stringToIntHash(str: string, upperbound: number, lowerbound: number) {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      result = result + str.charCodeAt(i);
    }

    return (result % (upperbound - lowerbound)) + lowerbound;
}

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

function addProfilePicture( comments: any, postCreator: string) {

    comments.forEach( (comment: any) => {
        let profilePicture = stringToIntHash( comment.account_id + comment.post_id , 363, 0);
        if ( comment.account_id == postCreator ) {
            profilePicture = -1;
        }
        comment.profilePicture = profilePicture;
        delete comment.account_id;
    })

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
                tagger?: string;
                names?: string[];
            } = {
                owned: false,
                numTagged: tagList.length,
                tagged: false
            };

            if ( accountId == comments[index].account_id ) {
                // You are the tagger

                tagObject.owned = true;
                let names: any[] = [];

                for ( let tagIndex = 0; tagIndex < tagList.length; tagIndex++ ) {
                    await accounts.getAccountById(tagList[tagIndex].account_id).then( (account: any) => {
                        names.push(account[0].username);
                    });
                }

                tagObject.names = names;

            } else if ( tagList.map( (t: any) => t.account_id ).includes( accountId )) {
                // you got tagged

                tagObject.tagged = true;

                await accounts.getAccountById(comments[index].account_id).then( (account: any) => {
                    tagObject.tagger = account[0].username;
                });

            } else {
                // you have no relation
            }
            comments[index].tag = tagObject;
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
		exists = await posts.linkExists(link)
	} while (exists)

	return link

}
