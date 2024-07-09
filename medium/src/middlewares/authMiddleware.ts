import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const authMiddleware = createMiddleware(async (c, next) => {
    const cookie = getCookie(c, "token") || "";
    try {
      const decoded = await verify(cookie, c.env.JWT_KEY);
      c.set("userId", decoded?.id);
      await next();
    } catch (e) {
      c.status(404);
      return c.json({
        error: e,
      });
    }
  });