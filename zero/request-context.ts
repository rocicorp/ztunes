import type {Context} from './auth';

export function createRequestContext({
  request,
  userId,
}: {
  request: Request;
  userId: string;
}): Context {
  return {
    userId,
    clientIP: getClientIP(request),
  };
}

function getClientIP(request: Request): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',').at(0)?.trim() || undefined;
  }

  return (
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    undefined
  );
}
