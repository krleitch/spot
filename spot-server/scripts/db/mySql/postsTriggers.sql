DROP TRIGGER IF EXISTS posts_rating_create;
DROP TRIGGER IF EXISTS posts_rating_change;
DROP TRIGGER IF EXISTS posts_comments_create;
DROP TRIGGER IF EXISTS posts_comments_delete;

delimiter $$

create trigger posts_rating_create
after insert on posts_rating
for each row
begin
IF ( new.rating = 1 ) THEN
    update posts set likes = likes + 1 where id = new.post_id;
ELSE
    update posts set dislikes = dislikes + 1 where id = new.post_id;
END IF;
end$$

create trigger posts_rating_change
after update on posts_rating
for each row
begin
IF ( old.rating = 1 ) THEN
    update posts set likes = likes - 1 where id = new.post_id;
    update posts set dislikes = dislikes + 1 where id = new.post_id;
ELSE
    update posts set dislikes = dislikes - 1 where id = new.post_id;
    update posts set likes = likes + 1 where id = new.post_id;
END IF;
end$$

create trigger posts_comments_create
after insert on comments
for each row
begin
    update posts set comments = comments + 1 where id = new.post_id;
end$$

create trigger posts_comments_delete
after update on comments
for each row
begin
IF ( new.deletion_date IS NOT NULL ) THEN
    update posts set comments = comments - 1 where id = new.post_id;
END IF;
end$$

delimiter ;
