require("dotenv").config();

// import express
const express = require("express");
// import express-handlebars
const exphbs = require("express-handlebars");

// import sequelize models
const db = require("./models");

const app = express();
const http = require("http").Server(app);
var io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

// PASSPORT: imports passport and express-session used with passport
const passport = require("passport");
const session = require("express-session");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// PASSPORT: Middleware for Passport
app.use(
  session({
    secret: "wild and crazy guys",
    resave: true,
    saveUninitialized: true
  })
);

// PASSPORT: Initialize passport and the passport session
app.use(passport.initialize());
app.use(passport.session());

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    partialsDir: ["views/partials/"]
  })
);
app.set("view engine", "handlebars");

//Models
const models = require("./models");

// Routes
require("./routes/authRoutes")(app, passport); // PASSPORT: auth routes used with passport
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

// PASSPORT: load passport strategies
require("./config/passport.js")(passport, models.user);

const syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(() => {
  http.listen(PORT, () => {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
