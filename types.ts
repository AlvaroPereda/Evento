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

export type User = {
    id?: string,
    name?: string,
    email?: string,
    phone?: string
}

export type Event = {
    id?: string,
    name?: string,
    date?: Date,
    organizer?: User
}

export type Inscription = {
    id: string,
    user_id: User,
    event_id: Event,
    date: Date
}