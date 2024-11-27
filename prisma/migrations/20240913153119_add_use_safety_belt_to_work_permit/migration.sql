/*
  Warnings:

  - Added the required column `use_safety_belt` to the `work_permit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "work_permit" ADD COLUMN     "use_safety_belt" BOOLEAN NOT NULL;
