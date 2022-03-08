import shortid from 'shortid';

// services
import badwords from '@services/badwords.js';
import locationService from '@services/location.js';

// db
import prismaSpot from '@db/prisma/spot.js';
import prismaComment from '@db/prisma/comment.js';
import prismaUser from '@db/prisma/user.js';
import prismaCommentTag from '@db/prisma/commentTag.js';

// error
import * as commentError from '@exceptions/comment.js';
import { SpotError } from '@exceptions/error.js';

// constants
import { COMMENT_CONSTANTS } from '@constants/comment.js';

// sources
import profileImages from '@helpers/profileImages.js';

// models
import P from '@prisma/client';
import { Tag, Comment, CommentTag } from '@models/comment.js';

const validCommentContent = (content: string): SpotError | null => {
  if (
    content.length < COMMENT_CONSTANTS.MIN_CONTENT_LENGTH ||
    content.length > COMMENT_CONSTANTS.MAX_CONTENT_LENGTH
  ) {
    return new commentError.InvalidCommentLength(
      400,
      COMMENT_CONSTANTS.MIN_CONTENT_LENGTH,
      COMMENT_CONSTANTS.MAX_CONTENT_LENGTH
    );
  }

  // Only ASCII characters allowed currently
  // content field is setup as utf8mb4 so emoji can be added later
  // eslint-disable-next-line no-control-regex
  if (!/^[\x00-\x7F]*$/.test(content)) {
    return new commentError.InvalidCommentContent(400);
  }

  if (badwords.checkProfanity(content)) {
    return new commentError.InvalidCommentProfanity(400);
  }

  return null;
};

// Profile Pictures

// Combine the 2 strings by xor them
const combineStrings = (a: string, b: string): string => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  const result = Buffer.alloc(aBuffer.length);
  for (let i = 0; i < aBuffer.length; i++) {
    result[i] = aBuffer[i] ^ bBuffer[i];
  }
  return result.toString();
};

// Turn the string to an int [lowerbound, upperbound]
const stringToInt = (str: string, lowerbound: number, upperbound: number) => {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    result = result + str.charCodeAt(i);
  }
  return (result % (upperbound - lowerbound)) + lowerbound;
};

const addProfilePicturesToComments = async (
  comments: Array<P.Comment & {tag: CommentTag}>,
  spotOwnerId: string
) => {
  const commentsWithProfilePicture = await Promise.all(
    comments.map((comment) => {
      // op is -1
      if (comment.owner === spotOwnerId) {
        return {
          ...comment,
          profilePictureNum: -1,
          profilePictureSrc: 'op.png'
        };
      }

      const index = stringToInt(
        combineStrings(comment.owner, comment.spotId),
        0,
        profileImages.length * COMMENT_CONSTANTS.PROFILE_COLORS_COUNT
      );
      return {
        ...comment,
        profilePictureNum: index % COMMENT_CONSTANTS.PROFILE_COLORS_COUNT,
        profilePictureSrc: profileImages[index % profileImages.length]
      };
    })
  );
  return commentsWithProfilePicture;
};

// Add the tag object to the content, the client takes care of filling the content properly
const addTagsToComments = async (
  comments: P.Comment[],
  userId: string | undefined
) => {
  const commentsWithTags = await Promise.all(
    comments.map(async (comment) => {
      const tags = await prismaCommentTag.findTagsByCommentId(
        comment.commentId
      );
      let taggedBy = '';
      if (userId && tags.map((t) => t.userId).includes(userId)) {
        const tagger = await prismaUser.findUserById(comment.owner);
        taggedBy = tagger ? tagger.username : '';
      }
      const tagList: Tag[] = [];
      for (let j = 0; j < tags.length; j++) {
        if (userId === comment.owner || userId === tags[j].userId) {
          const user = await prismaUser.findUserById(tags[j].userId);
          tagList.push({
            offset: tags[j].offset,
            username: user ? user.username : ''
          });
        } else {
          tagList.push({
            offset: tags[j].offset,
            username: ''
          });
        }
      }
      return {
        ...comment,
        tag: {
          tagged: taggedBy !== '',
          taggedBy: taggedBy,
          tags: tagList
        }
      };
    })
  );
  return commentsWithTags;
};

// Generate a comment link that is unique
const generateCommentLink = async (): Promise<string> => {
  let link: string;
  let exists: boolean;
  do {
    link = shortid.generate();
    exists = await prismaComment.linkExists(link);
  } while (exists);
  return link;
};

// Is the user in range to make a comment
const userInRangeForComment = async (
  spotId: string,
  latitude: number,
  longitude: number
): Promise<boolean> => {
  const spot = await prismaSpot.findSpotById(spotId);
  if (!spot) {
    return false;
  }
  const distance = locationService.distanceBetweenTwoLocations(
    Number(spot.latitude),
    Number(spot.longitude),
    latitude,
    longitude,
    'M'
  );
  return distance <= COMMENT_CONSTANTS.MAX_DISTANCE;
};

export default {
  addProfilePicturesToComments,
  addTagsToComments,
  generateCommentLink,
  validCommentContent,
  userInRangeForComment
};