import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const viewAllPetitions = async(searchTerm:string, supportingCost:number): Promise<any> => {
    Logger.info(`Getting all Petitions`);
    const conn = await getPool().getConnection();
    const query = 'SELECT P.id as petitionId, P.title as title , P.category_id as categoryId, P.owner_id as ownerId, U.first_name as ownerFirstName, U.last_name as ownerLastName, P.creation_date as creationDate, S.cost as supportingCost FROM petition as P join user as U on P.owner_id = U.id join support_tier as S on P.id = S.petition_id WHERE ((ISNULL(?) or P.description like ? or P.title like ?)) AND (ISNULL(?) or S.cost <= ?) GROUP BY P.id, P.title, P.category_id, P.owner_id, U.first_name, U.last_name, P.creation_date, P.description ORDER BY P.creation_date asc';

    const [ result ] = await conn.query( query, [ searchTerm, searchTerm, searchTerm, supportingCost,supportingCost ]);
    await conn.release();
    return result;
};

export { viewAllPetitions }