import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as petition from '../models/petition.model';
import * as users from  '../models/user.model';
import {getCategory} from "../models/petition.model";
import validate from "../services/validator";
import * as schemas from "../resources/schemas.json";



const getAllPetitions = async (req: Request, res: Response): Promise<void> => {
    Logger.info('GET request all petitions')
    let startIndex = parseInt(req.query.startIndex as string,10);
    const count = parseInt(req.query.count as string,10);
    const q = req.query.q as string;
    const categoryId = req.query.categoryIds as string[];
    let supportingCost = parseInt(req.query.supportingCost as string,10);
    let ownerId = parseInt(req.query.ownerId as string, 10);
    let supporterId = parseInt(req.query.supporterId as string, 10);
    const sortBy = req.query.sortBy as string;
    let endIndex = startIndex + count;
    let searchTerm = null;
    let sortTerm;

    if (q === '') {
        res.status(400).send('Bad request');
        return;
    }
    if (q !== undefined)  {
        searchTerm = `%${q}%`;
    }
    if (Number.isNaN(supporterId)) {
        supporterId = null;
    }
    const checkUser = await users.getUserId(supporterId)
    Logger.info(checkUser)
    Logger.info(typeof req.query.supporterId)
    if (typeof req.query.supporterId === "string" && checkUser.length === 0) {
        res.status(400).send()
        return;
    }
    if (Number.isNaN(supportingCost)) {
        supportingCost = null;
    }

    if (Number.isNaN(ownerId)) {
        ownerId = null;
    }

    if (sortBy === 'ALPHABETICAL_ASC') {
        sortTerm = 'ORDER BY P.title ASC'
    } else if (sortBy === 'ALPHABETICAL_DESC') {
        sortTerm = 'ORDER BY P.title DESC'
    } else if (sortBy === 'COST_ASC') {
        sortTerm =  'ORDER BY T.cost ASC'
    } else if (sortBy === 'COST_DESC') {
        sortTerm = 'ORDER BY T.cost desc'
    } else if (sortBy === 'CREATED_DESC') {
        sortTerm = 'ORDER BY P.creation_date desc'
    } else if (sortBy === undefined) {
        sortTerm = 'ORDER BY P.creation_date asc'
    } else {
        res.status(400).send('Bad Request');
        return;
    }

    try{
        const result = await petition.viewAllPetitions(searchTerm, supportingCost, supporterId, ownerId, sortTerm, categoryId);
        if (Number.isNaN(startIndex)) {
            startIndex = 0;
            endIndex = result.length;
        }
        res.status(200).send({"petitions": result.slice(startIndex,endIndex), "count": result.length});
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.info('GET request a petition')
        const petitionId = parseInt(req.params.id,10);
        const check = await petition.petitionDetails(petitionId);

        if (check.length === 0){
            res.status(404).send('Not Found')
            return;
        }


        const result = await petition.viewPetition(petitionId)
        const supportTierResult = await petition.getSupportTier(petitionId)
        result[0].supportTiers = supportTierResult
        res.status(200).send(result[0]);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addPetition = async (req: Request, res: Response): Promise<void> => {
    Logger.info('POST request to add a petition')
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = parseInt(req.body.categoryId,10);
    const catId = parseInt(req.body.categoryId,10);

    const token = req.headers['x-authorization'] as string;

    if (token === undefined) {
        res.status(401).send('Unauthorized user')
        return;
    }
    const userDetails = await users.userByToken(token);

    if (token !== userDetails[0].auth_token) {
        res.status(401).send('Unauthorized user')
        return;
    }
    const ownerId = userDetails[0].id;


    const validation = await validate(
        schemas.petition_post,
        req.body);
    if (validation !== true) {
        res.status(400).send('Bad request.');
        return;
    }

    try{
        const result = await petition.addPetition(title, description, ownerId, categoryId);
        res.status(201).send({"petitionId":result.insertId});
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.info('PATCH request to edit a petition')
        const petitionId = parseInt(req.params.id, 10);
        const token = req.headers['x-authorization'] as string;
        let title = req.body.title;
        let description = req.body.description;
        let categoryId = req.body.categoryId;

        const userDetails = await users.userByToken(token);
        if (token !== userDetails[0].auth_token) {
            res.status(403).send('Forbidden')
            return;
        }

        const ownerId = userDetails[0].id;
        const validation = await validate(
            schemas.petition_patch,
            req.body);
        if (validation !== true) {
            res.status(400).send('Bad request.');
            return;
        }

        if(Number.isNaN(petitionId)) {
            res.status(400).send('Bad request')
            return;
        }

        const checkPetition = await petition.petitionDetails(petitionId);
        if (checkPetition.length === 0 ) {
            res.status(404).send('Not Found. No petition with id')
            return;
        }

        Logger.info(checkPetition)
        if (checkPetition[0].owner_id !== ownerId) {
            res.status(403).send('Forbidden')
            return;
        }


        if (description === undefined) {
            description = checkPetition[0].description
        }
        if (title === undefined) {
            title = checkPetition[0].title
        }
        if (categoryId === undefined) {
            categoryId = checkPetition[0].category_id
        }

        const result = await petition.editPetition(title, description, ownerId, categoryId, petitionId)
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deletePetition = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.info('DELETE request to delete a petition')
        const petitionId = parseInt(req.params.id, 10);
        const token = req.headers['x-authorization'] as string;
        const userDetails = await users.userByToken(token);

        if (token !== userDetails[0].auth_token) {
            res.status(403).send('Forbidden')
            return;
        }

        const checkPetition = await petition.petitionDetails(petitionId);
        if (checkPetition.length === 0 ) {
            res.status(404).send('Not Found')
            return;
        }
        const checkSupporter = await petition.viewSupporters(petitionId)
        if (checkSupporter.length !== 0) {
            res.status(403).send()
            return;
        }


        const result = await petition.removePetition(petitionId)
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getCategories = async(req: Request, res: Response): Promise<void> => {
    Logger.info('GET request to get all categories')
    const result = await petition.getCategory();
    try{
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export { getAllPetitions, getPetition, addPetition, editPetition, deletePetition, getCategories }