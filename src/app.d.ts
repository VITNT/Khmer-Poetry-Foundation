import type { Database } from '$lib/server/database';
declare global {
 namespace App {
  interface Locals {
   db: Database | null;
   user: { id: string; email: string } | null;
   isAdmin: boolean;
  }
 }
}
export {};
