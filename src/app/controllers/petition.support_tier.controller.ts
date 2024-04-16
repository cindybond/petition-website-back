import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as petition from '../models/petition.model';
import * as users from  '../models/user.model';
import validate from "../services/validator";
import * as schemas from "../resources/schemas.json";

const addSupportTier = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.info('POST request to add a support tier')
        const title = req.body.title;
        const description = req.body.description;
        const cost = req.body.cost;
        const petitionId = parseInt(req.params.id,10);
        const token = req.headers['x-authorization'] as string;

        if(Number.isNaN(petitionId)) {
            res.status(400).send('Bad request')
            return;
        }
        const userDetails = await users.userByToken(token);
        if (token !== userDetails[0].auth_token) {
            res.status(401).send('Unauthorized')
            return;
        }

        const checkPetition = await petition.petitionDetails(petitionId);
        if (checkPetition.length === 0 ) {
            res.status(404).send('Not Found. No petition found with id')
            return;
        }

        const checkSupportTier = await petition.getSupportTier(petitionId)
        Logger.http(checkSupportTier)
        if (checkSupportTier.length > 2) {
            res.status(403).send('Forbidden')
            return;
        }

        const validation = await validate(
            schemas.support_tier_post,
            req.body);
        if (validation !== true) {
            res.status(400).send('Bad request.');
            return;
        }


        const result = await petition.addSupportTier(petitionId, title, description, cost);
        Logger.info(result)
        res.status(201).send({"post_petition_support_tier_id": result.insertId});
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editSupportTier = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.info('PATCH request to edit support tier')
        const petitionId = parseInt(req.params.id,10);
        const supportTierId = parseInt(req.params.tierId, 10);
        let title = req.body.title;
        let description = req.body.description;
        let cost = req.body.cost;
        const token = req.headers['x-authorization'] as string;


        if(Number.isNaN(petitionId)) {
            res.status(400).send('Bad request')
            return;
        }

        const userDetails = await users.userByToken(token);
        if (token !== userDetails[0].auth_token) {
            res.status(401).send('Unauthorized')
            return;
        }

        const checkPetition = await petition.petitionDetails(petitionId);
        if (checkPetition.length === 0 ) {
            res.status(404).send('Not Found. No petition found with id')
            return;
        }

        const validation = await validate(
            schemas.support_tier_patch,
            req.body);
        if (validation !== true) {
            res.status(400).send('Bad request.');
            return;
        }
        const checkSupporter = await petition.viewSupporters(petitionId)
        Logger.info(checkSupporter)
        if (checkSupporter.length !== 0 && checkSupporter[0].supportTierId === supportTierId) {
            res.status(403).send()
            return;
        }
        const checkSupportTier = await petition.getSupportTier(petitionId)
        Logger.info(checkSupportTier)

        if (title === undefined) {
            title = checkSupportTier[0].title
        }
        if (description === undefined) {
            description = checkSupportTier[0].description
        }
        if (cost === undefined) {
            cost = checkSupportTier[0].cost
        }
        const result = await petition.updateSupportTier(title, description, cost, petitionId)
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deleteSupportTier = async (req: Request, res: Response): Promise<void> => {
    Logger.info('DELETE request to delete support tier')
    const petitionId = parseInt(req.params.id,10);
    const supportTierId = parseInt(req.params.tierId, 10);
    const token = req.headers['x-authorization'] as string;

    const userDetails = await users.userByToken(token);
    if (token === undefined) {
        res.status(401).send('Unauthorized')
        return;
    }
    if (token !== userDetails[0].auth_token) {
        res.status(401).send('Unauthorized')
        return;
    }
    if(Number.isNaN(petitionId)) {
        res.status(400).send('Bad request')
        return;
    }

    const checkSupportTier = await petition.getSupportTier(petitionId)
    const checkSupporter = await petition.viewSupporters(petitionId)
    if (checkSupportTier.length === 0 || checkSupportTier.length === 1) {
        res.status(404).send()
        return;
    }
    if (checkSupporter.length === 0 || checkSupporter[0].supportTierId === supportTierId) {
        res.status(403).send()
        return;
    }
    try{
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {addSupportTier, editSupportTier, deleteSupportTier};