"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";


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

  const fetchtask = async () => {
    try {
      const res = await api.get("/tasks");
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
    fetchtask();
  }, []);

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

  const filtered = tasks
  .filter((t) => (filter === "all" ? true : t.status === filter))
  .filter((t) => 
  t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">TaskApp</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Toggle Dark Mode"
          >
            {darkMode ?  (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07 5.07l-.7-.7M6.34 6.34l-.7-.7m12.02 12.02l-.7-.7M6.34 17.66l-.7-.7M12 7a5 5 0 000 10 5 5 0 000-10z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                />
              </svg>
            )}
          </button>
        </div>
        <nav className="flex-1 px-6 py-8 space-y-6">
         <p className="w-full text-left px-4 py-2 rounded-lg font-semibold transition bg-blue-600 text-white shadow-lg">DashBoard</p>
        </nav>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-3">
          <div>
            <p className="font-semibold">Welcome, {user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <button
            onClick={() => setshowmodal(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
          >
            + New Task
          </button>
        </div>
        {/* Filter buttons */}
        <input type="text" placeholder="Search.." className="border border-gray-500 bg-white text-black w-full h-[50px] rounded-xl pl-3 mb-4" value={search} onChange={(e) => setsearch(e.target.value)}/>
          <div className="mb-6 flex flex-wrap gap-3">
          {["all", "todo", "in-progress", "done"].map((f) => (
            <button
              key={f}
              onClick={() => setfilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {f === "all"
                ? "Tous"
                : f === "todo"
                ? "À faire"
                : f === "in-progress"
                ? "En cours"
                : "Terminées"}
            </button>
          ))}
        </div>

        {/* Tasks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 && (
            <p className="text-center col-span-full text-gray-500 dark:text-gray-400">
              Aucune tâche à afficher.
            </p>
          )}
          {filtered.map((task) => (
            <div
              key={task._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-xl transition cursor-pointer"
            >
              <div>
                <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {task.description || "Pas de description"}
                </p>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    task.status === "done"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
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
                    className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                    title="Changer le statut"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handledelete(task._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    title="Supprimer la tâche"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showmodal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Nouvelle tâche
              </h2>
              <form onSubmit={handlecreate} className="space-y-5">
                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={(e) => setform({ ...form, title: e.target.value })}
                  placeholder="Titre"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setform({ ...form, description: e.target.value })}
                  placeholder="Description"
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <select
                  value={form.status}
                  onChange={(e) => setform({ ...form, status: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="todo">À faire</option>
                  <option value="in-progress">En cours</option>
                  <option value="done">Terminée</option>
                </select>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setshowmodal(false)}
                    className="px-5 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
              {err && <p className="text-red-600 mt-3">{err}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
