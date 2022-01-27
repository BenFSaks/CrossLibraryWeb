if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mysql = require('mysql')


const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database : 'nodemysql'
});

db.connect((err) => {
    if(err) throw err
    console.log('My sql connected...')

})

app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE nodemysql'
    db.query(sql, (err,result) => {
        if(err) throw err
        console.log(result)
        res.send('Database created...')
    });
})

//Create table
app.get('/createpoststable', (req, res) => {
    let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY (id))'
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Posts table created...')
    })
})

//Insert post 1 
app.get('/addpost1', (req,res) =>{
    let post = {title: 'Post One', body: 'This is post number one'}
    let sql = 'INSERT INTO posts SET ?'
    let query = db.query(sql, post, (err,result) => {
        if(err) throw err
        console.log(result)
        res.send('Post 1 added ....')
    })
})

app.get('/addpost2', (req,res) =>{
    let post = {title: 'Post Two', body: 'This is post number two'}
    let sql = 'INSERT INTO posts SET ?'
    let query = db.query(sql, post, (err,result) => {
        if(err) throw err
        console.log(result)
        res.send('Post 2 added ....')
    })
})

app.get('/getposts', (req,res) =>{
    let sql = 'SELECT * FROM posts' 
    let query = db.query(sql, (err,results) => {
        if(err) throw err
        console.log(results)
        res.send('Posts fetched...')
    })
})


app.get('/getpost/:id', (req,res) =>{
    let sql = `SELECT * FROM posts WHERE id = ${req.params.id}` 
    let query = db.query(sql, (err,result) => {
        if(err) throw err
        console.log(result)
        res.send('Post fetched...')
    })
})


app.get('/updatepost/:id', (req,res) =>{
    let newTitle = 'Updated Title';
    let sql = `UPDATE posts SET title = '${newTitle}' WHERE id = ${req.params.id}` 
    let query = db.query(sql, (err,result) => {
        if(err) throw err
        console.log(result)
        res.send('Post Updated...')
    })
})

app.get('/deletepost/:id', (req,res) =>{
    let newTitle = 'Updated Title';
    let sql = `DELETE FROM posts WHERE id = ${req.params.id}` 
    let query = db.query(sql, (err,result) => {
        if(err) throw err
        console.log(result)
        res.send('Post Delete...')
    })
})
const initalizePassport = require('./passport-config')
initalizePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

const users = []

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('login.ejs')
})


app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs')
})
app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true

}))

app.post('/register', checkNotAuthenticated, async(req,res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')

    }
    console.log(users)
})

app.delete('/logout', (req,res) => {
    req.logOut()
    res.redirect('/login')
})


function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(3000)