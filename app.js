const express = require('express')
const app = express();
const path = require('path');
const ejs = require('ejs');
const cookies= require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const signin  = require('./views/models/signup');
const { Server } = require('socket.io');
const http = require('http');
const goaler = require('./views/models/goal');



const server = http.createServer(app);
const io = new Server(server); // Create a new instance of Server

io.on('connection', (socket) => {
    console.log('A user connected');

    // When a new goal is added, broadcast it to all clients
    socket.on('createGoal', (goal) => {
        // Broadcast to all clients
        io.emit('newGoal', goal);
    });
});



app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookies());



 




app.get('/',function(req,res){
    res.render('signup');
})
app.post('/', async function(req,res){
    let {username,email, password} = req.body;

    bcrypt.genSalt(10,(err,salt) => {
        bcrypt.hash(password,salt, async (err,hash) => {
            let stuser = await signin.create({
                username,
                email,
                password: hash,
            });

            let token  = jwt.sign({ email },"pass");

            res.cookie("Token",token);

            
            res.render('Create' , { stuser });
        })
    })

  
    

})
 
app.get('/login',function(req,res){
    res.render('login')
})

app.post('/login', async function(req,res){
    let signuser = await signin.findOne({email: req.body.email});
    if(!signuser){
        res.status(404).send("User not Found ");
    }
    bcrypt.compare(req.body.password, signuser.password, function(err,result){
        if(result){
            let token = jwt.sign({email: signuser.email},"pass");
            res.cookie("Token",token);

            res.render('create');
        }else{
            res.status(500).send("An Error Occured During Login");
        }
    })
})

app.get('/logout',function(req,res){
    res.cookie("Token","");
    res.redirect('/login');
})
app.get('/CreateGoal',function(req,res){
    res.render('create')
})


app.post('/CreateGoal',function(req,res){
    let {goal,amount}  = req.body;

    bcrypt.genSalt(10,(err,salt) => {
        bcrypt.hash(goal,salt, async (err,hash) => {
            let user = await goaler.create({     //This user var is use to get the real data from database
                goal,
                amount,
                
            });

            let token  = jwt.sign({ goal },"pass");

            res.cookie("goaltoken",token);

        
            
            res.render('All' , { user });
        })
    })

})

app.get('/AllGoals', async function(req,res){
    let {goal, amount} = await req.body;

    // let goals = await  goaler.find({name: req.goal , amount: req.amount});
    let goals = await goaler.find();
    res.render('All',{ goals });
})
app.get('/AllGoals', async function(req,res){

    res.render('All',{ goals });
})

app.get('/chat',function(req,res){
    res.render('chat')
})



// app.listen(3000,function(){
//     console.log("Sever has been started at port number 3000")
// })
server.listen(3000,function(){
    console.log("Server has been started on Port 3000");
    
})


