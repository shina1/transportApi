import moment from 'moment';

import dbQuery from '../db/dev/dbQuery';

import Validations from '../helpers/validation';


import {
  errMsg, successMessage, status, trip_statuses,
} from '../helpers/status';

/**
   * Create A Trip
   */
const createTrip = async (req, res) => {
  const {
    bus_id, origin, destination, trip_date, fare,
  } = req.body;

  const { is_admin } = req.user;
  if (!is_admin === true) {
    errMsg.error = 'Sorry You are unauthorized to create a trip';
    return res.status(status.bad).send(errMsg);
  }

  const created_on = moment(new Date());

  if (Validations.empty(bus_id) || Validations.isEmpty(origin) || Validations.isEmpty(destination) || Validations.empty(trip_date) || Validations.empty(fare)) {
    errMsg.error = 'Origin, Destination, Trip Date and Fare, field cannot be empty';
    return res.status(status.bad).send(errMsg);
  }
  const createTripQuery = `INSERT INTO
          trip(bus_id, origin, destination, trip_date, fare, created_on)
          VALUES($1, $2, $3, $4, $5, $6)
          returning *`;
  const values = [
    bus_id,
    origin,
    destination,
    trip_date,
    fare,
    created_on,
  ];

  try {
    const { rows } = await dbQuery.query(createTripQuery, values);
    const dbResponse = rows[0];
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errMsg.error = 'Unable to create trip';
    return res.status(status.error).send(errMsg);
  }
};

/**
   * Get All Trips
   */
const getAllTrips = async (req, res) => {
  const getAllTripsQuery = 'SELECT * FROM trip ORDER BY id DESC';
  try {
    const { rows } = await dbQuery.query(getAllTripsQuery);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errMsg.error = 'There are no trips';
      return res.status(status.notfound).send(errMsg);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errMsg.error = 'Operation was not successful';
    return res.status(status.error).send(errMsg);
  }
};

/**
   * cancel A Trip
   */
const cancelTrip = async (req, res) => {
  const { tripId } = req.params;
  const { is_admin } = req.user;
  const { cancelled } = trip_statuses;
  if (!is_admin === true) {
    errMsg.error = 'Sorry You are unauthorized to cancel a trip';
    return res.status(status.bad).send(errMsg);
  }
  const cancelTripQuery = 'UPDATE trip SET status=$1 WHERE id=$2 returning *';
  const values = [
    cancelled,
    tripId,
  ];
  try {
    const { rows } = await dbQuery.query(cancelTripQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errMsg.error = 'There is no trip with that id';
      return res.status(status.notfound).send(errMsg);
    }
    successMessage.data = {};
    successMessage.data.message = 'Trip cancelled successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errMsg.error = 'Operation was not successful';
    return res.status(status.error).send(errMsg);
  }
};

/**
 * filter trips by origin
 */
const filterTripByOrigin = async (req, res) => {
  const { origin } = req.query;

  const findTripQuery = 'SELECT * FROM trip WHERE origin=$1 ORDER BY id DESC';
  try {
    const { rows } = await dbQuery.query(findTripQuery, [origin]);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errMsg.error = 'No Trips with that origin';
      return res.status(status.notfound).send(errMsg);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errMsg.error = 'Operation was not successful';
    return res.status(status.error).send(errMsg);
  }
};

/**
 * filter trips by destination
 */
const filterTripByDestination = async (req, res) => {
  const { destination } = req.query;

  const findTripQuery = 'SELECT * FROM trip WHERE destination=$1 ORDER BY id DESC';
  try {
    const { rows } = await dbQuery.query(findTripQuery, [destination]);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errMsg.error = 'No Trips with that destination';
      return res.status(status.notfound).send(errMsg);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errMsg.error = 'Operation was not successful';
    return res.status(status.error).send(errMsg);
  }
};

export {
  createTrip,
  getAllTrips,
  cancelTrip,
  filterTripByOrigin,
  filterTripByDestination,
};