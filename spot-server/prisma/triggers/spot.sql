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
