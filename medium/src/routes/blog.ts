import { PrismaClient } from "@prisma/client/edge";
import { Hono } from "hono";
import { authMiddleware } from "../middlewares/authMiddleware";


  const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_KEY: string;
    };
    Variables: {
      userId: string;
      prisma: PrismaClient
    };
  }>();

  blogRouter.use("/*", authMiddleware);

  blogRouter.post("/", async (c) => {
    const prisma = c.get('prisma')
    const body = await c.req.json()

    try{
        const post = await prisma.post.create({
            data:{
                title:body.title,
                content:body.content,
                authorId:c.get('userId')
            }
        })

        return c.json({
            postId: post.id
        })
    }catch(e){
        c.status(403)
        return c.json({
            error: e
        })
    }
  });
  
  blogRouter.put("/", async (c) => {
    const prisma = c.get('prisma')
    const body = await c.req.json()

    try{
        const post = await prisma.post.update({
            where:{
                id: body.id,
                authorId: c.get('userId')
            },
            data:{
                title:body.title,
                content:body.content,
                authorId:c.get('userId')
            }
        })
        return c.json({
            postId: post.id
        })
    }catch(e){
        c.status(403)
        return c.json({
            error: e
        })
    }
   
  });
  
  blogRouter.get("/bulk", async (c) => {
    const prisma = c.get('prisma')
    try{
        const posts = await prisma.post.findMany({})
        return c.json({
            blog: posts
        })
    }catch(e){
        c.status(403)
        return c.json({
            error: e
        })
    }
  });

  blogRouter.get("/:id", async (c) => {
    const prisma = c.get('prisma')
    const postId = c.req.param("id")

    try{
        const post = await prisma.post.findUnique({
            where:{
                id: postId
            }
        })

        if(!post){
            c.status(404)
            return c.json({
                error: "No Such Post exist"
            })
        }
            

        return c.json({
            post
        })
    }catch(e){
        c.status(403)
        return c.json({
            error:e
        })
    }
    

    return c.json({
      userid: c.get("userId"),
    });
  });
  
  
  
  
  export default blogRouter