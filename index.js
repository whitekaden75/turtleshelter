// the required libraries
let express = require("express");
let app = express();
let path = require("path");
const cors = require("cors");

let security = false;
let sudoSecurity = false;
const port = 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

//connecting it to PG
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "Suicidecraddle",
    database: "intex",
    port: 5432,
  },
});

app.get("/", (req, res) => res.render("index"));

app.get("/reqevents", (req, res) => res.render("reqevents"));

app.get("/newvolunteer", (req, res) => res.render("newvolunteer"));

app.get("/adminhome", (req, res) => {
  // Ensure the 'security' variable is being passed
  res.render("adminhome", { sudoSecurity, security });
});

app.get("/login", (req, res) => res.render("login"));

app.post("/login", async (req, res) => {
  const Username = req.body.Username;
  const Password = req.body.Password;

  try {
    const user = await knex("Admin")
      .select()
      .where("Username", Username)
      .andWhere("Password", Password)
      .first();

    if (user && user.UserTypeID == 1) {
      sudoSecurity = true;
      security = false;
    } else if (user) {
      security = true;
      sudoSecurity = false;
    } else {
      sudoSecurity = false;
      security = false;
    }

    res.redirect("/adminhome");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Route to show the form for adding a new volunteer
app.get("/newvolunteer", (req, res) => {
  // Query to get the sewing levels
  knex("SewingLevel")
    .select("SewingID", "SewingLevel")
    .then((sewingLevels) => {
      // Query to get the referral sources
      knex("ReferralSource")
        .select("ReferralSourceID", "ReferralSourceType")
        .then((referralSources) => {
          // Render the form and pass the fetched data to the template
          res.render("newvolunteer", { sewingLevels, referralSources });
        })
        .catch((error) => {
          console.error("Error fetching referral sources:", error);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("Error fetching sewing levels:", error);
      res.status(500).send("Internal Server Error");
    });
});

// Route to handle adding a new volunteer
app.post("/addvolunteer", (req, res) => {
  // Extract data from the form
  const volFirstName = req.body.volFirstName || "";
  const volLastName = req.body.volLastName || "";
  const volEmail = req.body.volEmail || "";
  const volPhone = req.body.volPhone || "";
  const hoursAvailable = req.body.hoursAvailable;
  const SewingID = parseInt(req.body.SewingID, 10); // Selected sewing level ID
  const ReferralSourceID = parseInt(req.body.ReferralSourceID, 10); // Selected referral source ID

  // Insert the new volunteer into the 'volunteers' table
  knex("Volunteer")
    .insert({
      volFirstName: volFirstName.toUpperCase(),
      volLastName: volLastName.toUpperCase(),
      volEmail: volEmail,
      volPhone: volPhone,
      hoursAvailable: hoursAvailable,
      SewingID: SewingID, // Store the sewing level ID
      ReferralSourceID: ReferralSourceID, // Store the referral source ID
    })
    .then(() => {
      // Redirect to home page or another relevant page after successful insertion
      res.redirect("/");
    })
    .catch((error) => {
      console.error("Error adding volunteer:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.listen(port, () => console.log("listening"));

//  in terminal need to add npm install express knex pg cors

// const events = await knex('events').select('*');
// res.json(events);
