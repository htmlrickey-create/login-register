const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const path = require("path");

const app = express();

//login_registerフォーム情報を受け取る
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

//EJS設定
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//session設定
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

//DB接続
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
//DB接続確認
connection.connect((err) => {
    if(err){
        console.error("✖DB接続失敗✖");
        console.error(err);
        return
    }

    console.log("DB接続成功🚀");
})

console.log("現在のフォルダ:", __dirname);


//HTMLファイルの表示コード
app.get("/", (req, res) => {
    res.render("index");
});
app.use(express.static(path.join(__dirname, "assets")));

//新規登録処理
app.post("/register", async (req, res) => {

    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.send("ユーザー名またはメールアドレスが既に登録されています");
                }

                console.error(err);
                return res.send("登録失敗");
            }

            res.render("mypage", {
                username,
                email
            });

        }
    );

});

//ログイン機能処理
app.post("/login", (req, res) => {
    const {email, password} = req.body;

    connection.query(
        "SELECT *FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            const user = results[0];


            if(results.length === 0){
                return res.json({
                    success: false,
                    message: "ユーザーが存在しません"
                })
            }

            const match = await bcrypt.compare(
                password,
                user.password
            );


            if(!match){
                return res.json({
                    success: false,
                    message: "パスワードが違います"
                })
            }

            req.session.userId = user.id;


            return res.json({
                success: true,
                redirect: "/mypage"
            });
        }
    );
});

//マイページ用ルート
app.get("/mypage", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/");
    }

    connection.query(
        "SELECT * FROM users WHERE id = ?",
        [req.session.userId],
        (err, results) => {

            const user = results[0];

            res.render("mypage", {
                username: user.username,
                email: user.email
            });
        }
    );
});

//ログアウト機能
app.post("/logout", (req,res) => {
    req.session.destroy((err)=>{

        if(err){
            return res.send("ログアウトに失敗しました");
        }

        res.redirect("/");
    });
});

app.listen(5000, ()=>{
    console.log("サーバー起動成功")
})