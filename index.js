// the required libraries
let express = require("express");
let app = express();
let path = require("path");
let securtiy = false;
const port = 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

//connecting it to PG
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "Suicidecraddle",
    database: "starwars",
    port: 5432,
  },
});

app.get("/", (req, res) => res.render("index"));

app.get("/reqevents", (req, res) => res.render("reqevents"));
app.get("/newvolunteer", (req, res) => res.render("newvolunteer"));

app.get("/login", (req, res) => res.render("login"));

app.listen(port, () => console.log("listening"));
