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

// Route to show the form for adding a new volunteer
app.get('/newvolunteer', (req, res) => {
  // Query to get the sewing levels
  knex('SewingLevel') 
      .select('SewingID', 'SewingLevel')
      .then(sewingLevels => {
          // Query to get the referral sources
          knex('ReferralSource')  
              .select('ReferralSourceID', 'ReferralSourceType')
              .then(referralSources => {
                  // Render the form and pass the fetched data to the template
                  res.render('newvolunteer', { sewingLevels, referralSources });
              })
              .catch(error => {
                  console.error('Error fetching referral sources:', error);
                  res.status(500).send('Internal Server Error');
              });
      })
      .catch(error => {
          console.error('Error fetching sewing levels:', error);
          res.status(500).send('Internal Server Error');
      });
});

// Route to handle adding a new volunteer
app.post('/addvolunteer', (req, res) => {
  // Extract data from the form
  const volFirstName = req.body.volFirstName || '';
  const volLastName = req.body.volLastName || '';
  const volEmail = req.body.volEmail || '';
  const volPhone = req.body.volPhone || '';
  const hoursAvailable = req.body.hoursAvailable;
  const SewingID = parseInt(req.body.SewingID, 10); // Selected sewing level ID
  const ReferralSourceID = parseInt(req.body.ReferralSourceID, 10); // Selected referral source ID
  

  // Insert the new volunteer into the 'volunteers' table
  knex('Volunteer')
      .insert({
          volFirstName: volFirstName.toUpperCase(),
          volLastName: volLastName.toUpperCase(),
          volEmail: volEmail,
          volPhone: volPhone,
          hoursAvailable: hoursAvailable,
          SewingID: SewingID,  // Store the sewing level ID
          ReferralSourceID: ReferralSourceID // Store the referral source ID
      })
      .then(() => {
          // Redirect to home page or another relevant page after successful insertion
          res.redirect('/');
      })
      .catch(error => {
          console.error('Error adding volunteer:', error);
          res.status(500).send('Internal Server Error');
      });
});

app.get("/login", (req, res) => res.render("login"));

app.listen(port, () => console.log("listening"));
