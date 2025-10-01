-- CreateTable
CREATE TABLE "Governorate" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Governorate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "governorateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "governorateId" INTEGER,
    "districtId" INTEGER,
    "icuBeds" INTEGER NOT NULL DEFAULT 0,
    "pediatricBeds" INTEGER NOT NULL DEFAULT 0,
    "mediumCareBeds" INTEGER NOT NULL DEFAULT 0,
    "incubators" INTEGER NOT NULL DEFAULT 0,
    "newbornBeds" INTEGER NOT NULL DEFAULT 0,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "roles" TEXT[],
    "activeRole" VARCHAR(50) NOT NULL,
    "hospitalId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "reportNumber" VARCHAR(100),
    "reportDate" TIMESTAMP(3),
    "reportTime" VARCHAR(10),
    "fullName" VARCHAR(500) NOT NULL,
    "nationalId" VARCHAR(14) NOT NULL,
    "age" INTEGER,
    "gender" VARCHAR(10),
    "governorate" VARCHAR(255),
    "address" VARCHAR(500),
    "phone1" VARCHAR(20),
    "phone2" VARCHAR(20),
    "referralSource" VARCHAR(500),
    "doctorName" VARCHAR(255),
    "attachments" TEXT,
    "sameHospital" BOOLEAN,
    "careType" VARCHAR(255),
    "admissionDate" TIMESTAMP(3),
    "admissionTime" VARCHAR(10),
    "apacheScore" INTEGER,
    "initialDiagnosis" TEXT,
    "additionalServices" TEXT,
    "vent" BOOLEAN,
    "transferToOther" BOOLEAN,
    "transferReason" VARCHAR(500),
    "icuClass" VARCHAR(100),
    "finalDiagnosis" TEXT,
    "dischargeStatus" VARCHAR(100),
    "dischargeCriteria" VARCHAR(500),
    "dischargeReport" TEXT,
    "dischargeDate" TIMESTAMP(3),
    "dischargeTime" VARCHAR(10),
    "notes" TEXT,
    "directTransfer" BOOLEAN,
    "hospitalId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Governorate_name_key" ON "Governorate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_governorateId_key" ON "District"("name", "governorateId");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_code_key" ON "Hospital"("code");

-- CreateIndex
CREATE INDEX "Hospital_governorateId_idx" ON "Hospital"("governorateId");

-- CreateIndex
CREATE INDEX "Hospital_districtId_idx" ON "Hospital"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_hospitalId_idx" ON "User"("hospitalId");

-- CreateIndex
CREATE INDEX "User_activeRole_idx" ON "User"("activeRole");

-- CreateIndex
CREATE INDEX "Patient_nationalId_idx" ON "Patient"("nationalId");

-- CreateIndex
CREATE INDEX "Patient_reportNumber_idx" ON "Patient"("reportNumber");

-- CreateIndex
CREATE INDEX "Patient_hospitalId_idx" ON "Patient"("hospitalId");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hospital" ADD CONSTRAINT "Hospital_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hospital" ADD CONSTRAINT "Hospital_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
