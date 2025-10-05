"use client";
import api from '@/utils/api';
import {useState} from 'react';
import { useRouter } from 'next/navigation';
export default function Login() {
    const [form, setForm] = useState({email:'', password:''});
    const [err, setErr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr('');
        
        if(!form.email || !form.password) {
            setErr("Please fill in all fields");
            return;
        }
        
        setIsLoading(true);
        try {
            const res = await api.post("/auth/login",form);
            const token = res.data.token;
            localStorage.setItem('token', token);
            router.push("/dashboard");
        }catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErr(error.response.data.message);
            } else {
                setErr("An error occurred. Please try again.");
            }
    }
}
    
    return (
        
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 flex items-center justify-center p-4">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative w-full max-w-md">
                {/* Logo or brand area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900 mb-2">Welcome back</h1>
                    <p className="text-slate-600 text-sm">Sign in to continue to your tasks</p>
                </div>
                
                {/* Main form card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {err && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {err}
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <p className="text-slate-600 text-sm">
                            Don't have an account?{' '}
                            <a href="/register" className="text-amber-600 hover:text-amber-700 font-medium transition">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
                
                {/* Footer text */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}