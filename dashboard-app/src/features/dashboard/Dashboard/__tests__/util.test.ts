import { logsToDurations, findMostActive } from '../util';


describe('Dashboard statistics utilities', () => {
  describe('logsToDurations', () => {
    test('empty array gives zero duration', () => {
      expect(logsToDurations([])).toEqual({});
    });

    test('single log returns that logs duration', () => {
      expect(logsToDurations([{ duration: { minutes: 0 } }])).toEqual({});
      expect(logsToDurations([{ duration: { minutes: 10 } }])).toEqual({ minutes: 10 });
    });

    test('multiple logs have their durations extracted and summed', () => {
      expect(logsToDurations([
        { duration: { minutes: 10 } },
        { duration: { hours: 1 } },
        { duration: { hours: 2, seconds: 10 } },
      ]))
        .toEqual({ hours: 3, minutes: 10, seconds: 10 });
    });
  });

  describe('findMostActive', () => {
    test('empty dictionary gives empty value', () => {
      expect(findMostActive({})).toEqual({ labels: [], value: 0 });
    });

    test('single entry is returned as only max', () => {
      expect(findMostActive({ ['Jun 2018']: [{ duration: { minutes: 125 } }] }))
        .toEqual({ labels: ['Jun 2018'], value: 2 }); // rounded
    });

    test('multiple equal entries are all returned', () => {
      const logs = {
        ['Jun 2018']: [
          { duration: { hours: 2, minutes: 20 } },
          { duration: { minutes: 30 } },
        ],
        ['Sept 2018']: [
          { duration: { hours: 1, minutes: 50 } },
          { duration: { hours: 1 } },
        ],
      };

      expect(findMostActive(logs)).toEqual({
        labels: ['Jun 2018', 'Sept 2018'], // TODO: Check ordering
        value: 3, // TODO: Check if should be _FLOORED_
      });
    });
  });
});
