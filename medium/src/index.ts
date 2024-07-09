import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { prismaClientInit } from "./middlewares/prismaClient";
import userRouter from "./routes/user";
import blogRouter from "./routes/blog";
import { hash, verifyHashedData } from "./util/hashGenerator";



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

app.get("/", async (c) => {

const data = await hash("mayank@neovim2004")  
const isVerified = await verifyHashedData("mayank@neovim2004", data)
    
return c.json({
    hash: data,
    newHash: isVerified
   })
 });
export default app;
