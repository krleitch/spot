DROP TRIGGER IF EXISTS comment_rating_create;
DROP TRIGGER IF EXISTS comment_rating_change;
DROP TRIGGER IF EXISTS comment_rating_delete;

delimiter $$

create trigger comment_rating_create
after insert on CommentRating
for each row
begin
IF ( new.rating = CommentRatingType.LIKE ) THEN
    update Comment set likes = likes + 1 where id = new.commentId;
ELSE
    update Comment set dislikes = dislikes + 1 where id = new.commentId;
END IF;
end$$

create trigger comment_rating_change
after update on CommentRating
for each row
begin
IF ( old.rating = CommentRatingType.LIKE ) THEN
    update Comment set likes = likes - 1 where id = new.commentId;
    update Comment set dislikes = dislikes + 1 where id = new.commentId;
ELSE
    update Comment set dislikes = dislikes - 1 where id = new.commentId;
    update Comment set likes = likes + 1 where id = new.commentId;
END IF;
end$$

create trigger comment_rating_delete
after delete on CommentRating
for each row
begin
IF ( old.rating = CommentRatingType.LIKE ) THEN
    update Comment set likes = likes - 1 where id = old.commentId;
ELSE
    update Comment set dislikes = dislikes - 1 where id = old.commentId;
END IF;
end$$

delimiter ;
