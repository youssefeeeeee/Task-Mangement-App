import Login from './page';
import {render, screen, fireEvent} from '@testing-library/react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

jest.mock('@/utils/api');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('Login page Test', () => {
    const pushmock = jest.fn();

beforeEach(() => {
    useRouter.mockReturnValue({push: pushmock});
    let store = {};
    Object.defineProperty(window,'localStorage',{
        value:{
            getItem: jest.fn((key) => store[key] || null),
            setItem: jest.fn((key, value) => {store[key] = value;}),
            clear: jest.fn(() => {store = {};}),
        },
        writable: true,
    });
    jest.clearAllMocks();
});
test('renders login form',() => {
    render(<Login/>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button',{name:/sign in/i})).toBeInTheDocument();
});
test('show error when fields are empty', () => {
    render(<Login/>);
    const button = screen.getByRole('button',{name:/sign in/i});
    fireEvent.click(button);
    expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
});
test('updates from field on user input', () => {
    render(<Login/>);
    const emailinput = screen.getByLabelText(/email/i);    
    const passwordinput = screen.getByLabelText(/password/i); 
    fireEvent.change(emailinput, {target: {value: 'test@example.com'}});
    fireEvent.change(passwordinput, {target: {value: 'password123'}});
    expect(emailinput.value).toBe('test@example.com');
    expect(passwordinput.value).toBe('password123');   
});
test('calls api.post and sets token on successful login', async () => {
    api.post.mockResolvedValue({ data : {token: 'fake-token'}});
    render(<Login/>);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'test@example.com'}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'password123'}});
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await screen.findByRole('button');
    expect(api.post).toHaveBeenCalledWith('/auth/login',{email: 'test@example.com', password: 'password123'});
    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
    expect(pushmock).toHaveBeenCalledWith('/dashboard');
});
test('shows error message on failed login', async () => {
    api.post.mockRejectedValue({ response : {data : { message : 'Invalid credentials'}}});
    render(<Login/>);
    fireEvent.change(screen.getByLabelText(/email/i),{target: {value: 'test@example.com'}});
    fireEvent.change(screen.getByLabelText(/password/i),{target: {value: 'wrongpassword'}});
    fireEvent.click(screen.getByRole('button'));
    const errormsg = await screen.findByText(/invalid credentials/i);
    expect(errormsg).toBeInTheDocument();
});

})
