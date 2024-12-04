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

// Route to view all volunteers
app.get('/viewvolunteers', (req, res) => {
  knex('Volunteer')
    .join('SewingLevel', 'SewingLevel.SewingID', '=', 'Volunteer.SewingID')
    .join('ReferralSource', 'ReferralSource.ReferralSourceID', '=', 'Volunteer.ReferralSourceID')
    .select('volFirstName', 'volLastName', 'volEmail', 'volPhone', 'hoursAvailable', 'SewingLevel.SewingLevel', 'ReferralSource.ReferralSourceType', 'Volunteer.SewingID', 'Volunteer.ReferralSourceID')
    .then(volunteers => {
      res.render('viewvolunteers', { volunteers });
    })
    .catch(error => {
      console.error('Error fetching volunteers:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Edit route (optional)
app.get('/editvolunteer/:id', (req, res) => {
  const sewingID = req.params.id;
  knex('Volunteer')
    .join('SewingLevel', 'SewingLevel.SewingID', '=', 'Volunteer.SewingID')
    .join('ReferralSource', 'ReferralSource.ReferralSourceID', '=', 'Volunteer.ReferralSourceID')
    .select('volFirstName', 'volLastName', 'volEmail', 'volPhone', 'hoursAvailable', 'SewingLevel.SewingLevel', 'ReferralSource.ReferralSourceType', 'Volunteer.SewingID', 'Volunteer.ReferralSourceID')
    .where('Volunteer.SewingID', sewingID)
    .then(Volunteer => {
      res.render('editvolunteer', { Volunteer: Volunteer[0] });
    })
    .catch(error => {
      console.error('Error fetching volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.post('/editvolunteer/:id', async (req, res) => {
  try {
    const id = req.params.id; // Get the VolunteerID from the URL
    const { volFirstName, volLastName, volEmail, volPhone, hoursAvailable, SewingID, ReferralSourceID } = req.body;

    // Update the volunteer's details in the database using knex
    await knex('Volunteer')
      .where('VolunteerID', id) // Ensure you're using the correct primary key
      .update({
        volFirstName: volFirstName.toUpperCase(),
        volLastName: volLastName.toUpperCase(),
        volEmail,
        volPhone,
        hoursAvailable,
        SewingID,
        ReferralSourceID,
      });

    // Redirect to the volunteer list page
    res.redirect('/viewvolunteers');
  } catch (err) {
    console.error('Error updating volunteer:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Delete route 
app.post('/deletevolunteer/:id', (req, res) => {
  const sewingID = req.params.id;
  knex('Volunteer')
    .where('SewingID', sewingID)
    .del()
    .then(() => {
      res.redirect('/viewvolunteers');  // Redirect to the volunteer list after deletion
    })
    .catch(error => {
      console.error('Error deleting volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});

// View all events route
app.get('/vieweventrequests', (req, res) => {
  knex('EventRequests')
    .select('EventDate', 'EventAddress', 'EventCity', 'EventState', 'StartTime', 'Duration', 'ContactFirstName', 'ContactLastName', 'EventType', 'JenStory', 'Participants')
    .then(events => {
      res.render('vieweventrequests', { events });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
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

// CONTACTS ------------
app.get("/manageContacts", (req, res) => {
  knex("Contact")
  .select()
  .then((contacts) => {
      res.render("manageContacts", { contacts })
  });
});

// Edit GET route 
app.get('/editContact/:id', (req, res) => {
  const EventContactID = req.params.id;
  knex('Contact')
    .select(
      'EventContactID',
      'ContactFirstName',
      'ContactLastName',
      'ContactPhone',
      'ContactEmail',
      'GroupName'
    )
    .where('EventContactID', EventContactID)
    .first()
    .then(contact => {
      res.render('editContact', { contact });
    })
    .catch(error => {
      console.error('Error fetching volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Edit POST route
app.post("/editContact/:id", (req, res) => {
  const ContactFirstName = req.body.ContactFirstName;
  const ContactLastName = req.body.ContactLastName;
  const ContactPhone = req.body.ContactPhone;
  const ContactEmail = req.body.ContactEmail;
  const GroupName = req.body.GroupName;
  const EventContactID = req.params.id; // Get the EventContactID from the URL parameter
  
  knex("Contact")
    .where("EventContactID", EventContactID)  // Specify which contact to update based on EventContactID
    .update({
      ContactFirstName: ContactFirstName,
      ContactLastName: ContactLastName,
      ContactPhone: ContactPhone,
      ContactEmail: ContactEmail,
      GroupName: GroupName
    })
    .then(() => {
      res.redirect("/manageContacts"); // Redirect to the contacts management page after updating
    })
    .catch((error) => {
      console.error('Error updating contact:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Add Contact Get Route
app.get('/addContact', (req, res) => {
  res.render('addContact'); // Render the addContact page
});

app.post('/addContact', (req, res) => {
  const { ContactFirstName, ContactLastName, ContactPhone, ContactEmail, GroupName } = req.body;

  knex('Contact')
    .insert({
      ContactFirstName,
      ContactLastName,
      ContactPhone,
      ContactEmail,
      GroupName
    })
    .then(() => {
      res.redirect('/manageContacts'); // Redirect to the manage contacts page after adding
    })
    .catch((error) => {
      console.error('Error adding contact:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.listen(port, () => console.log("listening"));

//  in terminal need to add npm install express knex pg cors

// const events = await knex('events').select('*');
// res.json(events);
