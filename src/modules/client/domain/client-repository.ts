import type {Client} from "@/src/modules/shared";export interface ClientRepository{list():Promise<Client[]>;get(id:string|number):Promise<Client>;create(input:Omit<Client,"id">):Promise<Client>;}
