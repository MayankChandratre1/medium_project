import { PrismaClient } from "@prisma/client/edge";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { hash, verifyHashedData } from "../util/hashGenerator";

import { signinInput, signupInput } from "@mayankc/medium-validation"

  const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_KEY: string;
      BCRYPT_SALT_ROUNDS:number
    };
    Variables: {
      userId: string;
      prisma: PrismaClient
    };
   }>();

  userRouter.post("/signup", async (c) => {
    const prisma = c.get('prisma')
    const body = await c.req.json();
    try {
      const { name, email, password } = body;

      const { success } = signupInput.safeParse(body)

      if(!success){
        c.status(411)
        return c.json({
          message:"wrong inputs"
        })
      }

      const old_user = await prisma.user.findFirst({
        where: {
          email,
        },
      });
      if (old_user) {
        c.status(500);
        return c.json({ error: "user already exists" });
      }
      const hashedPassword = await hash(password)
      const res = await prisma.user.create({
        data: {
          name: name || "Anonymus",
          email,
          password: hashedPassword,
        },
      });
      const token: string = await sign({ id: res.id }, c.env.JWT_KEY);
      setCookie(c, "token", token);
      return c.json({ token, res });
    } catch (e) {
      c.status(403);
      return c.json({ error: "error during creation of user" });
    } finally {
      prisma.$disconnect();
    }
   });
  
  userRouter.post("/signin", async (c) => {
    const prisma = c.get('prisma')
    const body = await c.req.json();

    const { success } = signinInput.safeParse(body)

      if(!success){
        c.status(411)
        return c.json({
          message:"wrong inputs"
        })
      }
  
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });
  
      if (!user) {
        c.status(404);
        return c.json({ error: "user not found" });
      }
      const isPasswordRight = await verifyHashedData(body.password, user.password)
      if (!isPasswordRight) {
        c.status(403);
        return c.json({
          error: "wrong input credentials",
        });
      }
  
      const token = await sign({ id: user.id }, c.env.JWT_KEY);
      setCookie(c, "token", token);
  
      return c.json({ token });
    } catch (e) {
      c.status(400);
      return c.json({ error: e });
    } finally {
      prisma.$disconnect();
    }
   });

   

  export default userRouter