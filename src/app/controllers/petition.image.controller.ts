import {Request, Response} from "express";
import Logger from "../../config/logger";
import fs, {readFileSync} from 'fs';
import * as path from 'path';
import * as image from '../models/petition.image.model';
import * as petition from '../models/petition.model'
import * as users from "../models/user.model";

const getImage = async (req: Request, res: Response): Promise<void> => {
    const petitionId = parseInt(req.params.id, 10);

    const checkId = await petition.petitionDetails(petitionId);
    if (checkId.length === 0) {
        res.status(404).send('Not Found. No petition with id or Petition has no image')
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
    const petitionId = parseInt(req.params.id, 10);
    const token = req.headers['x-authorization'] as string;
    const body = req.body;
    const contentType = req.headers['content-type'] as string;


    const userDetails = await users.userByToken(token);
    if (token !== userDetails[0].auth_token) {
        res.status(403).send('Forbidden')
        return;
    }

    const id = userDetails[0].id;
    if (Number.isNaN(petitionId)){
        res.status(404).send('Not found. No user with ID given');
        return;
    }
    if (contentType !== 'image/jpeg' && contentType !== 'image/png' && contentType !== 'image/gif') {
        res.status(400).send('Bad request')
        return;
    }

    if (token !== userDetails[0].auth_token) {
        res.status(403).send("Forbidden. Only the owner of aa petition can change the hero image");
        return;
    }

    const filename = `petition_${petitionId}`;
    const fileType = contentType.split('/')[1];
    const filePath = path.join(__dirname, '..' , '..', '..', 'storage', 'images', `${filename}.${fileType}`)
    const petitionDetails = await petition.petitionDetails(petitionId);

    if (petitionDetails[0].image_filename === null) {
        fs.writeFileSync(filePath, body, 'binary');
        const setPhoto = await image.setPhoto(petitionId, filename, fileType);
        res.status(201).send('Created. New image created')
        return;
    }

    try{
        fs.writeFileSync(filePath, body, 'binary');
        const setPhoto = await image.setPhoto(petitionId, filename, fileType);
        res.status(200).send('OK. Image updated');
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


export {getImage, setImage};