"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";


export default function dashboard(){

    const router = useRouter();
    const [tasks,settasks] = useState([]);
    const [form,setform] = useState({title:'',description:'',status:'to-do'});
    const [filter,setfilter] = useState('all');
    const [err,seterr] = useState('');
    const nav = [
      {label:"Dashboard",href:""},
      {label:"Tasks",href:""}
    ]

    const fetchtask = async () => {
        try{
           const res=  await api.get('/tasks');
           settasks(res.data);
        }catch (e) {
            console.error(e);
            seterr('Impossible de charger les tâches');
        }
    };

    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('token');
        if(!token) {router.push('/login'); return;}
        fetchtask();
    },[]);

    const handlecreate = async (e) => {
        e.preventDefault();
        try{
            const res = await api.post('/tasks',form);
            settasks(prev => [res.data,...prev]);
            setform({title:'',description:'',status:'To-Do'});
        }catch(e){
            seterr('erreur de creation');
        }
    }
const handledelete = async (id) => {
    try{
        await api.delete(`/tasks/${id}`);
        settasks(prev => prev.filter( t => t._id !== id));
    }catch(er){
        seterr("erreur de supression");
    }
}

 const handleToggleStatus = async (task) => {
    const next = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
    try {
      const res = await api.put(`/tasks/${task._id}`, { ...task, status: next });
      settasks(prev => prev.map(t => t._id === task._id ? res.data : t));
    } catch (e) {
      seterr('Erreur update');
    }
  };

  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);

   return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden max-w-full"> 
        <div className="flex justify-start items-start">
      
    {/* Sidebar */}
    <div className="flex flex-col items-start border-r border-white p-5">
      <h1 className="text-white font-bold text-3xl border-b p-4 pb-7 ">TaskMg</h1>
      <ul className="list-none text-white space-y-5 font-semibold text-lg p-4">
        <li>Dashboard</li>
        <li>Tasks</li>
      </ul>
    </div>

    {/* Form */}
    <h1 className="text-white text-3xl p-10 flex">{nav.label}</h1>
    <div className="w-full">
    <form 
      onSubmit={handlecreate} 
      className="mb-4 flex gap-2 text-white w-[60%] p-5"
    >
      <input 
        required 
        name="title" 
        value={form.title} 
        onChange={e => setform({...form, title: e.target.value})} 
        placeholder="Titre" 
        className="flex-1 p-2 border rounded" 
      />
      <select 
        value={form.status} 
        onChange={e => setform({...form, status: e.target.value})} 
        className="p-2 border rounded"
      >
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <button className="p-2 bg-blue-600 text-white rounded">Ajouter</button>
    </form>


    <div className="mb-4 flex gap-2 text-white">
        {['all','todo','in-progress','done'].map(f => (
          <button key={f} onClick={() => setfilter(f)} className={`px-3 py-1 rounded ${filter===f ? 'bg-blue-600 text-white' : 'border'}`}>{f}</button>
        ))}
      </div>

      <ul className="space-y-3 text-white ">
        {filtered.map(task => (
          <li key={task._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{task.title}</div>
              <div className="text-sm text-gray-600">{task.description}</div>
              <div className="text-xs mt-1">Status: {task.status}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleToggleStatus(task)} className="px-2 py-1 border rounded">Next</button>
              <button onClick={() => handledelete(task._id)} className="px-2 py-1 bg-red-500 text-white rounded">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
</div>

  );
}