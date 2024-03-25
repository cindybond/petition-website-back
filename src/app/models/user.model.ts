import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const insert = async (firstName: string, lastName: string, email: string, password: string): Promise<any> => {
    Logger.info(`Adding user ${firstName} to the database`);
    const conn = await getPool().getConnection();
    const query = 'insert into user (first_name, last_name, email, password) values ( ?, ?, ?, ? )';
    const [ result ] = await conn.query( query, [ firstName, lastName, email, password ]);
    await conn.release();
    return result;
};

const insertToken = async (token: string, email: string): Promise<any> => {
    Logger.info(`Storing token`);
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = ? where email = ?';
    const [ result ] = await conn.query( query, [ token, email ]);
    await conn.release();
    return result;
};
const getUser = async (email:string): Promise<any> => {
    Logger.info('Getting the user details from the database');
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ? ';
    const [ result ] = await conn.query( query , [ email ]);
    await conn.release();
    return result;
};

const getUserId = async (id:number): Promise<any> => {
    Logger.info('Getting the user details from the database');
    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ? ';
    const [ result ] = await conn.query( query , [ id ]);
    await conn.release();
    return result;
};

const userByToken = async (token:string): Promise<any> => {
    Logger.info('Getting the user details from the database');
    const conn = await getPool().getConnection();
    const query = 'select * from user where auth_token = ? ';
    const [ result ] = await conn.query( query , [ token ]);
    await conn.release();
    return result;
};
const userLogin = async(email: string, password: string) : Promise<any> => {
    Logger.info('Logging in an user');
    const conn = await getPool().getConnection();
    const query = 'select id from user where email = ? and password = ?';
    const [ result ] = await conn.query( query, [ email, password ]);
    await conn.release();
    return result;
}

const userLogout = async (token: string | string[]): Promise<any> => {
    Logger.info('Logging out current user');
    const conn = await getPool().getConnection();
    const query = 'select id from user where auth_token = ?';
    const [ result ] = await conn.query( query, [ token ]);
    await conn.release();
    return result;
}

const updateUser = async (password:string , id:number): Promise<any> => {
    Logger.info(`Storing token`);
    const conn = await getPool().getConnection();
    const query = 'update user set password = ? where id = ?';
    const [ result ] = await conn.query( query, [ password, id ]);
    await conn.release();
    return result;
};



export{ insert, insertToken, getUser, getUserId, userByToken, userLogout, userLogin, updateUser }