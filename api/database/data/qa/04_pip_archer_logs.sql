----Adding a volunteer log----
----PIP ARCHER----
INSERT INTO volunteer_hours_log
  (user_account_id, organisation_id, created_by, volunteer_activity_id, duration, started_at)
VALUES
  ( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Cafe/Catering'),
    INTERVAL '03:00:00' DAY TO SECOND,
    '2019-04-01T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Committee work, AGM'),
    INTERVAL '00:45:00' DAY TO SECOND,
    '2019-04-02T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Community outreach and communications'),
    INTERVAL '08:00:00' DAY TO SECOND,
    '2019-04-03T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Helping with raising funds (shop, events…)'),
    INTERVAL '04:00:00' DAY TO SECOND,
    '2019-04-04T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Office support'),
    INTERVAL '01:00:00' DAY TO SECOND,
    '2019-04-05T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Other'),
    INTERVAL '02:20:00' DAY TO SECOND,
    '2019-04-06T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Outdoor and practical work'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-07T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Professional pro bono work (Legal, IT, Research)'),
    INTERVAL '00:10:00' DAY TO SECOND,
    '2019-04-08T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Shop/Sales'),
    INTERVAL '01:07:00' DAY TO SECOND,
    '2019-04-09T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Support and Care for vulnerable community members'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-10T10:00:00.000'),
  ( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Cafe/Catering'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-11T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Committee work, AGM'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-12T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Community outreach and communications'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-13T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Helping with raising funds (shop, events…)'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-14T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Office support'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-15T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Other'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-16T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Outdoor and practical work'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-17T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Professional pro bono work (Legal, IT, Research)'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-18T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Shop/Sales'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-19T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Support and Care for vulnerable community members'),
    INTERVAL '00:05:00' DAY TO SECOND,
    '2019-04-20T10:00:00.000'),
--24h------------------------------------------------
  ( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Cafe/Catering'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-21T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Committee work, AGM'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-22T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Community outreach and communications'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-23T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Helping with raising funds (shop, events…)'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-24T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Office support'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-25T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Other'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-26T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Outdoor and practical work'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-27T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Professional pro bono work (Legal, IT, Research)'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-28T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Shop/Sales'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-29T10:00:00.000'),
( (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT organisation_id FROM organisation WHERE organisation_name='Twine Testing Archers'),
    (SELECT user_account_id FROM user_account WHERE email='b@archers.com'),
    (SELECT volunteer_activity_id FROM volunteer_activity WHERE volunteer_activity_name='Support and Care for vulnerable community members'),
    INTERVAL '24:00:00' DAY TO SECOND,
    '2019-04-30T10:00:00.000')
;
