import type { ObjectId, OptionalId } from "mongodb";

export type UserModel = OptionalId<{
    name: string,
    email: string,
    phone: string
}>

export type EventModel = OptionalId<{
    name: string,
    date: Date,
    organizer: ObjectId
}>

export type InscriptionModel = OptionalId<{
    user_id: ObjectId,
    event_id: ObjectId,
    date: Date
}>
