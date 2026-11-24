document.documentElement.classList.add('js');

const products = [
  {
    id: 'tasse-bonjour',
    name: 'Tasse Bonjour',
    category: 'cuisine',
    categoryLabel: 'Cuisine & café',
    price: 18.9,
    image: 'assets/tasse-bonjour.jpg',
    alt: 'Tasse en céramique corail sur une soucoupe jaune',
    badge: 'Coup de cœur',
    rating: 4.9,
    reviews: 86,
    description: 'Une céramique douce et colorée pour les matins qu’on aime.'
  },
  {
    id: 'carnet-jolies-idees',
    name: 'Carnet Mes jolies idées',
    category: 'papeterie',
    categoryLabel: 'Papeterie créative',
    price: 12.5,
    oldPrice: 15,
    image: 'assets/carnet-jolies-idees.jpg',
    alt: 'Carnet jaune à reliure corail avec un stylo vert',
    badge: 'Prix doux',
    rating: 4.8,
    reviews: 54,
    description: '160 pages pour noter, rêver et laisser parler sa créativité.'
  },
  {
    id: 'bougie-figue-douce',
    name: 'Bougie Figue douce',
    category: 'maison',
    categoryLabel: 'Maison & déco',
    price: 22,
    image: 'assets/bougie-figue-douce.jpg',
    alt: 'Bougie dans un pot vert avec couvercle en bois',
    badge: 'Nouveau',
    rating: 5,
    reviews: 32,
    description: 'Un parfum fruité et une lueur douce pour ralentir un peu.'
  },
  {
    id: 'tote-au-marche',
    name: 'Tote bag Au marché',
    category: 'accessoires',
    categoryLabel: 'Accessoires',
    price: 14.9,
    image: 'assets/tote-au-marche.jpg',
    alt: 'Sac en toile naturelle imprimé avec des agrumes colorés',
    badge: 'Pratique & joli',
    rating: 4.9,
    reviews: 71,
    description: 'Solide, spacieux et plein de soleil pour tous vos petits trajets.'
  },
  {
    id: 'jeu-petits-bonheurs',
    name: 'Jeu Petits Bonheurs',
    category: 'loisirs',
    categoryLabel: 'Jeux & loisirs',
    price: 29.9,
    image: 'assets/jeu-petits-bonheurs.jpg',
    alt: 'Boîte de jeu de société corail avec cartes et pions en bois',
    badge: 'À partager',
    rating: 4.9,
    reviews: 43,
    description: 'Un jeu familial malin pour des après-midis complices et riants.'
  },
  {
    id: 'coffret-decouverte',
    name: 'Coffret Découverte',
    category: 'maison',
    categoryLabel: 'Maison & déco',
    price: 39.9,
    image: 'assets/hero-boutique.jpg',
    alt: 'Coffret découverte avec tasse, carnet, bougie et accessoires',
    badge: 'Prêt à offrir',
    rating: 5,
    reviews: 28,
    description: 'Une jolie sélection de cinq essentiels, réunie dans un coffret.'
  }
];

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const productGrid = document.getElementById('product-grid');
const emptyState = document.getElementById('empty-state');
const resultsSummary = document.getElementById('results-summary');
const searchInput = document.getElementById('product-search');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cartDialog = document.getElementById('cart-dialog');
const checkoutDialog = document.getElementById('checkout-dialog');
const cartItems = document.getElementById('cart-items');
const cartFooter = document.getElementById('cart-footer');
const cartCount = document.querySelector('[data-cart-count]');
let activeFilter = 'tous';
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

const storedCart = readStorage('petit-bonheur-cart', []);
let cart = Array.isArray(storedCart)
  ? storedCart.filter(item => products.some(product => product.id === item.id)).map(item => ({ id: item.id, quantity: Math.max(1, Number(item.quantity) || 1) }))
  : [];
const storedFavorites = readStorage('petit-bonheur-favorites', []);
let favorites = new Set(Array.isArray(storedFavorites) ? storedFavorites : []);

