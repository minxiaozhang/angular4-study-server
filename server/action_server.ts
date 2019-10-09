import * as express from 'express';
import {Server} from "ws";

import * as path from 'path';


const  app = express();
export  class  Product {
    constructor(
        public  id: number,
        public title: string,
        public  price: number,
        public rating: number,
        public  desc: string,
        public categories: Array<string>) {

    }
}

export  class Comment {
    constructor(
        public id: number,
        public productId: number,
        public timestamp: string,
        public user: string,
        public rating: number,
        public content: string) {

    }
}

// 设置访问首页
app.use('/',express.static(path.join(__dirname,'..','client/untitled')))

/*app.get('/',(req,res)=>{
    res.send("Hello Express");
})*/
app.get('/api/products',(req,res)=>{
    let result=products
    let params=req.query;
    if(params.title){
        result=result.filter((p)=>p.title.indexOf(params.title)!==-1)
    }
    if(params.price && result.length>0){
        result=result.filter((p)=>p.price <= params.price)
    }
    if(params.categories!="-1" && result.length>0){
        result=result.filter((p)=>p.categories.indexOf(params.categories)!==-1)
    }
   res.json(result)
})

app.get('/api/product/:id',(req,res)=>{
    // @ts-ignore
    res.json(products.find((product)=>product.id==req.params.id))
})

app.get('/api/comments/:id',(req,res)=>{
    // @ts-ignore
    res.json(comments.filter((comment:Comment)=>comment.productId==req.params.id))
})



const server=app.listen(8000,"localhost",()=>{
    console.log("服务器已经启动,http://localhost:8000")
})

const products: Product[] = [
    new Product(1, '第一个商品', 1.99, 3.5, 'mi奥数', ['电子产品', '硬件设备']),
    new Product(2, '第二个商品', 3.99, 2.5, 'mi奥数', ['电子产品', '硬件设备']),
    new Product(3, '第三个商品', 4.99, 4.5, 'mi奥数', ['电子产品', '硬件设备']),
    new Product(4, '第四个商品', 2.99, 1.5, 'mi奥数', ['电子产品', '硬件设备']),
    new Product(5, '第五个商品', 6.99, 3.5, 'mi奥数', ['图书']),
    new Product(6, '第六个商品', 8.99, 2.5, 'mi奥数', ['电子产品', '硬件设备']),
];
const   comments: Comment[] = [
    new Comment(1, 1, '2017-03-04 23:12:43', '张三', 3, '还行吧'),
    new Comment(2, 1, '2017-03-04 23:12:43', '李四', 3.5, '还行吧'),
    new Comment(3, 3, '2017-03-04 23:12:43', '发送到', 4.5, '还行吧'),
    new Comment(4, 3, '2017-03-04 23:12:43', '水电费', 3, '还行吧'),
    new Comment(5, 5, '2017-03-04 23:12:43', '双方都', 1.5, '还行吧'),
    new Comment(6, 6, '2017-03-04 23:12:43', '水电费V型', 3, '还行吧'),
];
const subscription=new Map<any,number[]>()
const  wsServer=new Server({port:8083});
wsServer.on("connection",websocket=>{
    /*websocket.send("这个消息是服务器主动推送的")*/
    websocket.on("message",message=>{
        let messageObj ={}
        if (typeof message === "string") {
              messageObj = JSON.parse(message);
        }
        let productIds=subscription.get(websocket) || [];
        subscription.set(websocket,[...productIds,messageObj.productId]);
        // console.log("subscription",messageObj.productId)
    });
});

const currentBids= new Map<number,number>()

setInterval(()=>{
    //每两秒钟生成一个新的报价并且推给客户端
    products.forEach( p => {
        let currentBid=currentBids.get(p.id) ||p.price;
        let newBid =  (currentBid + Math.random() * 5).toFixed(2) ;
        currentBids.set(p.id,Number(newBid))
    })
    //一个客户端会关注多个商品
    subscription.forEach((productIds: number[] ,ws)=>{
        if(ws.readyState===1){ //客户端还在线
            let newBids=productIds.map( pid => ({
                productId:pid,
                bid: currentBids.get(pid)
            }))
            // console.log("newBids",newBids)
            ws.send(JSON.stringify(newBids))
        }else{
            subscription.delete(ws)
        }

    })
    /*if(wsServer.clients){
        wsServer.clients.forEach(client=>{
            client.send("这是定时推送")
        })
    }*/
},2000);



