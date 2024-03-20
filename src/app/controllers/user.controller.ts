import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as users from  '../models/user.model';
import * as schemas from '../resources/schemas.json';
import validate from '../services/validator';

const register = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST register a user with username: ${req.body.firstName}`)
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;


    const validation = await validate(
        schemas.user_register,
        req.body);
    if (validation !== true) {
        res.statusMessage= `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }

    try{
        const result = await users.insert(firstName, lastName, email, password);
        res.status(201).send({ "user_id": result.insertId });
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
    Logger.http('POST request to login a user');
    const email = req.params.email;
    const password = req.params.password;
    try{
        // Your code goes here
        const result = await users.userLogin(email, password);
        res.status(201).send('User logged in');

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();

    }
}

const logout = async (req: Request, res: Response): Promise<void> => {
    Logger.info('POST request to logout current user')
    const token = req.headers['x-authorization'];
    try{
        // Your code goes here
        const result = await users.userLogout(token);
        res.statusMessage = "Not Implemented Yet!";
        res.status(201).send('User logged out');
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    try{
        // Your code goes here
        res.status(201).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const update = async (req: Request, res: Response): Promise<void> => {
    Logger.http('GET User details')
    const userId = req.params.id;
    try{
        // Your code goes here
        const result = await users.getUser(userId);
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}