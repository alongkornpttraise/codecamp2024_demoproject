/*
  Warnings:

  - Added the required column `department` to the `work_permit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_active` to the `work_permit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reject_reason_1` to the `work_permit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reject_reason_2` to the `work_permit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "work_permit" ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL,
ADD COLUMN     "reject_reason_1" TEXT NOT NULL,
ADD COLUMN     "reject_reason_2" TEXT NOT NULL;
