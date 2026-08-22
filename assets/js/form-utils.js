/* Shared helpers for the enquiry and clinician application forms. */
(function (global) {
  function isValidPhone(value, iso) {
    var v = (value || '').trim();
    if (!v) return false;
    if (global.libphonenumber) {
      try {
        if (v.charAt(0) === '+') return libphonenumber.isValidPhoneNumber(v);
        if (!iso) return false;
        return libphonenumber.isValidPhoneNumber(v, iso);
      } catch (e) {
        return false;
      }
    }
    // Fallback if the validation library failed to load: loose E.164 shape check.
    var d = v.replace(/[\s\-().]/g, '');
    return d.charAt(0) === '+' && /^\+[1-9]\d{7,14}$/.test(d);
  }

  /* Lets someone type a calling code (e.g. "44") to jump straight to that
     country, even though the visible option text leads with a flag emoji
     the browser's native type-ahead can't match against. */
  function attachCountryTypeahead(select) {
    var buffer = '';
    var timer = null;
    select.addEventListener('keydown', function (e) {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        buffer += e.key;
        clearTimeout(timer);
        timer = setTimeout(function () { buffer = ''; }, 700);
        var options = Array.prototype.slice.call(select.options);
        var match = options.find(function (o) { return o.dataset.cc && o.dataset.cc.indexOf(buffer) === 0; });
        if (match) {
          select.value = match.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (e.key === 'Backspace') {
        buffer = buffer.slice(0, -1);
      } else if (e.key.length === 1) {
        buffer = '';
      }
    });
  }

  function setFieldError(el, msgId, message) {
    el.classList.add('err');
    el.setAttribute('aria-invalid', 'true');
    var m = document.getElementById(msgId);
    if (m) { m.textContent = message; m.style.display = 'flex'; }
  }

  function clearFieldError(el, msgId) {
    el.classList.remove('err');
    el.removeAttribute('aria-invalid');
    var m = document.getElementById(msgId);
    if (m) { m.textContent = ''; m.style.display = 'none'; }
  }

  /* Clears a field's error state on the next input/change so the red
     highlight does not linger after the person has fixed it. */
  function clearOnEdit(el, msgId) {
    ['input', 'change'].forEach(function (evt) {
      el.addEventListener(evt, function () { clearFieldError(el, msgId); });
    });
  }

  global.CBForm = {
    isValidPhone: isValidPhone,
    attachCountryTypeahead: attachCountryTypeahead,
    setFieldError: setFieldError,
    clearFieldError: clearFieldError,
    clearOnEdit: clearOnEdit
  };
})(window);
