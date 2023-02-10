import Amplify, { Auth, Hub } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

export async function signIn(username: string, password: string) {
    try {
        const user = await Auth.signIn(username, password);
        return user;
    } catch (error) {
        return error;
    }
}
