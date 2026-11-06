'use strict';
(() => {
  const key = 'smallGallery.collection.v1';
  const categories = ['Живопись', 'Графика', 'Фотография'];
  const get = id => document.getElementById(id);
  let items = [];
  let editingId = null;

  function validateItem(item) {
    if (typeof item.title !== 'string' || !item.title.trim()) return 'Введите название.';
    if (typeof item.artist !== 'string' || !item.artist.trim()) return 'Введите автора.';
    if (!Number.isInteger(item.year) || item.year < 1 || item.year > new Date().getFullYear()) return 'Введите целый год от 1 до текущего года.';
    if (!categories.includes(item.category)) return 'Выберите категорию из списка.';
    if (typeof item.available !== 'boolean') return 'Некорректный статус доступности.';
    return '';
  }

  function loadItems() {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) throw new Error('Invalid collection');
      const seen = new Set();
      for (const item of saved) {
        if (!item || typeof item.id !== 'string' || !item.id || seen.has(item.id) || validateItem(item)) throw new Error('Invalid item');
        seen.add(item.id);
      }
      items = saved;
    } catch (error) {
      items = [];
      get('storageStatus').textContent = 'Сохранённая коллекция недоступна или повреждена. Показан пустой список. Следующее успешное изменение сохранит новую коллекцию.';
    }
  }

  function saveItems(nextItems) {
    try {
      localStorage.setItem(key, JSON.stringify(nextItems));
      items = nextItems;
      get('storageStatus').textContent = 'Изменения сохранены.';
      return true;
    } catch (error) {
      get('storageStatus').textContent = 'Сохранение не удалось. Изменения не применены. Проверьте свободное место и разрешения браузера.';
      return false;
    }
  }

  function resetForm() {
    editingId = null;
    get('itemForm').reset();
    get('formHeading').textContent = 'Добавить работу';
    get('saveButton').textContent = 'Добавить';
    get('cancelEdit').hidden = true;
    get('itemError').textContent = '';
  }

  function addItem(item) {
    let id;
    do { id = 'work-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10); }
    while (items.some(existing => existing.id === id));
    return saveItems([...items, { id, ...item }]);
  }

  function editItem(id) {
    const item = items.find(entry => entry.id === id);
    if (!item) return;
    editingId = id;
    for (const field of ['title', 'artist', 'year', 'category']) get(field).value = item[field];
    get('available').checked = item.available;
    get('formHeading').textContent = 'Редактировать работу';
    get('saveButton').textContent = 'Сохранить';
    get('cancelEdit').hidden = false;
    get('itemError').textContent = '';
    get('title').focus();
  }

  function updateItem(id, item) {
    return saveItems(items.map(entry => entry.id === id ? { id, ...item } : entry));
  }

  function deleteItem(id) {
    if (!window.confirm('Удалить эту работу из коллекции?')) return;
    if (saveItems(items.filter(item => item.id !== id))) {
      if (editingId === id) resetForm();
      renderItems();
    }
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function renderItems() {
    const query = get('search').value.trim().toLowerCase();
    const category = get('filter').value;
    const visible = items.filter(item => (item.title + ' ' + item.artist).toLowerCase().includes(query) && (!category || item.category === category));
    get('items').replaceChildren();
    get('count').textContent = `Показано: ${visible.length} из ${items.length}`;
    if (!visible.length) get('items').append(element('p', items.length ? 'Ничего не найдено. Измените поиск или фильтр.' : 'Коллекция пуста. Добавьте первую работу.'));
    for (const item of visible) {
      const card = element('article', '', 'collection-card');
      card.append(element('h2', item.title), element('p', `${item.artist} · ${item.year} · ${item.category}`), element('p', item.available ? 'Доступна для выставки' : 'Недоступна для выставки', item.available ? 'badge' : 'badge unavailable'));
      const actions = element('div', '');
      const edit = element('button', 'Редактировать');
      const remove = element('button', 'Удалить');
      edit.type = remove.type = 'button';
      edit.setAttribute('aria-label', `Редактировать: ${item.title}`);
      remove.setAttribute('aria-label', `Удалить: ${item.title}`);
      edit.addEventListener('click', () => editItem(item.id));
      remove.addEventListener('click', () => deleteItem(item.id));
      actions.append(edit, remove);
      card.append(actions);
      get('items').append(card);
    }
  }

  get('itemForm').addEventListener('submit', event => {
    event.preventDefault();
    const item = { title: get('title').value.trim(), artist: get('artist').value.trim(), year: Number(get('year').value), category: get('category').value, available: get('available').checked };
    const error = validateItem(item);
    get('itemError').textContent = error;
    if (error) return;
    const success = editingId === null ? addItem(item) : updateItem(editingId, item);
    if (success) { resetForm(); renderItems(); }
  });
  get('cancelEdit').addEventListener('click', resetForm);
  get('search').addEventListener('input', renderItems);
  get('filter').addEventListener('change', renderItems);
  loadItems();
  renderItems();
})();
