import logger from '../../config/logger';
import bcrypt from 'bcrypt';

const hash = async (password: string): Promise<string> => {
    password = await bcrypt.hash(password, 10);
    return password;
}

const compare = async (password: string, comp: string): Promise<boolean> => {
    const passwordMatch = await bcrypt.compare(password, comp);
    if (passwordMatch) {
        logger.info('Password match')
    } else {
        logger.info('Password do not match')
    }
    return passwordMatch;
}

export {hash, compare}