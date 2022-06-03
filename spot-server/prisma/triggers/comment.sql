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
    UPDATE "Comment" SET "dislikes" = "dislikes" +  1 WHERE "commentId" = NEW."commentId";
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
