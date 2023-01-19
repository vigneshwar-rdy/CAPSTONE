/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
var cookieParser = require("cookie-parser")
const { Elections, Admins, questions } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");

const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy =require('passport-local');
const bcrypt = require('bcrypt');

const flash = require("connect-flash");
app.set("views", path.join(__dirname, "views"));
app.use(flash());

const saltRounds = 10;
app.use(bodyParser.json());
app.use(express.urlencoded({ extended:false}));
app.use(cookieParser("some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret:"my-super-secret-key-21728172615261562",
  cookie:{
    maxAge: 24*60*60*1000 //24hrs
  }
}));

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (username, password, done) => {
  Admins.findOne({ where: { email: username } })
  .then(async function (user) {
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Invalid password" });
    }
  })
  .catch((error) => {
    return done(error);
  });
}));

passport.serializeUser((user, done) => {
  console.log("Serializing user with id ", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Admins.findByPk(id)
    .then(user => {
      done(null, user);
    })
    .catch(error => {
      done(error, null);
    })
});

app.get("/", async (request, response) => {
  var login=true;
  if(request.user ==null){
login=false;
  }
  response.render("index", {
    title:"election application",
    login,
    csrfToken:request.csrfToken(),
  });
});  
  

app.get("/elections", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const loggedInUser = request.user.id;
  const all = await Elections.getelections(loggedInUser);
  console.log("get elections",all);
  if (request.accepts("html")) {
    response.render("elections", {
      title:"My Elections",
      all,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({ all });
  }
});



app.get("/elections/:id", async function (request, response) {
  try {
    const todo = await Elections.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/signup", (request,response) => {
  response.render("signup", {title:"Signup", csrfToken: request.csrfToken()})
});

app.post("/admins", async (request,response) => {
  //Hash password using bcrypt
  const hashedPwd = await bcrypt.hash(request.body.password,saltRounds)
  console.log(hashedPwd)
  //Have to create the user
  try{
      const user= await Admins.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email:request.body.email,
      password:hashedPwd,
    });
    request.login(user, (err) => {
      if(err) {
        console.log(err)
      }
    response.redirect("/elections");
    })

  }catch(error) {
    console.log(error);
  }
});

app.get("/login", (request, response) => {
  response.render("login", {title:"Login", csrfToken: request.csrfToken()});
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/elections");
  }
);

app.get("/signout", (request, response, next) => {
  //Signout
  request.logOut((err) => {
    if(err) { return next(err);}
    response.redirect("/");
  })
});

app.post("/elections",connectEnsureLogin.ensureLoggedIn(),async function (request, response) {
    if (request.body.name.length == 0)  {
      request.flash("error", "Enter the title");
      return response.redirect("/elections");
    }

    console.log("creating new election", request.body);
    try {
      await Elections.addelection({
        title: request.body.name,
        adminId: request.user.id,
      });
      console.log("admins", request.body);
      const loggedInadmin = request.user.id;
      const allElections = await Elections.findOne({
        where: {
          adminId: loggedInadmin,
        },
        order: [["id", "DESC"]],
      });
      return response.redirect(`/elections`);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get(
  "/elections/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const election = await Elections.findByPk(request.params.id);
      response.render("manage-elections", {
        electionId: request.params.id,
        election,
        csrfToken: request.csrfToken(),
      });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);
app.delete("/elections/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  console.log("We have to delete an Election with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE

  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)
  // 
  try{
    await Elections.remove(request.params.id,request.user.id);
    return  response.json({success: true});
  } catch(error){
    return response.status(422).json(error);
  }
});

module.exports = app;