import { env } from "@ocrbase/env/server";
import { Elysia } from "elysia";
import Redis from "ioredis";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 100;

const redis = env.REDIS_URL ? new Redis(env.REDIS_URL) : null;

const getClientIdentifier = (
  request: Request,
  userId?: string
): string | null => {
  if (userId) {
    return `user:${userId}`;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) {
      return `ip:${firstIp}`;
    }
  }

  return null;
};

export const rateLimitPlugin = new Elysia({ name: "rateLimit" }).onBeforeHandle(
  async ({ request, set, store }) => {
    if (!redis) {
      return;
    }

    const { userId } = store as { userId?: string };
    const identifier = getClientIdentifier(request, userId);

    if (!identifier) {
      return;
    }

    const key = `ratelimit:${identifier}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    const ttl = await redis.ttl(key);

    set.headers["X-RateLimit-Limit"] = String(RATE_LIMIT_MAX_REQUESTS);
    set.headers["X-RateLimit-Remaining"] = String(
      Math.max(0, RATE_LIMIT_MAX_REQUESTS - current)
    );
    set.headers["X-RateLimit-Reset"] = String(
      Math.ceil(Date.now() / 1000) + ttl
    );

    if (current > RATE_LIMIT_MAX_REQUESTS) {
      set.status = 429;
      set.headers["Retry-After"] = String(ttl);
      return {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${ttl} seconds.`,
        retryAfter: ttl,
      };
    }
  }
);

export { redis };
