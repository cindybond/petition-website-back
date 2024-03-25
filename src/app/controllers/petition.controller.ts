import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as petition from '../models/petition.model';
import * as users from  '../models/user.model';
import {getCategory} from "../models/petition.model";
import validate from "../services/validator";
import * as schemas from "../resources/schemas.json";


const getAllPetitions = async (req: Request, res: Response): Promise<void> => {
    Logger.info('GET all petitions')
    let startIndex = parseInt(req.query.startIndex as string,10);
    const count = parseInt(req.query.count as string,10);
    const q = req.query.q as string;
    const categoryIds = req.query.categoryIds as string[];
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

    if (Number.isNaN(supportingCost)) {
        supportingCost = null;
    }
    if (Number.isNaN(supporterId)) {
        supporterId = null;
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
        const result = await petition.viewAllPetitions(searchTerm, supportingCost, supporterId, ownerId, sortTerm);
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
    const id = parseInt(req.params.id,10);
    const result = await petition.viewPetition(id);

    if (result.length === 0){
        res.status(404).send('Not Found')
        return;
    }
    Logger.info(result)
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

const addPetition = async (req: Request, res: Response): Promise<void> => {
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;

    const token = req.headers['x-authorization'] as string;

    if (token === undefined) {
        res.status(401).send('Unauthorized user')
        return;
    }
    const userDetails = await users.userByToken(token);
    Logger.info(userDetails)
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
    const petitionId = parseInt(req.params.id, 10);
    const token = req.headers['x-authorization'] as string;
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;

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

    const checkPetition = await petition.viewPetition(petitionId);
    if (checkPetition.length === 0 ) {
        res.status(404).send('Not Found. No petition with id')
        return;
    }
    Logger.info(checkPetition)
    if (checkPetition[0].owner_id !== ownerId) {
        res.status(403).send('Forbidden')
        return;
    }

    try{
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
    const petitionId = parseInt(req.params.id, 10);
    const token = req.headers['x-authorization'] as string;
    const userDetails = await users.userByToken(token);
    if (token !== userDetails[0].auth_token) {
        res.status(403).send('Forbidden')
        return;
    }
    const checkPetition = await petition.viewPetition(petitionId);
    if (checkPetition.length === 0 ) {
        res.status(404).send('Not Found')
        return;
    }
    try{
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
    const result = await petition.getCategory();
    Logger.info(result)
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