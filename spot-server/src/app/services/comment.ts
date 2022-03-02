import shortid from 'shortid';

// services
import badwords from '@services/badwords.js';
import locationService from '@services/location.js';
import aws from '@services/aws.js';

// db
import posts from '@db/posts.js';
import comments from '@db/comments.js';
import accounts from '@db/accounts.js';
import tags from '@db/tags.js';
import prismaSpot from '@db/../prisma/spot.js';
import prismaComment from '@db/../prisma/comment.js';
import prismaUser from '@db/../prisma/user.js';
import prismaCommentTag from '@db/../prisma/commentTag.js';

// error
import * as commentError from '@exceptions/comment.js';
import { SpotError } from '@exceptions/error.js';

// constants
import { COMMENT_CONSTANTS } from '@constants/comment.js';

// sources
import profileImages from '@helpers/profileImages.js';

// models
import P from '@prisma/client';
import { Tag, Comment, CommentTag } from '@models/../newModels/comment.js';

function validContent(content: string): SpotError | null {
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
}

// Profile Pictures

// Combine the 2 strings by xor them
function combineStrings(a: string, b: string): string {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  const result = Buffer.alloc(aBuffer.length);

  for (let i = 0; i < aBuffer.length; i++) {
    result[i] = aBuffer[i] ^ bBuffer[i];
  }

  return result.toString();
}

// Turn the string to an int [lowerbound, upperbound]
function stringToInt(str: string, lowerbound: number, upperbound: number) {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    result = result + str.charCodeAt(i);
  }

  // TODO: Can take a better look behind the math of this to ensure its actually random enough

  return (result % (upperbound - lowerbound)) + lowerbound;
}

