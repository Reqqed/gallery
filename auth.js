'use strict';
(() => {
  const form = document.querySelector('#registerForm, #loginForm');
  const isRegistration = form.id === 'registerForm';
  const status = document.getElementById('formStatus');
  const profileKey = 'smallGallery.profile.v1';
  const ids = isRegistration ? ['fullname', 'email', 'birthday', 'password', 'confirm', 'interest', 'consent'] : ['email', 'password'];
  const get = id => document.getElementById(id);

  function calculateAge(value) {
    const birth = new Date(value + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function validateField(id) {
    const value = get(id).value.trim();
    let error = '';
    if (id === 'consent') {
      if (!get(id).checked) error = 'Подтвердите согласие.';
    } else if (!value) error = 'Заполните это поле.';
    else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Пример email: name@example.com.';
    else if (id === 'birthday') {
      const age = calculateAge(value);
      if (!Number.isFinite(age) || age < 16 || age > 120) error = 'Допустимый возраст: от 16 до 120 лет.';
    } else if (id === 'password' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(get(id).value)) error = 'Нужно 8+ символов, A–Z, a–z и цифра.';
    else if (id === 'confirm' && get(id).value !== get('password').value) error = 'Пароли не совпадают.';
    get(id + '-error').textContent = error;
    get(id).setAttribute('aria-invalid', String(Boolean(error)));
    return !error;
  }

  function validateForm() {
    let valid = true;
    for (const id of ids) {
      if (!validateField(id)) valid = false;
    }
    return valid;
  }

  function register() {
    // Deliberately save no password or confirmation, even in a simulated project.
    const profile = { fullname: get('fullname').value.trim(), email: get('email').value.trim().toLowerCase(), birthday: get('birthday').value, age: calculateAge(get('birthday').value), interest: get('interest').value, consent: get('consent').checked };
    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      form.reset();
      status.textContent = 'Регистрация успешна! Перейдите на страницу входа. Пароль не сохранён.';
    } catch (error) {
      status.textContent = 'Не удалось сохранить профиль. Проверьте разрешение браузера на хранение данных.';
    }
  }

  function login() {
    try {
      const profile = JSON.parse(localStorage.getItem(profileKey) || 'null');
      if (profile && typeof profile.email === 'string' && profile.email === get('email').value.trim().toLowerCase()) {
        status.textContent = 'Учебный вход выполнен! Откройте «Галерея» в меню.';
        get('password').value = '';
      } else status.textContent = 'Вход не выполнен: зарегистрируйте этот email в данном браузере.';
    } catch (error) {
      status.textContent = 'Профиль недоступен или повреждён. Пройдите регистрацию заново.';
    }
  }

  ids.forEach(id => {
    get(id).addEventListener('input', () => {
      validateField(id);
      status.textContent = '';
      if (isRegistration && id === 'password' && get('confirm').value) validateField('confirm');
    });
    get(id).addEventListener('change', () => validateField(id));
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    status.textContent = '';
    if (!validateForm()) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    if (isRegistration) register();
    else login();
  });
})();
