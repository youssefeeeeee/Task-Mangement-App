import Dashboard from "./page";
import {render, screen, fireEvent, waitFor, within} from "@testing-library/react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

jest.mock('@/utils/api');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));
beforeAll(() => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key],
      setItem: (key, val) => (store[key] = val),
      removeItem: (key) => delete store[key],
      clear: () => (store = {}),
    };
  })();
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
});
describe("Dashboard Page Test", () => {
    const pushmock = jest.fn();
    beforeEach(() => {
        useRouter.mockReturnValue({push: pushmock});
        jest.clearAllMocks();
        window.localStorage.setItem('token', 'fake-token');
    })
    test("renders dashboard and fetches tasks + user successfully",async () => {
        api.get.mockImplementation((url) => {
            if(url.includes('/tasks')) {
                return Promise.resolve({ data: [{ _id: "1", title: "Task 1", description: "desc", status: "todo" }] });
            }
            if(url.includes('/auth/me')) {
                return Promise.resolve({data: {name: 'user', email: 'usr@example.com'}});
            }
        });
        render(<Dashboard/>);
        expect(await screen.findByText("Dashboard")).toBeInTheDocument();
        expect(await screen.findByText("Task 1")).toBeInTheDocument();
        expect(await screen.findByText("user")).toBeInTheDocument();
    });
    test("redirects to login if no token", async () => {
        window.localStorage.removeItem('token');
        render(<Dashboard/>);
        await waitFor(() => {
            expect(pushmock).toHaveBeenCalledWith('/');
        });
    });
    test("creates a new task when form is submitted", async () => {
        api.get.mockImplementation((url) => {
        if (url.includes("/tasks")) {
            return Promise.resolve({ data: [] });
        }
        if (url.includes("/auth/me")) {
            return Promise.resolve({ data: { name: "User", email: "u@test.com" } });
        }
        });
        api.post.mockResolvedValueOnce({
        data: { _id: "2", title: "New Task", description: "Some desc", status: "todo" },
    });

    render(<Dashboard />);
    const newTaskButton = screen.getByRole('button', { name: /new task/i });
    fireEvent.click(newTaskButton);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "New Task" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Some desc" } });
    fireEvent.click(screen.getByText(/ajouter/i));

    await waitFor(() => expect(screen.getByText("New Task")).toBeInTheDocument());
  });
   test("deletes a task successfully", async () => {
        // initial get returns one task and user
        api.get.mockImplementation((url) => {
            if (url.includes('/tasks')) {
                return Promise.resolve({ data: [{ _id: 'del-1', title: 'ToDelete', description: 'will be deleted', status: 'todo' }] });
            }
            if (url.includes('/auth/me')) {
                return Promise.resolve({ data: { name: 'User', email: 'u@test.com' } });
            }
        });

        // mock delete to succeed
        api.delete.mockResolvedValueOnce({});

        render(<Dashboard />);

        // ensure task is shown
        expect(await screen.findByText('ToDelete')).toBeInTheDocument();

        // click the delete button for the task (there may be multiple Delete buttons; find the one near the task)
        const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
        // choose the first delete button (should correspond to our single task)
        fireEvent.click(deleteButtons[0]);

    // the confirmation modal appears; wait for the confirmation text then click the modal's Delete button
        await screen.findByText(/are you sure you want to delete this task\?/i);
        const allDeleteBtns = screen.getAllByRole('button', { name: /^delete$/i });
        // the modal's delete button should be the last one rendered
        fireEvent.click(allDeleteBtns[allDeleteBtns.length - 1]);

        // wait for the task to be removed from the document
        await waitFor(() => {
            expect(screen.queryByText('ToDelete')).not.toBeInTheDocument();
        });
    });
});
