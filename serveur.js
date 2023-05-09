import express from 'express';
import { createServer } from 'http';
import http from "http";  
import { Server } from "socket.io";
import fs from 'fs';
import { dirname } from "path";
import { fileURLToPath } from "url";
const app = express();
const server = createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// set the view engine to ejs
app.set('view engine', 'ejs');

// index page
app.get('/', function(req, res) {
  var mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  var tagline = "Les serveurs nodeJs avec express c'est vraiment trop fun.";

  res.render('tmplEjs/index', {
    mascots: mascots,
    tagline: tagline
  });
});


// about page
app.get('/about', function(req, res) {
  res.render('tmplEjs/about');
});

// about chat
app.get('/chat', function(req, res) {
  res.render('tmplEjs/chat');
});

let users = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('user joined', `${username} joined the chat`);
  });

  socket.on('chat message', (msg) => {
    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}`;
    const username = users[socket.id];
    const message = { username, msg, time };
    io.emit('chat message', message);
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit('user left', `${username} left the chat`);
  });
});

app.get('/login', (req, res) => {
  res.render('tmplEjs/connexion');
});

app.post('/login', (req, res) => {
  var username = req.query.username;
  var password = req.query.password;
  
  if (username === 'admin' && password === 'admin') {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.redirect('/');
  }
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
