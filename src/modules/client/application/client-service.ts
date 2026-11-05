import type { Client } from "@/src/modules/shared";
import { jGet, jPut } from "@/lib/javaApi";

interface BackendClientProfile { userId:number; fullName:string; phoneNumber?:string; province?:string; updatedAt?:string; }
function mapClient(profile:BackendClientProfile):Client {
  return { id:profile.userId, name:profile.fullName, phone:profile.phoneNumber };
}
async function getCurrentProfile():Promise<BackendClientProfile> {
  return jGet<BackendClientProfile>("/api/v1/client/profile");
}

export const clientService = {
  // ALIS_BACKEND exposes the authenticated client's profile, not a generic
  // /api/clients collection. Admin client listing/creation needs backend routes.
  list: async ():Promise<Client[]> => { throw new Error("Client listing is not exposed by the current ALIS Java API."); },
  get: async (id:string|number):Promise<Client> => {
    const profile = await getCurrentProfile();
    if (String(profile.userId) !== String(id)) throw new Error("The current API only allows access to the authenticated client's profile.");
    return mapClient(profile);
  },
  create: async (_input:Omit<Client,"id">):Promise<Client> => { throw new Error("Client creation is handled by /api/v1/auth/register, not a generic client endpoint."); },
  updateProfile: async (input:Partial<Client>):Promise<Client> => mapClient(await jPut<BackendClientProfile>("/api/v1/client/profile", { fullName:input.name, phoneNumber:input.phone })),
};
