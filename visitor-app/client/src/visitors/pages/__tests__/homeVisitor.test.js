import {
  cleanup,
  waitForElement,
  fireEvent,
  wait,
} from 'react-testing-library';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import renderWithRouter from '../../../tests';
import homeVisitor from '../homeVisitor';


describe('Visitor Home Page', () => {
  let mock;
  const API_HOST = process.env.API_HOST_DOMAIN;
  const noop = () => {};

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(cleanup);

  test('submit positive feedback successfully', async () => {
    expect.assertions(1);

    mock
      .onPost(`${API_HOST}/api/v1/community-businesses/me/feedback`)
      .reply(200, { data: null });

    const tools = renderWithRouter({
      route: '/visitor/signup',
      auth: 'fakeauthtoken',
      updateAdminToken: noop,
      updateLoggedIn: noop,
    })(homeVisitor);

    const posBtn = await waitForElement(() => tools.getByTestId('positive-feedback-btn'));

    fireEvent.click(posBtn);

    await wait(() => {
      expect(tools.history.location.pathname).toBe('/thankyou');
    });
  });

  test('submit neutral feedback successfully', async () => {
    expect.assertions(1);

    mock
      .onPost(`${API_HOST}/api/v1/community-businesses/me/feedback`)
      .reply(200, { data: null });

    const tools = renderWithRouter({
      route: '/visitor/signup',
      auth: 'fakeauthtoken',
      updateAdminToken: noop,
      updateLoggedIn: noop,
    })(homeVisitor);

    const neuBtn = await waitForElement(() => tools.getByTestId('neutral-feedback-btn'));

    fireEvent.click(neuBtn);

    await wait(() => {
      expect(tools.history.location.pathname).toBe('/thankyou');
    });
  });

  test('submit negative feedback successfully', async () => {
    expect.assertions(1);

    mock
      .onPost(`${API_HOST}/api/v1/community-businesses/me/feedback`)
      .reply(200, { data: null });

    const tools = renderWithRouter({
      route: '/visitor/signup',
      auth: 'fakeauthtoken',
      updateAdminToken: noop,
      updateLoggedIn: noop,
    })(homeVisitor);

    const negBtn = await waitForElement(() => tools.getByTestId('negative-feedback-btn'));

    fireEvent.click(negBtn);

    await wait(() => {
      expect(tools.history.location.pathname).toBe('/thankyou');
    });
  });

  test('submit any feedback unsuccessfully', async () => {
    expect.assertions(1);

    mock
      .onPost(`${API_HOST}/api/v1/community-businesses/me/feedback`)
      .reply(500, { error: { statusCode: 500, type: 'Internal Server Error', message: 'Oops' } });

    const tools = renderWithRouter({
      route: '/visitor/signup',
      auth: 'fakeauthtoken',
      updateAdminToken: noop,
      updateLoggedIn: noop,
    })(homeVisitor);

    const neuBtn = await waitForElement(() => tools.getByTestId('neutral-feedback-btn'));

    fireEvent.click(neuBtn);

    await wait(() => {
      expect(tools.history.location.pathname).toBe('/error/500');
    });
  });

});
