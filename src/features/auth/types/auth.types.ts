export interface RegisterCandidateData{
    fullName:string;
    email:string;
    password:string;
    phone?:string;
}

export interface VerifyEmailData{
    email:string;
    verificationCode:string;
}