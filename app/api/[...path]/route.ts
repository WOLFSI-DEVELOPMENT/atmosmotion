import app from '../../../server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toExpressRequest(request: Request) {
  return request;
}

async function handle(request: Request) {
  const { createServer } = await import('node:http');
  const body = ['GET', 'HEAD'].includes(request.method)
    ? undefined
    : Buffer.from(await request.arrayBuffer());

  return new Promise<Response>((resolve, reject) => {
    const server = createServer((req, res) => {
      app(req as any, res as any);
    });

    server.listen(0, async () => {
      try {
        const address = server.address();
        if (!address || typeof address === 'string') {
          throw new Error('Unable to create local API bridge');
        }

        const targetUrl = new URL(request.url);
        targetUrl.protocol = 'http:';
        targetUrl.hostname = '127.0.0.1';
        targetUrl.port = String(address.port);

        const response = await fetch(targetUrl, {
          method: request.method,
          headers: request.headers,
          body,
          redirect: 'manual',
        });

        resolve(response);
      } catch (error) {
        reject(error);
      } finally {
        server.close();
      }
    });

    server.on('error', reject);
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
