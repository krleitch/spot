export { addProfilePicture, getTags }

const accounts = require('../db/accounts');
const tags = require('../db/tags');

function stringToIntHash(str: string, upperbound: number, lowerbound: number) {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      result = result + str.charCodeAt(i);
    }

    return (result % (upperbound - lowerbound)) + lowerbound;
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
            let tagObject = {
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
