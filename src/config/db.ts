import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Logger from './logger';
dotenv.config();
// technically typed : {pool: mysql.Pool}
const state: any = {
    pool: null
};

// const connect = async (): Promise<void> => {
//     state.pool = await mysql.createPool( {
//         connectionLimit: 100,
//         multipleStatements: true,
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_DATABASE || "cbo680_",
//     } );
//     await state.pool.getConnection(); // Check connection
//     Logger.info(`Successfully connected to database`)
//     return
// };


const connect = async (): Promise<mysql.Connection> => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE // Default database
    });
    await state.pool.getConnection();
    Logger.info(`Successfully connected to database`);
    return connection;
};

// technically typed : () => mysql.Pool
const getPool = () => {
    return state.pool;
};

export {connect, getPool}
