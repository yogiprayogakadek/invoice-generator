/* Invoice Generator
   Browser-only invoice editor, storage, and print flow. */

(function () {
  'use strict';

  var core = window.IGCore;
  if (!core) {
    return;
  }

  var KEYS = {
    invoices: 'invoiceGenerator.v1.invoices',
    profile: 'invoiceGenerator.v1.profile',
    settings: 'invoiceGenerator.v1.settings',
    draft: 'invoiceGenerator.v1.draft'
  };

  var STATUS_LABELS = {
    draft: 'Draft',
    sent: 'Terkirim',
    paid: 'Lunas',
    overdue: 'Jatuh tempo'
  };

  var STATUS_VALUES = ['draft', 'sent', 'paid', 'overdue'];
  var DEFAULT_NUMBER_FORMAT = 'INV/{yyyy}/{mm}/{seq:4}';
  var MAX_STORAGE_WARNING = 4.2 * 1024 * 1024;

  var state = {
    invoices: [],
    profile: core.normalizeProfile({}),
    settings: core.normalizeSettings({}),
    current: null,
    view: 'editor',
    saveTimer: 0,
    profileSaveTimer: 0,
    toastTimer: 0,
    resizeFrame: 0,
    importMode: 'invoice',
    pendingFocus: null,
    bannerDismissed: false,
    storageError: false,
    resizeObserver: null
  };

  var el = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function timeNow() {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  }

  function formatDecimal(value) {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function cacheElements() {
    el.brandHome = byId('brand-home');
    el.btnNew = byId('btn-new');
    el.btnPrint = byId('btn-print');

    el.storageBanner = byId('storage-banner');
    el.storageBannerText = byId('storage-banner-text');
    el.btnExportNow = byId('btn-export-now');
    el.btnDismissBanner = byId('btn-dismiss-banner');

    el.viewEditor = byId('view-editor');
    el.viewHistory = byId('view-history');
    el.viewProfile = byId('view-profile');

    el.editorGrid = byId('editor-grid');
    el.formPanel = qs('.form-panel');
    el.editorTitle = byId('editor-title');
    el.editorSubtitle = byId('editor-subtitle');
    el.saveState = byId('save-state');
    el.saveStateText = byId('save-state-text');
    el.btnNewInline = byId('btn-new-inline');
    el.profileReminder = byId('profile-reminder');
    el.btnGoProfile = byId('btn-go-profile');

    el.tabForm = byId('tab-form');
    el.tabPreview = byId('tab-preview');
    el.mobileTabs = qsa('.mobile-tab');
    el.topNavItems = qsa('.topnav__item');
    el.mobileNavItems = qsa('.mobile-nav__item');

    el.form = byId('invoice-form');
    el.number = byId('invoice-number');
    el.btnRegenerateNumber = byId('btn-regenerate-number');
    el.numberHint = byId('number-hint');
    el.numberError = byId('number-error');
    el.status = byId('invoice-status');
    el.issueDate = byId('issue-date');
    el.issueError = byId('issue-error');
    el.dueDate = byId('due-date');
    el.dueError = byId('due-error');
    el.currency = byId('invoice-currency');

    el.customerName = byId('customer-name');
    el.customerNameError = byId('customer-name-error');
    el.customerCompany = byId('customer-company');
    el.customerAddress = byId('customer-address');
    el.customerPhone = byId('customer-phone');
    el.customerEmail = byId('customer-email');
    el.customerEmailError = byId('customer-email-error');

    el.btnToggleColumns = byId('btn-toggle-columns');
    el.columnSettings = byId('column-settings');
    el.columnsUnit = byId('columns-unit');
    el.columnsDiscount = byId('columns-discount');
    el.columnsDescLabel = byId('columns-desc-label');
    el.columnsUnitLabel = byId('columns-unit-label');
    el.itemHeadDesc = byId('item-head-desc');
    el.itemHeadUnit = byId('item-head-unit');
    el.itemHeadDiscount = qs('.item-head [data-col="discount"]');
    el.itemsList = byId('items-list');
    el.btnAddItem = byId('btn-add-item');
    el.itemsError = byId('items-error');
    el.itemRowTemplate = byId('item-row-template');

    el.discountType = byId('discount-type');
    el.discountValue = byId('discount-value');
    el.discountError = byId('discount-error');
    el.extraFee = byId('extra-fee');
    el.taxEnabled = byId('tax-enabled');
    el.taxRate = byId('tax-rate');
    el.taxRateError = byId('tax-rate-error');
    el.notes = byId('invoice-notes');
    el.terms = byId('invoice-terms');
    el.quickDateChips = qsa('.quick-dates .chip');

    el.previewMeta = byId('preview-meta');
    el.btnTips = byId('btn-tips');
    el.btnDownloadInvoice = byId('btn-download-invoice');
    el.btnPrintPreview = byId('btn-print-preview');
    el.paperStage = byId('paper-stage');
    el.paperFit = byId('paper-fit');
    el.paperScaler = byId('paper-scaler');
    el.invoicePaper = byId('invoice-paper');

    el.invLogo = byId('inv-logo');
    el.invBusinessName = byId('inv-business-name');
    el.invBusinessAddress = byId('inv-business-address');
    el.invBusinessContact = byId('inv-business-contact');
    el.invBusinessWeb = byId('inv-business-web');
    el.invBusinessNpwp = byId('inv-business-npwp');
    el.invNumber = byId('inv-number');
    el.invStatus = byId('inv-status');
    el.invCustomerName = byId('inv-customer-name');
    el.invCustomerCompany = byId('inv-customer-company');
    el.invCustomerAddress = byId('inv-customer-address');
    el.invCustomerContact = byId('inv-customer-contact');
    el.invIssue = byId('inv-issue');
    el.invDue = byId('inv-due');
    el.invItems = byId('inv-items');
    el.thDesc = byId('th-desc');
    el.thUnit = byId('th-unit');
    el.thDiscount = qs('#invoice-paper th[data-col="discount"]');
    el.colUnit = qs('#invoice-paper col[data-col="unit"]');
    el.colDiscount = qs('#invoice-paper col[data-col="discount"]');
    el.invSubtotal = byId('inv-subtotal');
    el.rowDiscount = byId('row-discount');
    el.invDiscount = byId('inv-discount');
    el.rowDpp = byId('row-dpp');
    el.invDpp = byId('inv-dpp');
    el.rowTax = byId('row-tax');
    el.invTaxLabel = byId('inv-tax-label');
    el.invTax = byId('inv-tax');
    el.rowFee = byId('row-fee');
    el.invFee = byId('inv-fee');
    el.invTotal = byId('inv-total');
    el.invTerbilang = byId('inv-terbilang');
    el.invNotesWrap = byId('inv-notes-wrap');
    el.invNotes = byId('inv-notes');
    el.invAccounts = byId('inv-accounts');
    el.invSignatureName = byId('inv-signature-name');
    el.invSignatureTitle = byId('inv-signature-title');
    el.invTermsWrap = byId('inv-terms-wrap');
    el.invTerms = byId('inv-terms');

    el.historySubtitle = byId('history-subtitle');
    el.btnImportInvoice = byId('btn-import-invoice');
    el.btnHistoryNew = byId('btn-history-new');
    el.historySearch = byId('history-search');
    el.historyStatus = byId('history-status-filter');
    el.historyList = byId('history-list');
    el.historyEmpty = byId('history-empty');
    el.btnEmptyNew = byId('btn-empty-new');
    el.historyNoResults = byId('history-no-results');
    el.btnResetFilters = byId('btn-reset-filters');

    el.profileSaveState = byId('profile-save-state');
    el.profileSaveStateText = byId('profile-save-state-text');
    el.profileForm = byId('profile-form');
    el.profileBusinessName = byId('profile-business-name');
    el.profileBusinessNameError = byId('profile-business-name-error');
    el.profileBusinessPhone = byId('profile-business-phone');
    el.profileBusinessAddress = byId('profile-business-address');
    el.profileBusinessEmail = byId('profile-business-email');
    el.profileBusinessWebsite = byId('profile-business-website');
    el.profileBusinessNpwp = byId('profile-business-npwp');
    el.logoPreview = byId('logo-preview');
    el.logoPlaceholder = byId('logo-placeholder');
    el.btnUploadLogo = byId('btn-upload-logo');
    el.btnRemoveLogo = byId('btn-remove-logo');
    el.logoError = byId('logo-error');
    el.accountsList = byId('accounts-list');
    el.accountsError = byId('accounts-error');
    el.btnAddAccount = byId('btn-add-account');
    el.accountRowTemplate = byId('account-row-template');
    el.profileNotes = byId('profile-notes');
    el.profileTerms = byId('profile-terms');
    el.profileSignatureName = byId('profile-signature-name');
    el.profileSignatureTitle = byId('profile-signature-title');
    el.profileNumberFormat = byId('profile-number-format');
    el.numberFormatPreview = byId('number-format-preview');
    el.profileTaxRate = byId('profile-tax-rate');
    el.profileTaxRateError = byId('profile-tax-rate-error');
    el.profileCurrency = byId('profile-currency');
    el.profileDueDays = byId('profile-due-days');
    el.storageUsage = byId('storage-usage');
    el.btnExportAll = byId('btn-export-all');
    el.btnImportAll = byId('btn-import-all');

    el.confirmDialog = byId('confirm-dialog');
    el.confirmTitle = byId('confirm-title');
    el.confirmMessage = byId('confirm-message');
    el.confirmOk = byId('confirm-ok');
    el.tipsDialog = byId('tips-dialog');

    el.importFile = byId('import-file');
    el.logoFile = byId('logo-file');
    el.toast = byId('toast');
    el.toastText = byId('toast-text');
    el.toastIcon = qs('.toast__icon use');
  }

  /* Storage ---------------------------------------------------------------- */

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      onStorageError(error);
      return false;
    }
  }

  function onStorageError(error) {
    state.storageError = true;
    state.bannerDismissed = false;
    if (el.storageBanner) {
      el.storageBanner.hidden = false;
      if (el.storageBannerText) {
        el.storageBannerText.textContent =
          'Penyimpanan browser penuh atau tidak tersedia. Ekspor data lalu hapus invoice lama.';
      }
    }
    if (window.console && typeof window.console.warn === 'function') {
      window.console.warn('Invoice Generator: penyimpanan gagal.', error);
    }
  }

  function storageBytes() {
    var total = 0;
    try {
      for (var i = 0; i < window.localStorage.length; i += 1) {
        var key = window.localStorage.key(i);
        if (!key || key.indexOf('invoiceGenerator.v1.') !== 0) continue;
        var value = window.localStorage.getItem(key);
        total += (key.length + (value ? value.length : 0)) * 2;
      }
    } catch (error) {
      return total;
    }
    return total;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB';
  }

  function loadState() {
    var storedInvoices = readJSON(KEYS.invoices, []);
    if (Array.isArray(storedInvoices)) {
      state.invoices = storedInvoices.map(function (invoice) {
        return core.normalizeInvoice(invoice);
      });
    }

    state.profile = core.normalizeProfile(readJSON(KEYS.profile, {}));
    state.settings = core.normalizeSettings(readJSON(KEYS.settings, {}));

    var draft = readJSON(KEYS.draft, null);
    if (draft && draft.invoice && typeof draft.invoice === 'object') {
      state.current = core.normalizeInvoice(draft.invoice);
    } else {
      state.current = createBlankInvoice();
    }
  }

  /* Invoice state ---------------------------------------------------------- */

  function historyNumbers() {
    return state.invoices
      .map(function (invoice) { return invoice.number; })
      .filter(function (number) { return Boolean(number && String(number).trim()); });
  }

  function otherNumbers() {
    var currentId = state.current ? state.current.id : '';
    return state.invoices
      .filter(function (invoice) { return invoice.id !== currentId; })
      .map(function (invoice) { return invoice.number; })
      .filter(function (number) { return Boolean(number && String(number).trim()); });
  }

  function generateNumber(date, excludeCurrent) {
    var existing = historyNumbers();
    if (excludeCurrent && state.current && state.current.number) {
      existing.push(state.current.number);
    }
    return core.nextInvoiceNumber({
      pattern: state.settings.numberFormat || DEFAULT_NUMBER_FORMAT,
      date: date || core.todayISO(),
      seq: 1,
      existing: existing
    }).number;
  }

  function currentInHistory() {
    if (!state.current) return false;
    return state.invoices.some(function (invoice) {
      return invoice.id === state.current.id;
    });
  }

  function findInvoiceIndex(id) {
    for (var i = 0; i < state.invoices.length; i += 1) {
      if (state.invoices[i].id === id) return i;
    }
    return -1;
  }

  function hasInvoiceContent(invoice) {
    if (!invoice) return false;
    var customer = invoice.customer || {};
    var hasCustomer = ['name', 'company', 'address', 'phone', 'email'].some(function (key) {
      return String(customer[key] || '').trim() !== '';
    });
    var hasItem = (invoice.items || []).some(function (item) {
      return (
        String(item.desc || '').trim() !== '' ||
        String(item.unit || '').trim() !== '' ||
        Number(item.price) > 0 ||
        Number(item.discount) > 0
      );
    });
    var hasMoney =
      Number(invoice.extraFee) > 0 ||
      Number(invoice.discount && invoice.discount.value) > 0;
    return hasCustomer || hasItem || hasMoney;
  }

  function profileComplete() {
    var business = state.profile.business || {};
    var hasName = String(business.name || '').trim() !== '';
    var hasAccount = (state.profile.accounts || []).some(function (account) {
      return (
        String(account && account.bank || '').trim() !== '' &&
        String(account && account.number || '').trim() !== ''
      );
    });
    return hasName && hasAccount;
  }

  function captureSnapshot() {
    if (!state.current) return;
    state.current.snapshot = core.deepClone({
      business: state.profile.business,
      accounts: state.profile.accounts,
      signature: state.profile.signature
    });
    state.current.snapshotAt = nowISO();
  }

  function ensureSnapshot() {
    if (!state.current) return;
    if (state.current.status !== 'draft' && !state.current.snapshot && profileComplete()) {
      captureSnapshot();
    }
  }

  function effectiveProfile() {
    var invoice = state.current;
    if (invoice && invoice.status !== 'draft' && invoice.snapshot) {
      var snapshot = invoice.snapshot;
      var business =
        snapshot.business && String(snapshot.business.name || '').trim()
          ? snapshot.business
          : state.profile.business;
      var accounts =
        Array.isArray(snapshot.accounts) && snapshot.accounts.length
          ? snapshot.accounts
          : state.profile.accounts;
      var signature =
        snapshot.signature &&
        (String(snapshot.signature.name || '').trim() ||
          String(snapshot.signature.title || '').trim())
          ? snapshot.signature
          : state.profile.signature;
      return {
        business: business || {},
        accounts: accounts || [],
        signature: signature || {},
        defaults: state.profile.defaults
      };
    }
    return state.profile;
  }

  function createBlankInvoice() {
    var today = core.todayISO();
    return core.normalizeInvoice({
      number: generateNumber(today),
      status: 'draft',
      issueDate: today,
      dueDate: core.addDaysISO(today, state.settings.dueDays),
      currency: state.settings.currency,
      customer: {},
      items: [{ desc: '', qty: 1, unit: '', price: 0, discount: 0 }],
      discount: { type: 'percent', value: 0 },
      tax: { enabled: true, rate: state.settings.taxRate },
      extraFee: 0,
      notes: state.profile.defaults.notes,
      terms: state.profile.defaults.terms,
      columns: {
        unit: true,
        discount: false,
        descLabel: 'Deskripsi',
        unitLabel: 'Satuan'
      }
    });
  }

  function persistDraft() {
    if (!state.current) return true;
    return writeJSON(KEYS.draft, {
      invoice: state.current,
      savedAt: nowISO()
    });
  }

  function setSaveState(mode, text) {
    if (!el.saveState) return;
    el.saveState.classList.toggle('is-saving', mode === 'saving');
    el.saveState.classList.toggle('is-error', mode === 'error');
    el.saveStateText.textContent = text;
  }

  function setProfileSaveState(mode, text) {
    if (!el.profileSaveState) return;
    el.profileSaveState.classList.toggle('is-saving', mode === 'saving');
    el.profileSaveState.classList.toggle('is-error', mode === 'error');
    el.profileSaveStateText.textContent = text;
  }

  function scheduleSave() {
    if (!state.current) return;
    setSaveState('saving', 'Menyimpan…');
    if (state.saveTimer) clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(flushSave, 500);
  }

  function flushSave() {
    if (state.saveTimer) {
      clearTimeout(state.saveTimer);
      state.saveTimer = 0;
    }
    if (!state.current) return;

    ensureSnapshot();
    state.current.updatedAt = nowISO();

    var shouldStore = currentInHistory() || hasInvoiceContent(state.current);
    if (shouldStore) {
      var normalized = core.normalizeInvoice(state.current);
      var index = findInvoiceIndex(state.current.id);
      if (index === -1) state.invoices.push(normalized);
      else state.invoices[index] = normalized;
      if (!writeJSON(KEYS.invoices, state.invoices)) {
        setSaveState('error', 'Gagal menyimpan');
        return;
      }
    }

    if (!persistDraft()) {
      setSaveState('error', 'Gagal menyimpan');
      return;
    }

    setSaveState('saved', 'Tersimpan ' + timeNow());
    updateEditorHeading();
    updateStorageBanner();
    updateStorageUsage();
    if (state.view === 'history') renderHistory();
  }

  function scheduleProfileSave() {
    setProfileSaveState('saving', 'Menyimpan…');
    if (state.profileSaveTimer) clearTimeout(state.profileSaveTimer);
    state.profileSaveTimer = setTimeout(function () {
      flushProfileSave(false);
    }, 500);
  }

  function flushProfileSave(showToast) {
    if (state.profileSaveTimer) {
      clearTimeout(state.profileSaveTimer);
      state.profileSaveTimer = 0;
    }
    state.profile.updatedAt = nowISO();
    var savedProfile = writeJSON(KEYS.profile, state.profile);
    var savedSettings = writeJSON(KEYS.settings, state.settings);
    if (!savedProfile || !savedSettings) {
      setProfileSaveState('error', 'Gagal menyimpan');
      return false;
    }
    setProfileSaveState('saved', 'Tersimpan ' + timeNow());
    updateStorageBanner();
    updateStorageUsage();
    if (showToast) toast('Profil tersimpan.');
    return true;
  }

  function updateStorageBanner() {
    if (!el.storageBanner) return;
    if (state.bannerDismissed) {
      el.storageBanner.hidden = true;
      return;
    }
    var bytes = storageBytes();
    if (state.storageError) {
      el.storageBanner.hidden = false;
      el.storageBannerText.textContent =
        'Penyimpanan browser penuh atau tidak tersedia. Ekspor data lalu hapus invoice lama.';
      return;
    }
    if (bytes > MAX_STORAGE_WARNING) {
      el.storageBanner.hidden = false;
      el.storageBannerText.textContent =
        'Penyimpanan browser hampir penuh (' +
        formatBytes(bytes) +
        '). Ekspor data lalu hapus invoice lama.';
      return;
    }
    el.storageBanner.hidden = true;
  }

  function updateStorageUsage() {
    if (!el.storageUsage) return;
    var bytes = storageBytes();
    el.storageUsage.textContent =
      'Data aplikasi: ' + formatBytes(bytes) + '. Tersimpan hanya di browser ini.';
  }

  /* Form rendering --------------------------------------------------------- */

  function renderForm() {
    var invoice = state.current;
    if (!invoice) return;

    el.number.value = invoice.number || '';
    el.status.value = invoice.status;
    el.issueDate.value = invoice.issueDate || '';
    el.dueDate.value = invoice.dueDate || '';
    el.currency.value = invoice.currency;

    el.customerName.value = invoice.customer.name || '';
    el.customerCompany.value = invoice.customer.company || '';
    el.customerAddress.value = invoice.customer.address || '';
    el.customerPhone.value = invoice.customer.phone || '';
    el.customerEmail.value = invoice.customer.email || '';

    el.discountType.value = invoice.discount.type;
    el.discountValue.value = discountDisplay(invoice);
    el.extraFee.value = invoice.extraFee
      ? core.formatMoneyInput(invoice.extraFee, invoice.currency)
      : '';
    el.taxEnabled.checked = invoice.tax.enabled;
    el.taxRate.value = formatDecimal(invoice.tax.rate);
    el.notes.value = invoice.notes || '';
    el.terms.value = invoice.terms || '';

    el.columnsUnit.checked = invoice.columns.unit;
    el.columnsDiscount.checked = invoice.columns.discount;
    el.columnsDescLabel.value = invoice.columns.descLabel;
    el.columnsUnitLabel.value = invoice.columns.unitLabel;

    renderItems();
    applyColumns();
    syncTaxState();
    updateLineTotals();
    updateNumberHint();
    updateEditorHeading();
    updateQuickDates();
    updateProfileReminder();
  }

  function discountDisplay(invoice) {
    if (invoice.discount.type === 'percent') {
      return formatDecimal(invoice.discount.value);
    }
    return invoice.discount.value
      ? core.formatMoneyInput(invoice.discount.value, invoice.currency)
      : '';
  }

  function itemValue(item, field, invoice) {
    if (field === 'desc') return item.desc || '';
    if (field === 'qty') return item.qty ? core.formatQty(item.qty) : '';
    if (field === 'unit') return item.unit || '';
    if (field === 'price') {
      return item.price ? core.formatMoneyInput(item.price, invoice.currency) : '';
    }
    if (field === 'discount') {
      return item.discount ? core.formatMoneyInput(item.discount, invoice.currency) : '';
    }
    return '';
  }

  function renderItems() {
    var invoice = state.current;
    if (!invoice) return;

    el.itemsList.textContent = '';

    if (!invoice.items.length) {
      var empty = document.createElement('p');
      empty.className = 'items-empty';
      empty.textContent = 'Belum ada item. Tambahkan minimal satu item untuk dicetak.';
      el.itemsList.append(empty);
    } else {
      invoice.items.forEach(function (item, index) {
        el.itemsList.append(buildItemRow(item, index, invoice));
      });
    }

    applyColumns();

    var pending = state.pendingFocus;
    state.pendingFocus = null;
    if (!pending) return;

    if (pending.action) {
      var row = el.itemsList.querySelector('.item-row[data-index="' + pending.index + '"]');
      var actionButton = row
        ? row.querySelector('[data-action="' + pending.action + '"]')
        : null;
      if (actionButton && !actionButton.disabled) {
        actionButton.focus();
      } else {
        var fallback = row ? row.querySelector('[data-field="desc"]') : null;
        if (fallback) fallback.focus();
        else el.btnAddItem.focus();
      }
      return;
    }

    if (pending.field) {
      var focusRow = el.itemsList.querySelector('.item-row[data-index="' + pending.index + '"]');
      var input = focusRow
        ? focusRow.querySelector('[data-field="' + pending.field + '"]')
        : null;
      if (input) {
        input.focus();
        if (pending.select) input.select();
      }
      return;
    }

    el.btnAddItem.focus();
  }

  function buildItemRow(item, index, invoice) {
    var node = el.itemRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.index = String(index);

    var labels = {
      desc: invoice.columns.descLabel,
      qty: 'Qty',
      unit: invoice.columns.unitLabel,
      price: 'Harga/unit',
      discount: 'Diskon'
    };

    ['desc', 'qty', 'unit', 'price', 'discount'].forEach(function (field) {
      var input = qs('[data-field="' + field + '"]', node);
      var label = qs('[data-label-for="' + field + '"]', node);
      input.id = 'item-' + index + '-' + field;
      input.value = itemValue(item, field, invoice);
      if (label) {
        label.htmlFor = input.id;
        label.textContent = labels[field];
      }
    });

    var line = core.calcLine(item, invoice.currency, invoice.columns.discount);
    var totalOut = qs('[data-line-total]', node);
    totalOut.textContent = core.formatMoney(line.total, invoice.currency);

    var warning = qs('[data-warning]', node);
    warning.id = 'item-' + index + '-warning';
    var showWarning = line.warning && (String(item.desc || '').trim() || item.price > 0);
    warning.hidden = !showWarning;
    warning.textContent = showWarning ? 'Periksa qty dan harga item ini.' : '';

    var descInput = qs('[data-field="desc"]', node);
    descInput.setAttribute('aria-describedby', warning.id);

    var up = qs('[data-action="up"]', node);
    var down = qs('[data-action="down"]', node);
    var remove = qs('[data-action="remove"]', node);
    up.disabled = index === 0;
    down.disabled = index === invoice.items.length - 1;
    up.setAttribute('aria-label', 'Naikkan item ' + (index + 1));
    down.setAttribute('aria-label', 'Turunkan item ' + (index + 1));
    remove.setAttribute('aria-label', 'Hapus item ' + (index + 1));

    return node;
  }

  function applyColumns() {
    var invoice = state.current;
    if (!invoice) return;

    el.formPanel.classList.toggle('no-unit', !invoice.columns.unit);
    el.formPanel.classList.toggle('no-discount', !invoice.columns.discount);

    qsa('[data-col="unit"]', el.itemsList).forEach(function (node) {
      node.hidden = !invoice.columns.unit;
    });
    qsa('[data-col="discount"]', el.itemsList).forEach(function (node) {
      node.hidden = !invoice.columns.discount;
    });

    if (el.itemHeadUnit) {
      el.itemHeadUnit.hidden = !invoice.columns.unit;
      el.itemHeadUnit.textContent = invoice.columns.unitLabel;
    }
    if (el.itemHeadDiscount) {
      el.itemHeadDiscount.hidden = !invoice.columns.discount;
    }
    if (el.itemHeadDesc) {
      el.itemHeadDesc.textContent = invoice.columns.descLabel;
    }

    qsa('.item-row', el.itemsList).forEach(function (row) {
      var descLabel = qs('[data-label-for="desc"]', row);
      var unitLabel = qs('[data-label-for="unit"]', row);
      if (descLabel) descLabel.textContent = invoice.columns.descLabel;
      if (unitLabel) unitLabel.textContent = invoice.columns.unitLabel;
    });
  }

  function syncTaxState() {
    var enabled = el.taxEnabled.checked;
    el.taxRate.disabled = !enabled;
    var field = el.taxRate.closest('.field');
    if (field) field.classList.toggle('is-disabled', !enabled);
  }

  function updateLineTotals() {
    var invoice = state.current;
    if (!invoice) return;

    qsa('.item-row', el.itemsList).forEach(function (row, index) {
      var item = invoice.items[index];
      if (!item) return;
      var line = core.calcLine(item, invoice.currency, invoice.columns.discount);
      var out = qs('[data-line-total]', row);
      if (out) out.textContent = core.formatMoney(line.total, invoice.currency);

      var warning = qs('[data-warning]', row);
      if (warning) {
        var showWarning =
          line.warning && (String(item.desc || '').trim() || item.price > 0);
        warning.hidden = !showWarning;
        warning.textContent = showWarning ? 'Periksa qty dan harga item ini.' : '';
      }
    });
  }

  function updateQuickDates() {
    var invoice = state.current;
    if (!invoice) return;
    var issue = core.parseISODate(invoice.issueDate);
    var due = core.parseISODate(invoice.dueDate);
    var difference = issue && due ? Math.round((due - issue) / 86400000) : null;

    el.quickDateChips.forEach(function (chip) {
      var days = Number(chip.dataset.due);
      var active = difference !== null && difference === days;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function updateNumberHint() {
    if (!el.numberHint) return;
    var duplicate = otherNumbers().some(function (number) {
      return (
        String(number || '').trim().toLowerCase() ===
        String(state.current.number || '').trim().toLowerCase()
      );
    });

    if (duplicate && String(state.current.number || '').trim()) {
      el.numberHint.textContent = 'Nomor ini juga dipakai invoice lain.';
      el.numberHint.classList.add('is-warning');
    } else {
      el.numberHint.textContent = 'Format: ' + state.settings.numberFormat;
      el.numberHint.classList.remove('is-warning');
    }
  }

  function updateEditorHeading() {
    if (!el.editorTitle) return;
    var inHistory = currentInHistory();
    el.editorTitle.textContent = inHistory ? 'Edit invoice' : 'Invoice baru';
    el.editorSubtitle.textContent = inHistory
      ? 'Perubahan tersimpan otomatis di browser ini.'
      : 'Isi data di kiri, pratinjau A4 diperbarui langsung.';
  }

  function updateProfileReminder() {
    if (!el.profileReminder) return;
    el.profileReminder.hidden = profileComplete();
  }

  /* Preview rendering ------------------------------------------------------ */

  function setText(node, value, placeholder) {
    if (!node) return;
    var text = value == null ? '' : String(value);
    var hasValue = text.trim() !== '';
    node.textContent = hasValue ? text : (placeholder || '');
    node.classList.toggle('is-placeholder', !hasValue && Boolean(placeholder));
    node.hidden = !hasValue && !placeholder;
  }

  function joinContact(phone, email) {
    return [phone, email]
      .map(function (part) { return String(part || '').trim(); })
      .filter(Boolean)
      .join(' · ');
  }

  function setStatusPill(node, status) {
    if (!node) return;
    var value = STATUS_VALUES.indexOf(status) !== -1 ? status : 'draft';
    node.className = 'status-pill status--' + value;
    node.textContent = STATUS_LABELS[value];
  }

  function appendCell(row, className, text) {
    var cell = document.createElement('td');
    cell.className = className;
    cell.textContent = text;
    row.append(cell);
    return cell;
  }

  function renderPreview() {
    var invoice = state.current;
    if (!invoice) return;

    var profile = effectiveProfile();
    var business = profile.business || {};
    var signature = profile.signature || {};
    var totals = core.calcTotals(invoice);
    var showUnit = invoice.columns.unit;
    var showDiscount = invoice.columns.discount;

    if (business.logo) {
      if (el.invLogo.getAttribute('src') !== business.logo) {
        el.invLogo.src = business.logo;
      }
      el.invLogo.hidden = false;
    } else {
      el.invLogo.hidden = true;
      el.invLogo.removeAttribute('src');
    }

    setText(el.invBusinessName, business.name, 'Nama Usaha');
    setText(el.invBusinessAddress, business.address, null);
    setText(el.invBusinessContact, joinContact(business.phone, business.email), null);
    setText(el.invBusinessWeb, business.website, null);
    setText(el.invBusinessNpwp, business.npwp ? 'NPWP ' + business.npwp : '', null);

    setText(el.invNumber, invoice.number, 'Nomor invoice');
    setStatusPill(el.invStatus, invoice.status);

    setText(el.invCustomerName, invoice.customer.name, 'Nama pelanggan');
    setText(el.invCustomerCompany, invoice.customer.company, null);
    setText(el.invCustomerAddress, invoice.customer.address, null);
    setText(
      el.invCustomerContact,
      joinContact(invoice.customer.phone, invoice.customer.email),
      null
    );

    var issueText = core.formatDateID(invoice.issueDate);
    var dueText = core.formatDateID(invoice.dueDate);
    setText(el.invIssue, issueText, 'Belum diisi');
    setText(el.invDue, dueText, 'Belum diisi');

    el.invItems.textContent = '';

    if (!invoice.items.length) {
      var emptyRow = document.createElement('tr');
      emptyRow.className = 'invoice-empty-row';
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 7;
      emptyCell.textContent = 'Belum ada item.';
      emptyRow.append(emptyCell);
      el.invItems.append(emptyRow);
    } else {
      invoice.items.forEach(function (item, index) {
        var row = document.createElement('tr');
        appendCell(row, 'col-no', String(index + 1));
        appendCell(row, 'col-desc', item.desc || '-');
        appendCell(row, 'col-qty', core.formatQty(item.qty));

        var unitCell = appendCell(row, 'col-unit', item.unit || '-');
        unitCell.hidden = !showUnit;

        appendCell(row, 'col-price', core.formatMoney(item.price, invoice.currency));

        var discountCell = appendCell(
          row,
          'col-disc',
          item.discount > 0 ? core.formatMoney(item.discount, invoice.currency) : '-'
        );
        discountCell.hidden = !showDiscount;

        appendCell(
          row,
          'col-amount',
          core.formatMoney(totals.lineTotals[index].total, invoice.currency)
        );
        el.invItems.append(row);
      });
    }

    if (el.thDesc) el.thDesc.textContent = invoice.columns.descLabel;
    if (el.thUnit) {
      el.thUnit.textContent = invoice.columns.unitLabel;
      el.thUnit.hidden = !showUnit;
    }
    if (el.thDiscount) el.thDiscount.hidden = !showDiscount;
    if (el.colUnit) el.colUnit.style.display = showUnit ? '' : 'none';
    if (el.colDiscount) el.colDiscount.style.display = showDiscount ? '' : 'none';

    el.invSubtotal.textContent = core.formatMoney(totals.subtotal, invoice.currency);
    el.invDiscount.textContent = '-' + core.formatMoney(totals.discountTotal, invoice.currency);
    el.rowDiscount.hidden = totals.discountTotal <= 0;

    el.invDpp.textContent = core.formatMoney(totals.dpp, invoice.currency);
    el.rowDpp.hidden = !(totals.taxEnabled && totals.taxRate > 0);

    el.invTaxLabel.textContent = 'PPN ' + core.formatPercent(totals.taxRate);
    el.invTax.textContent = core.formatMoney(totals.tax, invoice.currency);
    el.rowTax.hidden = !(totals.taxEnabled && totals.taxRate > 0);

    el.invFee.textContent = core.formatMoney(totals.extraFee, invoice.currency);
    el.rowFee.hidden = totals.extraFee <= 0;

    el.invTotal.textContent = core.formatMoney(totals.total, invoice.currency);
    el.invTerbilang.textContent = core.amountInWords(totals.total, invoice.currency);

    setText(el.invNotes, invoice.notes, null);
    el.invNotesWrap.hidden = !String(invoice.notes || '').trim();

    setText(el.invTerms, invoice.terms, null);
    el.invTermsWrap.hidden = !String(invoice.terms || '').trim();

    renderAccountsPreview(profile.accounts || []);

    setText(
      el.invSignatureName,
      signature.name,
      invoice.status === 'draft' ? 'Nama penandatangan' : ''
    );
    setText(el.invSignatureTitle, signature.title, null);

    el.previewMeta.textContent = 'A4 · 210 × 297 mm · ' + invoice.currency;
    document.title =
      (invoice.number ? invoice.number + ' · ' : '') + 'Invoice Generator';

    scheduleResize();
  }

  function renderAccountsPreview(accounts) {
    el.invAccounts.textContent = '';
    var visible = accounts.filter(function (account) {
      return (
        String(account && account.bank || '').trim() ||
        String(account && account.number || '').trim()
      );
    });

    if (!visible.length) {
      var empty = document.createElement('p');
      empty.className = 'is-placeholder';
      empty.textContent = 'Rekening belum diisi.';
      el.invAccounts.append(empty);
      return;
    }

    visible.forEach(function (account) {
      var line = document.createElement('p');
      var bank = document.createElement('span');
      bank.className = 'payment-bank';
      bank.textContent = [account.bank, account.number]
        .map(function (part) { return String(part || '').trim(); })
        .filter(Boolean)
        .join(' ');
      line.append(bank);

      if (String(account.holder || '').trim()) {
        var holder = document.createElement('span');
        holder.className = 'payment-holder';
        holder.textContent = '\na.n. ' + account.holder;
        line.append(holder);
      }
      el.invAccounts.append(line);
    });
  }

  function scheduleResize() {
    if (state.resizeFrame) cancelAnimationFrame(state.resizeFrame);
    state.resizeFrame = requestAnimationFrame(function () {
      state.resizeFrame = 0;
      resizePreview();
    });
  }

  function resizePreview() {
    if (!el.paperStage || !el.invoicePaper || !el.paperFit || !el.paperScaler) return;
    var available = el.paperStage.clientWidth;
    if (!available) return;

    var paperWidth = el.invoicePaper.offsetWidth || 794;
    var paperHeight = el.invoicePaper.offsetHeight || 1123;
    var scale = Math.min(1, available / paperWidth);
    if (scale < 0.2) scale = 0.2;

    el.paperScaler.style.transform = 'scale(' + scale + ')';
    el.paperFit.style.width = Math.round(paperWidth * scale) + 'px';
    el.paperFit.style.height = Math.round(paperHeight * scale) + 'px';
  }

  /* Form reading and inline validation ------------------------------------ */

  function rowField(row, name) {
    return qs('[data-field="' + name + '"]', row);
  }

  function convertMoneyFields(fromCurrency, toCurrency) {
    var invoice = state.current;
    if (!invoice || fromCurrency === toCurrency) return;

    invoice.items.forEach(function (item) {
      item.price = core.convertMinor(item.price, fromCurrency, toCurrency);
      item.discount = core.convertMinor(item.discount, fromCurrency, toCurrency);
    });
    invoice.extraFee = core.convertMinor(invoice.extraFee, fromCurrency, toCurrency);
    if (invoice.discount.type === 'nominal') {
      invoice.discount.value = core.convertMinor(
        invoice.discount.value,
        fromCurrency,
        toCurrency
      );
    }
  }

  function readForm(moneyCurrency) {
    var invoice = state.current;
    if (!invoice) return;
    var parseCurrency = moneyCurrency || invoice.currency;
    invoice.number = el.number.value;
    invoice.status = STATUS_VALUES.indexOf(el.status.value) !== -1
      ? el.status.value
      : 'draft';
    invoice.issueDate = el.issueDate.value;
    invoice.dueDate = el.dueDate.value;
    invoice.currency = el.currency.value;

    invoice.customer = {
      name: el.customerName.value,
      company: el.customerCompany.value,
      address: el.customerAddress.value,
      phone: el.customerPhone.value,
      email: el.customerEmail.value
    };

    invoice.items = qsa('.item-row', el.itemsList).map(function (row) {
      return {
        desc: rowField(row, 'desc').value,
        qty: core.parseDecimalInput(rowField(row, 'qty').value),
        unit: rowField(row, 'unit').value,
        price: core.toMinor(
          Math.max(0, core.parseMoneyInput(rowField(row, 'price').value, parseCurrency)),
          parseCurrency
        ),
        discount: core.toMinor(
          Math.max(
            0,
            core.parseMoneyInput(rowField(row, 'discount').value, parseCurrency)
          ),
          parseCurrency
        )
      };
    });

    var discountType = el.discountType.value === 'nominal' ? 'nominal' : 'percent';
    invoice.discount = {
      type: discountType,
      value: discountType === 'nominal'
        ? core.toMinor(
            Math.max(0, core.parseMoneyInput(el.discountValue.value, parseCurrency)),
            parseCurrency
          )
        : Math.max(0, core.parseDecimalInput(el.discountValue.value))
    };

    invoice.tax = {
      enabled: el.taxEnabled.checked,
      rate: core.parseDecimalInput(el.taxRate.value)
    };
    invoice.extraFee = core.toMinor(
      Math.max(0, core.parseMoneyInput(el.extraFee.value, parseCurrency)),
      parseCurrency
    );
    invoice.notes = el.notes.value;
    invoice.terms = el.terms.value;
    invoice.columns = {
      unit: el.columnsUnit.checked,
      discount: el.columnsDiscount.checked,
      descLabel: el.columnsDescLabel.value,
      unitLabel: el.columnsUnitLabel.value
    };
  }

  function setFieldError(node, message, input, warning) {
    if (!node) return;
    if (message) {
      node.textContent = message;
      node.hidden = false;
      node.classList.toggle('is-warning', Boolean(warning));
      if (input && !warning) input.setAttribute('aria-invalid', 'true');
    } else {
      node.textContent = '';
      node.hidden = true;
      node.classList.remove('is-warning');
      if (input) input.removeAttribute('aria-invalid');
    }
  }

  function clearEditorErrors() {
    setFieldError(el.numberError, '', el.number);
    setFieldError(el.issueError, '', el.issueDate);
    setFieldError(el.dueError, '', el.dueDate);
    setFieldError(el.customerNameError, '', el.customerName);
    setFieldError(el.customerEmailError, '', el.customerEmail);
    setFieldError(el.itemsError, '', null);
    setFieldError(el.discountError, '', el.discountValue);
    setFieldError(el.taxRateError, '', el.taxRate);
  }

  function clearProfileErrors() {
    setFieldError(el.profileBusinessNameError, '', el.profileBusinessName);
    setFieldError(el.accountsError, '', null);
  }

  function hasPrintableItem() {
    if (!state.current) return false;
    return (state.current.items || []).some(function (item) {
      return String(item.desc || '').trim() || Number(item.price) > 0;
    });
  }

  function refreshInlineValidation() {
    var invoice = state.current;
    if (!invoice) return;

    if (
      core.isValidISODate(invoice.dueDate) &&
      (!core.isValidISODate(invoice.issueDate) || invoice.dueDate >= invoice.issueDate)
    ) {
      setFieldError(el.dueError, '', el.dueDate);
    } else if (
      invoice.dueDate &&
      invoice.issueDate &&
      invoice.dueDate < invoice.issueDate
    ) {
      setFieldError(
        el.dueError,
        'Jatuh tempo tidak boleh lebih awal dari tanggal terbit.',
        el.dueDate
      );
    }

    if (core.isValidISODate(invoice.issueDate)) {
      setFieldError(el.issueError, '', el.issueDate);
    }

    if (!invoice.customer.email || core.isValidEmail(invoice.customer.email)) {
      setFieldError(el.customerEmailError, '', el.customerEmail);
    } else {
      setFieldError(el.customerEmailError, 'Format email belum benar.', el.customerEmail);
    }

    var totals = core.calcTotals(invoice);
    if (invoice.discount.type === 'percent' && invoice.discount.value > 100) {
      setFieldError(
        el.discountError,
        'Diskon persen maksimal 100%.',
        el.discountValue,
        true
      );
    } else if (
      invoice.discount.type === 'nominal' &&
      invoice.discount.value > totals.subtotal
    ) {
      setFieldError(
        el.discountError,
        'Diskon nominal melebihi subtotal, jadi dibatasi ke subtotal.',
        el.discountValue,
        true
      );
    } else {
      setFieldError(el.discountError, '', el.discountValue);
    }

    if (invoice.tax.rate > 100) {
      setFieldError(
        el.taxRateError,
        'Tarif PPN di atas 100% akan dibatasi.',
        el.taxRate,
        true
      );
    } else {
      setFieldError(el.taxRateError, '', el.taxRate);
    }

    if (hasPrintableItem()) setFieldError(el.itemsError, '', null);
  }

  function validateField(target) {
    var invoice = state.current;
    if (!invoice) return;

    if (target === el.number) {
      if (!String(invoice.number || '').trim()) {
        setFieldError(el.numberError, 'Nomor invoice wajib diisi.', el.number);
      } else {
        setFieldError(el.numberError, '', el.number);
      }
    }

    if (target === el.dueDate) {
      if (!core.isValidISODate(invoice.dueDate)) {
        setFieldError(el.dueError, 'Jatuh tempo wajib diisi.', el.dueDate);
      } else if (
        core.isValidISODate(invoice.issueDate) &&
        invoice.dueDate < invoice.issueDate
      ) {
        setFieldError(
          el.dueError,
          'Jatuh tempo tidak boleh lebih awal dari tanggal terbit.',
          el.dueDate
        );
      } else {
        setFieldError(el.dueError, '', el.dueDate);
      }
    }

    if (target === el.issueDate) {
      if (!core.isValidISODate(invoice.issueDate)) {
        setFieldError(el.issueError, 'Tanggal terbit wajib diisi.', el.issueDate);
      } else {
        setFieldError(el.issueError, '', el.issueDate);
      }
    }

    if (target === el.customerEmail) {
      if (invoice.customer.email && !core.isValidEmail(invoice.customer.email)) {
        setFieldError(
          el.customerEmailError,
          'Format email belum benar.',
          el.customerEmail
        );
      } else {
        setFieldError(el.customerEmailError, '', el.customerEmail);
      }
    }
  }

  function reformatField(target) {
    var currency = state.current.currency;
    var value;

    if (
      target.matches('[data-field="price"], [data-field="discount"], #extra-fee')
    ) {
      value = core.parseMoneyInput(target.value, currency);
      target.value = value
        ? core.formatMoneyInput(core.toMinor(value, currency), currency)
        : '';
      return;
    }

    if (target.id === 'discount-value') {
      if (state.current.discount.type === 'nominal') {
        value = core.parseMoneyInput(target.value, currency);
        target.value = value
          ? core.formatMoneyInput(core.toMinor(value, currency), currency)
          : '';
      } else {
        target.value = formatDecimal(core.parseDecimalInput(target.value));
      }
      return;
    }

    if (target.matches('[data-field="qty"]')) {
      value = core.parseDecimalInput(target.value);
      target.value = value ? core.formatQty(value) : '';
      return;
    }

    if (target.id === 'tax-rate') {
      target.value = formatDecimal(core.parseDecimalInput(target.value));
    }
  }

  /* Profile --------------------------------------------------------------- */

  function renderProfile() {
    var business = state.profile.business || {};
    var defaults = state.profile.defaults || {};
    var signature = state.profile.signature || {};

    el.profileBusinessName.value = business.name || '';
    el.profileBusinessPhone.value = business.phone || '';
    el.profileBusinessAddress.value = business.address || '';
    el.profileBusinessEmail.value = business.email || '';
    el.profileBusinessWebsite.value = business.website || '';
    el.profileBusinessNpwp.value = business.npwp || '';

    el.profileNotes.value = defaults.notes || '';
    el.profileTerms.value = defaults.terms || '';

    el.profileSignatureName.value = signature.name || '';
    el.profileSignatureTitle.value = signature.title || '';

    el.profileNumberFormat.value = state.settings.numberFormat;
    el.profileTaxRate.value = formatDecimal(state.settings.taxRate);
    el.profileCurrency.value = state.settings.currency;
    el.profileDueDays.value = String(state.settings.dueDays);

    renderAccounts();
    renderLogo();
    updateNumberFormatPreview();
    updateStorageUsage();
  }

  function renderAccounts() {
    el.accountsList.textContent = '';
    var accounts = state.profile.accounts.length
      ? state.profile.accounts
      : [{ bank: '', number: '', holder: '' }];

    accounts.forEach(function (account, index) {
      var node = el.accountRowTemplate.content.firstElementChild.cloneNode(true);
      node.dataset.index = String(index);

      ['bank', 'number', 'holder'].forEach(function (field) {
        var input = qs('[data-field="' + field + '"]', node);
        var label = qs('[data-label-for="' + field + '"]', node);
        input.id = 'account-' + index + '-' + field;
        input.value = account[field] || '';
        if (label) label.htmlFor = input.id;
      });

      var remove = qs('[data-action="remove-account"]', node);
      remove.dataset.index = String(index);
      remove.setAttribute('aria-label', 'Hapus rekening ' + (index + 1));
      el.accountsList.append(node);
    });
  }

  function renderLogo() {
    var logo = state.profile.business.logo;
    if (logo) {
      el.logoPreview.src = logo;
      el.logoPreview.hidden = false;
      el.logoPlaceholder.hidden = true;
      el.btnRemoveLogo.hidden = false;
    } else {
      el.logoPreview.hidden = true;
      el.logoPreview.removeAttribute('src');
      el.logoPlaceholder.hidden = false;
      el.btnRemoveLogo.hidden = true;
    }
  }

  function readProfileForm() {
    var logo = state.profile.business.logo || '';
    state.profile.business = {
      name: el.profileBusinessName.value,
      phone: el.profileBusinessPhone.value,
      address: el.profileBusinessAddress.value,
      email: el.profileBusinessEmail.value,
      website: el.profileBusinessWebsite.value,
      npwp: el.profileBusinessNpwp.value,
      logo: logo
    };

    state.profile.accounts = qsa('.account-row', el.accountsList).map(function (row) {
      return {
        bank: qs('[data-field="bank"]', row).value,
        number: qs('[data-field="number"]', row).value,
        holder: qs('[data-field="holder"]', row).value
      };
    });

    state.profile.defaults = {
      notes: el.profileNotes.value,
      terms: el.profileTerms.value
    };
    state.profile.signature = {
      name: el.profileSignatureName.value,
      title: el.profileSignatureTitle.value
    };

    state.settings.numberFormat =
      el.profileNumberFormat.value.trim() || DEFAULT_NUMBER_FORMAT;
    var rawTax = core.parseDecimalInput(el.profileTaxRate.value);
    state.settings.taxRate = core.clamp(rawTax, 0, 100);
    state.profileTaxInvalid = rawTax > 100 || rawTax < 0;
    state.settings.currency = el.profileCurrency.value;
    state.settings.dueDays = [0, 7, 14, 30].indexOf(Number(el.profileDueDays.value)) !== -1
      ? Number(el.profileDueDays.value)
      : 14;
  }

  function updateNumberFormatPreview() {
    if (!el.numberFormatPreview) return;
    var next = core.nextInvoiceNumber({
      pattern: state.settings.numberFormat || DEFAULT_NUMBER_FORMAT,
      date: core.todayISO(),
      seq: 1,
      existing: historyNumbers()
    });
    el.numberFormatPreview.textContent = 'Berikutnya: ' + next.number;
  }

  function showLogoError(message) {
    if (!el.logoError) return;
    el.logoError.textContent = message || '';
    el.logoError.hidden = !message;
  }

  function handleLogoFile(file) {
    if (!file) return;
    showLogoError('');

    var filename = String(file.name || '');
    var isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(filename);
    var isJpeg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(filename);
    var isPng = file.type === 'image/png' || /\.png$/i.test(filename);

    if (!isSvg && !isJpeg && !isPng) {
      showLogoError('Gunakan file PNG, JPG, atau SVG.');
      return;
    }
    if (file.size > 1024 * 1024) {
      showLogoError('Ukuran logo maksimal 1 MB.');
      return;
    }

    var reader = new FileReader();
    reader.onerror = function () {
      showLogoError('Logo tidak bisa dibaca. Coba file lain.');
    };
    reader.onload = function () {
      var dataUrl = String(reader.result || '');
      if (isSvg) {
        applyLogo(dataUrl);
        return;
      }

      var image = new Image();
      image.onerror = function () {
        showLogoError('Logo tidak bisa dibaca. Coba file lain.');
      };
      image.onload = function () {
        var maxWidth = 480;
        var maxHeight = 240;
        var scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
        var width = Math.max(1, Math.round(image.width * scale));
        var height = Math.max(1, Math.round(image.height * scale));
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        if (!context) {
          showLogoError('Logo tidak bisa diproses di browser ini.');
          return;
        }
        if (isJpeg) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0, width, height);
        var output = isJpeg
          ? canvas.toDataURL('image/jpeg', 0.86)
          : canvas.toDataURL('image/png');
        applyLogo(output);
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function applyLogo(dataUrl) {
    state.profile.business.logo = dataUrl;
    renderLogo();
    flushProfileSave(false);
    renderPreview();
    showLogoError('');
    toast('Logo diperbarui.');
  }

  /* History --------------------------------------------------------------- */

  function updateHistorySubtitle() {
    if (!el.historySubtitle) return;
    el.historySubtitle.textContent = state.invoices.length
      ? state.invoices.length + ' invoice tersimpan di browser ini.'
      : 'Belum ada invoice tersimpan.';
  }

  function renderHistory() {
    if (!el.historyList) return;

    var query = String(el.historySearch.value || '').trim().toLowerCase();
    var status = el.historyStatus.value;
    var sorted = state.invoices.slice().sort(function (a, b) {
      return String(b.updatedAt || b.issueDate || '').localeCompare(
        String(a.updatedAt || a.issueDate || '')
      );
    });

    var filtered = sorted.filter(function (invoice) {
      if (status !== 'all' && invoice.status !== status) return false;
      if (!query) return true;
      var haystack = [
        invoice.number,
        invoice.customer && invoice.customer.name,
        invoice.customer && invoice.customer.company
      ]
        .join(' ')
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });

    el.historyList.textContent = '';
    filtered.forEach(function (invoice) {
      el.historyList.append(buildHistoryRow(invoice));
    });

    el.historyEmpty.hidden = state.invoices.length !== 0;
    el.historyNoResults.hidden = !(state.invoices.length > 0 && filtered.length === 0);
    el.historyList.hidden = filtered.length === 0;
    updateHistorySubtitle();
  }

  function historyAction(label, action, id, invoiceNumber, danger) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--ghost' + (danger ? ' btn--delete' : '');
    button.dataset.action = action;
    button.dataset.id = id;
    button.textContent = label;
    button.setAttribute(
      'aria-label',
      label + ' invoice ' + (invoiceNumber || 'tanpa nomor')
    );
    return button;
  }

  function buildHistoryRow(invoice) {
    var row = document.createElement('article');
    row.className = 'history-row';

    var main = document.createElement('div');
    main.className = 'history-main';
    var number = document.createElement('p');
    number.className = 'history-number';
    number.textContent = invoice.number || 'Tanpa nomor';
    var customer = document.createElement('p');
    customer.className = 'history-customer';
    var customerName = invoice.customer.name || invoice.customer.company || '';
    customer.textContent = customerName || 'Tanpa pelanggan';
    if (!customerName) customer.classList.add('is-placeholder');
    main.append(number, customer);

    var date = document.createElement('span');
    date.className = 'history-date';
    date.textContent = core.formatDateID(invoice.issueDate) || '-';

    var status = document.createElement('span');
    status.className = 'status-pill';
    setStatusPill(status, invoice.status);

    var total = document.createElement('span');
    total.className = 'history-total';
    total.textContent = core.formatMoney(
      core.calcTotals(invoice).total,
      invoice.currency
    );

    var actions = document.createElement('div');
    actions.className = 'history-actions';
    actions.append(
      historyAction('Buka', 'open', invoice.id, invoice.number, false),
      historyAction('Duplikat', 'duplicate', invoice.id, invoice.number, false),
      historyAction('Hapus', 'delete', invoice.id, invoice.number, true)
    );

    row.append(main, date, status, total, actions);
    return row;
  }

  /* Views and navigation -------------------------------------------------- */

  function setView(view, silent) {
    if (['editor', 'history', 'profile'].indexOf(view) === -1) view = 'editor';
    var previous = state.view;

    if (previous === 'editor' && view !== 'editor') flushSave();
    if (previous === 'profile' && view !== 'profile') flushProfileSave(false);

    state.view = view;
    el.viewEditor.hidden = view !== 'editor';
    el.viewHistory.hidden = view !== 'history';
    el.viewProfile.hidden = view !== 'profile';

    qsa('[data-view]').forEach(function (button) {
      var active = button.dataset.view === view;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    if (view === 'history') renderHistory();
    if (view === 'profile') renderProfile();
    if (view === 'editor') {
      setMobileTab('form');
      scheduleResize();
    }

    if (!silent) window.scrollTo(0, 0);
  }

  function setMobileTab(tab) {
    var preview = tab === 'preview';
    el.editorGrid.classList.toggle('show-preview', preview);

    el.mobileTabs.forEach(function (button) {
      var active = preview ? button.id === 'tab-preview' : button.id === 'tab-form';
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });

    if (preview) scheduleResize();
  }

  /* Invoice actions ------------------------------------------------------- */

  function openInvoice(id) {
    flushSave();
    var index = findInvoiceIndex(id);
    if (index === -1) return;

    state.current = core.normalizeInvoice(core.deepClone(state.invoices[index]));
    clearEditorErrors();
    setView('editor');
    renderForm();
    renderPreview();
    persistDraft();
    setSaveState('saved', 'Tersimpan ' + timeNow());
    el.number.focus();
    el.number.select();
    toast('Invoice dibuka.');
  }

  function newInvoice() {
    flushSave();
    state.current = createBlankInvoice();
    clearEditorErrors();
    setView('editor');
    renderForm();
    renderPreview();
    persistDraft();
    setSaveState('saved', 'Tersimpan ' + timeNow());
    el.customerName.focus();
  }

  function duplicateInvoice(id) {
    flushSave();
    var index = findInvoiceIndex(id);
    if (index === -1) return;

    var today = core.todayISO();
    var copy = core.normalizeInvoice(core.deepClone(state.invoices[index]));
    copy.id = core.uid('inv');
    copy.number = generateNumber(today);
    copy.status = 'draft';
    copy.issueDate = today;
    copy.dueDate = core.addDaysISO(today, state.settings.dueDays);
    copy.snapshot = null;
    copy.snapshotAt = '';
    copy.createdAt = nowISO();
    copy.updatedAt = nowISO();

    state.invoices.push(copy);
    if (!writeJSON(KEYS.invoices, state.invoices)) {
      state.invoices.pop();
      toast('Gagal menduplikasi invoice.', 'error');
      return;
    }

    state.current = core.normalizeInvoice(core.deepClone(copy));
    clearEditorErrors();
    setView('editor');
    renderForm();
    renderPreview();
    persistDraft();
    setSaveState('saved', 'Tersimpan ' + timeNow());
    toast('Invoice diduplikasi.');
  }

  function deleteInvoice(id) {
    var index = findInvoiceIndex(id);
    if (index === -1) return;
    var invoice = state.invoices[index];

    askConfirm({
      title: 'Hapus invoice?',
      message:
        'Invoice ' +
        (invoice.number || 'tanpa nomor') +
        ' akan dihapus permanen dari browser ini. Tindakan ini tidak bisa dibatalkan.',
      okLabel: 'Hapus',
      danger: true
    }).then(function (confirmed) {
      if (!confirmed) return;

      var removed = state.invoices.splice(index, 1)[0];
      if (!writeJSON(KEYS.invoices, state.invoices)) {
        state.invoices.splice(index, 0, removed);
        toast('Gagal menghapus invoice.', 'error');
        return;
      }

      if (state.current && state.current.id === id) {
        state.current = createBlankInvoice();
        clearEditorErrors();
        renderForm();
        renderPreview();
        persistDraft();
        setSaveState('saved', 'Tersimpan ' + timeNow());
      }

      renderHistory();
      updateStorageBanner();
      updateStorageUsage();
      toast('Invoice dihapus.');
    });
  }

  /* Validation and print -------------------------------------------------- */

  function showPrintErrors(result) {
    clearEditorErrors();
    clearProfileErrors();

    var errors = result.errors || {};
    var warnings = result.warnings || {};

    if (errors.number) setFieldError(el.numberError, errors.number, el.number);
    if (errors.issueDate) setFieldError(el.issueError, errors.issueDate, el.issueDate);
    if (errors.dueDate) setFieldError(el.dueError, errors.dueDate, el.dueDate);
    if (errors.customerName) {
      setFieldError(el.customerNameError, errors.customerName, el.customerName);
    }
    if (errors.customerEmail) {
      setFieldError(el.customerEmailError, errors.customerEmail, el.customerEmail);
    }
    if (errors.items) setFieldError(el.itemsError, errors.items, null);
    if (warnings.discount) {
      setFieldError(el.discountError, warnings.discount, el.discountValue, true);
    }
    if (warnings.taxRate) {
      setFieldError(el.taxRateError, warnings.taxRate, el.taxRate, true);
    }
    if (errors.businessName) {
      setFieldError(el.profileBusinessNameError, errors.businessName, el.profileBusinessName);
    }
    if (errors.accounts) setFieldError(el.accountsError, errors.accounts, null);

    if (errors.businessName || errors.accounts) {
      setView('profile');
      if (errors.businessName) {
        el.profileBusinessName.focus();
        el.profileBusinessName.scrollIntoView({ block: 'center' });
      } else {
        var firstAccount = qs('.account-row [data-field="bank"]', el.accountsList);
        if (firstAccount) {
          firstAccount.focus();
          firstAccount.scrollIntoView({ block: 'center' });
        }
      }
      toast('Lengkapi profil usaha sebelum mencetak.', 'error');
      return true;
    }

    if (Object.keys(errors).length) {
      setView('editor');
      setMobileTab('form');
      var target = null;
      if (errors.number) target = el.number;
      else if (errors.issueDate) target = el.issueDate;
      else if (errors.dueDate) target = el.dueDate;
      else if (errors.customerName) target = el.customerName;
      else if (errors.customerEmail) target = el.customerEmail;
      else if (errors.items) target = el.btnAddItem;

      if (target) {
        target.focus();
        target.scrollIntoView({ block: 'center' });
      }
      toast('Lengkapi data yang ditandai sebelum mencetak.', 'error');
      return true;
    }

    if (warnings.discount || warnings.taxRate) {
      toast('Periksa peringatan perhitungan sebelum mencetak.', 'error');
    }
    return false;
  }

  function requestPrint() {
    if (!state.current) return;
    readForm();
    ensureSnapshot();

    var result = core.validateInvoice(state.current, {
      profile: effectiveProfile(),
      existingNumbers: otherNumbers(),
      forPrint: true
    });

    if (showPrintErrors(result)) return;

    flushSave();
    setView('editor');
    setMobileTab('form');
    renderPreview();

    setTimeout(function () {
      window.print();
    }, 80);
  }

  /* Feedback -------------------------------------------------------------- */

  function toast(message, type) {
    if (!el.toast) return;
    el.toastText.textContent = message;
    el.toast.classList.toggle('is-error', type === 'error');
    if (el.toastIcon) {
      el.toastIcon.setAttribute(
        'href',
        type === 'error' ? '#icon-alert' : '#icon-check'
      );
    }
    el.toast.hidden = false;
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () {
      el.toast.hidden = true;
    }, 4200);
  }

  function askConfirm(options) {
    var settings = options || {};
    return new Promise(function (resolve) {
      if (!el.confirmDialog || typeof el.confirmDialog.showModal !== 'function') {
        resolve(window.confirm(settings.message || 'Lanjutkan?'));
        return;
      }

      el.confirmTitle.textContent = settings.title || 'Konfirmasi';
      el.confirmMessage.textContent = settings.message || '';
      el.confirmOk.textContent = settings.okLabel || 'Lanjutkan';
      el.confirmOk.className = 'btn ' + (settings.danger === false ? 'btn--primary' : 'btn--danger');
      el.confirmDialog.returnValue = '';

      el.confirmDialog.addEventListener(
        'close',
        function onClose() {
          el.confirmDialog.removeEventListener('close', onClose);
          resolve(el.confirmDialog.returnValue === 'confirm');
        }
      );
      el.confirmDialog.showModal();
    });
  }

  /* Export and import ----------------------------------------------------- */

  function sanitizeFilename(value) {
    var name = String(value || 'invoice')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return name || 'invoice';
  }

  function downloadJSON(data, filename) {
    var blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function exportInvoice() {
    if (!state.current) return;
    readForm();
    flushSave();
    var invoice = core.normalizeInvoice(state.current);
    downloadJSON(
      {
        app: 'invoice-generator',
        type: 'invoice',
        version: 1,
        exportedAt: nowISO(),
        invoice: invoice
      },
      sanitizeFilename(invoice.number) + '.json'
    );
    toast('Invoice diekspor.');
  }

  function exportAll() {
    flushSave();
    flushProfileSave(false);
    downloadJSON(
      {
        app: 'invoice-generator',
        version: 1,
        exportedAt: nowISO(),
        profile: state.profile,
        settings: state.settings,
        invoices: state.invoices
      },
      'invoice-generator-backup-' + core.todayISO() + '.json'
    );
    toast('Semua data diekspor.');
  }

  function triggerImport(mode) {
    state.importMode = mode;
    el.importFile.value = '';
    el.importFile.click();
  }

  function onImportFileChange() {
    var file = el.importFile.files && el.importFile.files[0];
    if (!file) return;
    var mode = state.importMode;

    var reader = new FileReader();
    reader.onerror = function () {
      toast('File tidak bisa dibaca.', 'error');
      el.importFile.value = '';
    };
    reader.onload = function () {
      try {
        var payload = JSON.parse(String(reader.result || ''));
        if (mode === 'all') importAll(payload);
        else importInvoice(payload);
      } catch (error) {
        toast(
          error && error.message ? error.message : 'File JSON tidak bisa dibaca.',
          'error'
        );
      }
      el.importFile.value = '';
    };
    reader.readAsText(file);
  }

  function importInvoice(payload) {
    var raw =
      payload && payload.type === 'invoice' && payload.invoice
        ? payload.invoice
        : payload;

    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) {
      throw new Error('File bukan invoice yang valid.');
    }

    var invoice = core.normalizeInvoice(raw);
    invoice.id = core.uid('inv');
    invoice.createdAt = nowISO();
    invoice.updatedAt = nowISO();
    if (!String(invoice.number || '').trim()) {
      invoice.number = generateNumber(invoice.issueDate);
    }

    var duplicate = state.invoices.some(function (existing) {
      return (
        String(existing.number || '').trim().toLowerCase() ===
        String(invoice.number || '').trim().toLowerCase()
      );
    });

    state.invoices.push(invoice);
    if (!writeJSON(KEYS.invoices, state.invoices)) {
      state.invoices.pop();
      return;
    }

    state.current = core.normalizeInvoice(core.deepClone(invoice));
    clearEditorErrors();
    setView('editor');
    renderForm();
    renderPreview();
    persistDraft();
    setSaveState('saved', 'Tersimpan ' + timeNow());
    updateStorageBanner();
    updateStorageUsage();
    toast(
      duplicate
        ? 'Invoice diimpor. Nomor bentrok, periksa sebelum mencetak.'
        : 'Invoice diimpor.',
      duplicate ? 'error' : ''
    );
  }

  function importAll(payload) {
    var data =
      payload && Array.isArray(payload.invoices)
        ? payload
        : payload && payload.data && Array.isArray(payload.data.invoices)
          ? payload.data
          : null;

    if (!data) {
      throw new Error('File cadangan tidak valid.');
    }

    askConfirm({
      title: 'Impor semua data?',
      message:
        data.invoices.length +
        ' invoice akan menggantikan ' +
        state.invoices.length +
        ' invoice yang ada sekarang, beserta profil dan pengaturannya.',
      okLabel: 'Impor dan ganti',
      danger: true
    }).then(function (confirmed) {
      if (!confirmed) return;

      var incoming = data.invoices.map(function (invoice) {
        return core.normalizeInvoice(invoice);
      });

      var seen = {};
      incoming.forEach(function (invoice) {
        if (seen[invoice.id]) invoice.id = core.uid('inv');
        seen[invoice.id] = true;
      });

      state.invoices = incoming;
      state.profile = core.normalizeProfile(data.profile || {});
      state.settings = core.normalizeSettings(data.settings || {});

      var savedInvoices = writeJSON(KEYS.invoices, state.invoices);
      var savedProfile = writeJSON(KEYS.profile, state.profile);
      var savedSettings = writeJSON(KEYS.settings, state.settings);
      if (!savedInvoices || !savedProfile || !savedSettings) {
        toast('Impor gagal disimpan. Periksa penyimpanan browser.', 'error');
        return;
      }

      state.current = state.invoices.length
        ? core.normalizeInvoice(core.deepClone(state.invoices[0]))
        : createBlankInvoice();
      clearEditorErrors();
      clearProfileErrors();
      persistDraft();
      setView('editor');
      renderForm();
      renderPreview();
      renderProfile();
      renderHistory();
      setSaveState('saved', 'Tersimpan ' + timeNow());
      setProfileSaveState('saved', 'Tersimpan ' + timeNow());
      updateStorageBanner();
      updateStorageUsage();
      toast('Data diimpor: ' + incoming.length + ' invoice.');
    });
  }

  /* Event handlers ------------------------------------------------------- */

  function onFormInput(event) {
    if (!state.current) return;
    var target = event.target;

    if (target.id === 'invoice-currency') {
      var previousCurrency = state.current.currency;
      readForm(previousCurrency);
      convertMoneyFields(previousCurrency, state.current.currency);
      renderForm();
      refreshInlineValidation();
      renderPreview();
      scheduleSave();
      return;
    }

    var previousStatus = state.current.status;
    readForm();

    if (
      target.id === 'invoice-status' &&
      previousStatus === 'draft' &&
      state.current.status !== 'draft' &&
      profileComplete()
    ) {
      captureSnapshot();
    }

    if (target.id === 'discount-type') {
      renderForm();
    }

    if (
      target.id === 'columns-unit' ||
      target.id === 'columns-discount' ||
      target.id === 'columns-desc-label' ||
      target.id === 'columns-unit-label'
    ) {
      applyColumns();
    }

    if (target.id === 'tax-enabled') syncTaxState();

    updateLineTotals();
    updateNumberHint();
    updateQuickDates();
    updateEditorHeading();
    refreshInlineValidation();
    renderPreview();
    updateProfileReminder();
    scheduleSave();
  }

  function onFormFocusIn(event) {
    var target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (
      target.matches(
        '[data-field="price"], [data-field="discount"], #extra-fee, #discount-value'
      ) &&
      target.value
    ) {
      target.select();
    }
  }

  function onFormFocusOut(event) {
    var target = event.target;
    if (!target || typeof target.matches !== 'function') return;

    var moneyTarget = target.matches(
      '[data-field="price"], [data-field="discount"], #extra-fee, #discount-value'
    );
    var quantityTarget = target.matches('[data-field="qty"], #tax-rate');

    if (moneyTarget || quantityTarget) {
      readForm();
      reformatField(target);
      updateLineTotals();
      refreshInlineValidation();
      renderPreview();
      scheduleSave();
    }

    if (
      target === el.number ||
      target === el.issueDate ||
      target === el.dueDate ||
      target === el.customerEmail
    ) {
      validateField(target);
    }
  }

  function onItemListClick(event) {
    if (!event.target || typeof event.target.closest !== 'function') return;
    var button = event.target.closest('button[data-action]');
    if (!button || !el.itemsList.contains(button)) return;

    var row = button.closest('.item-row');
    if (!row) return;
    var index = Number(row.dataset.index);
    if (!Number.isFinite(index)) return;

    readForm();
    var items = state.current.items;
    var action = button.dataset.action;

    if (action === 'up' && index > 0) {
      var movedUp = items.splice(index, 1)[0];
      items.splice(index - 1, 0, movedUp);
      state.pendingFocus = { index: index - 1, action: 'up' };
    } else if (action === 'down' && index < items.length - 1) {
      var movedDown = items.splice(index, 1)[0];
      items.splice(index + 1, 0, movedDown);
      state.pendingFocus = { index: index + 1, action: 'down' };
    } else if (action === 'remove') {
      items.splice(index, 1);
      state.pendingFocus = items.length
        ? { index: Math.min(index, items.length - 1), field: 'desc' }
        : { action: 'none' };
    } else {
      return;
    }

    renderItems();
    updateLineTotals();
    refreshInlineValidation();
    renderPreview();
    scheduleSave();
  }

  function onAccountListClick(event) {
    if (!event.target || typeof event.target.closest !== 'function') return;
    var button = event.target.closest('[data-action="remove-account"]');
    if (!button || !el.accountsList.contains(button)) return;

    var row = button.closest('.account-row');
    if (!row) return;
    var index = Number(row.dataset.index);
    if (!Number.isFinite(index)) return;

    readProfileForm();
    state.profile.accounts.splice(index, 1);
    renderAccounts();
    updateProfileReminder();
    renderPreview();
    scheduleProfileSave();

    var nextInput = qs('.account-row [data-field="bank"]', el.accountsList);
    if (nextInput) nextInput.focus();
  }

  function onProfileInput(event) {
    readProfileForm();
    updateNumberFormatPreview();
    updateNumberHint();
    updateProfileReminder();
    renderPreview();
    scheduleProfileSave();

    if (event.target === el.profileBusinessName && state.profile.business.name.trim()) {
      setFieldError(el.profileBusinessNameError, '', el.profileBusinessName);
    }

    if (event.target === el.profileTaxRate) {
      if (state.profileTaxInvalid) {
        setFieldError(
          el.profileTaxRateError,
          'Tarif PPN harus antara 0 dan 100.',
          el.profileTaxRate
        );
      } else {
        setFieldError(el.profileTaxRateError, '', el.profileTaxRate);
      }
    }

    var hasAccount = state.profile.accounts.some(function (account) {
      return (
        String(account.bank || '').trim() && String(account.number || '').trim()
      );
    });
    if (hasAccount) setFieldError(el.accountsError, '', null);
  }

  function onProfileFocusOut(event) {
    var target = event.target;
    if (!target || typeof target.matches !== 'function') return;

    if (target === el.profileTaxRate) {
      readProfileForm();
      target.value = formatDecimal(state.settings.taxRate);
      setFieldError(el.profileTaxRateError, '', target);
      scheduleProfileSave();
    }

    if (target === el.profileNumberFormat) {
      readProfileForm();
      target.value = state.settings.numberFormat;
      updateNumberFormatPreview();
      scheduleProfileSave();
    }
  }

  function onProfileSubmit(event) {
    event.preventDefault();
    readProfileForm();
    var saved = flushProfileSave(false);
    updateNumberFormatPreview();
    updateNumberHint();
    updateProfileReminder();
    renderPreview();

    if (!saved) {
      toast('Gagal menyimpan profil. Periksa penyimpanan browser.', 'error');
      return;
    }

    if (!state.profile.business.name.trim()) {
      setFieldError(
        el.profileBusinessNameError,
        'Nama usaha wajib diisi.',
        el.profileBusinessName
      );
      el.profileBusinessName.focus();
      toast('Nama usaha wajib diisi.', 'error');
      return;
    }

    setFieldError(el.profileBusinessNameError, '', el.profileBusinessName);
    toast('Profil tersimpan.');
  }

  function onHistoryClick(event) {
    if (!event.target || typeof event.target.closest !== 'function') return;
    var button = event.target.closest('button[data-action]');
    if (!button || !el.historyList.contains(button)) return;

    var id = button.dataset.id;
    var action = button.dataset.action;
    if (action === 'open') openInvoice(id);
    else if (action === 'duplicate') duplicateInvoice(id);
    else if (action === 'delete') deleteInvoice(id);
  }

  function addItem() {
    readForm();
    state.current.items.push({
      desc: '',
      qty: 1,
      unit: '',
      price: 0,
      discount: 0
    });
    state.pendingFocus = {
      index: state.current.items.length - 1,
      field: 'desc'
    };
    renderItems();
    updateLineTotals();
    refreshInlineValidation();
    renderPreview();
    scheduleSave();
  }

  function addAccount() {
    readProfileForm();
    state.profile.accounts.push({ bank: '', number: '', holder: '' });
    renderAccounts();
    var rows = qsa('.account-row', el.accountsList);
    var last = rows[rows.length - 1];
    var input = last ? qs('[data-field="bank"]', last) : null;
    if (input) input.focus();
  }

  function regenerateNumber() {
    readForm();
    state.current.number = generateNumber(
      core.isValidISODate(state.current.issueDate)
        ? state.current.issueDate
        : core.todayISO(),
      true
    );
    el.number.value = state.current.number;
    setFieldError(el.numberError, '', el.number);
    updateNumberHint();
    renderPreview();
    scheduleSave();
    toast('Nomor invoice diperbarui.');
  }

  function applyQuickDue(chip) {
    readForm();
    var days = Number(chip.dataset.due);
    var base = core.isValidISODate(state.current.issueDate)
      ? state.current.issueDate
      : core.todayISO();
    state.current.dueDate = core.addDaysISO(base, days);
    el.dueDate.value = state.current.dueDate;
    setFieldError(el.dueError, '', el.dueDate);
    updateQuickDates();
    renderPreview();
    scheduleSave();
  }

  function removeLogo() {
    state.profile.business.logo = '';
    renderLogo();
    flushProfileSave(false);
    renderPreview();
    toast('Logo dihapus.');
  }

  function bindEvents() {
    qsa('[data-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        setView(button.dataset.view);
      });
    });

    el.brandHome.addEventListener('click', function () {
      setView('editor');
    });

    el.btnNew.addEventListener('click', newInvoice);
    if (el.btnNewInline) el.btnNewInline.addEventListener('click', newInvoice);
    el.btnHistoryNew.addEventListener('click', newInvoice);
    el.btnEmptyNew.addEventListener('click', newInvoice);
    el.btnPrint.addEventListener('click', requestPrint);
    el.btnPrintPreview.addEventListener('click', requestPrint);

    el.btnTips.addEventListener('click', function () {
      if (el.tipsDialog && typeof el.tipsDialog.showModal === 'function') {
        el.tipsDialog.showModal();
      }
    });

    el.btnDownloadInvoice.addEventListener('click', exportInvoice);
    el.btnExportAll.addEventListener('click', exportAll);
    el.btnExportNow.addEventListener('click', exportAll);
    el.btnImportInvoice.addEventListener('click', function () {
      triggerImport('invoice');
    });
    el.btnImportAll.addEventListener('click', function () {
      triggerImport('all');
    });
    el.importFile.addEventListener('change', onImportFileChange);

    el.btnDismissBanner.addEventListener('click', function () {
      state.bannerDismissed = true;
      el.storageBanner.hidden = true;
    });

    el.btnGoProfile.addEventListener('click', function () {
      setView('profile');
      el.profileBusinessName.focus();
    });

    el.tabForm.addEventListener('click', function () {
      setMobileTab('form');
    });
    el.tabPreview.addEventListener('click', function () {
      setMobileTab('preview');
    });
    el.mobileTabs.forEach(function (button) {
      button.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        var next = button.id === 'tab-form' ? el.tabPreview : el.tabForm;
        setMobileTab(next.id === 'tab-preview' ? 'preview' : 'form');
        next.focus();
      });
    });

    el.form.addEventListener('input', onFormInput);
    el.form.addEventListener('focusin', onFormFocusIn);
    el.form.addEventListener('focusout', onFormFocusOut);
    el.form.addEventListener('submit', function (event) {
      event.preventDefault();
    });

    el.itemsList.addEventListener('click', onItemListClick);
    el.btnAddItem.addEventListener('click', addItem);
    el.btnRegenerateNumber.addEventListener('click', regenerateNumber);

    el.btnToggleColumns.addEventListener('click', function () {
      var expanded = el.btnToggleColumns.getAttribute('aria-expanded') === 'true';
      var next = !expanded;
      el.btnToggleColumns.setAttribute('aria-expanded', next ? 'true' : 'false');
      el.columnSettings.hidden = !next;
      if (next) {
        var first = qs('input', el.columnSettings);
        if (first) first.focus();
      }
    });

    el.quickDateChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        applyQuickDue(chip);
      });
    });

    el.historySearch.addEventListener('input', renderHistory);
    el.historyStatus.addEventListener('change', renderHistory);
    el.historyList.addEventListener('click', onHistoryClick);
    el.btnResetFilters.addEventListener('click', function () {
      el.historySearch.value = '';
      el.historyStatus.value = 'all';
      renderHistory();
      el.historySearch.focus();
    });

    el.profileForm.addEventListener('input', onProfileInput);
    el.profileForm.addEventListener('focusout', onProfileFocusOut);
    el.profileForm.addEventListener('submit', onProfileSubmit);
    el.accountsList.addEventListener('click', onAccountListClick);
    el.btnAddAccount.addEventListener('click', addAccount);

    el.btnUploadLogo.addEventListener('click', function () {
      el.logoFile.click();
    });
    el.btnRemoveLogo.addEventListener('click', removeLogo);
    el.logoFile.addEventListener('change', function () {
      var file = el.logoFile.files && el.logoFile.files[0];
      handleLogoFile(file);
      el.logoFile.value = '';
    });

    el.invLogo.addEventListener('error', function () {
      el.invLogo.hidden = true;
    });
    el.invLogo.addEventListener('load', scheduleResize);

    window.addEventListener('resize', scheduleResize);
    window.addEventListener('pagehide', function () {
      flushSave();
      flushProfileSave(false);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        flushSave();
        flushProfileSave(false);
      }
    });
  }

  /* Boot ------------------------------------------------------------------ */

  function init() {
    cacheElements();
    loadState();
    bindEvents();

    renderForm();
    renderPreview();
    renderProfile();
    renderHistory();
    setView('editor', true);
    clearEditorErrors();
    clearProfileErrors();

    setSaveState('saved', 'Tersimpan');
    setProfileSaveState('saved', 'Tersimpan');
    updateStorageBanner();
    updateStorageUsage();
    persistDraft();

    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver(function () {
        scheduleResize();
      });
      state.resizeObserver.observe(el.invoicePaper);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
