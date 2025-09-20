"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";


export default function register() {
    const [form, setform] = useState({name:'',email:'',password:''});
    const [err,seterr]  = useState('');
    const router = useRouter();

    const handlechanges = (e) => setform({...form, [e.target.name]:e.target.value});

    const handlesubmit = async (e) => {
        e.preventDefault();
        seterr('');
        try{
            await api.post('/auth/register',form);
            router.push('/login');
        }catch (error) {
            console.log(error);
        }
    }
    return(
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden">
            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center font-sans">
                <form onSubmit={handlesubmit} className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-lg">
                    <h1 className="mb-8 text-3xl font-semibold text-white">Inscription</h1>
                    {err && <div className="text-red-500 mb-2">{err}</div>}
                    <input name="name" type="text" value={form.name} onChange={handlechanges} placeholder="Name.." className="mb-6 w-full rounded-full bg-white/20 px-5 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/30 transition"/>
                    <input name="email" type="email" value={form.email} onChange={handlechanges} placeholder="Email..." className="mb-6 w-full rounded-full bg-white/20 px-5 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/30 transition"/>
                    <input name="password" type="password" value={form.password} onChange={handlechanges} placeholder="Password..." className="mb-6 w-full rounded-full bg-white/20 px-5 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/30 transition"/>
                    <button className="mb-6 w-full rounded-full bg-indigo-600 py-3 text-lg font-semibold text-white shadow-md shadow-indigo-700/50 hover:bg-indigo-700 transition">S'inscrire</button>
                </form>
            </main>
        </div>
    );
}