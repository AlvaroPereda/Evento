import { type Collection } from "mongodb";
import type { Event, EventModel, Inscription, InscriptionModel, User, UserModel } from "./types.ts";

export const getOrganizer = async(
    evento: EventModel | null,
    userCollection: Collection<UserModel>
):Promise<Event> => {
    const aux = await userCollection.findOne({_id:evento?.organizer})
    return ({
        id: evento?._id.toString(),
        name: evento?.name,
        date: evento?.date,
        organizer : changeUser(aux)
    })
}

export const getTodo = async(
    ins: InscriptionModel,
    userCollection: Collection<UserModel>,
    eventCollection: Collection<EventModel>
):Promise<Inscription> => {
    
    const aux = await eventCollection.findOne({_id:ins.event_id})
    const user = await userCollection.findOne({_id:ins.user_id})
    console.log(user)
    return ({
        id: ins._id.toString(),
        user_id: changeUser(user),
        event_id: await getOrganizer(aux,userCollection),
        date: ins.date
    }) 
}

export const changeUser = (
    usuario : UserModel | null
):User => {
    return ({
        id: usuario?._id?.toString(),
        name: usuario?.name,
        email: usuario?.email,
        phone: usuario?.phone
    })
} 