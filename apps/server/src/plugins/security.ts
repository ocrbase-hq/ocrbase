import { env } from "@ocrbase/env/server";
import { Elysia } from "elysia";

export const securityPlugin = new Elysia({ name: "security" }).onAfterHandle(
  ({ set }) => {
    set.headers["X-Content-Type-Options"] = "nosniff";
    set.headers["X-Frame-Options"] = "DENY";
    set.headers["X-XSS-Protection"] = "1; mode=block";
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

    if (env.NODE_ENV === "production") {
      set.headers["Strict-Transport-Security"] =
        "max-age=31536000; includeSubDomains";
    }
  }
);
