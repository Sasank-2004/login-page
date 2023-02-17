const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const pg = require('pg');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express()
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true}));

const conString = "postgres://postgres:1234@localhost:5432/postgres";
const client = new pg.Client(conString);

client.connect((err) => {
    if (err) {
      console.log('Database Connection failed');
    } else {
      console.log('Successfully connected to database');
    }
});

app.get('/',(req,res)=>{
    res.render('home');
});

app.get("/register",(req,res)=>{
    res.render('register');
});

app.get("/login",(req,res)=>{
    res.render('login');
});

app.post('/register',(req,res)=>{
    bcrypt.hash(req.body.password,saltRounds,(error,hash)=>{
        const query = {
            text: 'INSERT INTO users VALUES($1, $2)',
            values: [req.body.username, hash],
          }; 
        client.query(query,(err)=>{
            if(err) 
            {
                res.send('Username already exists');
                console.log(err.message);
            }
            else 
            {
                res.render('secrets');
                console.log("User registration successful");
            }
        });       
    })
});

app.post('/login',(req,res)=>{
    const query = {
        text: 'select password from users where username = $1',
        values: [req.body.username],
      };
    client.query(query,(err,result)=>{
        if(err) console.log(err.message);
        else if(result.rows.length == 1)
        {
            bcrypt.compare(req.body.password,result.rows[0].password,(err,r)=>{
                if(r==true) res.render('secrets');
                else res.send("Invalid Username or password");
            })
        }
        else res.send("Invalid Username or Password");
    })
})

app.listen(3000,()=>{
    console.log('Server running on port 3000');
});
