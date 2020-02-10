import { fireEvent, cleanup, waitForElement, wait } from 'react-testing-library';
import MockAdapter from 'axios-mock-adapter';
import 'jest-dom/extend-expect';
import { axios } from '../../../../api';

import { renderWithRouter } from '../../../../tests';
import Activities from '..';


describe('Activities Component', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);

    mock.onPut('/community-businesses/me')
      .reply(200, { result: null });

    mock.onGet('/visit-activity-categories')
      .reply(200, {
        result: [
          { id: 1, name: 'Adult skills building' },
          { id: 2, name: 'Arts, Craft, and Music' },
          { id: 3, name: 'Business support' },
          { id: 4, name: 'Care service' },
          { id: 5, name: 'Education support' },
          { id: 6, name: 'Employment support' },
          { id: 7, name: 'Environment and conservation work' },
          { id: 8, name: 'Food' },
          { id: 9, name: 'Housing support' },
          { id: 10, name: 'Local products' },
          { id: 11, name: 'Mental health support' },
          { id: 12, name: 'Outdoor work and gardening' },
          { id: 13, name: 'Physical health and wellbeing' },
          { id: 14, name: 'Socialising' },
          { id: 15, name: 'Sports' },
          { id: 16, name: 'Transport' },
          { id: 17, name: 'Work space' }],
      });

    mock.onGet('/community-businesses/me/visit-activities')
      .reply(200, {
        result: [
          {
            id: 8,
            name: 'French Lessons',
            category: 'Education support',
            monday: false,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          },
          {
            id: 7,
            name: 'Yoga',
            category: 'Sports',
            monday: false,
            tuesday: false,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          },
          {
            id: 13,
            name: 'Skating',
            category: 'Sports',
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          }],
      });

    mock.onPost('/community-businesses/me/visit-activities')
      .reply(200, {
        result: {
          id: 14,
          name: 'Cycling',
          category: 'Sports',
          deleted: false,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
          date: '2018-07-27T00:15:16.510Z',
        },
      });

    mock.onPut('/community-businesses/me/visit-activities/8')
      .reply(200,
        {
          result: {
            id: 8,
            name: 'French Lessons',
            category: 'Education support',
            deleted: false,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
            date: '2017-12-22T17:24:57.000Z',
          },
        });

    mock.onDelete('/community-businesses/me/visit-activities/8')
      .reply(200, { result: null });
  });

  afterEach(cleanup);

  test('page load :: correct response renders rows for each activity', async () => {
    expect.assertions(3);
    const { getByText } = renderWithRouter()(Activities);
    const [french, yoga, skating] = await waitForElement(() => [
      getByText('French Lessons'),
      getByText('Yoga'),
      getByText('Skating'),
    ]);

    expect(french).toHaveTextContent('French Lessons');
    expect(yoga).toHaveTextContent('Yoga');
    expect(skating).toHaveTextContent('Skating');
  });

  test('add :: correct response adds new row', async () => {
    expect.assertions(1);
    const { getByText, getByLabelText } = renderWithRouter()(Activities);

    const input = getByLabelText('Add an activity');
    const add = getByText('ADD');
    await waitForElement(() => getByText('French Lessons'));

    fireEvent.change(input, { target: { value: 'Cycling' } });
    fireEvent.click(add);

    const cycling = await waitForElement(() => getByText('Cycling'));

    expect(cycling).toHaveTextContent('Cycling');
  });

  test('update :: correct response updates specified row', async () => {
    expect.assertions(2);
    const { getByAltText } = renderWithRouter()(Activities);

    const checkbox = await waitForElement(() => getByAltText('French Lessons monday update button'));
    expect(checkbox.checked).toBeFalsy();
    fireEvent.click(checkbox);

    await wait(() => {
      const updatedCheck = getByAltText('French Lessons monday update button');
      expect(updatedCheck.checked).toBeTruthy();
    });
  });

  test('update :: change category on activity', async () => {
    mock.onPut('/community-businesses/me/visit-activities/8')
      .reply(200, {
        result: {
          id: 8,
          name: 'French Lessons',
          category: 'Food',
          monday: false,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
      });

    const tools = renderWithRouter()(Activities);

    const select = await waitForElement(() => tools.getByValue('Education support'));
    fireEvent.change(select, { target: { value: 'Food' } });

    const newCategory = await waitForElement(() => tools.getByValue('Food'));
    expect(newCategory).toBeTruthy();
  });

  test('delete :: correct response deletes specified row', async () => {
    expect.assertions(1);
    const { getByText, getByTestId } = renderWithRouter()(Activities);

    const [frenchLessons, deleteButton] = await waitForElement(() => [
      getByText('French Lessons'),
      getByTestId('Delete French Lessons'),
    ]);

    fireEvent.click(deleteButton);

    await wait(() => expect(frenchLessons).not.toBeInTheDocument());
  });
});
