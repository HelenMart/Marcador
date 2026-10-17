import 'dotenv/config';
import {db} from '../src/db.js';
import {matches} from '../src/schema.js';
if(db.select().from(matches).all().length===0){db.insert(matches).values([{home:'Real Madrid',away:'Barcelona',status:'LIVE'},{home:'Manchester City',away:'Liverpool',status:'LIVE'}]).run(); console.log('Dos partidos creados');} else console.log('Los partidos ya existen');
