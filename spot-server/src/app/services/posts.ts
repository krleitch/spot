export { calcDistance, generateLink, validContent }

const shortid = require('shortid');

// services
const badwords = require('@services/badwords');

// db
const posts = require('@db/posts');

// error
const PostsError = require('@exceptions/posts');

// constants
const CONSTANTS = require('@constants/posts');

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

function validContent(content: string): Error | null {

	if ( content.length < CONSTANTS.MIN_CONTENT_LENGTH || content.length > CONSTANTS.MAX_CONTENT_LENGTH ) {
		return new PostsError.InvalidPostLength(400);
	}

	// Only ASCII characters allowed currently
	// content field is setup as utf8mb4 so emoji can be added later
	if ( ! /^[\x00-\x7F]*$/.test(content) ) {
		return new PostsError.InvalidPostContent(400);
	};

	if ( badwords.checkProfanity(content) ) {
		return new PostsError.InvalidPostProfanity(400);
	}

	return null;

}

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number, unit: string) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}
