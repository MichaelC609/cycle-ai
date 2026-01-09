'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

function OAuthLoginButton()
{
    const { login } = useAuth();
    const router = useRouter();

    const handleSuccess = async(credentialResponse) => {
        try{
            console.log('Google login successful, credential: ', credentialResponse.credential);

            //send credential to backend via AuthContext
            await login(credentialResponse.credential);
            console.log('Backend authentication successful');

            //Redirect to home page
            router.push('/');
        } catch(error) {
            console.error('Login failed', error);
            alert('Login failed. Please try again');
        }
    };

    const handleError = () => {
        console.error('Google login failed');
        alert('Google login failed. Please try again')
    };

    return (
        <div className="flex justify-center items-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme='outline'
                size='large'
                text='Signin_with'
            />
        </div>
    );
}

export default OAuthLoginButton