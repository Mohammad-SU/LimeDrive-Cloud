import { render, fireEvent, waitFor } from '@testing-library/react';
import { it, expect } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import LoginForm from '../LoginForm';
import { MemoryRouter as Router } from 'react-router-dom';
import { UserProvider } from '../../../contexts/UserContext';
import { FileProvider } from '../../../contexts/FileContext';

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe('Login Input Validation', () => {
	let getByTestId: (testId: string) => HTMLElement;
	let domErrorText: HTMLElement;
	const invalidLoginError = "Invalid login details."
	const connectionError = "Error. Please check your connection."

	function interactWithLoginInputs(username: string, password: string) {
		const usernameOrEmailInput = getByTestId('usernameOrEmailInput') as HTMLInputElement;
		const passwordInput = getByTestId('passwordInput') as HTMLInputElement;
		const loginButton = getByTestId('loginButton');

		fireEvent.change(usernameOrEmailInput, { target: { value: username } });
		fireEvent.change(passwordInput, { target: { value: password } });
		fireEvent.click(loginButton);
	}

	beforeEach(() => {
		const { getByTestId: getByTestIdFunc } = render(
			<Router>
				<FileProvider>
					<UserProvider>
						<LoginForm />
					</UserProvider>
				</FileProvider>
			</Router>
		);
		getByTestId = getByTestIdFunc;
		domErrorText = getByTestId('domErrorText');
	});

	it('should display "Invalid login details." if details are invalid. (Invalid username/email and password formats, no request)', () => {
		interactWithLoginInputs('iaawd¦¦@,sawko=q-.a@@s^&&/s.a', '12345');
		expect(domErrorText).toHaveTextContent(invalidLoginError);
	});

	it('should display "Invalid login details." if details are invalid. (Invalid username/email format and valid password format)', async () => {
		interactWithLoginInputs('iaawd¦¦@,sawko=q-.a@@s^&&/s.a', '12345678');
		let response = mock.onPost('/login').reply(400, { message: invalidLoginError });

		await waitFor(() => {
			console.log(response)
			console.log(domErrorText)
			expect(domErrorText).toHaveTextContent(invalidLoginError);
		});
	});

	it('should *not* display "Invalid login details." or "Error. Please check your connection." if details are valid. (Valid formats)', async () => {
		interactWithLoginInputs('validUsername', '12345678');
		mock.onPost('/login').reply(200, { message: 'Login successful.' });

		await waitFor(() => {
			expect(domErrorText).not.toHaveTextContent(invalidLoginError);
			expect(domErrorText).not.toHaveTextContent(connectionError);
		});
	});

	it('should display "Error. Please check your connection." if the network connection is lost', async () => {
		interactWithLoginInputs('validUsername', '12345678');
		mock.onPost('/login').networkError();

		await waitFor(() => {
			expect(domErrorText).toHaveTextContent(connectionError);
		});
	});
});