function renderProducts() {
  const query = normalize(searchInput.value.trim());
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeFilter === 'tous' || product.category === activeFilter;
    const searchableText = normalize(`${product.name} ${product.categoryLabel} ${product.description}`);
    return matchesCategory && (!query || searchableText.includes(query));
  });

  productGrid.innerHTML = filteredProducts.map(product => {
    const isFavorite = favorites.has(product.id);
    return `
      <article class="product-card">
        <div class="product-media">
          <img src="${product.image}" alt="${product.alt}" width="1024" height="1024" loading="lazy">
          <span class="product-badge">${product.badge}</span>
          <button class="favorite-button${isFavorite ? ' active' : ''}" type="button" data-favorite="${product.id}" aria-label="${isFavorite ? 'Retirer' : 'Ajouter'} ${product.name} ${isFavorite ? 'des' : 'aux'} favoris" aria-pressed="${isFavorite}">
            <svg class="icon" aria-hidden="true"><use href="#icon-heart"></use></svg>
          </button>
        </div>
        <div class="product-info">
          <span class="product-category">${product.categoryLabel}</span>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-rating" aria-label="Note ${product.rating.toFixed(1).replace('.', ',')} sur 5, ${product.reviews} avis">★★★★★ <span>${product.rating.toFixed(1).replace('.', ',')} · ${product.reviews} avis</span></div>
          <div class="product-bottom">
            <div class="product-price">${product.oldPrice ? `<del>${currency.format(product.oldPrice)}</del>` : ''}${currency.format(product.price)}</div>
            <button class="product-add" type="button" data-add="${product.id}" aria-label="Ajouter ${product.name} au panier">Ajouter <svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg></button>
          </div>
        </div>
      </article>`;
  }).join('');

  emptyState.hidden = filteredProducts.length > 0;
  resultsSummary.textContent = `${filteredProducts.length} ${filteredProducts.length > 1 ? 'trouvailles' : 'trouvaille'} à découvrir`;
}

