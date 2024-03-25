import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as users from  '../models/user.model';
import * as schemas from '../resources/schemas.json';
import validate from '../services/validator';
import * as passwords from '../services/passwords';
import { uid } from 'rand-token';
import jwt from 'jwt-simple';


const register = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST register a user with username: ${req.body.firstName}`)
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = await passwords.hash(req.body.password);
    const checkResult = await users.getUser(email);

    const validation = await validate(
        schemas.user_register,
        req.body);
    if (validation !== true) {
        res.statusMessage= `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }

    if (checkResult.length !== 0) {
        res.status(403).send('Forbidden');
    } else {
        try{
            const result = await users.insert(firstName, lastName, email, password);
            res.status(201).send({ "userId": result.insertId });
            return;
        } catch (err) {
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
            return;
        }
    }

}

const login = async (req: Request, res: Response): Promise<void> => {
    Logger.http('POST request to login a user');
    const email = req.body.email;
    const password = await passwords.hash(req.body.password);
    const checkPassword = await users.getUser(email);
    const comparePassword = await passwords.compare(req.body.password, checkPassword[0].password);
    const token = uid(16);
    const storeToken = await users.insertToken(token, email);

    const validation = await validate(
        schemas.user_login,
        req.body);
    if (validation !== true) {
        res.statusMessage= `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }

    if (comparePassword === false) {
        res.status(401).send('Error:Invalid password')
    } else {
        try{
            const result = await users.userLogin(email, checkPassword[0].password);
            Logger.http(result)
            Logger.http(token)
            res.status(200).send({"token": token, "userId": result[0].id});

        } catch (err) {
            Logger.error(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();

        }
    }

}

const logout = async (req: Request, res: Response): Promise<void> => {
    Logger.info('POST request to logout current user')
    const token = req.headers['x-authorization'];
    try{
        // Your code goes here
        const result = await users.userLogout(token);
        res.status(200).send('User logged out');
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    Logger.http('GET request to get user details');
    const id = parseInt(req.params.id, 10);
    const token = req.headers['x-authorization'];
    if (Number.isNaN(id)) {
        res.status(404).send('No user with specified id');
        return;
    }

    const userDetails = await users.getUserId(id);
    Logger.http(token)
    Logger.http(userDetails)

    if (token !== userDetails[0].auth_token) {
        res.status(200).send({"firstName": userDetails[0].first_name, "lastName": userDetails[0].last_name});
    } else {
        try{
            res.status(200).send({"firstName": userDetails[0].first_name, "lastName": userDetails[0].last_name, "email": userDetails[0].email});
            return;
        } catch (err) {

            Logger.error(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
            return;
        }
    }

}

const update = async (req: Request, res: Response): Promise<void> => {
    Logger.http('PATCH request to change user details');
    const id = parseInt(req.params.id, 10);
    const token = req.headers['x-authorization'];
    const currentPassword = req.body.currentPassword;
    const password = req.body.password;

    if (Number.isNaN(id)) {
        res.status(400).send('Bad request. Invalid information.');
        return;
    }

    const validation = await validate(
        schemas.user_edit,
        req.body);
    if (validation !== true) {
        res.status(400).send('Bad request. Invalid information.');
        return;
    }

    const userDetails = await users.getUserId(id);
    Logger.http(userDetails);
    if (token !== userDetails[0].auth_token) {
        res.status(401).send('Error: Unauthorized');
        return;
    }

    if (currentPassword === password) {
        res.status(403).send('Forbidden');
    }

    try{
        const hashedPassword = await passwords.hash(req.body.password);
        const result = await users.updateUser(hashedPassword, id)
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}