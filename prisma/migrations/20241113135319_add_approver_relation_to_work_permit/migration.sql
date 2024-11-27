-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
