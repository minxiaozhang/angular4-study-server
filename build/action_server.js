"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var ws_1 = require("ws");
var app = express();
var Product = /** @class */ (function () {
    function Product(id, title, price, rating, desc, categories) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
app.get('/', function (req, res) {
    res.send("Hello Express");
});
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
    if (params.title) {
        result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
    }
    if (params.price && result.length > 0) {
        result = result.filter(function (p) { return p.price <= params.price; });
    }
    if (params.categories != "-1" && result.length > 0) {
        result = result.filter(function (p) { return p.categories.indexOf(params.categories) !== -1; });
    }
    res.json(result);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/comments/:id', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(8000, "localhost", function () {
    console.log("服务器已经启动");
});
var products = [
    new Product(1, '第一个商品', 1.99, 3.5, 'mi奥数', ['电子产品', '硬件设备']),
    new Product(2, '第二个商品', 3.99, 2.5, 'mi奥数', ['电子产品', '硬件设备']),
    new Product(3, '第三个商品', 4.99, 4.5, 'mi奥数', ['电子产品', '硬件设备']),
    new Product(4, '第四个商品', 2.99, 1.5, 'mi奥数', ['电子产品', '硬件设备']),
    new Product(5, '第五个商品', 6.99, 3.5, 'mi奥数', ['图书']),
    new Product(6, '第六个商品', 8.99, 2.5, 'mi奥数', ['电子产品', '硬件设备']),
];
var comments = [
    new Comment(1, 1, '2017-03-04 23:12:43', '张三', 3, '还行吧'),
    new Comment(2, 1, '2017-03-04 23:12:43', '李四', 3.5, '还行吧'),
    new Comment(3, 3, '2017-03-04 23:12:43', '发送到', 4.5, '还行吧'),
    new Comment(4, 3, '2017-03-04 23:12:43', '水电费', 3, '还行吧'),
    new Comment(5, 5, '2017-03-04 23:12:43', '双方都', 1.5, '还行吧'),
    new Comment(6, 6, '2017-03-04 23:12:43', '水电费V型', 3, '还行吧'),
];
var wsServer = new ws_1.Server({ port: 8083 });
wsServer.on("connection", function (websocket) {
    websocket.send("这个消息是服务器主动推送的");
    websocket.on("message", function (message) {
        console.log("message", message);
    });
});
setInterval(function () {
    if (wsServer.clients) {
        wsServer.clients.forEach(function (client) {
            client.send("这是定时推送");
        });
    }
}, 2000);
