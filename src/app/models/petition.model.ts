import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const viewAllPetitions = async(searchTerm:string, supportingCost:number, supporterId: number, ownerId:number, sortTerm:string): Promise<any> => {
    Logger.info(`Getting all Petitions`);
    const conn = await getPool().getConnection();
    let query = 'SELECT P.id as petitionId, P.title as title , P.category_id as categoryId, P.owner_id as ownerId, U.first_name as ownerFirstName, U.last_name as ownerLastName, P.creation_date as creationDate, T.cost as supportingCost FROM petition as P join user as U on P.owner_id = U.id join support_tier as T on P.id = T.petition_id join supporter as S on P.id = S.petition_id WHERE ((ISNULL(?) or P.description like ? or P.title like ?)) AND (ISNULL(?) or T.cost <= ?) AND (ISNULL(?) or S.user_id = ?) AND(ISNULL(?) or P.owner_id = ?) GROUP BY P.id, P.title, P.category_id, P.owner_id, U.first_name, U.last_name, P.creation_date, P.description';

    query += ` ${sortTerm}`;
    const [ result ] = await conn.query( query, [ searchTerm, searchTerm, searchTerm, supportingCost,supportingCost, supporterId, supporterId, ownerId , ownerId ]);
    await conn.release();
    return result;
};

const viewPetition = async (id:number): Promise<any> => {
    Logger.info(`Retrieving petition with matching id`);
    const conn = await getPool().getConnection();
    const query = 'select * from petition where id = ?';
    const [ result ] = await conn.query( query, [ id]);
    await conn.release();
    return result;
};

const getCategory = async (): Promise<any> => {
    Logger.info(`Retrieving a list of all accepted categories`);
    const conn = await getPool().getConnection();
    const query = 'select * from category';
    const [ result ] = await conn.query( query, [ ]);
    await conn.release();
    return result;
};

const addPetition = async (title: string, description:string): Promise<any> => {
    Logger.info(`Adding a petition`);
    const conn = await getPool().getConnection();
    const query = 'insert into petition ( title , description, creation_date ) values (?, ?)';
    const [ result ] = await conn.query( query, [ title, description ]);
    await conn.release();
    return result;
};


export { viewAllPetitions, viewPetition, getCategory, addPetition }