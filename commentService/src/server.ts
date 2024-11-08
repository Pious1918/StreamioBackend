
import app from "./app";
import { CommentController } from "./controllers/commentController";
const commentController = new CommentController();
// commentController.startGRPCServer(); 

const port = process.env.SERVER_PORT 
app.listen(port , ()=>{
    console.log(`commentService server running on ${port}`)
})