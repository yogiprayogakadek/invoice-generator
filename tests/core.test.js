'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');

test('parseMoneyInput understands Indonesian grouping and currency symbols', () => {
  assert.equal(core.parseMoneyInput('Rp 1.250.000', 'IDR'), 1250000);
  assert.equal(core.parseMoneyInput('1.250.000', 'IDR'), 1250000);
  assert.equal(core.parseMoneyInput('1.250.000,50', 'IDR'), 1250000.5);
  assert.equal(core.parseMoneyInput('', 'IDR'), 0);
  assert.equal(core.parseMoneyInput('$1,500.50', 'USD'), 1500.5);
});

test('parseDecimalInput accepts comma and dot decimals', () => {
  assert.equal(core.parseDecimalInput('1,5'), 1.5);
  assert.equal(core.parseDecimalInput('1.500,5'), 1500.5);
  assert.equal(core.parseDecimalInput('1,500.5'), 1500.5);
  assert.equal(core.parseDecimalInput(''), 0);
});

test('calcTotals scenario 1: three items without discount or tax', () => {
  const invoice = {
    currency: 'IDR',
    items: [
      { qty: 1, price: 1500000, discount: 0 },
      { qty: 2, price: 250000, discount: 0 },
      { qty: 3, price: 100000, discount: 0 }
    ],
    discount: { type: 'percent', value: 0 },
    tax: { enabled: false, rate: 11 },
    extraFee: 0
  };
  const totals = core.calcTotals(invoice);
  assert.equal(totals.subtotal, 2300000);
  assert.equal(totals.discountTotal, 0);
  assert.equal(totals.dpp, 2300000);
  assert.equal(totals.tax, 0);
  assert.equal(totals.total, 2300000);
});

test('calcTotals scenario 2: percent discount and 11 percent tax', () => {
  const invoice = {
    currency: 'IDR',
    items: [{ qty: 1, price: 1000000, discount: 0 }],
    discount: { type: 'percent', value: 10 },
    tax: { enabled: true, rate: 11 },
    extraFee: 0
  };
  const totals = core.calcTotals(invoice);
  assert.equal(totals.subtotal, 1000000);
  assert.equal(totals.discountTotal, 100000);
  assert.equal(totals.dpp, 900000);
  assert.equal(totals.tax, 99000);
  assert.equal(totals.total, 999000);
});

test('calcTotals scenario 3: nominal discount and tax', () => {
  const invoice = {
    currency: 'IDR',
    items: [{ qty: 1, price: 750000, discount: 0 }],
    discount: { type: 'nominal', value: 50000 },
    tax: { enabled: true, rate: 11 },
    extraFee: 20000
  };
  const totals = core.calcTotals(invoice);
  assert.equal(totals.subtotal, 750000);
  assert.equal(totals.discountTotal, 50000);
  assert.equal(totals.dpp, 700000);
  assert.equal(totals.tax, 77000);
  assert.equal(totals.total, 797000);
});

test('calcTotals keeps USD amounts in minor units', () => {
  const totals = core.calcTotals({
    currency: 'USD',
    items: [{ qty: 2, price: 150050, discount: 0 }],
    discount: { type: 'percent', value: 10 },
    tax: { enabled: true, rate: 11 },
    extraFee: 500
  });
  assert.equal(totals.subtotal, 300100);
  assert.equal(totals.discountTotal, 30010);
  assert.equal(totals.dpp, 270090);
  assert.equal(totals.tax, 29710);
  assert.equal(totals.total, 300300);
  assert.equal(core.formatMoney(totals.total, 'USD'), '$3,003.00');
});

test('convertMinor preserves the major value across currencies', () => {
  assert.equal(core.convertMinor(1500000, 'IDR', 'USD'), 150000000);
  assert.equal(core.convertMinor(150050, 'USD', 'IDR'), 1501);
  assert.equal(core.convertMinor(150050, 'USD', 'EUR'), 150050);
});

test('calcTotals scenario 4: decimal quantity and line discount', () => {
  const invoice = {
    currency: 'IDR',
    items: [{ qty: 1.5, price: 200000, discount: 50000 }],
    discount: { type: 'percent', value: 0 },
    tax: { enabled: false, rate: 11 },
    extraFee: 0
  };
  const totals = core.calcTotals(invoice);
  assert.equal(totals.subtotal, 250000);
  assert.equal(totals.total, 250000);
});

test('calcTotals scenario 5: nominal discount is capped at subtotal', () => {
  const invoice = {
    currency: 'IDR',
    items: [{ qty: 1, price: 100000, discount: 0 }],
    discount: { type: 'nominal', value: 250000 },
    tax: { enabled: true, rate: 11 },
    extraFee: 0
  };
  const totals = core.calcTotals(invoice);
  assert.equal(totals.discountTotal, 100000);
  assert.equal(totals.dpp, 0);
  assert.equal(totals.tax, 0);
  assert.equal(totals.total, 0);
});

