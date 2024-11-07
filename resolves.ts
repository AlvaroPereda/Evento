import { type Collection } from "mongodb";
import type { EventModel, InscriptionModel, UserModel } from "./types.ts";

export const getOrganizer = async(
    evento: EventModel|null,
    userCollection: Collection<UserModel>
):Promise<EventModel> => {
    return ({
        name: evento!.name,
        date: evento!.date,
        organizer : await userCollection.findOne({_id:evento!.organizer})
    })
}

export const getTodo = async(
    ins: InscriptionModel,
    userCollection: Collection<UserModel>,
    eventCollection: Collection<EventModel>
):Promise<InscriptionModel> => {
    const aux = await eventCollection.findOne({_id:ins.event_id})
    return ({
        user_id: await userCollection.findOne({_id:ins.user_id}),
        event_id: await getOrganizer(aux,userCollection),
        date: ins.date
    }) 
}