function setFilter(filter, shouldScroll = false) {
  activeFilter = filter;
  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  renderProducts();
  if (shouldScroll) document.getElementById('boutique').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getCartDetails() {
  return cart.map(item => ({ ...item, product: products.find(product => product.id === item.id) })).filter(item => item.product);
}

function getSubtotal() {
  return getCartDetails().reduce((total, item) => total + item.product.price * item.quantity, 0);
}

function getShipping(subtotal) {
  return subtotal === 0 || subtotal >= 50 ? 0 : 4.9;
}

function updateCart() {
  const details = getCartDetails();
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = getSubtotal();
  const shipping = getShipping(subtotal);
  cartCount.textContent = totalQuantity;

  if (!details.length) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <svg class="icon" aria-hidden="true"><use href="#icon-bag"></use></svg>
        <h3>Votre panier attend ses petits bonheurs.</h3>
        <p>Parcourez la boutique et trouvez une jolie chose à ajouter.</p>
        <button class="button button-primary" type="button" data-close-cart>Découvrir la boutique</button>
      </div>`;
    cartFooter.classList.add('is-empty');
    return;
  }

  cartFooter.classList.remove('is-empty');
  cartItems.innerHTML = details.map(item => `
    <div class="cart-item">
      <img src="${item.product.image}" alt="${item.product.alt}" width="76" height="83">
      <div>
        <span class="cart-item-category">${item.product.categoryLabel}</span>
        <h3>${item.product.name}</h3>
        <span class="cart-item-price">${currency.format(item.product.price * item.quantity)}</span>
        <div class="quantity-control" aria-label="Quantité pour ${item.product.name}">
          <button type="button" data-quantity="minus" data-id="${item.id}" aria-label="Diminuer la quantité"><svg class="icon" aria-hidden="true"><use href="#icon-minus"></use></svg></button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="plus" data-id="${item.id}" aria-label="Augmenter la quantité"><svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg></button>
        </div>
      </div>
      <button class="cart-remove" type="button" data-remove="${item.id}" aria-label="Retirer ${item.product.name} du panier"><svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg></button>
    </div>`).join('');

  document.getElementById('cart-subtotal').textContent = currency.format(subtotal);
  document.getElementById('checkout-total').textContent = currency.format(subtotal + shipping);
  const remaining = Math.max(0, 50 - subtotal);
  document.getElementById('shipping-message').innerHTML = remaining > 0
    ? `Encore <strong>${currency.format(remaining)}</strong> pour la livraison offerte`
    : '<strong>Youpi ! La livraison vous est offerte.</strong>';
  document.getElementById('shipping-bar').style.width = `${Math.min(100, subtotal / 50 * 100)}%`;
  document.getElementById('checkout-button').disabled = false;
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) existingItem.quantity = Math.min(99, existingItem.quantity + 1);
  else cart.push({ id: productId, quantity: 1 });
  writeStorage('petit-bonheur-cart', cart);
  updateCart();
  showToast(`${product.name} a rejoint votre panier.`);
}

function changeQuantity(productId, change) {
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;
  item.quantity = Math.max(0, Math.min(99, item.quantity + change));
  if (item.quantity === 0) cart = cart.filter(entry => entry.id !== productId);
  writeStorage('petit-bonheur-cart', cart);
  updateCart();
}

function removeFromCart(productId) {
  const product = products.find(item => item.id === productId);
  cart = cart.filter(item => item.id !== productId);
  writeStorage('petit-bonheur-cart', cart);
  updateCart();
  if (product) showToast(`${product.name} a été retiré du panier.`);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function syncModalState() {
  document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
}

productGrid.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add]');
  const favoriteButton = event.target.closest('[data-favorite]');
  if (addButton) addToCart(addButton.dataset.add);
  if (favoriteButton) {
    const productId = favoriteButton.dataset.favorite;
    if (favorites.has(productId)) favorites.delete(productId);
    else favorites.add(productId);
    writeStorage('petit-bonheur-favorites', [...favorites]);
    renderProducts();
    const product = products.find(item => item.id === productId);
    showToast(favorites.has(productId) ? `${product.name} a été ajouté à vos favoris.` : `${product.name} a été retiré de vos favoris.`);
  }
});

filterButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.category, true)));
searchInput.addEventListener('input', renderProducts);
document.getElementById('reset-filters').addEventListener('click', () => {
  searchInput.value = '';
  setFilter('tous');
  searchInput.focus();
});
document.querySelector('[data-open-search]').addEventListener('click', () => {
  document.getElementById('boutique').scrollIntoView({ behavior: 'smooth', block: 'start' });
  searchInput.focus({ preventScroll: true });
});
document.querySelectorAll('[data-footer-filter]').forEach(link => link.addEventListener('click', () => {
  searchInput.value = '';
  setFilter('tous', true);
}));

document.querySelector('[data-open-cart]').addEventListener('click', () => {
  updateCart();
  cartDialog.showModal();
  syncModalState();
});
document.addEventListener('click', event => {
  if (event.target.closest('[data-close-cart]')) cartDialog.close();
  if (event.target.closest('[data-close-checkout]')) checkoutDialog.close();
});
[cartDialog, checkoutDialog].forEach(dialog => {
  dialog.addEventListener('close', syncModalState);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) dialog.close();
    }
  });
});
cartItems.addEventListener('click', event => {
  const quantityButton = event.target.closest('[data-quantity]');
  const removeButton = event.target.closest('[data-remove]');
  if (quantityButton) changeQuantity(quantityButton.dataset.id, quantityButton.dataset.quantity === 'plus' ? 1 : -1);
  if (removeButton) removeFromCart(removeButton.dataset.remove);
});
document.getElementById('checkout-button').addEventListener('click', () => {
  cartDialog.close();
  updateCart();
  checkoutDialog.showModal();
  syncModalState();
});
document.getElementById('checkout-form').addEventListener('submit', event => {
  event.preventDefault();
  cart = [];
  writeStorage('petit-bonheur-cart', cart);
  updateCart();
  checkoutDialog.close();
  event.currentTarget.reset();
  showToast('Merci ! Votre commande de démonstration a bien été enregistrée.');
});

document.querySelectorAll('[data-subject]').forEach(link => link.addEventListener('click', () => {
  document.getElementById('contact-subject').value = link.dataset.subject;
}));
document.getElementById('newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  const message = document.getElementById('newsletter-message');
  message.textContent = 'Merci ! Votre inscription est enregistrée pour cette démonstration.';
  event.currentTarget.reset();
});
document.getElementById('contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const message = document.getElementById('contact-message');
  message.textContent = 'Merci ! Votre message est enregistré pour cette démonstration.';
  event.currentTarget.reset();
});

const menuTrigger = document.querySelector('.menu-trigger');
const mainNav = document.getElementById('main-nav');
menuTrigger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuTrigger.setAttribute('aria-expanded', String(isOpen));
  menuTrigger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  menuTrigger.querySelector('use').setAttribute('href', isOpen ? '#icon-close' : '#icon-menu');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuTrigger.setAttribute('aria-expanded', 'false');
  menuTrigger.setAttribute('aria-label', 'Ouvrir le menu');
  menuTrigger.querySelector('use').setAttribute('href', '#icon-menu');
}));

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('is-visible'));
}

const siteHeader = document.getElementById('site-header');
const backToTop = document.querySelector('.back-to-top');
function handleScroll() {
  siteHeader.classList.toggle('scrolled', window.scrollY > 12);
  backToTop.classList.toggle('show', window.scrollY > 650);
}
window.addEventListener('scroll', handleScroll, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.getElementById('current-year').textContent = new Date().getFullYear();

renderProducts();
updateCart();
handleScroll();
