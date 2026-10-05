import {createHttpClient} from "@/src/modules/shared";
const JAVA_API=process.env.NEXT_PUBLIC_JAVA_API_URL??"http://localhost:8080";const AI_API=process.env.NEXT_PUBLIC_AI_API_URL??"http://localhost:8000";
export const javaApi=createHttpClient(JAVA_API);export const aiApi=createHttpClient(AI_API);
