import moment from 'moment'

import dbQuery from '../db/dev/dbQuery';

import Validations from '../helpers/validation';

import {
    errMsg, successMessage, status
} from '../helpers/status';

/**
 * add a booking
 */

 const createBooking = async(req ,res)=>{
     const {trip_id, bus_id, trip_date, seat_number} = req.body;

     const {first_name, last_name, user_id, email} = req.user;
     if(Validations.empty(trip_id)){
         errMsg.error = 'Trip is required';
         return res.status(status.bad).send(errMsg);
     }
     const bookingQueryText = `INSERT INTO booking(user_id, trip_id, bus_id, trip_date, seat_number, first_name, last_name, email, created_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`;
     const values = [
        user_id,
        trip_id,
        bus_id,
        trip_date,
        seat_number,
        first_name,
        last_name,
        email,
        created_on,
     ];
     try{
         const { rows } = await dbQuery.query(bookingQueryText, values);
         const dbResponse = rows[0];

         successMessage.data = dbResponse;
         return res.status(status.created).send(successMessage);
     }catch(err){
         if(err.routine === '_bt_check_unique'){
             errMsg.error = 'Seat Number is taken aleady';
             return res.status(status.conflict).send(errMsg);
         }
         errMsg.error = 'Unable to create booking';
     return res.status(status.error).send(errMsg); 
     }
    
 };

 /**
  * Get all bookings
  */

  const getAllBookings = async(req, res)=>{
      const {is_admin, user_id} = req.user;
      if(!is_admin === true){
          const allBookingQueryText = 'SELECT * FROM booking WHERE user_id = $1';

          try {
              const { rows } = await dbQuery.query(allBookingQueryText);
              const dbResponse = rows;
              if(dbResponse[0] === undefined){
                  errMsg.error = 'You have no bookings';
                  return res.status(status.notfound).send(errMsg);
              }
              successMessage.data = dbResponse;
              return res.status(status.success).send(successMessage);
          } catch (error) {
              errMsg.error = 'An error occured';
              return res.status(status.error).send(errMsg);
          }
      }
  };

  /**
   * delete booking
   */

  const deleteBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { user_id } = req.user;
    const deleteBookingQuery = 'DELETE FROM booking WHERE id=$1 AND user_id = $2 returning *';
    try {
      const { rows } = await dbQuery.query(deleteBookingQuery, [bookingId, user_id]);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errMsg.error = 'You have no booking with that id';
        return res.status(status.notfound).send(errMsg);
      }
      successMessage.data = {};
      successMessage.data.message = 'Booking deleted successfully';
      return res.status(status.success).send(successMessage);
    } catch (error) {
        errMsg.error = 'Something went wrong';
      return res.status(status.error).send(errMsg);
    }
  };

  /**
   * update booking
   */

  const updateBookingSeat = async (req, res) => {
    const { bookingId } = req.params;
    const { seat_number } = req.body;
  
    const { user_id } = req.user;
  
    if (Validations.empty(seat_number)) {
      errMsg.error = 'Seat Number is needed';
      return res.status(status.bad).send(errMsg);
    }
    const findBookingQuery = 'SELECT * FROM booking WHERE id=$1';
    const updateBooking = `UPDATE booking
          SET seat_number=$1 WHERE user_id=$2 AND id=$3 returning *`;
    try {
      const { rows } = await dbQuery.query(findBookingQuery, [bookingId]);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errMsg.error = 'Booking Cannot be found';
        return res.status(status.notfound).send(errMsg);
      }
      const values = [
        seat_number,
        user_id,
        bookingId,
      ];
      const response = await dbQuery.query(updateBooking, values);
      const dbResult = response.rows[0];
      delete dbResult.password;
      successMessage.data = dbResult;
      return res.status(status.success).send(successMessage);
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
       errMsg.error = 'Seat Number is taken already';
        return res.status(status.conflict).send(errMsg);
      }
     errMsg.error = 'Operation was not successful';
      return res.status(status.error).send(errMsg);
    }
  };

  export {
    createBooking,
    getAllBookings,
    deleteBooking,
    updateBookingSeat,
  };