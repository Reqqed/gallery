const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const permanentPaintings = [
    {
      title: "Мона Лиза",
      meta: "Леонардо да Винчи, ок. 1503–1519",
      src: "images/art-1.jpg",
      desc: "Погрудный портрет молодой женщины на фоне туманного горного пейзажа. Она сидит вполоборота, руки сложены, а лицо освещено мягким, рассеянным светом (техника сфумато), из-за чего её едва заметная улыбка кажется то тёплой, то загадочной в зависимости от угла взгляда. Один из самых знаменитых портретов в истории живописи, хранится в Луврe."
    },
    {
      title: "Звёздная ночь",
      meta: "Винсент ван Гог, 1889",
      src: "images/art-2.jpg",
      desc: "Ночной пейзаж с бурлящим тёмно-синим небом, по которому крупными светящимися завитками рассыпаны звёзды и растущий полумесяц. Слева на переднем плане возвышается тёмный извивающийся кипарис, а внизу спит небольшая деревня с шпилем церкви. Картина написана крупными, закрученными мазками и передаёт скорее внутреннее переживание художника, чем реальный вид из окна."
    },
    {
      title: "Большая волна в Канагаве",
      meta: "Кацусика Хокусай, ок. 1831",
      src: "images/art-3.jpg",
      desc: "Японская ксилография: гигантская вспенившаяся волна с изогнутыми, похожими на когти брызгами нависает над тремя узкими рыбацкими лодками. Далеко на заднем плане, в промежутке между волнами, видна маленькая заснеженная гора Фудзи. Работа выполнена в характерной для укиё-э плоской манере с насыщенным синим цветом (берлинская лазурь)."
    },
    {
      title: "Девушка с жемчужной серёжкой",
      meta: "Ян Вермеер, ок. 1665",
      src: "images/art-4.jpg",
      desc: "Портрет девушки на тёмном однотонном фоне, повернувшейся через плечо и смотрящей прямо на зрителя приоткрытыми губами. На ней синий с золотистым тюрбан и крупная жемчужная серьга, которая ярко бликует на фоне затемнённой щеки. Мягкий свет и почти фотографическая непосредственность взгляда сделали картину одной из самых узнаваемых в мире, за что её иногда называют «северной Моной Лизой»."
    },
    {
      title: "Крик",
      meta: "Эдвард Мунк, 1893",
      src: "images/art-5.jpg",
      desc: "На переднем плане изображена искажённая ужасом фигура с вытянутым, похожим на череп лицом, зажавшая голову ладонями с открытым в крике ртом. За её спиной — мост с двумя удаляющимися силуэтами и небо, написанное волнистыми полосами кроваво-оранжевого и жёлтого цветов. Картина считается символом тревоги и экзистенциального отчаяния в искусстве."
    },
    {
      title: "Рождение Венеры",
      meta: "Сандро Боттичелли, ок. 1485",
      src: "images/art-6.jpg",
      desc: "В центре композиции обнажённая богиня Венера стоит на раскрытой морской раковине, придерживая длинные золотистые волосы. Слева бог ветра Зефир с нимфой обдувает её лёгким ветром, гоня раковину к берегу, а справа женская фигура спешит укрыть Венеру цветочным плащом. Картина воплощает ренессансный идеал женской красоты и гармонии."
    }
  ];

  const permanentGrid = document.getElementById('permanentGrid');
  const userGrid = document.getElementById('userGrid');
  const emptyNote = document.getElementById('emptyNote');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  let userWorks = [];

  function renderPermanent(){
    permanentGrid.innerHTML = permanentPaintings.map(p => `
      <div class="frame" tabindex="0" role="group" aria-label="${p.title}. Нажмите F для описания крупным шрифтом.">
        <div class="art"><img src="${p.src}" alt="${p.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;color:#8a8578;font-size:0.85rem;text-align:center;padding:12px;\'>Изображение недоступно</div>'"></div>
        <div class="caption">
          <div class="title">${p.title}</div>
          <div class="meta">${p.meta}</div>
        </div>
      </div>
    `).join('');

    permanentGrid.querySelectorAll('.frame').forEach((frame, i) => {
      const painting = permanentPaintings[i];
      const setActive = () => setActiveArt(frame, {
        title: painting.title,
        meta: painting.meta,
        desc: painting.desc
      });
      frame.addEventListener('mouseenter', setActive);
      frame.addEventListener('focusin', setActive);
      frame.addEventListener('dblclick', () => {setActive();openA11yPanel();});
      frame.addEventListener('keydown', e => {if(e.key === 'Enter' && e.target === frame){setActive();openA11yPanel();}});
    });
  }

  function renderUser(){
    emptyNote.style.display = userWorks.length ? 'none' : 'block';
    userGrid.innerHTML = userWorks.map((w, i) => `
      <div class="frame uploaded" tabindex="0" role="group" aria-label="${escapeHTML(w.name)}. Ваша работа. Нажмите F для описания крупным шрифтом.">
        <button class="remove-btn" data-index="${i}" title="Убрать со стены">✕</button>
        <div class="art"><img src="${w.src}" alt="${escapeHTML(w.name)}"></div>
        <div class="caption">
          <div class="title">${escapeHTML(w.name)}</div>
          <div class="meta">Ваша работа</div>
        </div>
        <div class="desc-field">
          <textarea class="desc-input" data-index="${i}" placeholder="Добавьте описание для слабовидящих...">${escapeHTML(w.desc || '')}</textarea>
        </div>
      </div>
    `).join('');

    userGrid.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        userWorks.splice(idx, 1);
        renderUser();
      });
    });

    userGrid.querySelectorAll('.desc-input').forEach(field => {
      field.addEventListener('input', () => {
        const idx = Number(field.dataset.index);
        userWorks[idx].desc = field.value;
      });
      // Typing shouldn't trigger the F-key shortcut
      field.addEventListener('keydown', e => e.stopPropagation());
    });

    userGrid.querySelectorAll('.frame').forEach((frame, i) => {
      const work = userWorks[i];
      const setActive = () => setActiveArt(frame, {
        title: work.name,
        meta: "Ваша работа",
        desc: work.desc
      });
      frame.addEventListener('mouseenter', setActive);
      frame.addEventListener('focusin', setActive);
      frame.addEventListener('dblclick', () => {setActive();openA11yPanel();});
      frame.addEventListener('keydown', e => {if(e.key === 'Enter' && e.target === frame){setActive();openA11yPanel();}});
    });
  }

  function handleFiles(files){
    [...files].forEach(file => {
      if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024){ alert('Выберите JPG, PNG или WebP размером до 10 МБ.'); return; }
      const reader = new FileReader();
      reader.onload = e => {
        userWorks.push({
          name: file.name.replace(/\.[^/.]+$/, ''),
          src: e.target.result
        });
        renderUser();

      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Accessibility: large-print description on "F" ---------- */
  let activeArt = null;
  let a11yFontScale = 1;

  function setActiveArt(frameEl, info){
    document.querySelectorAll('.frame.active-art').forEach(f => f.classList.remove('active-art'));
    frameEl.classList.add('active-art');
    activeArt = info;
  }

  const a11yOverlay = document.createElement('div');
  a11yOverlay.className = 'a11y-overlay';
  a11yOverlay.inert = true;
  let previousFocus = null;
  a11yOverlay.setAttribute('role', 'dialog');
  a11yOverlay.setAttribute('aria-modal', 'true');
  a11yOverlay.setAttribute('aria-label', 'Описание картины крупным шрифтом');
  a11yOverlay.innerHTML = `
    <div class="a11y-card">
      <button class="a11y-close" aria-label="Закрыть">✕</button>
      <div class="a11y-controls">
        <button class="a11y-smaller" aria-label="Уменьшить текст">A−</button>
        <button class="a11y-bigger" aria-label="Увеличить текст">A+</button>
      </div>
      <div id="a11yBody"></div>
    </div>
  `;
  document.body.appendChild(a11yOverlay);

  const a11yBody = a11yOverlay.querySelector('#a11yBody');
  const a11yCard = a11yOverlay.querySelector('.a11y-card');

  function renderA11yBody(){
    if(!activeArt){
      a11yBody.innerHTML = `<p class="a11y-empty">Наведите курсор (или перейдите клавишей Tab) на картину и нажмите F ещё раз.</p>`;
      return;
    }
    a11yBody.innerHTML = `
      <h2 class="a11y-title">${escapeHTML(activeArt.title)}</h2>
      <p class="a11y-meta">${escapeHTML(activeArt.meta)}</p>
      <p class="a11y-desc">${escapeHTML(activeArt.desc || 'Описание пока не добавлено.')}</p>
    `;
    a11yCard.querySelector('.a11y-desc').style.fontSize = (1.6 * a11yFontScale) + 'rem';
    a11yCard.querySelector('.a11y-title').style.fontSize = (2.4 * a11yFontScale) + 'rem';
  }

  function openA11yPanel(){
    previousFocus = document.activeElement;
    a11yOverlay.inert = false;
    renderA11yBody();
    a11yOverlay.classList.add('open');
    a11yOverlay.querySelector('.a11y-close').focus();
  }

  function closeA11yPanel(){
    a11yOverlay.classList.remove('open');
    a11yOverlay.inert = true;
    previousFocus?.focus();
  }

  a11yOverlay.querySelector('.a11y-close').addEventListener('click', closeA11yPanel);
  a11yOverlay.addEventListener('click', e => { if(e.target === a11yOverlay) closeA11yPanel(); });
  a11yOverlay.querySelector('.a11y-bigger').addEventListener('click', () => {
    a11yFontScale = Math.min(1.8, a11yFontScale + 0.15);
    renderA11yBody();
  });
  a11yOverlay.querySelector('.a11y-smaller').addEventListener('click', () => {
    a11yFontScale = Math.max(0.8, a11yFontScale - 0.15);
    renderA11yBody();
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Tab' && a11yOverlay.classList.contains('open')){
      const buttons = [...a11yOverlay.querySelectorAll('button')];
      if(e.shiftKey && document.activeElement === buttons[0]){e.preventDefault();buttons.at(-1).focus();}
      else if(!e.shiftKey && document.activeElement === buttons.at(-1)){e.preventDefault();buttons[0].focus();}
    }
    const tag = (e.target && e.target.tagName) || '';
    if(tag === 'INPUT' || tag === 'TEXTAREA') return;

    if(e.key === 'Escape' && a11yOverlay.classList.contains('open')){
      closeA11yPanel();
      return;
    }
    if((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey){
      e.preventDefault();
      openA11yPanel();
    }
  });

  dropzone.addEventListener('click', e => { if(e.target !== fileInput) fileInput.click(); });
  dropzone.addEventListener('keydown', e => {if(e.key === 'Enter' || e.key === ' '){e.preventDefault();fileInput.click();}});
  fileInput.addEventListener('change', e => handleFiles(e.target.files));

  ['dragenter','dragover'].forEach(evt =>
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.add('drag');
    })
  );
  ['dragleave','drop'].forEach(evt =>
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.remove('drag');
    })
  );
  dropzone.addEventListener('drop', e => {
    handleFiles(e.dataTransfer.files);
  });

  renderPermanent();
  renderUser();

