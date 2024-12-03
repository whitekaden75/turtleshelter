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
                  res.render('newvolunteer', { sewingLevels, referralSources, successMessage: null });
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
          // Fetch sewing levels and referral sources to re-render the form
          knex('SewingLevel') 
              .select('SewingID', 'SewingLevel')
              .then(sewingLevels => {
                  knex('ReferralSource') 
                      .select('ReferralSourceID', 'ReferralSourceType')
                      .then(referralSources => {
                          res.render('newvolunteer', {
                              sewingLevels,
                              referralSources,
                              successMessage: 'New Volunteer Successfully Created!',
                              redirectTo: '/',
                          });
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
      })
      .catch(error => {
          console.error('Error adding volunteer:', error);
          res.status(500).send('Internal Server Error');
      });
});

// Event Request routes
app.get("/eventRequest", (req,res) => {
  knex("EventType")
  .select()
  .then(type => {
    res.render("eventRequest", {type})
  });
});

app.post("/eventRequest", (req, res) => {
  // Extract data from the form
  const proposedDate1 = req.body.proposedDate1 || null;
  const proposedDate2 = req.body.proposedDate2 || null;
  const proposedDate3 = req.body.proposedDate3 || null;
  let startTime = req.body.startTime;
  const duration = parseInt(req.body.duration, 10);
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phoneNumber = req.body.phoneNumber;
  const eventType = req.body.eventType;
  const shareStory = req.body.shareStory;
  const participants = parseInt(req.body.participants, 10);

  // Append ":00" for seconds, if it's missing
  if (startTime && startTime.length === 5) {
    startTime += ":00"; // Add seconds
  }
  knex("EventRequests")
  .insert({
    EventDate1 : proposedDate1,
    EventDate2 : proposedDate2,
    EventDate3 : proposedDate3,
    StartTime : startTime,
    Duration : duration,
    EventAddress : address.toUpperCase(),
    EventCity : city.toUpperCase(),
    EventState : state.toUpperCase(),
    ContactFirstName : firstName.toUpperCase(),
    ContactLastName : lastName.toUpperCase(),
    ContactPhone : phoneNumber,
    EventType : eventType,
    JenStory : shareStory ? "true" : "false",
    Participants : participants
  })
  .then(() => {
    res.redirect("/")
  })
});

app.listen(port, () => console.log("listening"));

//  in terminal need to add npm install express knex pg cors

// const events = await knex('events').select('*');
// res.json(events);
