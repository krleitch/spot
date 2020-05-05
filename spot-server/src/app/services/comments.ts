export { addProfilePicture }


function stringToIntHash(str: string, upperbound: number, lowerbound: number) {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      result = result + str.charCodeAt(i);
    }

    return (result % (upperbound - lowerbound)) + lowerbound;
}

function addProfilePicture( comments: any, postCreator: string) {

    comments.forEach( (comment: any) => {

        // Add profiles to tags
        comment.tagList.forEach( (tag: any ) => {
            let profilePicture = stringToIntHash( tag.account_id + comment.post_id , 363, 0);
            if ( tag.account_id == postCreator ) {
                profilePicture = -1;
            }
            tag.profilePicture = profilePicture;
            delete tag.account_id;
        });

        let profilePicture = stringToIntHash( comment.account_id + comment.post_id , 363, 0);
        if ( comment.account_id == postCreator ) {
            profilePicture = -1;
        }
        comment.profilePicture = profilePicture;
        delete comment.account_id;
    })

}
