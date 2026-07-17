import * as dotenv from 'dotenv';
dotenv.config();
import { getPrisma } from '../lib/database/dbClient';

async function test() {
  const prisma = getPrisma();
  if (!prisma) {
    console.log("Prisma client is null.");
    return;
  }
  try {
    console.log("Querying users...");
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Users count:", users.length);
  } catch (e: any) {
    console.error("Users query failed:", e.message);
  }

  try {
    console.log("Querying CmsProject...");
    const projects = await prisma.cmsProject.findMany({ take: 5 });
    console.log("CmsProject count:", projects.length);
  } catch (e: any) {
    console.error("CmsProject query failed:", e.message);
  }

  try {
    console.log("Querying UserNote...");
    const notes = await prisma.userNote.findMany({ take: 5 });
    console.log("UserNote count:", notes.length);
  } catch (e: any) {
    console.error("UserNote query failed:", e.message);
  }

  try {
    console.log("Querying Discussion...");
    const discussions = await prisma.discussion.findMany({ take: 5 });
    console.log("Discussion count:", discussions.length);
  } catch (e: any) {
    console.error("Discussion query failed:", e.message);
  }

  process.exit(0);
}

test();
