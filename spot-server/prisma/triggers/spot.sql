DROP TRIGGER IF EXISTS spot_rating_create;
DROP TRIGGER IF EXISTS spot_rating_change;
DROP TRIGGER IF EXISTS spot_rating_delete;
DROP TRIGGER IF EXISTS spot_comment_create;
DROP TRIGGER IF EXISTS spot_comment_delete;

delimiter $$

create trigger spot_rating_create
after insert on SpotRating
for each row
begin
IF ( new.rating = SpotRatingType.LIKE ) THEN
    update Spot set likes = likes + 1 where id = new.spotId;
ELSE
    update Spot set dislikes = dislikes + 1 where id = new.spotId;
END IF;
end$$

create trigger spot_rating_change
after update on SpotRating
for each row
begin
IF ( old.rating = SpotRatingType.LIKE ) THEN
    update Spot set likes = likes - 1 where id = new.spotId;
    update Spot set dislikes = dislikes + 1 where id = new.spotId;
ELSE
    update Spot set dislikes = dislikes - 1 where id = new.spotId;
    update Spot set likes = likes + 1 where id = new.spotId;
END IF;
end$$

create trigger spot_rating_delete
after delete on SpotRating
for each row
begin
IF ( old.rating = SpotRatingType.LIKE ) THEN
    update Spot set likes = likes - 1 where id = old.spotId;
ELSE
    update Spot set dislikes = dislikes - 1 where id = old.spotId;
END IF;
end$$

create trigger spot_comment_create
after insert on Comment
for each row
begin
    update Spot set comments = comments + 1 where id = new.spotId;
end$$

create trigger spot_comment_delete
after update on Comment
for each row
begin
IF ( new.deletedAt IS NOT NULL ) THEN
    update Spot set comments = comments - 1 where id = new.spotId;
END IF;
end$$

delimiter ;
