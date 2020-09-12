import { cleanup, waitForElement, fireEvent, wait } from 'react-testing-library';
import MockAdapter from 'axios-mock-adapter';
import { axios } from '../../../api';
import { renderWithRouter } from '../../../tests';
import HomeVisitor from '../HomeVisitor';


describe('Visitor Home Page', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(cleanup);

  test('submit positive feedback successfully', async () => {
    expect.assertions(1);

    mock
      .onPost('/community-businesses/me/feedback')
      .reply(200, { data: null });

    const tools = renderWithRouter({ route: '/visitor/signup' })(HomeVisitor);

    const posBtn = await waitForElement(() => tools.getByTestId('positive-feedback-btn'));

    fireEvent.click(posBtn);

    await wait(() => {
      expect(tools.history.location.pathname).toBe('/visitor/thankyou');
    });
  });

  test('submit neutral feedback successfully', async () => {
    expect.assertions(1);

    mock
      .onPost('/community-businesses/me/feedback')
      .reply(200, { data: null });

    const tools = renderWithRouter({ route: '/visitor/signup' })(HomeVisitor);

    const neuBtn = await waitForElement(() => tools.getByTestId('neutral-feedback-btn'));

    fireEvent.click(neuBtn);

    await wait(() => {
      expect(tools.history.location.pathname).toBe('/visitor/thankyou');
    });
  });

  test('submit negative feedback successfully', async () => {
    expect.assertions(1);

    mock
      .onPost('/community-businesses/me/feedback')
      .reply(200, { data: null });

    const tools = renderWithRouter({ route: '/visitor/signup' })(HomeVisitor);

    const negBtn = await waitForElement(() => tools.getByTestId('negative-feedback-btn'));

    fireEvent.click(negBtn);

    await wait(() => {
      expect(tools.history.location.pathname).toBe('/visitor/thankyou');
    });
  });

  test('submit any feedback unsuccessfully', async () => {
    expect.assertions(1);

    mock
      .onPost('/community-businesses/me/feedback')
      .reply(500, { error: { statusCode: 500, type: 'Internal Server Error', message: 'Oops' } });


    const tools = renderWithRouter({ route: '/visitor/signup' })(HomeVisitor);
    const neuBtn = await waitForElement(() => tools.getByTestId('neutral-feedback-btn'));

    fireEvent.click(neuBtn);

    await wait(() => {
      expect(tools.history.location.pathname).toBe('/error/500');
    });
  });

});
