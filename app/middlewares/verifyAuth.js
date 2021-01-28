import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import {errMsg , status} from '../helpers/status';

import env from '../../env';

dotenv.config();

/**
 * verify token
 */
const verifyToken = async(req, res, next)=>{
    const { token } = await req.headers;
    console.log({token});

    if(!token){
        errMsg.error = 'Token not provided';
        return res.status(status.bad).send(errMsg);
    }
    try{
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log(decoded);
        req.user = {
            email: decoded.email,
            user_id : decoded.user_id,
            is_admin: decoded.is_admin,
            first_name: decoded.first_name,
            last_name: decoded.last_name
        };
        next();
    }catch(err){
        errMsg.error = 'Authentication Failed';
        return res.status(status.unauthorized).send(errMsg);
    }
};

export default verifyToken;