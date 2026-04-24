import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';

type LoggerActionOptions = Partial<LoggerActionInterface>;

const getHeaderValue = (
  header: string | string[] | undefined,
): string | undefined => {
  if (!header) return undefined;
  return Array.isArray(header) ? header[0] : header;
};

const normalizeIp = (ip: string | undefined): string => {
  if (!ip) return 'unknown';

  const firstIp = ip.split(',')[0]?.trim();
  if (!firstIp) return 'unknown';

  if (firstIp === '::1') return '127.0.0.1';
  if (firstIp.startsWith('::ffff:')) return firstIp.replace('::ffff:', '');

  return firstIp;
};

const getClientIp = (request: Request): string => {
  const forwardedFor = getHeaderValue(request.headers['x-forwarded-for']);
  const realIp = getHeaderValue(request.headers['x-real-ip']);
  const trueClientIp = getHeaderValue(request.headers['true-client-ip']);
  const cfConnectingIp = getHeaderValue(request.headers['cf-connecting-ip']);

  return normalizeIp(
    forwardedFor ??
      realIp ??
      trueClientIp ??
      cfConnectingIp ??
      request.ip ??
      request.socket?.remoteAddress,
  );
};

export const LoggerAction: (options?: LoggerActionOptions) => ParameterDecorator =
  createParamDecorator(
    (options: LoggerActionOptions = {}, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest<Request>();
      const { url, method } = request;
      const ip = getClientIp(request);
      const userAgent = getHeaderValue(request.headers['user-agent']) ?? 'unknown';

      return { url, method, ip, userAgent, ...options } as LoggerActionInterface;
    },
  );
