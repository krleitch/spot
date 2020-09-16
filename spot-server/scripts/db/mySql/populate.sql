SET GLOBAL log_bin_trust_function_creators = 1;

-- Change delimiter so that the function body doesn't end the function declaration

DELIMITER //

CREATE FUNCTION uuid_v4()
    RETURNS CHAR(36)
BEGIN
    -- Generate 8 2-byte strings that we will combine into a UUIDv4
    SET @h1 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h2 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h3 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h6 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h7 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h8 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');

    -- 4th section will start with a 4 indicating the version
    SET @h4 = CONCAT('4', LPAD(HEX(FLOOR(RAND() * 0x0fff)), 3, '0'));

    -- 5th section first half-byte can only be 8, 9 A or B
    SET @h5 = CONCAT(HEX(FLOOR(RAND() * 4 + 8)),
                LPAD(HEX(FLOOR(RAND() * 0x0fff)), 3, '0'));

    -- Build the complete UUID
    RETURN LOWER(CONCAT(
        @h1, @h2, '-', @h3, '-', @h4, '-', @h5, '-', @h6, @h7, @h8
    ));
END
//
-- Switch back the delimiter
DELIMITER ;

set @account = uuid_v4();

INSERT INTO accounts (id, email, username, pass, phone, salt, creation_date, verified_date)
VALUES(@account, 'email@email.com', 'test', '123', '123456789', '1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO accounts_metadata (id, account_id, distance_unit, search_type, search_distance, score)
VALUES(uuid_v4(), @account, 'metric', 'hot', 'global', 0);

delimiter //
create procedure populate (in num int)
    begin
        declare i int default 0;
        while i < num do
            INSERT INTO posts (id, creation_date, account_id, longitude, latitude, geolocation, content, link, likes, dislikes, comments)
            VALUES(uuid_v4(), CURRENT_TIMESTAMP, @account, 66.6666, 66.6666, 'test', 'test', i, 0, 0, 0);
            set i = i + 1;
        end while;
    end //
delimiter ;

call populate (100000);