test('line discount is ignored when the column is disabled', () => {
  const invoice = {
    currency: 'IDR',
    columns: { discount: false },
    items: [{ qty: 1, price: 100000, discount: 25000 }],
    discount: { type: 'percent', value: 0 },
    tax: { enabled: false, rate: 11 },
    extraFee: 0
  };
  assert.equal(core.calcTotals(invoice).subtotal, 100000);
});

test('terbilang handles zero, thousands, millions, and billions', () => {
  assert.equal(core.terbilang(0), 'nol');
  assert.equal(core.terbilang(1000), 'seribu');
  assert.equal(core.terbilang(1500000), 'satu juta lima ratus ribu');
  assert.equal(core.terbilang(1250000), 'satu juta dua ratus lima puluh ribu');
  assert.equal(core.terbilang(1000000000), 'satu miliar');
});

test('amountInWords includes the currency name and cents', () => {
  assert.equal(core.amountInWords(1250000, 'IDR'), 'Satu juta dua ratus lima puluh ribu rupiah');
  assert.equal(
    core.amountInWords(150050, 'USD'),
    'Seribu lima ratus dolar Amerika Serikat dan lima puluh sen'
  );
});

test('formatMoney renders IDR, USD, and EUR', () => {
  assert.equal(core.formatMoney(1250000, 'IDR'), 'Rp 1.250.000');
  assert.equal(core.formatMoney(150050, 'USD'), '$1,500.50');
  assert.match(core.formatMoney(150050, 'EUR'), /1\.500,50/);
});

test('formatInvoiceNumber supports tokens and appends a sequence', () => {
  assert.equal(
    core.formatInvoiceNumber('INV/{yyyy}/{mm}/{seq:4}', { date: '2026-11-20', seq: 1 }),
    'INV/2026/11/0001'
  );
  assert.equal(
    core.formatInvoiceNumber('FAKTUR/{yy}{mm}/{seq}', { date: '2026-11-20', seq: 12 }),
    'FAKTUR/2611/12'
  );
  assert.equal(
    core.formatInvoiceNumber('INV/{yyyy}', { date: '2026-11-20', seq: 3 }),
    'INV/2026/0003'
  );
});

test('nextInvoiceNumber skips numbers already in use', () => {
  const result = core.nextInvoiceNumber({
    pattern: 'INV/{yyyy}/{mm}/{seq:4}',
    date: '2026-11-20',
    seq: 1,
    existing: ['INV/2026/11/0001', 'INV/2026/11/0002']
  });
  assert.equal(result.number, 'INV/2026/11/0003');
  assert.equal(result.seq, 3);
});

test('validateInvoice catches due date, duplicate, and print requirements', () => {
  const invoice = {
    number: 'INV/2026/11/0001',
    issueDate: '2026-11-20',
    dueDate: '2026-11-10',
    customer: { name: '', email: 'bukan-email' },
    items: [],
    discount: { type: 'percent', value: 0 },
    tax: { enabled: true, rate: 11 },
    extraFee: 0
  };
  const profile = { business: { name: '' }, accounts: [] };
  const result = core.validateInvoice(invoice, {
    profile,
    existingNumbers: ['INV/2026/11/0001'],
    forPrint: true
  });
  assert.match(result.errors.dueDate, /tidak boleh lebih awal/);
  assert.match(result.errors.number, /sudah dipakai/);
  assert.match(result.errors.customerName, /wajib/);
  assert.match(result.errors.customerEmail, /email/);
  assert.match(result.errors.items, /minimal satu item/);
  assert.match(result.errors.businessName, /Nama usaha/);
  assert.match(result.errors.accounts, /rekening/);
});

test('normalizeInvoice fills defaults and preserves money values', () => {
  const invoice = core.normalizeInvoice({
    number: 'INV/1',
    items: [{ desc: 'Jasa', qty: 1.5, price: 200000, discount: 50000 }],
    currency: 'IDR'
  });
  assert.equal(invoice.status, 'draft');
  assert.equal(invoice.currency, 'IDR');
  assert.equal(invoice.items[0].price, 200000);
  assert.equal(invoice.items[0].discount, 50000);
  assert.equal(invoice.columns.unit, true);
  assert.equal(invoice.columns.discount, false);
  assert.equal(invoice.tax.rate, 0);
});

test('normalizeSettings keeps zero tax and defaults missing values', () => {
  assert.equal(core.normalizeSettings({ taxRate: 0 }).taxRate, 0);
  assert.equal(core.normalizeSettings({}).taxRate, 11);
  assert.equal(core.normalizeSettings({}).numberFormat, 'INV/{yyyy}/{mm}/{seq:4}');
});

test('isInvoiceEmpty ignores a fresh draft but notices real content', () => {
  const empty = core.normalizeInvoice({ number: 'INV/1' });
  assert.equal(core.isInvoiceEmpty(empty), true);
  const filled = core.normalizeInvoice({
    number: 'INV/1',
    customer: { name: 'Budi' },
    items: [{ desc: 'Jasa', qty: 1, price: 100000 }]
  });
  assert.equal(core.isInvoiceEmpty(filled), false);
});
