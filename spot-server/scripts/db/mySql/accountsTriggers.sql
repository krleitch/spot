DROP TRIGGER IF EXISTS posts_insert;
DROP TRIGGER IF EXISTS comments_insert;
DROP TRIGGER IF EXISTS likes_post_insert;
DROP TRIGGER IF EXISTS likes_comments_insert;

delimiter $$
create trigger posts_insert
after insert on posts
for each row
begin
    update accounts_metadata set score = score + 1 where account_id = new.account_id;
end$$

create trigger comments_insert
after insert on comments
for each row
begin
    update accounts_metadata set score = score + 1 where account_id = new.account_id;
end$$

create trigger likes_post_insert
after insert on posts_rating
for each row
begin
    update accounts_metadata set score = score + 1 where account_id = (SELECT account_id FROM posts WHERE id = new.post_id);
end$$

create trigger likes_comments_insert
after insert on comments_rating
for each row
begin
    update accounts_metadata set score = score + 1 where account_id = (SELECT account_id FROM comments WHERE id = new.comment_id);
end$$
delimiter ;
