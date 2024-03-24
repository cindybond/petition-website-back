import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as petition from '../models/petition.model';

const getAllPetitions = async (req: Request, res: Response): Promise<void> => {
    Logger.info('GET all petitions')
    let startIndex = parseInt(req.query.startIndex as string,10);
    const count = parseInt(req.query.count as string,10);
    const q = (req.query.q as string);
    const categoryIds = req.query.categoryIds;
    let supportingCost = parseInt(req.query.supportingCost as string,10);
    const ownerId = req.query.ownerId;
    const supporterId = req.query.supporterId;
    let endIndex = startIndex + count;
    let searchTerm = null;

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


    try{
        const result = await petition.viewAllPetitions(searchTerm, supportingCost);
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

const addPetition = async (req: Request, res: Response): Promise<void> => {
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

const editPetition = async (req: Request, res: Response): Promise<void> => {
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

const deletePetition = async (req: Request, res: Response): Promise<void> => {
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

const getCategories = async(req: Request, res: Response): Promise<void> => {
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

export {getAllPetitions, getPetition, addPetition, editPetition, deletePetition, getCategories};