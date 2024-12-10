import { PrismaClient } from "@prisma/client";

// declare global {
//   var cachedPrisma: PrismaClient;
// }

export const db = new PrismaClient();
