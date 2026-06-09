const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const path = require("path");

const app = express();

//login_registerフォーム情報を受け取る
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

//session設定
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

//DB接続
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "login_register"
});

//DB接続確認
db.getConnection((err, connection) => {
    if(err){
        console.error("✖DB接続失敗✖");
        console.error(err);
        return
    }

    console.log("DB接続成功🚀");

    connection.release();
})

console.log("現在のフォルダ:", __dirname);


//HTMLファイルの表示コード
app.get("/", (req, res) => {
    console.log("GET / にアクセスされた");
    res.sendFile(path.join(__dirname, "assets", "index.html"));
});
app.use(express.static(path.join(__dirname, "assets")));

//新規登録処理
app.post("/register", async(req, res) => {
    console.log(req.body);
    const {username, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err) => {
            console.error(err);
           if(err) return res.send("登録失敗");
           res.send("登録成功🚀");
        }
    );
});

//ログイン機能処理
app.post("/login", (req, res) => {
    const {email, password} = req.body;

    db.query(
        "SELECT *FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            
            if(err){
                console.error(err);
                return res.send("❔ユーザーが存在しません❔");
            }
            const user = results[0];

            const match = await bcrypt.compare(
                password,
                user.password
            );

            if(!match){
                return res.send("パスワードが違います");
            }

            req.session.userId = user.id;

            res.send("ログイン成功🚀");
        }
    );
});

app.listen(5000, ()=>{
    console.log("サーバー起動成功")
})