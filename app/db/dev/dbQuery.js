import pool from './pool';

export default{
    /**
     *  DB Query
     * 
     */
    query(queryText, params){
        return new Promise((resolve, reject)=>{
            pool.query(queryText,params).then((res)=>{
                resolve(res);
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}