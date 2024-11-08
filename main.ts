import { MongoClient, ObjectId } from 'mongodb'
import type { EventModel, InscriptionModel, UserModel } from "./types.ts";
import { changeUser, getOrganizer, getTodo } from "./resolves.ts";

const url = Deno.env.get("MONGO_URL")
if(!url) {
  console.log("La url no existe")
  Deno.exit(1)
}

const client = new MongoClient(url);

await client.connect();
console.log('Conectado correctamente a la base de datos');

const db = client.db("Evento");
const userCollection = db.collection<UserModel>("users");
const eventCollection = db.collection<EventModel>("event");
const inscriptionCollection = db.collection<InscriptionModel>("inscription");

const handler = async(req: Request):Promise<Response> => {
  const url = new URL(req.url)
  const method = req.method
  const path = url.pathname

  if(method === "GET") {
    if(path === "/users") {
      const result = await userCollection.find().toArray()
      const resultFinal = result.map(e => changeUser(e))
      return new Response(JSON.stringify(resultFinal))
    } else if(path === "/events") {
      const result = await eventCollection.find().toArray()
      const resultFinal = await Promise.all(result.map(e => getOrganizer(e,userCollection)))
      return new Response(JSON.stringify(resultFinal))
    } else if(path === "/inscription") {
      const result = await inscriptionCollection.find().toArray()
      const resultFinal = await Promise.all(result.map(e => getTodo(e,userCollection,eventCollection)))
      return new Response(JSON.stringify(resultFinal))
    }
  } else if(method === "POST") {
    if(path === "/users") {
      const body = await req.json()
      if(!body.name || !body.email || !body.phone) return new Response("Bad request", {status:400})
      const comprobar = await userCollection.find({email: body.email}).toArray()
      if(comprobar.length > 0) return new Response("User already inserted", {status:404})
      const { insertedId } = await userCollection.insertOne({
        name: body.name,
        email: body.email,
        phone: body.phone
      })
      return new Response("Usuario insertado correctamente con ID: " + insertedId)
    } else if(path === "/events") {
      const body = await req.json()
      if(!body.name || !body.date || !body.organizer) return new Response("Bad request", {status:400})
      const comprobarOrganizer = await userCollection.findOne({_id:new ObjectId(body.organizer)})
      if(!comprobarOrganizer) return new Response("Organizer not found", {status:404})
      const comprobarNombre = await eventCollection.findOne({name:body.name, date:new Date(body.date)})
      if(comprobarNombre) return new Response("Event already inserted", {status:404})
      const { insertedId } = await eventCollection.insertOne({
        name: body.name,
        date: new Date(body.date),
        organizer: new ObjectId(body.organizer)
      })
      return new Response("Evento insertado correctamente con ID: " + insertedId)
    } else if(path === "/inscription") {
      const body = await req.json()
      if(!body.user_id || !body.event_id || !body.date) return new Response("Bad request", {status:400})
      const comprobarUser = await userCollection.findOne({_id: new ObjectId(body.user_id)})
      const comprobarEvent = await eventCollection.findOne({_id: new ObjectId(body.event_id)})
      if(!comprobarUser || !comprobarEvent) return new Response("User or Event not found", {status:404})
      const { insertedId } = await inscriptionCollection.insertOne({
        user_id: new ObjectId(body.user_id),
        event_id: new ObjectId(body.event_id),
        date: new Date(body.date)
      })
      return new Response("Incripcion insertada correctamente con ID: " + insertedId)
    }
  } else if(method === "PUT") {
    if(path === "/users") {
      const body = await req.json()
      if(!body.id || !body.name || !body.email || !body.phone) return new Response("Bad request", {status:400})
      const { modifiedCount } = await userCollection.updateOne(
        {_id:new ObjectId(body.id)},
        {$set:{
          name: body.name,
          email: body.email,
          phone: body.phone
        }}
      )
      if(modifiedCount === 0) return new Response("User not found", {status:404})
      return new Response("Usuario actualizado correctamente")
    } else if(path === "/events") {
      const body = await req.json()
      if(!body.id || !body.name || !body.date || !body.organizer) return new Response("Bad request", {status:400})
      const comprobarOrganizer = await userCollection.findOne({_id:new ObjectId(body.organizer)})
      if(!comprobarOrganizer) return new Response("Organizer not found", {status:404})
      const { modifiedCount } = await eventCollection.updateOne(
        {_id:new ObjectId(body.id)},
        {$set:{
          name: body.name,
          date: new Date(body.date),
          organizer: new ObjectId(body.organizer)
        }}
      )
      if(modifiedCount === 0) return new Response("Event not found", {status:404})
        return new Response("Evento actualizado correctamente")
    } else if(path === "/inscription") {
      const body = await req.json()
      if(!body.id || !body.user_id || !body.event_id || !body.date) return new Response("Bad request", {status:400})
      const comprobarUser = await userCollection.findOne({_id: new ObjectId(body.user_id)})
      const comprobarEvent = await eventCollection.findOne({_id: new ObjectId(body.event_id)})
      if(!comprobarUser || !comprobarEvent) return new Response("User or Event not found", {status:404})
      const { modifiedCount } = await inscriptionCollection.updateOne(
        {_id:new ObjectId(body.id)},
        {$set:{
          user_id: new ObjectId(body.user_id),
          event_id: new ObjectId(body.event_id),
          date: new Date(body.date)
        }}
      )
      if(modifiedCount === 0) return new Response("Incription not found", {status:404})
        return new Response("Inscripcion actualizada correctamente")
    }
  } else if(method === "DELETE") {
    if(path === "/users") {
      const body = await req.json()
      if(!body.id) return new Response("Bad request", {status:400})
      const { deletedCount } = await userCollection.deleteOne({_id:new ObjectId(body.id)})
      await inscriptionCollection.deleteOne({user_id:new ObjectId(body.id)}) 
      await eventCollection.updateMany(
        {_id:new ObjectId(body.id)},
        {$pull:{organizer:new ObjectId(body.id)}}
      )
      if(deletedCount === 0) return new Response("User not found", {status:404})
      return new Response("Usuario borrado correctamente")
    } else if(path === "/events") {
      const body = await req.json()
      if(!body.id) return new Response("Bad request", {status:400})
      const { deletedCount } = await eventCollection.deleteOne({_id:new ObjectId(body.id)})
      await inscriptionCollection.deleteOne({event_id:new ObjectId(body.id)}) 
      if(deletedCount === 0) return new Response("Event not found", {status:404})
      return new Response("Evento borrado correctamente")
    } else if(path === "/inscription") {
      const body = await req.json()
      if(!body.id) return new Response("Bad request", {status:400})
      const { deletedCount } = await inscriptionCollection.deleteOne({_id:new ObjectId(body.id)}) 
      if(deletedCount === 0) return new Response("Incription not found", {status:404})
      return new Response("Inscripcion borrada correctamente")
    }
  }

  return new Response("Endpoint not found", {status:404})
}

Deno.serve({port:3000}, handler)