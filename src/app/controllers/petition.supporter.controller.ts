import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as petition from '../models/petition.model';
import * as users from  '../models/user.model';
import validate from "../services/validator";
import * as schemas from "../resources/schemas.json";


const getAllSupportersForPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.info('GET request to get all supporters for a petition')
        const petitionId = parseInt(req.params.id,10);
        const checkPetition = await petition.petitionDetails(petitionId);
        if (checkPetition.length === 0 ) {
            res.status(404).send('Not Found. No petittion with id')
            return;
        }

        const result = await petition.viewSupporters(petitionId);
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addSupporter = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.info('POST request to add supporter')
        const supportTierId = req.body.supportTierId;
        const message = req.body.message;
        const token = req.headers['x-authorization'] as string;
        const petitionId = parseInt(req.params.id,10);

        if(Number.isNaN(petitionId)) {
            res.status(400).send('Bad request')
            return;
        }

        const checkPetition = await petition.petitionDetails(petitionId);
        if (checkPetition.length === 0 ) {
            res.status(404).send('Not Found. No petition found with id')
            return;
        }
        Logger.info(checkPetition)
        const userDetails = await users.userByToken(token);
        if (token !== userDetails[0].auth_token) {
            res.status(401).send('Unauthorized')
            return;
        }

        const userId = userDetails[0].id;

        if (userId === checkPetition[0].owner_id) {
            res.status(403).send('Forbidden. Cannot support your own petition.')
            return;
        }

        const validation = await validate(
            schemas.support_post,
            req.body);
        if (validation !== true) {
            res.status(400).send('Bad request.');
            return;
        }


        const result = await petition.addSupporter(petitionId, supportTierId, userId, message)
        res.status(201).send({"id": result.insertId} );
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getAllSupportersForPetition, addSupporter}