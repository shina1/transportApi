import moment from 'moment';

import dbQuery from '../db/dev/dbQuery';

import Validations from '../helpers/validation'


import {
  errMsg, successMessage, status,
} from '../helpers/status';


/**
   * Add A Bus
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object
   */
const addBusDetails = async (req, res) => {
  const {
    number_plate, manufacturer, model, year, capacity,
  } = req.body;

  const created_on = moment(new Date());

  if (Validations.empty(number_plate) || Validations.empty(manufacturer) || Validations.empty(model) || Validations.empty(year)
  || Validations.empty(capacity)) {
    errMsg.error = 'All fields are required';
    return res.status(status.bad).send(errMsg);
  }
  const createBusQuery = `INSERT INTO
          bus(number_plate, manufacturer, model, year, capacity, created_on)
          VALUES($1, $2, $3, $4, $5, $6)
          returning *`;
  const values = [
    number_plate,
    manufacturer,
    model,
    year,
    capacity,
    created_on,
  ];
    
  try {
    const { rows } = await dbQuery.query(createBusQuery, values);
    const dbResponse = rows[0];
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errMsg.error = 'Unable to add bus';
    return res.status(status.error).send(errMsg);
  }
};

/**
   * Get All Buses
   * @param {object} req 
   * @param {object} res 
   * @returns {object} buses array
   */
const getAllBuses = async (req, res) => {
  const getAllBusQuery = 'SELECT * FROM bus ORDER BY id DESC';
  try {
    const { rows } = await dbQuery.query(getAllBusQuery);
    const dbResponse = rows;
    if (dbResponse[0] === undefined) {
      errMsg.error = 'There are no buses';
      return res.status(status.notfound).send(errMsg);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errMsg.error = 'An error Occured';
    return res.status(status.error).send(errMsg);
  }
};


export {
  addBusDetails,
  getAllBuses,
};