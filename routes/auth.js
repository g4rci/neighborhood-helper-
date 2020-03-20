var express = require('express');
var router = express.Router();
var bcrypt = require("bcryptjs");
var bcryptSalt = 10;

const User = require("../models/user.js");

