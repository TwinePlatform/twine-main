import * as Knex from 'knex';

exports.seed = (knex: Knex) =>
  knex('community_business_sector')
    .insert([
      { sector_name: 'Arts centre or facility' },
      { sector_name: 'Community hub, facility or space' },
      { sector_name: 'Community pub, shop or café' },
      { sector_name: 'Employment, training, business support or education' },
      { sector_name: 'Energy' },
      { sector_name: 'Environment or nature' },
      { sector_name: 'Food catering or production (incl. farming)' },
      { sector_name: 'Health, care or wellbeing' },
      { sector_name: 'Housing' },
      { sector_name: 'Income or financial inclusion' },
      { sector_name: 'Sport & leisure' },
      { sector_name: 'Transport' },
      { sector_name: 'Visitor facilities or tourism' },
      { sector_name: 'Waste reduction, reuse or recycling' },
    ]);