async function getProfilePictureFromBucket(index: number) {
  // TODO: REMOVE
  // SAVE on requests to the bucket

  if (index === -1) {
    return 'op.png';
  }

  return profileImages[index % profileImages.length];

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

async function addProfilePicture(comments: any, postCreator: string) {
  for (let i = 0; i < comments.length; i++) {
    let index;
    if (comments[i].account_id == postCreator) {
      index = -1;
    } else {
      index = stringToInt(
        combineStrings(comments[i].account_id, comments[i].post_id),
        0,
        profileImages.length * COMMENTS_CONSTANTS.PROFILE_COLORS_COUNT
      );
    }

    // Get the image and save the Index
    comments[i].profilePictureSrc = await getProfilePictureFromBucket(
      index % profileImages.length
    );
    comments[i].profilePicture =
      index % COMMENTS_CONSTANTS.PROFILE_COLORS_COUNT;
    delete comments[i].account_id;
  }

  return comments;
}

// Add the tag object to the content, the client takes care of filling the content properly
const addTagsToComments = async (
  comments: P.Comment[],
  userId: string
): Promise<Array<P.Comment & { tag: CommentTag}>> => {
  // get tags for each reply

  const commentsWithTags =  await Promise.all(comments.map(async (comment) => {
    const tags = await prismaCommentTag.findTagsByCommentId(
      comment.commentId
    );
    let taggedBy = '';
    if (tags.map((t) => t.userId).includes(userId)) {
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
    }
  }));

  return commentsWithTags;
  
  for (let i = 0; i < comments.length; i++) {
    const tags = await prismaCommentTag.findTagsByCommentId(
      comments[i].commentId
    );

    // You were tagged, so get the tagger username
    if (tags.map((t) => t.userId).includes(userId)) {
      const tagger = await prismaUser.findUserById(comments[i].owner);
    }

    const tagList: Tag[] = [];
    for (let j = 0; j < tags.length; j++) {
      if (userId === comments[i].owner || userId === tags[j].userId) {
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



    await tags.getTagsByCommentId(comments[i].commentId).then(
      async (tagList: any) => {
        // The required properties
        const tagObject: {
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

        if (accountId == comments[index].account_id) {
          // You are the tagger

          tagObject.owned = true;
        }

        if (tagList.map((t: any) => t.account_id).includes(accountId)) {
          // you got tagged

          tagObject.tagged = true;

          await accounts.getAccountById(comments[index].account_id).then(
            (account: any) => {
              tagObject.tagger = account[0].username;
            },
            (err: any) => {}
          );
        }

        // add the tags, only include username if you own tag, or its you
        const tags: any[] = [];
        for (let tagIndex = 0; tagIndex < tagList.length; tagIndex++) {
          await accounts.getAccountById(tagList[tagIndex].account_id).then(
            (account: any) => {
              tags.push({
                username:
                  tagObject.owned || accountId == tagList[tagIndex].account_id
                    ? account[0].username
                    : '',
                offset: tagList[tagIndex].offset
              });
            },
            (err: any) => {}
          );
        }
        tagObject.tags = tags;

        comments[index].tag = tagObject;
      },
      (err: any) => {}
    );
  }

  return comments;
};

// For When we don't need the tag object, Content is filled by server
const addTagsToCommentsContent = async (
  userId: string,
  comments: P.Comment[]
): Promise<P.Comment> => {
  for (let i = 0; i < comments.length; i++) {
    const tags = await prismaCommentTag.findTagsByCommentId(
      comments[i].commentId
    );
    let currentIndex = 0;
    let newContent = '';
    for (let j = 0; j < tags.length; j++) {
      let username = '???';
      if (userId === tags[j].userId) {
      }
      newContent += comments[i].content.substring(currentIndex, tags[j].offset);
      newContent += tags[j].userId === '@' + tags[j].username;
      currentIndex += tags[j].offset;
    }
    tags.forEach((tag: P.CommentTag) => {});

    ret += commentContent.substring(myindex, commentContent.length);
  }

  await tags.getTagsByCommentId(commentId).then(
    async (tagList: any) => {
      // The required properties
      const tagObject: {
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

      if (accountId == commentAccountId) {
        // You are the tagger

        tagObject.owned = true;
      }

      if (tagList.map((t: any) => t.account_id).includes(accountId)) {
        // you got tagged

        tagObject.tagged = true;

        await accounts.getAccountById(commentAccountId).then(
          (account: any) => {
            tagObject.tagger = account[0].username;
          },
          (err: any) => {}
        );
      }

      // add the tags, only include username if you won tag, or its you
      const tags: any[] = [];
      for (let tagIndex = 0; tagIndex < tagList.length; tagIndex++) {
        await accounts.getAccountById(tagList[tagIndex].account_id).then(
          (account: any) => {
            tags.push({
              username:
                tagObject.owned || accountId == tagList[tagIndex].account_id
                  ? account[0].username
                  : '',
              offset: tagList[tagIndex].offset
            });
          },
          (err: any) => {}
        );
      }
      tagObject.tags = tags;

      // replace the content

      let myindex = 0;

      tagObject.tags.forEach((tag: any) => {
        ret += commentContent.substring(myindex, tag.offset);
        ret += '@' + tag.username;
        myindex += tag.offset;
      });

      ret += commentContent.substring(myindex, commentContent.length);
    },
    (err: any) => {}
  );

  return ret;
};

// Links

async function generateLink(): Promise<string> {
  // Need to make sure the link isnt already taken

  let link;
  let exists;
  do {
    link = shortid.generate();
    exists = await comments.linkExists(link);
  } while (exists);

  return link;
}

// Location

// is the user in range to make a comment
async function inRange(
  postId: string,
  latitude: number,
  longitude: number
): Promise<boolean> {
  return posts.getPostByIdNoAccount(postId).then((rows: any) => {
    // No post with this id
    if (rows.length < 1) {
      return false;
    }

    const post = rows[0];
    const distance = locations.distanceBetweenTwoLocations(
      post.latitude,
      post.longitude,
      latitude,
      longitude,
      'M'
    );

    return distance <= COMMENTS_CONSTANTS.MAX_DISTANCE;
  });
}

export default {
  addProfilePicture,
  getTags,
  addTagsToContent,
  generateLink,
  validContent,
  inRange
};
