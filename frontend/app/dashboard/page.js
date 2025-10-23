"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { LogOut } from "lucide-react";


export default function dashboard() {
  const router = useRouter();
  const [tasks, settasks] = useState([]);
  const [form, setform] = useState({ title: "", description: "", status: "todo" });
  const [filter, setfilter] = useState("all");
  const [err, seterr] = useState("");
  const [showmodal, setshowmodal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user,setuser] = useState(null);
  const [search,setsearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showusermodal,setusermodal] = useState(false);
  const [confmodal,setconfmodal] = useState(false);
  const [tasktodelete,setTaskToDelete] = useState(null);

  // Load dark mode preference from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  // Apply dark mode class to html/body
  useEffect(() => {
    if(!mounted) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode,mounted]);


  const fetchuser = async (token) => {
    try{
      const res = await api.get("/auth/me",{
        headers: {Authorization : `Bearer ${token}`}
      });
      setuser(res.data);
    }catch(err){
      console.error("erreur /me : ",err);
      localStorage.removeItem("token");
      router.push("/");
    }
  }

  const fetchtask = async (statusfilter = filter , searchQuery = search) => {
    try {
      
      const params = new URLSearchParams();
      if(statusfilter && statusfilter !== "all"){
        params.append('status',statusfilter);
      }
      if(searchQuery){
        params.append('search',searchQuery);
      }
      const res = await api.get(`/tasks?${params}`);
      console.log("api res : ",res.data);
      settasks(res.data);
    } catch (e) {
      console.error(e);
      seterr("Impossible de charger les tâches");
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchuser(token);
    fetchtask(filter,search);
  }, [filter,search]);

  const handlecreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/tasks", form);
      settasks((prev) => [res.data, ...prev]);
      setform({ title: "", description: "", status: "todo" });
      setshowmodal(false);
    } catch (e) {
      seterr("erreur de creation");
    }
  };
  const handledelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      settasks((prev) => prev.filter((t) => t._id !== id));
    } catch (er) {
      seterr("erreur de supression");
    }
  };

  const handleToggleStatus = async (task) => {
    const next =
      task.status === "todo"
        ? "in-progress"
        : task.status === "in-progress"
        ? "done"
        : "todo";
    try {
      const res = await api.put(`/tasks/${task._id}`, { ...task, status: next });
      settasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch (e) {
      seterr("Erreur update");
    }
  };

 
  const handlelogout = () => {
    localStorage.removeItem("token");
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-lg">
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">TaskFlow</h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Dark Mode"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07 5.07l-.7-.7M6.34 6.34l-.7-.7m12.02 12.02l-.7-.7M6.34 17.66l-.7-.7M12 7a5 5 0 000 10 5 5 0 000-10z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              value={search}
              onChange={(e) => setsearch(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Filters
          </div>
          {["all", "todo", "in-progress", "done"].map((f) => (
            <button
              key={f}
              onClick={() => {setfilter(f); fetchtask(f);}}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-medium text-sm transition flex items-center justify-between ${
                filter === f
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <span>
                {f === "all" ? "All Tasks" : f === "todo" ? "To Do" : f === "in-progress" ? "In Progress" : "Completed"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filter === f ? "bg-amber-100 dark:bg-amber-800 text-amber-900 dark:text-amber-300" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              }`}>
                {tasks.filter(t => f === "all" || t.status === f).length}
              </span>
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setusermodal(true)}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold shadow-lg">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* User Modal */}
      {showusermodal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">My Profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Account information</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setusermodal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition">
                Close
              </button>
              <button onClick={handlelogout} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4"/>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your tasks efficiently</p>
            </div>
            <button name="new task"
              onClick={() => setshowmodal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>
        </div>

        <div className="p-8">
          {tasks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400">No tasks found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create a new task to get started</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 flex flex-col"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{task.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
                    {task.description || "Pas de description"}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      task.status === "done"
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                        : task.status === "in-progress"
                        ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                        : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                    }`}
                  >
                    {task.status === "todo"
                      ? "À faire"
                      : task.status === "in-progress"
                      ? "En cours"
                      : "Terminée"}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="px-3 py-1.5 text-sm border border-amber-500 dark:border-amber-600 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition cursor-pointer"
                      title="Changer le statut"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => {
                        setTaskToDelete(task._id);
                        setconfmodal(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {confmodal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-2">Delete Task?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setconfmodal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handledelete(tasktodelete);
                  setconfmodal(false);
                  setTaskToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showmodal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Create New Task</h2>
            <form onSubmit={handlecreate} className="space-y-4">
              <div>
                <label htmlFor="title" name="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title
                </label>
                <input
                  id="title"
                  required
                  name="title"
                  value={form.title}
                  onChange={(e) => setform({ ...form, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label htmlFor="description" name="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={(e) => setform({ ...form, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none"
                />
              </div>
              
              <div>
                <label htmlFor="status" name="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setform({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setshowmodal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 transition-all"
                >
                  Ajouter
                </button>
              </div>
            </form>
            {err && <p className="text-red-600 dark:text-red-400 text-sm mt-3">{err}</p>}
          </div>
        </div>
      )}
    </div>
  );
}