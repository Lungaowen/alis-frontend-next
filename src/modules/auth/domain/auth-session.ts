import type {Id,ProfessionalMembership,User} from "@/src/modules/shared";export interface AuthSession{user:User;memberships:ProfessionalMembership[];activeTenantId?:Id;token:string;}
