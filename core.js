(function (global) {
  'use strict';

  var CURRENCIES = {
    IDR: { code: 'IDR', locale: 'id-ID', decimals: 0, name: 'rupiah', symbol: 'Rp' },
    USD: { code: 'USD', locale: 'en-US', decimals: 2, name: 'dolar Amerika Serikat', symbol: '$' },
    EUR: { code: 'EUR', locale: 'de-DE', decimals: 2, name: 'euro', symbol: '\u20AC' }
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function roundHalfUp(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return n >= 0 ? Math.round(n + Number.EPSILON) : -Math.round(Math.abs(n) + Number.EPSILON);
  }

  function currencyConfig(code) {
    return CURRENCIES[code] || CURRENCIES.IDR;
  }

  function parseDecimalInput(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    var raw = String(value == null ? '' : value).trim().replace(/\s/g, '');
    if (!raw) return 0;
    raw = raw.replace(/[^\d.,-]/g, '');
    if (!raw) return 0;
    var negative = raw.charAt(0) === '-';
    raw = raw.replace(/-/g, '');
    var lastComma = raw.lastIndexOf(',');
    var lastDot = raw.lastIndexOf('.');
    var normalized = raw;

    if (lastComma !== -1 && lastDot !== -1) {
      var decimal = lastComma > lastDot ? ',' : '.';
      var thousands = decimal === ',' ? '.' : ',';
      normalized = raw.split(thousands).join('');
      if (decimal === ',') normalized = normalized.replace(',', '.');
    } else if (lastComma !== -1) {
      normalized = raw.replace(/\./g, '').replace(',', '.');
    }

    var n = Number(normalized);
    if (!Number.isFinite(n)) return 0;
    return negative ? -n : n;
  }

  function parseMoneyInput(value, currency) {
    if (typeof value === 'number') return value;
    var cfg = currencyConfig(currency);
    var raw = String(value == null ? '' : value).trim().replace(/\s/g, '');
    if (!raw) return 0;
    raw = raw.replace(/[^\d.,-]/g, '');
    if (!raw) return 0;
    var negative = raw.charAt(0) === '-';
    raw = raw.replace(/-/g, '');
    var normalized;

    if (cfg.decimals === 0) {
      normalized = raw.replace(/\./g, '').replace(',', '.');
    } else if (cfg.locale === 'en-US') {
      normalized = raw.replace(/,/g, '');
    } else {
      normalized = raw.replace(/\./g, '').replace(',', '.');
    }

    var n = Number(normalized);
    if (!Number.isFinite(n)) return 0;
    return negative ? -n : n;
  }

  function toMinor(value, currency) {
    var cfg = currencyConfig(currency);
    return roundHalfUp(Number(value || 0) * Math.pow(10, cfg.decimals));
  }

  function fromMinor(minor, currency) {
    var cfg = currencyConfig(currency);
    return Number(minor || 0) / Math.pow(10, cfg.decimals);
  }

  function convertMinor(minor, fromCurrency, toCurrency) {
    var major = fromMinor(minor, fromCurrency);
    return toMinor(major, toCurrency);
  }

  function formatNumber(value, decimals, locale) {
    var digits = Number(decimals) || 0;
    return new Intl.NumberFormat(locale || 'id-ID', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(Number(value) || 0);
  }

  function formatMoney(minor, currency) {
    var cfg = currencyConfig(currency);
    var major = fromMinor(minor, currency);
    var text = new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      currencyDisplay: 'symbol',
      minimumFractionDigits: cfg.decimals,
      maximumFractionDigits: cfg.decimals
    }).format(major);
    return text.replace(/\u00A0/g, ' ');
  }

  function formatMoneyInput(minor, currency) {
    var cfg = currencyConfig(currency);
    return formatNumber(fromMinor(minor, currency), cfg.decimals, cfg.locale);
  }

  function formatQty(value) {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(value) || 0) + '%';
  }

  function calcLine(item, currency, includeDiscount) {
    var qty = Number(item && item.qty) || 0;
    var price = Number(item && item.price) || 0;
    var gross = roundHalfUp(qty * price);
    var discount = includeDiscount ? clamp(Number(item && item.discount) || 0, 0, Math.max(gross, 0)) : 0;
    return {
      gross: gross,
      discount: discount,
      total: gross - discount,
      warning: qty <= 0 || price <= 0
    };
  }

  function calcTotals(invoice) {
    var data = invoice || {};
    var currency = data.currency || 'IDR';
    var includeDiscount = !data.columns || data.columns.discount !== false;
    var items = Array.isArray(data.items) ? data.items : [];
    var lineTotals = items.map(function (item) {
      return calcLine(item, currency, includeDiscount);
    });
    var subtotal = lineTotals.reduce(function (sum, line) { return sum + line.total; }, 0);
    var discountType = data.discount && data.discount.type === 'nominal' ? 'nominal' : 'percent';
    var discountValue = Number(data.discount && data.discount.value) || 0;
    var discountTotal;

    if (discountType === 'percent') {
      discountTotal = roundHalfUp(subtotal * clamp(discountValue, 0, 100) / 100);
    } else {
      discountTotal = clamp(roundHalfUp(discountValue), 0, Math.max(subtotal, 0));
    }

    var dpp = subtotal - discountTotal;
    var taxEnabled = !data.tax || data.tax.enabled !== false;
    var taxRate = clamp(Number(data.tax && data.tax.rate) || 0, 0, 100);
    var tax = taxEnabled ? roundHalfUp(dpp * taxRate / 100) : 0;
    var extraFee = Math.max(0, roundHalfUp(Number(data.extraFee) || 0));
    var total = dpp + tax + extraFee;

    return {
      lineTotals: lineTotals,
      subtotal: subtotal,
      discountTotal: discountTotal,
      dpp: dpp,
      tax: tax,
      extraFee: extraFee,
      total: total,
      taxEnabled: taxEnabled,
      taxRate: taxRate
    };
  }

  var SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

  function terbilang(value) {
    var n = Math.floor(Math.abs(Number(value) || 0));
    if (n === 0) return 'nol';
    if (n < 12) return SATUAN[n];
    if (n < 20) return terbilang(n - 10) + ' belas';
    if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '');
    if (n < 200) return 'seratus' + (n % 100 ? ' ' + terbilang(n % 100) : '');
    if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '');
    if (n < 2000) return 'seribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '');
    if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '');
    if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' juta' + (n % 1000000 ? ' ' + terbilang(n % 1000000) : '');
    if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' miliar' + (n % 1000000000 ? ' ' + terbilang(n % 1000000000) : '');
    if (n < 1000000000000000) return terbilang(Math.floor(n / 1000000000000)) + ' triliun' + (n % 1000000000000 ? ' ' + terbilang(n % 1000000000000) : '');
    return String(n);
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  function amountInWords(minor, currency) {
    var cfg = currencyConfig(currency);
    var value = Number(minor) || 0;
    var negative = value < 0;
    value = Math.abs(value);
    var major = Math.floor(value / Math.pow(10, cfg.decimals));
    var cents = cfg.decimals > 0 ? value % Math.pow(10, cfg.decimals) : 0;
    var words = terbilang(major) + ' ' + cfg.name;
    if (cents > 0) words += ' dan ' + terbilang(cents) + ' sen';
    return capitalize((negative ? 'minus ' : '') + words);
  }

  function pad(value, width) {
    return String(value).padStart(width || 2, '0');
  }

  function parseISODate(iso) {
    if (!iso) return null;
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
    if (!match) return null;
    var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) return null;
    return date;
  }

  function isValidISODate(iso) {
    return Boolean(parseISODate(iso));
  }

  function toISODate(date) {
    var d = date instanceof Date ? date : new Date(date);
    if (!Number.isFinite(d.getTime())) return '';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function addDaysISO(iso, days) {
    var date = parseISODate(iso);
    if (!date) return '';
    date.setDate(date.getDate() + Number(days || 0));
    return toISODate(date);
  }

  function formatDateID(iso) {
    var date = parseISODate(iso);
    if (!date) return '';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function formatInvoiceNumber(pattern, options) {
    var opts = options || {};
    var date = parseISODate(opts.date) || (opts.date instanceof Date ? opts.date : new Date());
    var seq = Math.max(1, Math.floor(Number(opts.seq) || 1));
    var p = String(pattern || 'INV/{yyyy}/{mm}/{seq:4}').trim();

    if (!/\{seq(?::\d+)?\}/.test(p)) {
      p = p.replace(/\/+$/, '') + '/{seq:4}';
    }

    return p
      .replace(/\{yyyy\}/g, String(date.getFullYear()))
      .replace(/\{yy\}/g, String(date.getFullYear()).slice(-2))
      .replace(/\{mm\}/g, pad(date.getMonth() + 1))
      .replace(/\{dd\}/g, pad(date.getDate()))
      .replace(/\{seq:(\d+)\}/g, function (_, width) {
        return String(seq).padStart(Number(width) || 1, '0');
      })
      .replace(/\{seq\}/g, String(seq));
  }

  function nextInvoiceNumber(options) {
    var opts = options || {};
    var existing = new Set((opts.existing || []).map(function (n) {
      return String(n || '').trim().toLowerCase();
    }));
    var seq = Math.max(1, Math.floor(Number(opts.seq) || 1));

    for (var i = 0; i < 10000; i += 1) {
      var number = formatInvoiceNumber(opts.pattern, { date: opts.date, seq: seq });
      if (!existing.has(number.trim().toLowerCase())) {
        return { number: number, seq: seq };
      }
      seq += 1;
    }

    return { number: formatInvoiceNumber(opts.pattern, { date: opts.date, seq: seq }), seq: seq };
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function validateInvoice(invoice, options) {
    var opts = options || {};
    var errors = {};
    var warnings = {};
    var data = invoice || {};
    var profile = opts.profile || {};
    var forPrint = Boolean(opts.forPrint);
    var existing = opts.existingNumbers || [];

    if (!String(data.number || '').trim()) {
      errors.number = 'Nomor invoice wajib diisi.';
    } else if (existing.some(function (n) { return String(n || '').trim().toLowerCase() === String(data.number).trim().toLowerCase(); })) {
      if (forPrint) errors.number = 'Nomor ini sudah dipakai invoice lain.';
      else warnings.number = 'Nomor ini juga dipakai invoice lain.';
    }

    if (!isValidISODate(data.issueDate)) errors.issueDate = 'Tanggal terbit wajib diisi.';
    if (!isValidISODate(data.dueDate)) {
      errors.dueDate = 'Jatuh tempo wajib diisi.';
    } else if (isValidISODate(data.issueDate) && data.dueDate < data.issueDate) {
      errors.dueDate = 'Jatuh tempo tidak boleh lebih awal dari tanggal terbit.';
    }

    if (forPrint && !String(data.customer && data.customer.name || '').trim()) {
      errors.customerName = 'Nama pelanggan wajib diisi sebelum mencetak.';
    }
    if (data.customer && data.customer.email && !isValidEmail(data.customer.email)) {
      errors.customerEmail = 'Format email belum benar.';
    }

    var items = Array.isArray(data.items) ? data.items : [];
    var hasItem = items.some(function (item) {
      return String(item.desc || '').trim() || Number(item.price) > 0;
    });
    if (forPrint && !hasItem) errors.items = 'Tambahkan minimal satu item sebelum mencetak.';

    items.forEach(function (item, index) {
      if (String(item.desc || '').trim() && (Number(item.qty) <= 0 || Number(item.price) <= 0)) {
        warnings['item-' + index] = 'Periksa qty dan harga item ini.';
      }
    });

    var totals = calcTotals(data);
    if (data.discount && data.discount.type === 'nominal' && Number(data.discount.value) > totals.subtotal) {
      warnings.discount = 'Diskon nominal melebihi subtotal, jadi dibatasi ke subtotal.';
    }
    if (Number(data.tax && data.tax.rate) > 100) {
      warnings.taxRate = 'Tarif PPN di atas 100% akan dibatasi.';
    }

    if (forPrint) {
      var business = profile.business || {};
      if (!String(business.name || '').trim()) {
        errors.businessName = 'Nama usaha belum diisi di Profil.';
      }
      var accounts = Array.isArray(profile.accounts) ? profile.accounts : [];
      var hasAccount = accounts.some(function (account) {
        return String(account.bank || '').trim() && String(account.number || '').trim();
      });
      if (!hasAccount) {
        errors.accounts = 'Isi minimal satu rekening di Profil sebelum mencetak.';
      }
    }

    return { errors: errors, warnings: warnings };
  }

  function deepClone(value) {
    if (value == null) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function uid(prefix) {
    return String(prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function normalizeColumns(columns) {
    var c = columns || {};
    return {
      unit: c.unit !== false,
      discount: c.discount === true,
      descLabel: String(c.descLabel || 'Deskripsi').slice(0, 24) || 'Deskripsi',
      unitLabel: String(c.unitLabel || 'Satuan').slice(0, 16) || 'Satuan'
    };
  }

  function normalizeInvoice(invoice) {
    var data = invoice || {};
    var now = new Date().toISOString();
    var currency = CURRENCIES[data.currency] ? data.currency : 'IDR';
    var items = Array.isArray(data.items) ? data.items : [];

    return {
      id: String(data.id || uid('inv')),
      number: String(data.number || ''),
      status: ['draft', 'sent', 'paid', 'overdue'].indexOf(data.status) !== -1 ? data.status : 'draft',
      issueDate: isValidISODate(data.issueDate) ? data.issueDate : todayISO(),
      dueDate: isValidISODate(data.dueDate) ? data.dueDate : addDaysISO(todayISO(), 14),
      customer: {
        name: String(data.customer && data.customer.name || ''),
        company: String(data.customer && data.customer.company || ''),
        address: String(data.customer && data.customer.address || ''),
        phone: String(data.customer && data.customer.phone || ''),
        email: String(data.customer && data.customer.email || '')
      },
      items: items.map(function (item) {
        return {
          desc: String(item && item.desc || ''),
          qty: Number(item && item.qty) || 0,
          unit: String(item && item.unit || ''),
          price: Math.max(0, roundHalfUp(Number(item && item.price) || 0)),
          discount: Math.max(0, roundHalfUp(Number(item && item.discount) || 0))
        };
      }),
      discount: {
        type: data.discount && data.discount.type === 'nominal' ? 'nominal' : 'percent',
        value: Math.max(0, Number(data.discount && data.discount.value) || 0)
      },
      tax: {
        enabled: !data.tax || data.tax.enabled !== false,
        rate: clamp(Number(data.tax && data.tax.rate) || 0, 0, 100)
      },
      extraFee: Math.max(0, roundHalfUp(Number(data.extraFee) || 0)),
      notes: String(data.notes || ''),
      terms: String(data.terms || ''),
      currency: currency,
      columns: normalizeColumns(data.columns),
      snapshot: data.snapshot && typeof data.snapshot === 'object' ? data.snapshot : null,
      snapshotAt: String(data.snapshotAt || ''),
      createdAt: String(data.createdAt || now),
      updatedAt: String(data.updatedAt || now)
    };
  }

  function normalizeProfile(profile) {
    var data = profile || {};
    var business = data.business || {};
    var accounts = Array.isArray(data.accounts) ? data.accounts : [];
    var defaults = data.defaults || {};
    var signature = data.signature || {};

    return {
      business: {
        name: String(business.name || ''),
        address: String(business.address || ''),
        phone: String(business.phone || ''),
        email: String(business.email || ''),
        website: String(business.website || ''),
        npwp: String(business.npwp || ''),
        logo: String(business.logo || '')
      },
      accounts: accounts.map(function (account) {
        return {
          bank: String(account && account.bank || ''),
          number: String(account && account.number || ''),
          holder: String(account && account.holder || '')
        };
      }),
      defaults: {
        notes: String(defaults.notes || ''),
        terms: String(defaults.terms || '')
      },
      signature: {
        name: String(signature.name || ''),
        title: String(signature.title || '')
      },
      updatedAt: String(data.updatedAt || '')
    };
  }

  function normalizeSettings(settings) {
    var data = settings || {};
    return {
      numberFormat: String(data.numberFormat || 'INV/{yyyy}/{mm}/{seq:4}'),
      taxRate: clamp(data.taxRate === undefined || data.taxRate === null || data.taxRate === '' ? 11 : Number(data.taxRate), 0, 100),
      currency: CURRENCIES[data.currency] ? data.currency : 'IDR',
      dueDays: [0, 7, 14, 30].indexOf(Number(data.dueDays)) !== -1 ? Number(data.dueDays) : 14
    };
  }

  function isInvoiceEmpty(invoice) {
    if (!invoice) return true;
    var customer = invoice.customer || {};
    var hasCustomer = ['name', 'company', 'address', 'phone', 'email'].some(function (key) {
      return String(customer[key] || '').trim();
    });
    var hasItem = (invoice.items || []).some(function (item) {
      return String(item.desc || '').trim() || Number(item.price) > 0 || Number(item.discount) > 0 || String(item.unit || '').trim();
    });
    var hasMoney = Number(invoice.extraFee) > 0 || Number(invoice.discount && invoice.discount.value) > 0;
    return !hasCustomer && !hasItem && !hasMoney && !String(invoice.notes || '').trim() && !String(invoice.terms || '').trim();
  }

  var api = {
    CURRENCIES: CURRENCIES,
    clamp: clamp,
    roundHalfUp: roundHalfUp,
    parseDecimalInput: parseDecimalInput,
    parseMoneyInput: parseMoneyInput,
    toMinor: toMinor,
    fromMinor: fromMinor,
    convertMinor: convertMinor,
    formatNumber: formatNumber,
    formatMoney: formatMoney,
    formatMoneyInput: formatMoneyInput,
    formatQty: formatQty,
    formatPercent: formatPercent,
    calcLine: calcLine,
    calcTotals: calcTotals,
    terbilang: terbilang,
    amountInWords: amountInWords,
    parseISODate: parseISODate,
    isValidISODate: isValidISODate,
    toISODate: toISODate,
    todayISO: todayISO,
    addDaysISO: addDaysISO,
    formatDateID: formatDateID,
    formatInvoiceNumber: formatInvoiceNumber,
    nextInvoiceNumber: nextInvoiceNumber,
    isValidEmail: isValidEmail,
    validateInvoice: validateInvoice,
    deepClone: deepClone,
    uid: uid,
    normalizeColumns: normalizeColumns,
    normalizeInvoice: normalizeInvoice,
    normalizeProfile: normalizeProfile,
    normalizeSettings: normalizeSettings,
    isInvoiceEmpty: isInvoiceEmpty
  };

  global.IGCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
