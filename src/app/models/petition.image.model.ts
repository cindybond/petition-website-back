import { getPool } from '../../config/db';
import Logger from '../../config/logger';

const getPhoto = async (petitionId:number): Promise<any> => {
    Logger.info('Getting the petition image file from the database');
    const conn = await getPool().getConnection();
    const query = 'select image_filename from petition where id = ? ';
    const [ result ] = await conn.query( query , [ petitionId ]);
    await conn.release();
    return result;
}

export { getPhoto }