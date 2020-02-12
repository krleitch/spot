DROP TRIGGER IF EXISTS posts_insert;

delimiter $$
create trigger posts_insert
after insert on posts
for each row
begin
    update accounts set score = score + 1 where id = new.account_id;
end$$
delimiter ;
