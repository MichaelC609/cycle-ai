'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    //Check for existing auth token on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if(token)
        {
            try{
                const decoded = jwtDecode(token);

                //Check if token is expired
                if(decoded.exp * 1000 > Date.now())
                {
                    setUser(decoded)
                }

                    //Token expired, clear it
                    else
                    {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                    }
            } catch(error) {
                console.error('Invalid token: ', error);
            }
        }
        setLoading(false);
    }, []);

    const login = async(credential) => {
        //send google credential to backend
        try{
            const response = await fetch('http://localhost:8000/api/routes/auth/google/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({credential}),
            });

            if(!response.ok)
            {
                throw new Error('Authentication failed');
            }

            const data = await response.json();

            //Store tokens in localStorage
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            //Decode and store user info
            const decoded = jwtDecode(data.access);
            setUser(data.user);

            return data;
        } catch(error) {
            console.error('Login error:', error);
            throw error;
        }
    };


    //clears tokens and user data
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const value = {
        user, 
        login,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>;
};

//custom hook to access auth context from any component
export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context)
    {
        throw new Error('useAuth must be used within an attribute');
    }

    return context;
}