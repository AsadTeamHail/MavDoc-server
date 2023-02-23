const express = require("express");
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
var morgan = require('morgan');
const db = require("./models");

const verify = require('./functions/tokenVerification'); //import from functions folder
const authRoutes = require('./routes/auth')

app.use(morgan('tiny'));

app.use(cors());
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
app.use(bodyParser.json({limit: '100mb', extended: true}));
app.use(express.json());
db.sequelize.sync();

app.get("/", (req, res) => { res.json('Welcome to MavDocs Server') });
app.get("/isLoggedInVerification", verify, (req, res) => { res.json({isLoggedIn:true, fullname:req.body.fullname}) });

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});