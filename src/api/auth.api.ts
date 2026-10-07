import api from "./axios";
import type { RegisterCandidateData,VerifyEmailData,loginData,LoginResponse } from "../features/auth/types/auth.types";

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

export const resendVerificationEmail = async (
  email: string
) => {
  const response = await api.post('/auth/resend-verification', {
    email,
  });

  return response.data;
};

export const login = async(
    data:loginData
):Promise<LoginResponse>=>{
    const response = await api.post('/auth/login',data);
    return response.data;
}

export const logout = async ()=>{
    const response = await api.post('/auth/logout');
    return response.data;
}

