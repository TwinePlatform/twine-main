import { fireEvent, cleanup, waitForElement, wait } from 'react-testing-library';
import MockAdapter from 'axios-mock-adapter';
import 'jest-dom/extend-expect';
import { axios } from '../../../api';
import { renderWithRouter } from '../../../tests';
import ConfirmPassword from '../ConfirmPassword';

describe('ConfirmPassword Component', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(cleanup);

  test(':: incorrect password responds 401 and displays error message', async () => {
    expect.assertions(1);

    mock.onPost('/users/login')
      .reply(401, { result: null, error: 'Incorrect password' });

    const { getByText, getByLabelText } = renderWithRouter()(ConfirmPassword);
    const password = getByLabelText('Password');
    const submit = getByText('CONTINUE');

    fireEvent.change(password, { target: { value: 'lolLOL123' } });
    fireEvent.click(submit);

    const error = await waitForElement(() => getByText('Wrong password'));
    expect(error).toHaveTextContent('Wrong password');
  });

  test(':: correct password redirects to dashboard', async () => {
    expect.assertions(1);

    mock.onGet('/users/me')
      .reply(200, { result: { email: 'im@an.email' } });

    mock.onPost('/users/login')
      .reply(200, { result: null });

    const { getByText, getByLabelText, history } =
        renderWithRouter({ route: '/admin' })(ConfirmPassword);
    const password = getByLabelText('Password');
    const submit = getByText('CONTINUE');

    fireEvent.change(password, { target: { value: 'Funnyfingers11!' } });
    fireEvent.click(submit);

    await wait(() => history.length === 2);
    expect(history.location.pathname).toEqual('/admin');
  });

});
