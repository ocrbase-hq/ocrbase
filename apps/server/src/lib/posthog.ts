import { env } from "@ocrbase/env/server";
import { PostHog } from "posthog-node";

export const posthog = env.POSTHOG_API_KEY
  ? new PostHog(env.POSTHOG_API_KEY, {
      flushAt: 20,
      flushInterval: 10_000,
    })
  : null;

export const shutdownPosthog = async () => {
  await posthog?.shutdown();
};
