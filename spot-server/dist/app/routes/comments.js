import express from"express";const router=express.Router();import uuid from"uuid";import posts from"@db/posts";import reports from"@db/reports";import comments from"@db/comments";import accounts from"@db/accounts";import tags from"@db/tags";import notifications from"@db/notifications";import commentsService from"@services/comments";import imageService from"@services/image";import authorization from"@services/authorization/authorization";const singleUpload=imageService.upload.single("image");import rateLimiter from"@helpers/rateLimiter";import*as CommentsError from"@exceptions/comments";import*as AuthenticationError from"@exceptions/authentication";import ErrorHandler from"@helpers/errorHandler";import{COMMENTS_CONSTANTS}from"@constants/comments";import roles from"@services/authorization/roles";import config from"@config/config";router.use(function timeLog(req,res,next){next()});router.get("/activity",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}const accountId=req.user.id;const before=req.query.before?new Date(req.query.before):null;const after=req.query.after?new Date(req.query.after):null;const limit=Number(req.query.limit);comments.getCommentsActivity(accountId,before,after,limit).then(async activities=>{for(let i=0;i<activities.length;i++){try{activities[i].content=await commentsService.addTagsToContent(activities[i].id,accountId,activities[i].account_id,activities[i].content)}catch(err){return next(new CommentsError.CommentActivity(500))}}const response={activity:activities,size:activities.length,cursor:{before:activities.length>0?activities[0].creation_date:null,after:activities.length>0?activities[activities.length-1].creation_date:null}};res.status(200).json(response)},err=>{return next(new CommentsError.CommentActivity(500))})});router.get("/:postId",ErrorHandler.catchAsync(async function(req,res,next){const postId=req.params.postId;const commentLink=req.query.comment;let date=req.query.date;let type=req.query.type;let limit=Number(req.query.limit);let commentsArray=[];if(commentLink){try{const comment=await comments.getCommentByLink(commentLink,req.authenticated?req.user.id:null);if(comment.length<1){return next(new CommentsError.GetComments(500))}if(comment[0].parent_id){let parent;if(req.authenticated){parent=await comments.getCommentById(comment[0].parent_id,req.user.id)}else{parent=await comments.getCommentByIdNoAccount(comment[0].parent_id)}date=parent[0].creation_date;commentsArray=commentsArray.concat(parent)}else{date=comment[0].creation_date;commentsArray=commentsArray.concat(comment)}type="before";limit-=1;const rows=await comments.getCommentByPostId(postId,date,limit,type,req.authenticated?req.user.id:null);commentsArray=commentsArray.concat(rows)}catch(err){return next(new CommentsError.GetComments(500))}}else{try{const rows=await comments.getCommentByPostId(postId,date,limit,type,req.authenticated?req.user.id:null);commentsArray=commentsArray.concat(rows)}catch(err){return next(new CommentsError.GetComments(500))}}try{await commentsService.getTags(commentsArray,req.authenticated?req.user.id:null).then(taggedComments=>{commentsArray=taggedComments})}catch(err){return next(new CommentsError.GetComments(500))}let numCommentsBefore=0;let numCommentsAfter=0;if(type=="before"){if(commentsArray.length>0){const lastDate=commentsArray[commentsArray.length-1].creation_date;await comments.getNumberOfCommentsForPostBeforeDate(postId,lastDate).then(num=>{numCommentsBefore=num[0].total},err=>{return next(new CommentsError.GetComments(500))});const firstDate=commentsArray[0].creation_date;await comments.getNumberOfCommentsForPostAfterDate(postId,firstDate).then(num=>{numCommentsAfter=num[0].total},err=>{return next(new CommentsError.GetComments(500))})}}try{const postCreator=await posts.getPostCreator(postId);const a=await commentsService.addProfilePicture(commentsArray,postCreator[0].account_id);commentsArray=a}catch(err){return next(new CommentsError.GetComments(500))}const response={postId:postId,comments:commentsArray,totalCommentsBefore:numCommentsBefore,totalCommentsAfter:numCommentsAfter,type:type};res.status(200).json(response)}));router.get("/:postId/:commentId",ErrorHandler.catchAsync(async function(req,res,next){const postId=req.params.postId;const commentId=req.params.commentId;const replyLink=req.query.reply;const date=req.query.date||null;const limit=Number(req.query.limit);let replies;if(replyLink){try{const comment=await comments.getCommentByLink(replyLink,req.authenticated?req.user.id:null);if(comment.length<1){return next(new CommentsError.GetReplies(500))}if(comment[0].parent_id==commentId){replies=await comments.getRepliesUpToDate(postId,commentId,comment[0].creation_date,req.authenticated?req.user.id:null)}else{replies=await comments.getRepliesByCommentId(postId,commentId,date,limit,req.authenticated?req.user.id:null)}}catch(err){return next(new CommentsError.GetReplies(500))}}else{replies=await comments.getRepliesByCommentId(postId,commentId,date,limit,req.authenticated?req.user.id:null)}await commentsService.getTags(replies,req.authenticated?req.user.id:null).then(taggedComments=>{replies=taggedComments});const lastDate=replies.length>0?replies[replies.length-1].creation_date:null;comments.getNumberOfRepliesForCommentAfterDate(postId,commentId,lastDate).then(num=>{posts.getPostCreator(postId).then(async postCreator=>{await commentsService.addProfilePicture(replies,postCreator[0].account_id);const response={postId:postId,commentId:commentId,replies:replies,totalRepliesAfter:num[0].total};res.status(200).json(response)},err=>{return next(new CommentsError.GetReplies(500))})},err=>{return next(new CommentsError.GetReplies(500))})}));router.post("/:postId",rateLimiter.createCommentLimiter,ErrorHandler.catchAsync(async(req,res,next)=>{if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(!req.verified){return next(new AuthenticationError.VerifyError(400))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.AddComment(500))}const accountId=req.user.id;const commentId=uuid.v4();req.filename=commentId;singleUpload(req,res,async function(error){if(error){return next(new CommentsError.CommentImage(422))}const{content,tagsList,location}=JSON.parse(req.body.json);const image=req.file?req.file.location:null;const postId=req.params.postId;const inRange=await commentsService.inRange(postId,location.latitude,location.longitude);if(!inRange){return next(new CommentsError.NotInRange(400))}if(content.split(/\r\n|\r|\n/).length>COMMENTS_CONSTANTS.MAX_LINE_LENGTH){return next(new CommentsError.InvalidCommentLineLength(400,COMMENTS_CONSTANTS.MAX_LINE_LENGTH))}if(content.length===0&&!image&&tagsList.length===0){return next(new CommentsError.NoCommentContent(400))}const contentError=commentsService.validContent(content);if(contentError){return next(contentError)}const link=await commentsService.generateLink();let imageNsfw=false;if(config.testNsfwLocal&&image){try{imageNsfw=await imageService.predictNsfw(image)}catch(err){}}comments.addComment(commentId,postId,accountId,content,image,imageNsfw,link,commentId).then(async comment=>{if(config.testNsfwLambda&&image){imageService.predictNsfwLambda(image).then(result=>{if(Object.prototype.hasOwnProperty.call(result,"StatusCode")&&result.StatusCode===200){const payload=JSON.parse(result.Payload);if(payload.statusCode===200){const predict=JSON.parse(payload.body);if(Object.prototype.hasOwnProperty.call(predict,"className")){const isNsfw=predict.className==="Porn"||predict.className==="Hentai";comments.updateNsfw(commentId,isNsfw)}}}},err=>{})}for(let index=0;index<tagsList.length;index++){try{const account=await accounts.getAccountByUsername(tagsList[index].username);await tags.addTag(account[0].id,comment[0].id,Math.min(tagsList[index].offset,content.length));await notifications.addCommentNotification(accountId,account[0].id,comment[0].post_id,comment[0].id)}catch(err){return next(new CommentsError.AddComment(500))}}await commentsService.getTags(comment,accountId).then(taggedComments=>{comment=taggedComments},err=>{return next(new CommentsError.AddComment(500))});posts.getPostCreator(postId).then(async postCreator=>{await commentsService.addProfilePicture(comment,postCreator[0].account_id);res.status(200).json({postId:postId,comment:comment[0]})},err=>{return next(new CommentsError.AddComment(500))})},err=>{return next(new CommentsError.AddComment(500))})})}));router.post("/:postId/:commentId",rateLimiter.createCommentLimiter,ErrorHandler.catchAsync(async function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(!req.verified){return next(new AuthenticationError.VerifyError(400))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.AddComment(500))}const accountId=req.user.id;const replyId=uuid.v4();req.filename=replyId;singleUpload(req,res,async function(err){if(err){return next(new CommentsError.CommentImage(422))}const{content,tagsList,commentParentId,location}=JSON.parse(req.body.json);const image=req.file?req.file.location:null;const postId=req.params.postId;const commentId=req.params.commentId;const inRange=await commentsService.inRange(postId,location.latitude,location.longitude);const isTagged=await tags.TaggedInCommentChain(commentParentId,accountId);if(!inRange&&!isTagged){return next(new CommentsError.NotTagged(400))}else if(!inRange){return next(new CommentsError.NotInRange(400))}if(content.split(/\r\n|\r|\n/).length>COMMENTS_CONSTANTS.MAX_LINE_LENGTH){return next(new CommentsError.InvalidCommentLineLength(400,COMMENTS_CONSTANTS.MAX_LINE_LENGTH))}if(content.length===0&&!image&&tagsList.length===0){return next(new CommentsError.NoCommentContent(400))}const contentError=commentsService.validContent(content);if(contentError){return next(contentError)}const link=await commentsService.generateLink();let imageNsfw=false;if(config.testNsfwLocal&&image){try{imageNsfw=await imageService.predictNsfw(image)}catch(err){}}comments.addReply(replyId,postId,commentId,commentParentId,accountId,content,image,imageNsfw,link).then(async reply=>{if(config.testNsfwLambda&&image){imageService.predictNsfwLambda(image).then(result=>{if(Object.prototype.hasOwnProperty.call(result,"StatusCode")&&result.StatusCode===200){const payload=JSON.parse(result.Payload);if(payload.statusCode===200){const predict=JSON.parse(payload.body);if(Object.prototype.hasOwnProperty.call(predict,"className")){const isNsfw=predict.className==="Porn"||predict.className==="Hentai";comments.updateNsfw(replyId,isNsfw)}}}},err=>{})}for(let index=0;index<tagsList.length;index++){try{const account=await accounts.getAccountByUsername(tagsList[index].username);await tags.addTag(account[0].id,reply[0].id,Math.min(tagsList[index].offset,content.length));await notifications.addReplyNotification(accountId,account[0].id,reply[0].post_id,reply[0].parent_id,reply[0].id)}catch(err){return next(new CommentsError.AddComment(500))}}await commentsService.getTags(reply,accountId).then(taggedComments=>{reply=taggedComments});posts.getPostCreator(postId).then(async postCreator=>{await commentsService.addProfilePicture(reply,postCreator[0].account_id);const response={postId:postId,commentId:commentId,reply:reply[0]};res.status(200).json(response)},err=>{return next(new CommentsError.AddComment(500))})},err=>{return next(new CommentsError.AddComment(500))})})}));router.delete("/:postId/:commentId",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.DeleteComment(500))}const postId=req.params.postId;const commentId=req.params.commentId;const accountId=req.user.id;comments.checkOwned(postId,accountId).then(owned=>{if(owned||authorization.checkRole(req.user,[roles.owner,roles.admin])){comments.deleteCommentById(commentId).then(rows=>{comments.deleteReplyByParentId(commentId).then(rows=>{const response={postId:postId,commentId:commentId};res.status(200).json(response)},err=>{return next(new CommentsError.DeleteComment(500))})},err=>{return next(new CommentsError.DeleteComment(500))})}else{return next(new CommentsError.DeleteComment(500))}},err=>{return next(new CommentsError.DeleteComment(500))})});router.delete("/:postId/:parentId/:commentId",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.DeleteReply(500))}const postId=req.params.postId;const parentId=req.params.parentId;const commentId=req.params.commentId;const accountId=req.user.id;comments.checkOwned(postId,accountId).then(owned=>{if(owned||authorization.checkRole(req.user,[roles.owner,roles.admin])){comments.deleteCommentById(commentId).then(rows=>{const response={postId:postId,parentId:parentId,commentId:commentId};res.status(200).json(response)},err=>{return next(new CommentsError.DeleteReply(500))})}else{return next(new CommentsError.DeleteReply(500))}},err=>{return next(new CommentsError.DeleteReply(500))})});router.put("/:postId/:commentId/like",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.LikeComment(500))}const postId=req.params.postId;const commentId=req.params.commentId;const accountId=req.user.id;comments.likeComment(commentId,accountId).then(rows=>{const response={postId:postId,commentId:commentId};res.status(200).json(response)},err=>{return next(new CommentsError.LikeComment(500))})});router.put("/:postId/:commentId/dislike",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.DislikeComment(500))}const postId=req.params.postId;const commentId=req.params.commentId;const accountId=req.user.id;comments.dislikeComment(commentId,accountId).then(rows=>{const response={postId:postId,commentId:commentId};res.status(200).json(response)},err=>{return next(new CommentsError.DislikeComment(500))})});router.put("/:postId/:commentId/unrated",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.UnratedComment(500))}const postId=req.params.postId;const commentId=req.params.commentId;const accountId=req.user.id;comments.unratedComment(commentId,accountId).then(rows=>{const response={postId:postId,commentId:commentId};res.status(200).json(response)},err=>{return next(new CommentsError.UnratedComment(500))})});router.put("/:postId/:parentId/:commentId/like",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.LikeReply(500))}const postId=req.params.postId;const parentId=req.params.parentId;const commentId=req.params.commentId;const accountId=req.user.id;comments.likeComment(commentId,accountId).then(rows=>{const response={postId:postId,parentId:parentId,commentId:commentId};res.status(200).json(response)},err=>{return next(new CommentsError.LikeReply(500))})});router.put("/:postId/:parentId/:commentId/dislike",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.DislikeReply(500))}const postId=req.params.postId;const parentId=req.params.parentId;const commentId=req.params.commentId;const accountId=req.user.id;comments.dislikeComment(commentId,accountId).then(rows=>{const response={postId:postId,parentId:parentId,commentId:commentId};res.status(200).json(response)},err=>{return next(new CommentsError.DislikeReply(500))})});router.put("/:postId/:parentId/:commentId/unrated",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.UnratedComment(500))}const postId=req.params.postId;const parentId=req.params.parentId;const commentId=req.params.commentId;const accountId=req.user.id;comments.unratedComment(commentId,accountId).then(rows=>{const response={postId:postId,parentId:parentId,commentId:commentId};res.status(200).json(response)},err=>{return next(new CommentsError.UnratedComment(500))})});router.put("/:postId/:commentId/report",rateLimiter.genericCommentLimiter,function(req,res,next){if(!req.authenticated){return next(new AuthenticationError.AuthenticationError(401))}if(authorization.checkRole(req.user,[roles.guest])){return next(new CommentsError.ReportComment(500))}const postId=req.params.postId;const commentId=req.params.commentId;const accountId=req.user.id;const{content,category}=req.body;reports.addCommentReport(postId,commentId,accountId,content,category).then(rows=>{res.status(200).send({})},err=>{return next(new CommentsError.ReportComment(500))})});export default router;
//# sourceMappingURL=comments.js.map