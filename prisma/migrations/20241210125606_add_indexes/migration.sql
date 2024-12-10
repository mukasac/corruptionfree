/*
  Warnings:

  - The `status` column on the `Institution` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Nominee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ImpactArea` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Institution` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Position` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `District` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ImpactArea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Institution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InstitutionRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InstitutionRatingCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Nominee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NomineeRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RatingCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "NomineeStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'UNDER_INVESTIGATION');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('GOVERNMENT', 'PARASTATAL', 'AGENCY', 'CORPORATION');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_INVESTIGATION', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RatingStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "District" ADD COLUMN     "description" TEXT,
ADD COLUMN     "population" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ImpactArea" ADD COLUMN     "description" TEXT,
ADD COLUMN     "severity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "totalRatings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "InstitutionType" NOT NULL DEFAULT 'GOVERNMENT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "InstitutionStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "InstitutionRating" ADD COLUMN     "documents" TEXT[],
ADD COLUMN     "status" "RatingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" INTEGER,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "evidence" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InstitutionRatingCategory" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minimumEvidence" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Nominee" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "biography" TEXT,
ADD COLUMN     "documents" TEXT[],
ADD COLUMN     "title" TEXT,
ADD COLUMN     "totalRatings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "NomineeStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "NomineeRating" ADD COLUMN     "documents" TEXT[],
ADD COLUMN     "status" "RatingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" INTEGER,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "evidence" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "description" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RatingCategory" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minimumEvidence" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "Severity";

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "nomineeId" INTEGER NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_nomineeId_idx" ON "Comment"("nomineeId");

-- CreateIndex
CREATE INDEX "Comment_status_idx" ON "Comment"("status");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_nomineeId_userId_idx" ON "Comment"("nomineeId", "userId");

-- CreateIndex
CREATE INDEX "InstitutionComment_userId_idx" ON "InstitutionComment"("userId");

-- CreateIndex
CREATE INDEX "InstitutionComment_institutionId_idx" ON "InstitutionComment"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionComment_status_idx" ON "InstitutionComment"("status");

-- CreateIndex
CREATE INDEX "InstitutionComment_createdAt_idx" ON "InstitutionComment"("createdAt");

-- CreateIndex
CREATE INDEX "InstitutionComment_institutionId_userId_idx" ON "InstitutionComment"("institutionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_createdAt_idx" ON "Department"("createdAt");

-- CreateIndex
CREATE INDEX "District_name_idx" ON "District"("name");

-- CreateIndex
CREATE INDEX "District_region_idx" ON "District"("region");

-- CreateIndex
CREATE INDEX "District_population_idx" ON "District"("population");

-- CreateIndex
CREATE INDEX "District_createdAt_idx" ON "District"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactArea_name_key" ON "ImpactArea"("name");

-- CreateIndex
CREATE INDEX "ImpactArea_name_idx" ON "ImpactArea"("name");

-- CreateIndex
CREATE INDEX "ImpactArea_severity_idx" ON "ImpactArea"("severity");

-- CreateIndex
CREATE INDEX "ImpactArea_createdAt_idx" ON "ImpactArea"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "Institution"("name");

-- CreateIndex
CREATE INDEX "Institution_name_idx" ON "Institution"("name");

-- CreateIndex
CREATE INDEX "Institution_type_idx" ON "Institution"("type");

-- CreateIndex
CREATE INDEX "Institution_status_idx" ON "Institution"("status");

-- CreateIndex
CREATE INDEX "Institution_totalRatings_idx" ON "Institution"("totalRatings");

-- CreateIndex
CREATE INDEX "Institution_averageRating_idx" ON "Institution"("averageRating");

-- CreateIndex
CREATE INDEX "Institution_createdAt_idx" ON "Institution"("createdAt");

-- CreateIndex
CREATE INDEX "InstitutionRating_userId_idx" ON "InstitutionRating"("userId");

-- CreateIndex
CREATE INDEX "InstitutionRating_institutionId_idx" ON "InstitutionRating"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionRating_ratingCategoryId_idx" ON "InstitutionRating"("ratingCategoryId");

-- CreateIndex
CREATE INDEX "InstitutionRating_status_idx" ON "InstitutionRating"("status");

-- CreateIndex
CREATE INDEX "InstitutionRating_score_idx" ON "InstitutionRating"("score");

-- CreateIndex
CREATE INDEX "InstitutionRating_severity_idx" ON "InstitutionRating"("severity");

-- CreateIndex
CREATE INDEX "InstitutionRating_createdAt_idx" ON "InstitutionRating"("createdAt");

-- CreateIndex
CREATE INDEX "InstitutionRating_institutionId_ratingCategoryId_idx" ON "InstitutionRating"("institutionId", "ratingCategoryId");

-- CreateIndex
CREATE INDEX "InstitutionRatingCategory_keyword_idx" ON "InstitutionRatingCategory"("keyword");

-- CreateIndex
CREATE INDEX "InstitutionRatingCategory_name_idx" ON "InstitutionRatingCategory"("name");

-- CreateIndex
CREATE INDEX "InstitutionRatingCategory_weight_idx" ON "InstitutionRatingCategory"("weight");

-- CreateIndex
CREATE INDEX "InstitutionRatingCategory_isActive_idx" ON "InstitutionRatingCategory"("isActive");

-- CreateIndex
CREATE INDEX "InstitutionRatingCategory_createdAt_idx" ON "InstitutionRatingCategory"("createdAt");

-- CreateIndex
CREATE INDEX "Nominee_name_idx" ON "Nominee"("name");

-- CreateIndex
CREATE INDEX "Nominee_positionId_idx" ON "Nominee"("positionId");

-- CreateIndex
CREATE INDEX "Nominee_institutionId_idx" ON "Nominee"("institutionId");

-- CreateIndex
CREATE INDEX "Nominee_districtId_idx" ON "Nominee"("districtId");

-- CreateIndex
CREATE INDEX "Nominee_status_idx" ON "Nominee"("status");

-- CreateIndex
CREATE INDEX "Nominee_totalRatings_idx" ON "Nominee"("totalRatings");

-- CreateIndex
CREATE INDEX "Nominee_averageRating_idx" ON "Nominee"("averageRating");

-- CreateIndex
CREATE INDEX "Nominee_createdAt_idx" ON "Nominee"("createdAt");

-- CreateIndex
CREATE INDEX "NomineeRating_userId_idx" ON "NomineeRating"("userId");

-- CreateIndex
CREATE INDEX "NomineeRating_nomineeId_idx" ON "NomineeRating"("nomineeId");

-- CreateIndex
CREATE INDEX "NomineeRating_ratingCategoryId_idx" ON "NomineeRating"("ratingCategoryId");

-- CreateIndex
CREATE INDEX "NomineeRating_status_idx" ON "NomineeRating"("status");

-- CreateIndex
CREATE INDEX "NomineeRating_score_idx" ON "NomineeRating"("score");

-- CreateIndex
CREATE INDEX "NomineeRating_severity_idx" ON "NomineeRating"("severity");

-- CreateIndex
CREATE INDEX "NomineeRating_createdAt_idx" ON "NomineeRating"("createdAt");

-- CreateIndex
CREATE INDEX "NomineeRating_nomineeId_ratingCategoryId_idx" ON "NomineeRating"("nomineeId", "ratingCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- CreateIndex
CREATE INDEX "Position_name_idx" ON "Position"("name");

-- CreateIndex
CREATE INDEX "Position_level_idx" ON "Position"("level");

-- CreateIndex
CREATE INDEX "Position_createdAt_idx" ON "Position"("createdAt");

-- CreateIndex
CREATE INDEX "RatingCategory_keyword_idx" ON "RatingCategory"("keyword");

-- CreateIndex
CREATE INDEX "RatingCategory_name_idx" ON "RatingCategory"("name");

-- CreateIndex
CREATE INDEX "RatingCategory_weight_idx" ON "RatingCategory"("weight");

-- CreateIndex
CREATE INDEX "RatingCategory_isActive_idx" ON "RatingCategory"("isActive");

-- CreateIndex
CREATE INDEX "RatingCategory_createdAt_idx" ON "RatingCategory"("createdAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "Nominee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionComment" ADD CONSTRAINT "InstitutionComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionComment" ADD CONSTRAINT "InstitutionComment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
