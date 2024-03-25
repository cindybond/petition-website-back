import {Request, Response} from "express";
import Logger from "../../config/logger";
import fs, {readFileSync} from 'fs';
import * as path from 'path';
import * as image from '../models/petition.image.model';
import * as petition from '../models/petition.model'

const getImage = async (req: Request, res: Response): Promise<void> => {
    const petitionId = parseInt(req.params.id, 10);

    const checkId = await petition.viewPetition(petitionId);
    if (checkId.length === 0) {
        res.status(404).send('Not Found. No user with specified ID, or user has no image')
        return;
    }

    const photo = await image.getPhoto(petitionId);
    if (photo[0].image_filename === null) {
        res.status(404).send('Not Found. No user with specified ID, or user has no image')
        return;
    }
    try{
        const filename = photo[0].image_filename;
        const filePath = path.join(__dirname, '..' , '..', '..', 'storage', 'images', filename)
        const data = fs.readFileSync(filePath);
        let fileType = filename.split('.')[1];
        if (fileType === 'jpg') {
            fileType = 'jpeg';
        }
        const contentType = 'image/' + fileType;
        res.contentType(contentType)
        res.status(200).send(data)
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const setImage = async (req: Request, res: Response): Promise<void> => {
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


export {getImage, setImage};