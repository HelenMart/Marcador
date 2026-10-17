import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { eq, asc } from 'drizzle-orm';
import { db, sqlite } from './db.js';
import { matches, events } from './schema.js';
const app=express();app.use(cors());app.use(express.json());
type Client={id:number,send:(data:unknown)=>void,heartbeat:ReturnType<typeof setInterval>};
const clients=new Map<number,Set<Client>>();let clientId=0;
const ordered=(matchId:number)=>db.select().from(events).where(eq(events.matchId,matchId)).orderBy(asc(events.minute),asc(events.createdAt),asc(events.id)).all();
app.get('/api/matches',(_req,res)=>res.json(db.select().from(matches).all()));
app.get('/api/matches/:id',(req,res)=>{const id=Number(req.params.id);const match=db.select().from(matches).where(eq(matches.id,id)).get();if(!match){res.status(404).json({error:'Partido no encontrado'});return;}res.json({match,events:ordered(id)});});
app.get('/api/matches/:id/events/stream',(req,res)=>{const id=Number(req.params.id);if(!db.select().from(matches).where(eq(matches.id,id)).get()){res.status(404).end();return;}
 res.setHeader('Content-Type','text/event-stream');res.setHeader('Cache-Control','no-cache, no-transform');res.setHeader('Connection','keep-alive');res.flushHeaders();
 const send=(payload:unknown)=>res.write(`event: update\ndata: ${JSON.stringify(payload)}\n\n`);
 res.write(': connected\n\n');const heartbeat=setInterval(()=>res.write(': ping\n\n'),15000);const c={id:++clientId,send,heartbeat};if(!clients.has(id))clients.set(id,new Set());clients.get(id)!.add(c);
 req.on('close',()=>{clearInterval(heartbeat);clients.get(id)?.delete(c);if(clients.get(id)?.size===0)clients.delete(id);});});
const eventInput=z.object({minute:z.number().int().min(0).max(130),type:z.enum(['GOAL','FOUL','SUB']),team:z.enum(['HOME','AWAY']),description:z.string().trim().min(3).max(180),player:z.string().trim().max(80).default('')});
app.post('/api/matches/:id/events',(req,res)=>{const id=Number(req.params.id);const parsed=eventInput.safeParse(req.body);if(!parsed.success){res.status(400).json({error:'Formulario inválido',details:parsed.error.flatten()});return;}
 const match=db.select().from(matches).where(eq(matches.id,id)).get();if(!match){res.status(404).json({error:'Partido no encontrado'});return;}
 try{const payload=sqlite.transaction(()=>{const e=parsed.data;const result=db.insert(events).values({...e,matchId:id,createdAt:new Date().toISOString()}).run();if(e.type==='GOAL'){db.update(matches).set(e.team==='HOME'?{homeScore:match.homeScore+1}:{awayScore:match.awayScore+1}).where(eq(matches.id,id)).run();}const updated=db.select().from(matches).where(eq(matches.id,id)).get();const created=db.select().from(events).where(eq(events.id,Number(result.lastInsertRowid))).get();return {match:updated,event:created};})();
 // Transmitir solo DESPUÉS del commit de la transacción.
 clients.get(id)?.forEach(c=>c.send(payload));res.status(201).json(payload);
 }catch{res.status(500).json({error:'No se pudo guardar el evento'});}});
const port=Number(process.env.PORT||3001);app.listen(port,()=>console.log(`API y SSE en http://localhost:${port}`));
