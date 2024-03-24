import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const viewAllPetitions = async(q:string): Promise<any> => {
    Logger.info(`Getting all Petitions`);
    const conn = await getPool().getConnection();

    let query = 'select P.id as petitionId, P.title as title , P.category_id as categoryId, P.owner_id as ownerId, U.first_name as ownerFirstName, U.last_name as ownerLastName, P.creation_date as creationDate, S.cost as supportingCost from petition as P join user as U on P.owner_id = U.id join support_tier as S on P.id = S.petition_id';

    const params = [];
    if (q !== undefined) {
        // Add the '%' wildcard to the search term
        const searchTerm = `%${q}%`;
        query = `${query} where P.description like ? or P.title like ?`;
        params.push(searchTerm, searchTerm);
    }

    query = `${query} group by P.id, P.title, P.category_id, P.owner_id, U.first_name, U.last_name, P.creation_date, P.description order by P.creation_date asc`

    const [ result ] = await conn.query( query, params);
    await conn.release();
    return result;
};

export { viewAllPetitions }