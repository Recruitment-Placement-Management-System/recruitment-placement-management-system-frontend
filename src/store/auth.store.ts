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
    isInitializing:boolean;

    login:(accessToken:string,user:AuthUser)=>void;
    setAccessToken:(accessToken:string)=>void;
    setInitializing:(value:boolean)=>void;
    logout:()=>void;
}


const useAuthStore = create<AuthState>((set)=>({
    user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing:true,

  login: (accessToken, user) => {
    set({
      accessToken,
      user,
      isAuthenticated: true,
    });
  },

  setAccessToken:(accessToken)=>{
    set({
        accessToken,
        isAuthenticated:true,
    })
  },

  setInitializing: (value) => {
    set({
      isInitializing: value,
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