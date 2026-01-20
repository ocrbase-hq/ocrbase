import type { Session, User } from "better-auth/types";

import { auth } from "@ocrbase/auth";
import { Elysia } from "elysia";

type Organization = Awaited<ReturnType<typeof auth.api.getFullOrganization>>;

export const authPlugin = new Elysia({ name: "auth" }).derive(
  { as: "global" },
  async ({
    request,
  }): Promise<{
    user: User | null;
    session: Session | null;
    organization: Organization | null;
  }> => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return {
        organization: null,
        session: null,
        user: null,
      };
    }

    let activeOrg = await auth.api.getFullOrganization({
      headers: request.headers,
    });

    if (!activeOrg) {
      const orgId = request.headers.get("x-organization-id");
      if (orgId) {
        activeOrg = await auth.api.getFullOrganization({
          headers: request.headers,
          query: { organizationId: orgId },
        });
      }
    }

    return {
      organization: activeOrg,
      session: session.session,
      user: session.user,
    };
  }
);

export const requireAuth = new Elysia({ name: "requireAuth" })
  .use(authPlugin)
  .onBeforeHandle({ as: "scoped" }, ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
  });
