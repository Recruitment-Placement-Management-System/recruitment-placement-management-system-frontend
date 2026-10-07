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

export interface loginData {
    email:string;
    password:string
};

export interface LoginUser{
    id:string;
    email:string;
    roles:string[];
}

export interface LoginResponse{
    message:string;
    accessToken:string;
    user:LoginUser
}

export interface ResetPasswordData {
    token:string;
    newPassword:string;
}