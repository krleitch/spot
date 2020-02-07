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

        let profilePicture = stringToIntHash( comment.account_id + comment.post_id , 363, 0);
        if ( comment.account_id == postCreator ) {
            profilePicture = -1;
        }
        comment.profilePicture = profilePicture;
        delete comment.account_id;
    })

}
