import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';


const viewAllPetitions = async(searchTerm:string, supportingCost:number, supporterId: number, ownerId:number, sortTerm:string, categoryId: string[]): Promise<any> => {
    Logger.info(`Getting all Petitions`);
    const conn = await getPool().getConnection();
    let categoryIds;
    let categoryFilter;

    if (categoryId === undefined) {
        categoryFilter = ''
    } else if (categoryId !== undefined && categoryId.length !== 1) {
        categoryIds = categoryId.map(i => Number(i));
        categoryFilter = `AND P.category_id IN (${categoryIds})`;
    } else if (categoryId.length === 1) {
        categoryFilter = `AND P.category_id = ${categoryId}`
    }

    let query = 'SELECT P.id as petitionId, P.title as title , P.category_id as categoryId, P.owner_id as ownerId, U.first_name as ownerFirstName, U.last_name as ownerLastName, P.creation_date as creationDate, MIN(T.cost) as supportingCost FROM petition as P join user as U on P.owner_id = U.id join support_tier as T on P.id = T.petition_id join supporter as S on P.id = S.petition_id WHERE ((ISNULL(?) or P.description like ? or P.title like ?)) AND (ISNULL(?) or T.cost <= ?) AND (ISNULL(?) or S.user_id = ?) AND(ISNULL(?) or P.owner_id = ?)' + `${categoryFilter}` + ' GROUP BY P.id, P.title, P.category_id, P.owner_id, U.first_name, U.last_name, P.creation_date';

    query += ` ${sortTerm}`;
    Logger.info(query)
    const [ result ] = await conn.query( query, [ searchTerm, searchTerm, searchTerm, supportingCost,supportingCost, supporterId, supporterId, ownerId , ownerId ]);
    await conn.release();
    return result;
};

const getSupportTier = async (petitionId:number): Promise<SupportTier[]> => {
    Logger.info(`Retrieving supportTier with matching id`);
    const conn = await getPool().getConnection();
    const supportQuery = 'SELECT T.id as supportTierId, T.title as title, T.description as description, T.cost as cost from support_tier as T join petition as P on T.petition_id = P.id where P.id = ?'
    const [ supportResult ] = await conn.query(supportQuery, [ petitionId ]);
    await conn.release();
    return supportResult;
};
const viewPetition = async (petitionId:number): Promise<CombinedPetition[]> => {
    Logger.info(`Retrieving petition with matching id`);
    const conn = await getPool().getConnection();
    const query = `SELECT P.id as petitionId, P.title as title, P.category_id as categoryId, P.owner_id as ownerId, U.first_name as ownerFirstName, U.last_name as ownerLastName, S.petition_id, count(*) as numberOfSupporters, P.creation_date as creationDate, P.description as description, sum(T.cost) as moneyRaised FROM petition as P join user as U on P.owner_id = U.id join supporter as S on P.id = S.petition_id join support_tier as T on P.id = T.petition_id WHERE P.id = ?`;
    const [ result ] = await conn.query( query, [ petitionId ]);
    await conn.release();
    return result;
};


const petitionDetails = async (petitionId:number): Promise<any> => {
    Logger.info(`Retrieving all petition details with matching id`);
    const conn = await getPool().getConnection();
    const query = 'select * from petition where id = ?';
    const [ result ] = await conn.query( query, [ petitionId ]);
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
const addPetition = async (title: string, description:string, ownerId: number, categoryId:number): Promise<any> => {
    Logger.info(`Adding a petition`);
    const conn = await getPool().getConnection();
    const query = 'insert into petition ( title , description, creation_date, image_filename, owner_id, category_id ) values (?, ?, SYSDATE(), null, ?, ? )';
    const [ result ] = await conn.query( query, [ title, description, ownerId, categoryId ]);
    await conn.release();
    return result;
};

const editPetition = async (title: string, description:string, ownerId: number, categoryId:number, petitionId:number): Promise<any> => {
    Logger.info(`Editing a petition`);
    const conn = await getPool().getConnection();
    const query = 'update petition set title = ?, description = ?, creation_date = SYSDATE() , image_filename = null , owner_id = ?, category_id = ? where id = ?';
    const [ result ] = await conn.query( query, [ title, description, ownerId, categoryId, petitionId ]);
    await conn.release();
    return result;
};

const removePetition = async (petitionId:number): Promise<any> => {
    Logger.info(`Deleting a petition`);
    const conn = await getPool().getConnection();
    const query = 'delete from petition where id = ? ';
    const [ result ] = await conn.query( query, [ petitionId ]);
    await conn.release();
    return result;
};

const viewSupporters = async (petitionId:number): Promise<any> => {
    Logger.info(`Retrieving all supporters of petition with matching id`);
    const conn = await getPool().getConnection();
    const query = 'select S.id as supportId, S.support_tier_id as supportTierId, message, S.user_id as supporterId, U.first_name as supporterFirstName, U.last_name as supporterLastName, timestamp from supporter as S join user as U on S.user_id =  U.id WHERE petition_id = ? ORDER BY timestamp desc';
    const [ result ] = await conn.query( query, [ petitionId ]);
    await conn.release();
    return result;
};

const addSupporter = async (petitionId:number, supportTierId:number, userId:number, message:string): Promise<any> => {
    Logger.info(`Adding a supporter`);
    const conn = await getPool().getConnection();
    const query = 'insert into supporter ( petition_id, support_tier_id, user_id, message, timestamp ) values ( ?, ?, ?, ?, SYSDATE())';
    const [ result ] = await conn.query( query, [ petitionId, supportTierId, userId, message ]);
    await conn.release();
    return result;
};

const addSupportTier = async (petitionId:number, title:string, description:string, cost:number): Promise<any> => {
    Logger.info(`Adding a support tier`);
    const conn = await getPool().getConnection();
    const query = 'insert into support_tier ( petition_id, title, description, cost  ) values ( ?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [ petitionId, title, description, cost ]);
    await conn.release();
    return result;
};

const updateSupportTier = async (title:string, description:string, cost:number, petitionId:number): Promise<any> => {
    Logger.info(`Editing a petition`);
    const conn = await getPool().getConnection();
    const query = 'update support_tier set title = ?, description = ?, cost = ? where petition_id = ?';
    const [ result ] = await conn.query( query, [ title, description, cost, petitionId ]);
    await conn.release();
    return result;
};


export { viewAllPetitions, getSupportTier, viewPetition, getCategory, addPetition, editPetition, petitionDetails, removePetition, viewSupporters, addSupporter, addSupportTier, updateSupportTier }