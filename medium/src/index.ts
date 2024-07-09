import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { prismaClientInit } from "./middlewares/prismaClient";
import userRouter from "./routes/user";
import blogRouter from "./routes/blog";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_KEY: string;
   };
  Variables: {
    userId: string;
    prisma: PrismaClient
   };
 }>();

app.use("/*", prismaClientInit)
app.route("/api/v1/user", userRouter)
app.route("/api/v1/blog", blogRouter)
app.get("/", (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    setCookie(c, "token", "");
    console.log(prisma);
  } catch (e) {
    console.log(e);
  } finally {
    prisma.$disconnect();
  }
  return c.text("Hello Hono!");
 });

export default app;
