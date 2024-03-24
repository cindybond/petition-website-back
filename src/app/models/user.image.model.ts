import { getPool } from '../../config/db';
import Logger from '../../config/logger';

const getPhoto = async (id:number): Promise<any> => {
    Logger.info('Getting the user profile image file from the database');
    const conn = await getPool().getConnection();
    const query = 'select image_filename from user where id = ? ';
    const [ result ] = await conn.query( query , [ id ]);
    await conn.release();
    return result;
}

const setPhoto = async (id:number, filename:string, fileType:string): Promise<any> => {
    Logger.info('Setting the user profile image file to the database');
    const conn = await getPool().getConnection();
    const query = 'update user set image_filename = ? where id = ? ';
    const [ result ] = await conn.query( query , [ `${filename}.${fileType}`, id ]);
    await conn.release();
    return result;
}
const deletePhoto = async (id:number): Promise<any> => {
    Logger.info('Deleting the user profile image file from the database');
    const conn = await getPool().getConnection();
    const query = 'update user set image_filename = null where id = ? ';
    const [ result ] = await conn.query( query , [ id ]);
    await conn.release();
    return result;
}

export { getPhoto, setPhoto, deletePhoto }