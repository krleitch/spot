UPDATE "User" SET "verifiedAt" = NOW() WHERE "verifiedAt" IS NULL;
