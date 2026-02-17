-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_kana" VARCHAR(100),
    "group_id" INTEGER,
    "assignment_date" DATE,
    "termination_date" DATE,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "shift_date" DATE NOT NULL,
    "shift_code" VARCHAR(20),
    "start_time" TIME,
    "end_time" TIME,
    "is_holiday" BOOLEAN DEFAULT false,
    "is_paid_leave" BOOLEAN DEFAULT false,
    "is_remote" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "function_roles" (
    "id" SERIAL NOT NULL,
    "role_code" VARCHAR(20) NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,
    "role_type" VARCHAR(20) NOT NULL DEFAULT 'FUNCTION',
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "function_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_function_roles" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "function_role_id" INTEGER,
    "role_type" VARCHAR(20) NOT NULL DEFAULT 'FUNCTION',
    "is_primary" BOOLEAN DEFAULT false,
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "employee_function_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_name_history" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "name_kana" VARCHAR(100),
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "is_current" BOOLEAN DEFAULT false,
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_name_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_change_history" (
    "id" SERIAL NOT NULL,
    "shift_id" INTEGER NOT NULL,
    "employee_id" INTEGER,
    "shift_date" DATE NOT NULL,
    "shift_code" VARCHAR(20),
    "start_time" TIME,
    "end_time" TIME,
    "is_holiday" BOOLEAN,
    "is_paid_leave" BOOLEAN,
    "is_remote" BOOLEAN,
    "change_type" VARCHAR(10) NOT NULL,
    "version" INTEGER NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" VARCHAR(255),

    CONSTRAINT "shift_change_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_tools" (
    "id" SERIAL NOT NULL,
    "tool_code" VARCHAR(50) NOT NULL,
    "tool_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "external_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_external_accounts" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "external_tool_id" INTEGER,
    "external_name" VARCHAR(100) NOT NULL,
    "external_id" VARCHAR(100),
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "employee_external_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_employee_id_shift_date_key" ON "shifts"("employee_id", "shift_date");

-- CreateIndex
CREATE UNIQUE INDEX "function_roles_role_code_key" ON "function_roles"("role_code");

-- CreateIndex
CREATE INDEX "shift_change_history_shift_id_changed_at_idx" ON "shift_change_history"("shift_id", "changed_at");

-- CreateIndex
CREATE INDEX "shift_change_history_employee_id_shift_date_idx" ON "shift_change_history"("employee_id", "shift_date");

-- CreateIndex
CREATE UNIQUE INDEX "shift_change_history_shift_id_version_key" ON "shift_change_history"("shift_id", "version");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_function_roles" ADD CONSTRAINT "employee_function_roles_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_function_roles" ADD CONSTRAINT "employee_function_roles_function_role_id_fkey" FOREIGN KEY ("function_role_id") REFERENCES "function_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_name_history" ADD CONSTRAINT "employee_name_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_history" ADD CONSTRAINT "shift_change_history_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_external_accounts" ADD CONSTRAINT "employee_external_accounts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_external_accounts" ADD CONSTRAINT "employee_external_accounts_external_tool_id_fkey" FOREIGN KEY ("external_tool_id") REFERENCES "external_tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
