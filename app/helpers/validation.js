import env from '../../env';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt, { genSaltSync } from 'bcryptjs';

dotenv.config();

/**
 * Email validation checker
 */

 const Validations = {
     isValidEmail = (email) => {
        const regEx = /\S+@\S+\.\S+/;
        return regEx.test(email);
    },
     /**
  * Validate password
  */

   isValidPass = (pass) =>{
    if(pass.length <= 5 || pass === ''){
        return false;
    } 
    return true;
},
/**
   * hashpassword
   * @param {password} i 
   */
   hashPassword = (pass) =>{
    return bcrypt.hashSync(pass, genSaltSync(8));
},
 /**
   * compare password
   * @param {pass} inp 
   */

   comparePass = (hashPassword, pass) =>{
    return bcrypt.compareSync(pass, hashPassword);
},
/**
   * check for empty fields
   */

   isEmpty = (inp)=>{
    if(inp === undefined || inp === ''){
        return true; 
    }
    if(inp.replace(/\s/g, '').length){
        return false;
    } 
    return true;
},
 empty = (inp) =>{
    if(inp === undefined || inp === ''){
        return true;
    }
},
 generateUserToken = (email,id,is_admin,first_name, last_name) => {
    const token = jwt.sign({
        email,
        user_id : id,
        is_admin,
        first_name,
        last_name
    },
    process.env.SECRET, {expiresIn: '7d'}
    );
    return token;
}

 };
 

export default Validations;