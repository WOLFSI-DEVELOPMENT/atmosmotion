import { app, ensureDatabase } from '../server';

export default async function handler(req: any, res: any) {
  await ensureDatabase();
  return app(req, res);
}
