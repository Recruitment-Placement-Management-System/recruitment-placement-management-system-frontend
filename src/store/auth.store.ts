import {create} from 'zustand';

interface AuthUser{
    id:string;
    email:string;
    roles:string[];
}

interface AuthState {
    user:AuthUser|null;
    accessToken:string|null;
    isAuthenticated:boolean;

    login:(accessToken:string,user:AuthUser)=>void;
    logout:()=>void;
}


const useAuthStore = create<AuthState>((set)=>({
    user: null,
  accessToken: null,
  isAuthenticated: false,

  login: (accessToken, user) => {
    set({
      accessToken,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}))

export default useAuthStore;