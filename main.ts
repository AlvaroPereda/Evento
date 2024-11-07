import { MongoClient } from 'mongodb'

const url = Deno.env.get("MONGO_URL")
if(!url) {
  console.log("La url no existe")
  Deno.exit(1)
}

const client = new MongoClient(url);

await client.connect();
console.log('Conectado correctamente a la base de datos');

const db = client.db("Evento");
const collection = db.collection("users");

const handler = async(req: Request):Promise<Response> => {
  return new Response("Buenas")
}

Deno.serve({port:3000}, handler)