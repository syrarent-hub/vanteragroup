
  // mobile menu
  var mb=document.getElementById('menuBtn');
  mb.addEventListener('click',function(){
    var open=document.body.classList.toggle('mobile-open');
    mb.setAttribute('aria-expanded',open);
  });
  document.querySelectorAll('.nav-links a').forEach(function(a){
    a.addEventListener('click',function(){document.body.classList.remove('mobile-open');mb.setAttribute('aria-expanded',false);});
  });

  // fleet filters
  document.querySelectorAll('.filt').forEach(function(b){
    b.addEventListener('click',function(){
      var f=b.getAttribute('data-f');
      document.querySelectorAll('.filt').forEach(function(x){x.setAttribute('aria-pressed',x===b);});
      document.querySelectorAll('.car').forEach(function(c){
        var cats=(c.getAttribute('data-cat')||'').split(' ');
        c.classList.toggle('hide', f!=='all' && cats.indexOf(f)===-1);
      });
    });
  });

  // faq accordion
  document.querySelectorAll('.q button').forEach(function(btn){
    btn.addEventListener('click',function(){
      var q=btn.closest('.q'), a=q.querySelector('.a');
      var open=q.getAttribute('aria-expanded')==='true';
      q.setAttribute('aria-expanded',!open);
      a.style.maxHeight=open?null:a.scrollHeight+'px';
    });
  });

  // lead form -> Netlify Forms (ο παραλήπτης ρυθμίζεται στο Netlify, ΟΧΙ στον κώδικα)
  document.getElementById('waitForm').addEventListener('submit', function(e){
    e.preventDefault();
    var f = e.target, msg = document.getElementById('okMsg');
    var em = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var startValue = document.getElementById('startDate').value;
    var endValue = document.getElementById('endDate').value;
    var isEnglish = document.documentElement.lang === 'en';
    if(!em || em.indexOf('@') < 1){ msg.textContent = isEnglish ? 'Enter a valid email address.' : 'Βάλε ένα έγκυρο email.'; return; }
    if(phone.replace(/\D/g,'').length < 7){ msg.textContent = isEnglish ? 'Enter a valid phone number.' : 'Βάλε ένα έγκυρο τηλέφωνο.'; return; }
    if(!startValue || !endValue){ msg.textContent = isEnglish ? 'Choose both rental dates.' : 'Επίλεξε και τις δύο ημερομηνίες ενοικίασης.'; return; }
    var start = new Date(startValue + 'T00:00:00');
    var end = new Date(endValue + 'T00:00:00');
    var minimumEnd = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
    if(minimumEnd.getDate() !== start.getDate()) minimumEnd = new Date(start.getFullYear(), start.getMonth() + 2, 0);
    if(end < minimumEnd){ msg.textContent = isEnglish ? 'The rental request must be for at least one month.' : 'Το αίτημα ενοικίασης πρέπει να είναι για τουλάχιστον έναν μήνα.'; return; }
    msg.textContent = isEnglish ? 'Sending…' : 'Στέλνεται…';
    fetch('/', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams(new FormData(f)).toString()
    }).then(function(){
      msg.textContent = isEnglish ? 'Thank you — we will send you a quote.' : 'Ευχαριστούμε — θα σου στείλουμε προσφορά.';
      f.reset();
    }).catch(function(){
      msg.textContent = isEnglish ? 'Something went wrong. Call us or send a WhatsApp message.' : 'Κάτι πήγε στραβά. Πάρε μας τηλέφωνο ή στείλε WhatsApp.';
    });
  });

  // rental date calendar: enforce a minimum duration of one calendar month
  (function(){
    var startInput = document.getElementById('startDate');
    var endInput = document.getElementById('endDate');
    if(!startInput || !endInput) return;
    var today = new Date();
    var todayValue = today.toISOString().slice(0,10);
    startInput.min = todayValue;
    startInput.addEventListener('change', function(){
      if(!startInput.value) return;
      var start = new Date(startInput.value + 'T00:00:00');
      var minEnd = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
      if(minEnd.getDate() !== start.getDate()) minEnd = new Date(start.getFullYear(), start.getMonth() + 2, 0);
      endInput.min = minEnd.toISOString().slice(0,10);
      if(endInput.value && new Date(endInput.value + 'T00:00:00') < minEnd) endInput.value = '';
    });
  })();

  // scroll reveal
  if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});
    },{threshold:.12});
    document.querySelectorAll('.reveal, .sec-head, .step, .car, .value, .inc-item, .biz-card, .cmp-scroll, .ladder, .brand-card')
      .forEach(function(el){el.classList.add('reveal');io.observe(el);});
  }  // car detail modal — click a car to see more + submit from there
  (function(){
    var overlay = document.getElementById('carModalOverlay');
    var form = document.getElementById('waitForm');
    var formOriginalParent = form.parentNode;
    var formOriginalNextSibling = form.nextElementSibling; // .cta-direct, used as restore anchor
    var carSelect = document.getElementById('car');

    function openModalFor(car){
      var img = car.querySelector('.car-photo');
      var badge = car.querySelector('.car-badge');
      var name = car.querySelector('h3').textContent.trim();
      var price = car.querySelector('.car-price-tag .amt').textContent.trim();
      var tiers = car.querySelector('.tiers').textContent.trim();
      var specs = car.querySelectorAll('.specs li');
      var desc = car.getAttribute('data-desc') || '';

      document.getElementById('carModalImg').src = img.src;
      document.getElementById('carModalImg').alt = img.alt;
      document.getElementById('carModalBadge').textContent = badge ? badge.textContent.trim() : '';
      document.getElementById('carModalName').textContent = name;
      document.getElementById('carModalPrice').textContent = price;
      document.getElementById('carModalDesc').textContent = desc;
      document.getElementById('carModalTiers').textContent = tiers;

      var specsList = document.getElementById('carModalSpecs');
      specsList.innerHTML = '';
      specs.forEach(function(li){
        var clone = li.cloneNode(true);
        specsList.appendChild(clone);
      });

      // preselect this car in the form's dropdown
      for (var i = 0; i < carSelect.options.length; i++){
        if (carSelect.options[i].text === name){ carSelect.selectedIndex = i; break; }
      }

      // move the real form into the modal so submission works from here too
      document.getElementById('carModalFormSlot').appendChild(form);

      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(){
      // move the form back to its original spot in the page
      formOriginalParent.insertBefore(form, formOriginalNextSibling);
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.car').forEach(function(car){
      car.addEventListener('click', function(e){
        e.preventDefault(); // stop the inner "Ζήτα προσφορά" anchor from jumping to #waitlist
        openModalFor(car);
      });
    });

    document.getElementById('carModalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  })();
