DROP TRIGGER IF EXISTS comments_rating_create;
DROP TRIGGER IF EXISTS comments_rating_change;
DROP TRIGGER IF EXISTS comments_rating_delete;

delimiter $$

create trigger comments_rating_create
after insert on comments_rating
for each row
begin
IF ( new.rating = 1 ) THEN
    update comments set likes = likes + 1 where id = new.comment_id;
ELSE
    update comments set dislikes = dislikes + 1 where id = new.comment_id;
END IF;
end$$

create trigger comments_rating_change
after update on comments_rating
for each row
begin
IF ( old.rating = 1 ) THEN
    update comments set likes = likes - 1 where id = new.comment_id;
    update comments set dislikes = dislikes + 1 where id = new.comment_id;
ELSE
    update comments set dislikes = dislikes - 1 where id = new.comment_id;
    update comments set likes = likes + 1 where id = new.comment_id;
END IF;
end$$

create trigger comments_rating_delete
after delete on comments_rating
for each row
begin
IF ( old.rating = 1 ) THEN
    update comments set likes = likes - 1 where id = old.comment_id;
ELSE
    update comments set dislikes = dislikes - 1 where id = old.comment_id;
END IF;
end$$

delimiter ;
