const express = require("express");
const app = express();
// POST요청으로 서버에 데이터 전송하고 싶으면
//1. body-parser 필요
//2. html form 데이터의 경우 input들에 name 쓰기 ( 서버에 input을 구분하기위해 name 설정 )
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//css 연결
app.use("/bublic", express.static("public"));
// db연결
var db;
const MongoClient = require("mongodb").MongoClient;
// ejs 연결
app.set("view engine", "ejs");

// list 수정기능
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.ctpf7cp.mongodb.net/todoapp?retryWrites=true&w=majority",
  (err, client) => {
    app.listen(8080, function () {
      if (err) return console.log(err);

      db = client.db("todoapp");
      //   db.collection("post").insertOne(
      //     { _id: "", title: "", date: "" },
      //     (err, result) => {
      //       console.log("save good!");
      //     }
      //   );

      console.log("listening on 8080");
    });
  }
);
//
app.get("/", function (요청, 응답) {
  응답.render("index.ejs");
});
//
app.get("/write", (요청, 응답) => {
  응답.render("write.ejs");
});
//  write에서 submit하면 db에 데이터 전송
app.post("/add", (req, res) => {
  console.log(req.body);
  let totalPost;
  //   { title: 'aaaaaaaaaaaaaaaaaaaaa', date: 'wwwwwwwwwwwwwwwwwwwwwww' } obj형태
  db.collection("conuter").findOne({ name: "게시물갯수" }, (err, result) => {
    totalPost = result.totalPost;
    db.collection("post").insertOne(
      { _id: totalPost + 1, title: req.body.title, date: req.body.date }, // _id는 자료 저장시에 해주면 좋다
      (에러, 결과) => {
        db.collection("conuter").updateOne(
          { name: "게시물갯수" },
          { $inc: { totalPost: 1 } },
          () => {}
        );
      }
    );
  });
});
+(
  // DB에 저장된 데이터들 HTMl로 보여줌
  app.get("/list", (req, res) => {
    db.collection("post")
      .find()
      .toArray((err, result) => {
        // .find().toArray 모든 데이터 가져온다
        res.render("list.ejs", { posts: result });
      });
  })
);

//delete
app.delete("/delete", (req, res) => {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, (err, result) => {
    res.status(200).send({ message: "성공했습니다" });
  });
});

// detail
app.get("/detail/:id", function (req, res) {
  // ' detail/ : ?? 를 붙이면 파라미터 형식으로 전달 된다
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      if (err) return console.log(err);

      console.log(result);
      res.render("detail.ejs", { data: result });
    }
  );
});

// edit
app.get("/edit/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render("edit.ejs", { post: result });
    }
  );
});

// edit.ejs에서 put 요청을 했을때 실행
app.put("/edit", function (req, res) {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, date: req.body.date } },
    function () {
      console.log("수정완료");
      res.redirect("/list");
    }
  );
});

// Login ( DB 회원 정보 또는 구글 회원 조회)
