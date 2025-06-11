import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

expand(dotenv.config());

console.log("DSFADSFASDFASDF", process.env.DATABASE_URL);