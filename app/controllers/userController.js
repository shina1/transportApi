import moment from "moment";
import dbQuery from "../db/dev/dbQuery";

import Validations from "../helpers/validation";

import {
    errorMessage, successMessage, status, errMsg,
  } from "../helpers/status";

  /**
   * createUser
   */

   const createUser = async(req, res)=>{
       const {email, first_name, last_name, password} = req.body;

       const created_on = moment(new Date());
       if(Validations.isEmpty(email) || Validations.isEmpty(first_name) || Validations.isEmpty(password)){
           errMsg.error = 'Email, password, first name and last name field cannot be empty';
           return res.status(status.bad).send(errMsg);
       }
       if (!isValidEmail(email)) {
        errorMessage.error = 'Please enter a valid Email';
        return res.status(status.bad).send(errorMessage);
      }
      if (!validatePassword(password)) {
        errorMessage.error = 'Password must be more than five(5) characters';
        return res.status(status.bad).send(errorMessage);
      }

      const hashedPassword = Validations.hashPassword(password);

      const userQueryText = `INSERT INTO users(email, first_name, last_name, password, created_on) VALUES($1, $2, $3, $4, $5) returning *`;
      const values = [
          email,
          first_name,
          last_name,
          hashedPassword,
          created_on
      ];
      try {
          const { rows } = await dbQuery.query(userQueryText, values);
          const dbResponse = rows[0];

          delete dbResponse.password;
          const token = Validations.generateUserToken(dbResponse.email,dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
          successMessage.data = dbResponse;
          successMessage.data.token = token;
          return res.status(status.created).send(successMessage);
      } catch (err) {
          if(err.routine === '_bt_check_unique'){
              errMsg.error = 'User with that email already exist';
              return res.status(status.conflict).send(errMsg);
          }
      }
   };

   /**
    * sign a user in
    */

    const siginUser = async(req, res) =>{
        const {email, password} = req.body;
        if(Validations.isEmpty(email) || Validations.isEmpty(password)){
            errMsg.error = 'email and password field cannot be empty';
            return res.status(status.bad).send(errMsg);
        }
        if(!Validations.isValidEmail(email) || !Validations.validatePassword(password)){
            errMsg.error = 'Email or Password incorrect';
            return res.status(status.bad).send(errMsg);
        }
        const signinUserQueryText = 'SELECT * FROM users WHERE email = $1';
        try {
            const { rows } = dbQuery.query(signinUserQueryText, [email]);
            const dbResponse = rows[0];

            if(!dbResponse){
                errMsg.error = 'User with this email does not exist';
                return res.status(status.notfound).send(errMsg);
            }
            if(!Validations.comparePass(dbResponse.password, password)){
                errMsg.error = 'The password you provided is incorrect';
                return res.status(status.bad).send(errMsg);
            }
            const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
            delete dbResponse.password;
            successMessage.data = dbResponse;
            successMessage.data.token = token;
            return res.status(status.success).send(successMessage);
        } catch (error) {
            errMsg.error = 'Operation was not successful';
            return res.status(status.error).send(errMsg);
        }
    };

    export {
        createUser,
        siginUser,
      };