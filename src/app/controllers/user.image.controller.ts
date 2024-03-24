import {Request, Response} from "express";
import Logger from "../../config/logger";
import fs, {readFileSync} from 'fs';
import * as path from 'path';
import * as users from  '../models/user.model';
import * as image from '../models/user.image.model';


const getImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http('GET request to retrieve user profile image')
    const id = parseInt(req.params.id, 10);

    const checkId = await users.getUserId(id);
    if (checkId.length === 0) {
        res.status(404).send('Not Found. No user with specified ID, or user has no image')
        return;
    }
    const photo = await image.getPhoto(id);
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
    Logger.http('POST request to set user profile photo ')
    const id = parseInt(req.params.id, 10);
    const token = req.headers['x-authorization'];
    const body = req.body;
    const contentType = req.headers['content-type'];
    const filename = `user_${id}`;
    const fileType = contentType.split('/')[1];
    const filePath = path.join(__dirname, '..' , '..', '..', 'storage', 'images', `${filename}.${fileType}`)



    if (Number.isNaN(id)){
        res.status(404).send('Not found. No user with ID given');
        return;
    }

    const userDetails = await users.getUserId(id);
    if (userDetails.length === 0) {
        res.status(404).send('Not found. No user with ID given');
        return;
    }
    if (token !== userDetails[0].auth_token) {
        res.status(403).send("Forbidden. Can not delete another user's profile photo");
        return;
    }

    if (userDetails[0].image_filename === null) {
        fs.writeFileSync(filePath, body, 'binary');
        const setPhoto = await image.setPhoto(id, filename, fileType);
        res.status(201).send('Created. New image created')
        return;
    }

    try{
        fs.writeFileSync(filePath, body, 'binary');
        const setPhoto = await image.setPhoto(id, filename, fileType);
        res.status(200).send('OK. Image updated');
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deleteImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http('DELETE request to delete user profile photo')
    const id = parseInt(req.params.id, 10);
    const token = req.headers['x-authorization'];

    if (Number.isNaN(id)){
        res.status(404).send('Not found. No user with ID given');
        return;
    }

    const userDetails = await users.getUserId(id);
    if (userDetails.length === 0) {
        res.status(404).send('Not found. No user with ID given');
        return;
    }

    if (token !== userDetails[0].auth_token) {
        res.status(403).send("Forbidden. Can not delete another user's profile photo");
        return;
    }

    try{
        const deletePhoto = await image.deletePhoto(id);
        res.status(200).send('OK');
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }

}

export {getImage, setImage, deleteImage}