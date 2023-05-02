-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "filesystemId" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extension" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "filesystemId" INTEGER NOT NULL,

    CONSTRAINT "Extension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filesystem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxSize" INTEGER NOT NULL,

    CONSTRAINT "Filesystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filesystem_name_key" ON "Filesystem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_filesystemId_fkey" FOREIGN KEY ("filesystemId") REFERENCES "Filesystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extension" ADD CONSTRAINT "Extension_filesystemId_fkey" FOREIGN KEY ("filesystemId") REFERENCES "Filesystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
