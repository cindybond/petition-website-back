import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as petition from '../models/petition.model';


const getAllSupportersForPetition = async (req: Request, res: Response): Promise<void> => {
    const petitionId = parseInt(req.params.id,10);

    const checkPetition = await petition.viewPetition(petitionId);
    if (checkPetition.length === 0 ) {
        res.status(404).send('Not Found. No petittion with id')
        return;
    }

    try{
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
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getAllSupportersForPetition, addSupporter}