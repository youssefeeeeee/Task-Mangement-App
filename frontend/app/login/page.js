"use client";
import {useState} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function login() {
    const [form,setfrom] = useState({email:'',password:''});
    const [err,seterr] = useState('');
    const router = useRouter();

    const handlechange = (e) => setfrom({...form, [e.target.name]:e.target.value});
    const handlesubmit = async (e) => {
        e.preventDefault();
        seterr('');
        if(!form.email || !form.password) {
            seterr("Please fill in all fields");
            return;
        }
        try{
        const res = await api.post('/auth/login',form);
        const token = res.data.token;
        localStorage.setItem('token',token);
        router.push('/dashboard');
        } catch (error) {
      seterr(" your email or password is incorrect");
    }
    }
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden"> 
            <main className='relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center font-sans'>
                <form onSubmit={handlesubmit} className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-lg">
                    <h1 className="mb-8 text-3xl font-semibold text-white">Connexion</h1>
                    <input className="mb-6 w-full rounded-full bg-white/20 px-5 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/30 transition" name='email' type="email" value={form.email} onChange={handlechange} placeholder='Email..'/>
                    <input className="mb-6 w-full rounded-full bg-white/20 px-5 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/30 transition" name='password' type="password" value={form.password} onChange={handlechange} placeholder='Password...'/>
                    <button className="mb-6 w-full rounded-full bg-indigo-600 py-3 text-lg font-semibold text-white shadow-md shadow-indigo-700/50 hover:bg-indigo-700 transition cursor-pointer">Se Connecter</button>
                    <p className='text-white'>You don't have an account?<a href="/register" className='text-blue-600 underline'> Sign Up</a></p>
                    {err && <div className="text-red-500 mb-2">{err}</div>}
                </form>
            </main>
        </div>
    );
}