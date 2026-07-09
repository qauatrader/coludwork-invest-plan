import { db, usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
const admins = await db.select({ id: usersTable.id, phone: usersTable.phone, nickname: usersTable.nickname }).from(usersTable).where(eq(usersTable.isAdmin, true));
console.log(JSON.stringify(admins, null, 2));
await db.$client.end?.();
