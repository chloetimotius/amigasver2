-- AlterTable
ALTER TABLE "OtpCode" ADD COLUMN     "pendingUserData" TEXT;

-- CreateIndex
CREATE INDEX "OtpCode_code_idx" ON "OtpCode"("code");
