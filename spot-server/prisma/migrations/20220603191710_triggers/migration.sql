DROP TRIGGER IF EXISTS spot_insert_trigger ON "Spot";
DROP TRIGGER IF EXISTS comment_insert_trigger ON "Comment";

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


DROP TRIGGER IF EXISTS spot_rating_create_trigger ON "SpotRating";
DROP TRIGGER IF EXISTS spot_rating_change_trigger ON "SpotRating";
DROP TRIGGER IF EXISTS spot_rating_delete_trigger ON "SpotRating";
DROP TRIGGER IF EXISTS spot_comment_create_trigger ON "Comment";
DROP TRIGGER IF EXISTS spot_comment_delete_trigger ON "Comment";

CREATE OR REPLACE FUNCTION spot_rating_create()
  RETURNS trigger AS
$$
BEGIN
  IF ( NEW."rating" = 'LIKE' ) THEN
    UPDATE "Spot" SET "likes" = "likes" + 1 WHERE "spotId" = NEW."spotId";
  ELSE
    UPDATE "Spot" SET "dislikes" = "dislikes" + 1 WHERE "spotId" = NEW."spotId";
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER spot_rating_create_trigger
  AFTER INSERT
  ON "SpotRating"
  FOR EACH ROW
  EXECUTE PROCEDURE spot_rating_create();


CREATE OR REPLACE FUNCTION spot_rating_change()
  RETURNS trigger AS
$$
BEGIN
  IF ( OLD."rating" = 'LIKE' ) THEN
    UPDATE "Spot" SET "dislikes" = "dislikes" +  1 WHERE "spotId" = NEW."spotId";
    UPDATE "Spot" SET "likes" = "likes" - 1 WHERE "spotId" = NEW."spotId";
  ELSE
    UPDATE "Spot" SET "dislikes" = "dislikes" - 1 WHERE "spotId" = NEW."spotId";
    UPDATE "Spot" SET "likes" = "likes" + 1 WHERE "spotId" = NEW."spotId";
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER spot_rating_change_trigger
  AFTER UPDATE
  ON "SpotRating"
  FOR EACH ROW
  EXECUTE PROCEDURE spot_rating_change();


CREATE OR REPLACE FUNCTION spot_rating_delete()
  RETURNS trigger AS
$$
BEGIN
  IF ( OLD."rating" = 'LIKE' ) THEN
    UPDATE "Spot" SET "likes" = "likes" - 1 WHERE "spotId" = OLD."spotId";
  ELSE
    UPDATE "Spot" SET "dislikes" = "dislikes" - 1 WHERE "spotId" = OLD."spotId";
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER spot_rating_delete_trigger
  AFTER DELETE
  ON "SpotRating"
  FOR EACH ROW
  EXECUTE PROCEDURE spot_rating_delete();


CREATE OR REPLACE FUNCTION spot_comment_create()
  RETURNS trigger AS
$$
BEGIN
  UPDATE "Spot" set "totalComments" = "totalComments" + 1 WHERE "spotId" = NEW."spotId";
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER spot_comment_create_trigger
  AFTER INSERT
  ON "Comment"
  FOR EACH ROW
  EXECUTE PROCEDURE spot_comment_create();


CREATE OR REPLACE FUNCTION spot_comment_delete()
  RETURNS trigger AS
$$
BEGIN
  IF ( NEW."deletedAt" IS NOT NULL ) THEN
    UPDATE "Spot" set "totalComments" = "totalComments" - 1 WHERE "spotId" = NEW."spotId";
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER spot_comment_delete_trigger
  AFTER UPDATE
  ON "Comment"
  FOR EACH ROW
  EXECUTE PROCEDURE spot_comment_delete();


DROP TRIGGER IF EXISTS comment_rating_create_trigger ON "CommentRating";
DROP TRIGGER IF EXISTS comment_rating_change_trigger ON "CommentRating";
DROP TRIGGER IF EXISTS comment_rating_delete_trigger ON "CommentRating";

CREATE OR REPLACE FUNCTION comment_rating_create()
  RETURNS trigger AS
$$
BEGIN
  IF ( NEW."rating" = 'LIKE' ) THEN
    UPDATE "Comment" SET "likes" = "likes" + 1 WHERE "commentId" = NEW."commentId";
  ELSE
    UPDATE "Comment" SET "dislikes" = "dislikes" + 1 WHERE "commentId" = NEW."commentId";
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER comment_rating_create_trigger
  AFTER INSERT
  ON "CommentRating"
  FOR EACH ROW
  EXECUTE PROCEDURE comment_rating_create();


CREATE OR REPLACE FUNCTION comment_rating_change()
  RETURNS trigger AS
$$
BEGIN
  IF ( OLD."rating" = 'LIKE' ) THEN
    UPDATE "Comment" SET "dislikes" = "dislikes" + 1 WHERE "commentId" = NEW."commentId";
    UPDATE "Comment" SET "likes" = "likes" - 1 WHERE "commentId" = NEW."commentId";
  ELSE
    UPDATE "Comment" SET "dislikes" = "dislikes" - 1 WHERE "commentId" = NEW."commentId";
    UPDATE "Comment" SET "likes" = "likes" + 1 WHERE "commentId" = NEW."commentId";
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER comment_rating_change_trigger
  AFTER UPDATE
  ON "CommentRating"
  FOR EACH ROW
  EXECUTE PROCEDURE comment_rating_change();


CREATE OR REPLACE FUNCTION comment_rating_delete()
  RETURNS trigger AS
$$
BEGIN
  IF ( OLD."rating" = 'LIKE' ) THEN
    UPDATE "Comment" SET "likes" = "likes" - 1 WHERE "commentId" = OLD."commentId";
  ELSE
    UPDATE "Comment" SET "dislikes" = "dislikes" - 1 WHERE "commentId" = OLD."commentId";
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER comment_rating_delete_trigger
  AFTER DELETE
  ON "CommentRating"
  FOR EACH ROW
  EXECUTE PROCEDURE comment_rating_delete();
