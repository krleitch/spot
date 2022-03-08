
import shortid from 'shortid';

// services
import badwords from '@services/badwords.js';

// db
import prismaSpot from '@db/prisma/spot.js';

// error
import * as spotError from '@exceptions/spot.js';
import { SpotError } from '@exceptions/error.js';

// constants
import { POSTS_CONSTANTS } from '@constants/posts.js';

const generateSpotLink = async (): Promise<string> => {
  // Need to make sure the link isnt already taken
  let link: string;
  let exists: boolean;
  do {
    link = shortid.generate();
    exists = await prismaSpot.linkExists(link);
  } while (exists);
  return link;
}

const checkValidSpotContent = (content: string): SpotError | null => {
  if (
    content.length < POSTS_CONSTANTS.MIN_CONTENT_LENGTH ||
    content.length > POSTS_CONSTANTS.MAX_CONTENT_LENGTH
  ) {
    return new spotError.InvalidSpotLength(
      400,
      POSTS_CONSTANTS.MIN_CONTENT_LENGTH,
      POSTS_CONSTANTS.MAX_CONTENT_LENGTH
    );
  }

  // Only ASCII characters allowed currently
  // content field is setup as utf8mb4 so emoji can be added later
  // eslint-disable-next-line no-control-regex
  if (!/^[\x00-\x7F]*$/.test(content)) {
    return new spotError.InvalidSpotContent();
  }

  const profane = badwords.checkProfanityIndex(content);
  if (profane) {
    return new spotError.InvalidSpotProfanity(400, profane);
  }

  return null;
}

export default { generateSpotLink, checkValidSpotContent };