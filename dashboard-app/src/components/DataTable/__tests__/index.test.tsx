import React from 'react';
import { cleanup, render, wait, waitForElement, fireEvent } from 'react-testing-library';
import DataTable from '..';
import 'jest-dom/extend-expect';


describe('Component :: DataTable', () => {
  afterEach(cleanup);

  const props = {
    title: 'Data Table Title',
    headers: [
      'one',
      'two',
      'three',
    ],
    rows: [
      {
        columns: {
          one: { content: 'foo' },
          two: { content: 2 },
          three: { content: 3 },
        },
      },
      {
        columns: {
          one: { content: 'bar' },
          two: { content: 4 },
          three: { content: 5 },
        },
      },
      {
        columns: {
          one: { content: 'baz' },
          two: { content: 6 },
          three: { content: 7 },
        },
      },
      {
        columns: {
          one: { content: 'bax' },
          two: { content: 8 },
          three: { content: 9 },
        },
      },
    ],
  };

  test('Render table :: default', async () => {
    const tools = render(<DataTable {...props} />);

    const rows = await waitForElement(() => tools.getAllByTestId('data-table-row'));

    expect(rows[0]).toHaveTextContent('foo23');
    expect(rows[1]).toHaveTextContent('baz67');
    expect(rows[2]).toHaveTextContent('bax89');
    expect(rows[3]).toHaveTextContent('bar45');
  });

  test('Toggle sort order on default column', async () => {
    const tools = render(<DataTable {...props} />);

    const [header, rows] = await waitForElement(() => [
      tools.getByText('one', { exact: false }),
      tools.getAllByTestId('data-table-row'),
    ]);

    fireEvent.click(header);

    expect(header).toHaveTextContent('↑ one');
    expect(rows[0]).toHaveTextContent('bar45');
    expect(rows[1]).toHaveTextContent('bax89');
    expect(rows[2]).toHaveTextContent('baz67');
    expect(rows[3]).toHaveTextContent('foo23');
  });

  test('Choose different column to sort by', async () => {
    const tools = render(<DataTable {...props} />);

    const [header, rows] = await waitForElement(() => [
      tools.getByText('two', { exact: false }),
      tools.getAllByTestId('data-table-row'),
    ]);

    fireEvent.click(header);

    expect(header).toHaveTextContent('↓ two');
    expect(rows[0]).toHaveTextContent('bax89');
    expect(rows[1]).toHaveTextContent('baz67');
    expect(rows[2]).toHaveTextContent('bar45');
    expect(rows[3]).toHaveTextContent('foo23');
  });

  test('Choose different column to sort by then toggle', async () => {
    const tools = render(<DataTable {...props} />);

    const [header, rows] = await waitForElement(() => [
      tools.getByText('two', { exact: false }),
      tools.getAllByTestId('data-table-row'),
    ]);

    fireEvent.click(header);
    await wait();
    fireEvent.click(header);

    expect(header).toHaveTextContent('↑ two');
    expect(rows[0]).toHaveTextContent('foo23');
    expect(rows[1]).toHaveTextContent('bar45');
    expect(rows[2]).toHaveTextContent('baz67');
    expect(rows[3]).toHaveTextContent('bax89');
  });

});