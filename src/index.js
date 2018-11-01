const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();

// Port
const PORT = process.env.PORT || 3012;

// Routes
const router_api = require('./router_api');

// Middleware setup
app.use(morgan('dev'));
app.use(bodyParser.json({type: '*/*'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(cors());

// Router endpoint
app.use('/api', router_api);

app.listen(PORT, () => {
    console.log(`server started on ${PORT}`);
});