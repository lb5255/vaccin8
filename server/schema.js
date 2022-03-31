const Joi = require('joi');

const name = Joi.string().regex(/^[A-Z]+$/).uppercase();

const zipcode = Joi.integer();
const city; //Fill these out
const email;
const phone;
const insurance;
const insuranceID;

const recipientInfoSchema = Joi.object().keys({
    firstName: name,
    lastName: name,

    //Fill with data above ^



})