-- CreateTable
CREATE TABLE "user" (
    "user_id" UUID NOT NULL,
    "user_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "create_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" UUID,
    "update_date" TIMESTAMP(6) NOT NULL,
    "update_by" UUID,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "create_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" UUID,
    "update_date" TIMESTAMP(6) NOT NULL,
    "update_by" UUID,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_role_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,
    "create_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" UUID,
    "update_date" TIMESTAMP(6) NOT NULL,
    "update_by" UUID,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "permission" (
    "permission_id" SERIAL NOT NULL,
    "permission_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "create_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" UUID,
    "update_date" TIMESTAMP(6) NOT NULL,
    "update_by" UUID,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_permission_id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "create_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" UUID,
    "update_date" TIMESTAMP(6) NOT NULL,
    "update_by" UUID,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_permission_id")
);

-- CreateTable
CREATE TABLE "work_permit" (
    "work_permit_id" UUID NOT NULL,
    "work_permit_no" TEXT NOT NULL,
    "requester_name" TEXT NOT NULL,
    "work_type" TEXT NOT NULL,
    "worker_name" TEXT NOT NULL,
    "work_description" TEXT,
    "is_high_area" BOOLEAN NOT NULL,
    "use_welding_helmet" BOOLEAN NOT NULL,
    "use_leather_gloves" BOOLEAN NOT NULL,
    "use_full_body_harness" BOOLEAN NOT NULL,
    "other_safety_equipment" TEXT,
    "working_start_date" TIMESTAMP(6),
    "working_end_date" TIMESTAMP(6),
    "emergency_person_name" TEXT NOT NULL,
    "emergency_mobile_no" TEXT NOT NULL,
    "id_card_file_path" TEXT,
    "other_document_file_path" TEXT,
    "approver_id" UUID,
    "approve_date" TIMESTAMP(6),
    "status" TEXT NOT NULL,
    "create_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" UUID,
    "update_date" TIMESTAMP(6) NOT NULL,
    "update_by" UUID,

    CONSTRAINT "work_permit_pkey" PRIMARY KEY ("work_permit_id")
);

-- CreateTable
CREATE TABLE "safety_report" (
    "safety_report_id" UUID NOT NULL,
    "work_permit_id" UUID NOT NULL,
    "worker_amount" INTEGER NOT NULL,
    "not_safety_behavior" TEXT,
    "true_working_duration" INTEGER,
    "not_safety_alarm_count" INTEGER,
    "restoration_verification" TEXT,
    "safety_score" INTEGER NOT NULL,
    "create_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" UUID,
    "update_date" TIMESTAMP(6) NOT NULL,
    "update_by" UUID,

    CONSTRAINT "safety_report_pkey" PRIMARY KEY ("safety_report_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_id_role_id_key" ON "user_role"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_permit_work_permit_no_key" ON "work_permit"("work_permit_no");

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_create_by_fkey" FOREIGN KEY ("create_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_report" ADD CONSTRAINT "safety_report_work_permit_id_fkey" FOREIGN KEY ("work_permit_id") REFERENCES "work_permit"("work_permit_id") ON DELETE RESTRICT ON UPDATE CASCADE;
