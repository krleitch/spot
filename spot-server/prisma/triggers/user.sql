DROP TRIGGER IF EXISTS spot_insert_trigger ON "Spot";
DROP TRIGGER IF EXISTS comment_insert_trigger ON "Comment";
DROP TRIGGER IF EXISTS spot_like_insert_trigger ON "SpotRating";
DROP TRIGGER IF EXISTS comment_like_insert_trigger ON "CommentRating";


CREATE OR REPLACE FUNCTION spot_insert()
  RETURNS TRIGGER AS
$$
BEGIN
  UPDATE "UserMetadata" SET "score" = "score" + 1
  WHERE "userId" = NEW."owner";
  RETURN NEW;
END;
$$ 
LANGUAGE plpgsql;

CREATE TRIGGER spot_insert_trigger
  AFTER INSERT
  ON "Spot"
  FOR EACH ROW
  EXECUTE PROCEDURE spot_insert();


CREATE OR REPLACE FUNCTION comment_insert()
  RETURNS trigger AS
$$
BEGIN
  UPDATE "UserMetadata" SET "score" = "score" + 1
  WHERE "userId" = NEW."owner";
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER comment_insert_trigger
  AFTER INSERT
  ON "Comment"
  FOR EACH ROW
  EXECUTE PROCEDURE comment_insert();


CREATE OR REPLACE FUNCTION spot_like_insert()
  RETURNS trigger AS
$$
BEGIN
  UPDATE "UserMetadata" SET "score" = "score" + 1
  WHERE "userId" = (SELECT "owner" FROM "Spot" WHERE "spotId" = NEW."spotId");
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER spot_like_insert_trigger
  AFTER INSERT
  ON "SpotRating"
  FOR EACH ROW
  EXECUTE PROCEDURE spot_like_insert();


CREATE OR REPLACE FUNCTION comment_like_insert()
  RETURNS trigger AS
$$
BEGIN
  UPDATE "UserMetadata" SET "score" = "score" + 1
  WHERE "userId" = (SELECT "owner" FROM "Comment" WHERE "commentId" = NEW."commentId");
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER comment_like_insert_trigger
  AFTER INSERT
  ON "CommentRating"
  FOR EACH ROW
  EXECUTE PROCEDURE comment_like_insert();
