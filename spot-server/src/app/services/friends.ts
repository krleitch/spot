export { addFacebookFriends }

const request = require('request');

// Converts all friends of the user to SPOT friends
// Performs this once facebook account is connected
// TODO: need to get app reviewed first
// Must disconnect and reconnect to run again, should provide a sync feature after time
function addFacebookFriends(accessToken: String, accountId: string): Promise<any> {
    
    const url = "https://graph.facebook.com/me/friends&access_token=" + accessToken;

    return new Promise((resolve, reject) => {
        request(url, function (error: any, response: any, body: any) {
            if (error) {
                return reject(error);
            }

            body = JSON.parse(body);
            
            resolve({response: response, body: JSON.parse(body)});
          });
    });

}