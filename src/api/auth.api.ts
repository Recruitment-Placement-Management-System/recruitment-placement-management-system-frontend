import api from "./axios";
import type { RegisterCandidateData,VerifyEmailData } from "../features/auth/types/auth.types";

export const registerCandidate = async(
    data:RegisterCandidateData
)=>{
    const response = await api.post('/auth/register',data);
    return response.data;
}

export const verifyEmail = async(
    data:VerifyEmailData,
)=>{
    const response = await api.post('/auth/verify-email',data)
    return response.data;
}