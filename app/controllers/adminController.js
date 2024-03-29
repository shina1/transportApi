import moment from 'moment';
import dbQuery from '../db/dev/dbQuery';

import Validations from '../helpers/validation';

import {errMsg, successMessage, status} from '../helpers/status';

const createAdmin = async(req,res) =>{
    const {email, first_name, last_name,password} = req.body;

    const { is_admin } = req.user;


    const isAdmin = true;
    const created_on = moment(new Date());

    if(!is_admin === false){
        errMsg.error = 'Sorry you are not authorized to create an admin';
        return res.status(status.bad).send(errMsg);
    }
    if(Validations.isEmpty(email) || Validations.isEmpty(first_name) || Validations.isEmpty(last_name) || Validations.isEmpty(password) ){
        errMsg.error = 'Email, password, first name and last name field can not be empty';
        return res.status(status.bad).send(errMsg);
    }
    if(!Validations.isValidEmail(email)){
        errMsg = 'Please enter a valid Email';
        return res.status(status.bad).send(errMsg);
    }
    if(!Validations.isValidPass(password)){
        errMsg.error = 'Password must be more than five characters';
        return res.status(status.bad).send(errMsg);
    }
    const hashedPassword = Validations.hashPassword(password);

    const createUserQuery = `INSERT INTO users(email, first_name, last_name, password, is_admin, created_on) VALUES($1, $2, $3, $4, $5, $6 ) returning *`;

    const values = [
        email,
        first_name,
        last_name,
        hashedPassword,
        isAdmin,
        created_on
    ];

    try {
        const { rows } = await dbQuery.query(createUserQuery, values);
        const dbResponse = rows[0];
        delete dbResponse.password;
        const token = Validations.generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
        successMessage.data = dbResponse;
        successMessage.data.token = token;
        return res.status(status.created).send(token, dbResponse);
    } catch (error) {
        if(error.routine === '_bt_check_unique'){
            errMsg.error = 'Admin with that Email already exist';
            return res.status(status.conflict).send(errMsg);
        }
        
    }
};

/**
 * Update user to admin
 */
const updateUserToAdmin = async(req, res) =>{
    const { id } = req.params;
    const { isAdmin } = req.body;
    const { is_admin } = req.user;
    if(!is_admin === true){
        errMsg.error = 'Sorry You are unauthorized to make a user an admin';
        return res.status(status.bad).send(errMsg);
    }
    if(isAdmin === ''){
        errMsg.error = 'Admin status is needed';
        return res.status(status.bad).send(errMsg);
    }
    const findUserQuery = 'SELECT * FROM users WHERE id=$1';
    const updateUser = `UPDATE users SET is_admin=$1 WHERE id=$2 returning *`;

    try {
        const { rows } = dbQuery.query(findUserQuery, [id]);
        const dbResponse = rows[0];
        if(!dbResponse){
            errMsg.error = 'User not found';
            return res.status(status.notfound).send(errMsg);
        }
        const values = [
            isAdmin,
            id
        ];
        const response = await dbQuery.query(updateUser, values);
        const dbResult = response.rows[0];
        delete dbResult.password;
        successMessage.data = dbResult;
        return res.status(status.success).send(successMessage), dbResult;
    } catch (error) {
        errMsg.error = 'Operation failed';
        return res.status(status.error).send(errMsg);
    }
};

export {
    createAdmin,
    updateUserToAdmin,
  };