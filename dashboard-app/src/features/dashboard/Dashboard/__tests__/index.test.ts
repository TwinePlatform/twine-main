import { cleanup, waitForElement, fireEvent, wait } from 'react-testing-library';
import MockAdapter from 'axios-mock-adapter';
import Dashboard from '../../Dashboard';
import { axios } from '../../../../lib/api';
import 'jest-dom/extend-expect';
import { renderWithHistory } from '../../../../lib/util/tests';


describe('Dashboard Page', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(cleanup);

  test('Render', async () => {
    const tools = renderWithHistory(Dashboard);

    mock.onGet('/community-businesses/me/volunteer-logs').reply(200, { result: [] });
    mock.onGet('/community-businesses/me/volunteers').reply(200, { result: [] });

    await waitForElement(() => [
      tools.getByText('Activities'),
      tools.getByText('Time'),
      tools.getByText('Volunteers'),
      tools.getByText('Projects'),
    ]);
  });

  test('API requests fail', async () => {
    expect.assertions(1);

    mock.onGet('/community-businesses/me/volunteer-logs').reply(500, { error: {} });
    mock.onGet('/community-businesses/me/volunteers').reply(500, { error: {} });

    const tools = renderWithHistory(Dashboard);

    await wait(() => expect(tools.history.location.pathname).toBe('/error/500'));
  });

  test('Response processing failure', async () => {
    expect.assertions(1);

    // Don't setup mock responses to force a type error
    // in the response processing code.

    const tools = renderWithHistory(Dashboard);

    await wait(() => expect(tools.history.location.pathname).toBe('/error/unknown'));
  });

  test('Clicking time goes to /time', async () => {
    expect.assertions(1);

    mock.onGet('/community-businesses/me/volunteer-logs').reply(200, { result: [] });
    mock.onGet('/community-businesses/me/volunteers').reply(200, { result: [] });

    const tools = renderWithHistory(Dashboard);
    const buttons = await waitForElement(() => tools.getAllByText('View data'));
    fireEvent.click(buttons[0]);

    await wait(() => expect(tools.history.location.pathname).toBe('/time'));
  });

  test('Clicking activity goes to /activities', async () => {
    expect.assertions(1);

    mock.onGet('/community-businesses/me/volunteer-logs').reply(200, { result: [] });
    mock.onGet('/community-businesses/me/volunteers').reply(200, { result: [] });

    const tools = renderWithHistory(Dashboard);
    const buttons = await waitForElement(() => tools.getAllByText('View data'));
    fireEvent.click(buttons[1]);

    await wait(() => expect(tools.history.location.pathname).toBe('/activities'));
  });

  test('Clicking volunteer goes to /volunteers', async () => {
    expect.assertions(1);

    mock.onGet('/community-businesses/me/volunteer-logs').reply(200, { result: [] });
    mock.onGet('/community-businesses/me/volunteers').reply(200, { result: [] });

    const tools = renderWithHistory(Dashboard);
    const buttons = await waitForElement(() => tools.getAllByText('View data'));
    fireEvent.click(buttons[2]);

    await wait(() => expect(tools.history.location.pathname).toBe('/volunteers'));
  });

  test('Clicking project goes to /projects', async () => {
    expect.assertions(1);

    mock.onGet('/community-businesses/me/volunteer-logs').reply(200, { result: [] });
    mock.onGet('/community-businesses/me/volunteers').reply(200, { result: [] });

    const tools = renderWithHistory(Dashboard);
    const buttons = await waitForElement(() => tools.getAllByText('View data'));
    fireEvent.click(buttons[3]);

    await wait(() => expect(tools.history.location.pathname).toBe('/projects'));
  });
});
