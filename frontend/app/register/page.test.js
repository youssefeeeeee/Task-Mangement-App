import Register from "./page";
import { render, screen, fireEvent} from "@testing-library/react";
import api from '@/utils/api';
import {useRouter} from 'next/navigation';

jest.mock('@/utils/api');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('Register Page Test', () => {
    const pushmock = jest.fn();
    beforeEach(() => {
        useRouter.mockReturnValue({push: pushmock});
        jest.clearAllMocks();
    });
    test('render register form', () => {
        render(<Register/>);
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
    test('show error when fields are empty', () => {
        render(<Register/>);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
    });
    test('updates form fields on user input', () => {
        render(<Register/>);
        const name = screen.getByLabelText(/name/i);    
        const email = screen.getByLabelText(/email/i);    
        const password = screen.getByLabelText(/password/i);
        fireEvent.change(name, {target: {value: 'Test User'}});
        fireEvent.change(email, {target: {value: 'test@example.com'}});
        fireEvent.change(password, {target: {value: 'password123'}});
        expect(name.value).toBe('Test User');
        expect(email.value).toBe('test@example.com');
        expect(password.value).toBe('password123');       
    });
    test('calls api.post on successful registration',async () => {
        api.post.mockResolvedValue({data : {token: 'fake-token'}});
        render(<Register/>);
        fireEvent.change(screen.getByLabelText(/name/i), {target: {value:'Test User'}});
        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'test@example.com'}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'password123'}});
        fireEvent.click(screen.getByRole('button'));
        await screen.findByRole('button');
        expect(api.post).toHaveBeenCalledWith('/auth/register', {name:'Test User', email: 'test@example.com', password: 'password123'});
        expect(pushmock).toHaveBeenCalledWith('/');
    });
    test('show error message on failed regsitration', async() => {
        api.post.mockRejectedValue({response: {data: {message: 'Registration error'}}});
        render(<Register/>);
        fireEvent.change(screen.getByLabelText(/name/i), {target: {value:'Test User'}});
        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'test@example.com'}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'wrongpassword'}});
        fireEvent.click(screen.getByRole('button'));
        await screen.findByText(/Registration failed. Please try again./i);
        expect(screen.getByText(/Registration failed. Please try again./i)).toBeInTheDocument();
    });
});
