import { products } from './products.js'
const DOM = {
    //variables
    hamburgerButton: document.querySelector('.hamburger'),
    navbar: document.querySelector('.navbar'),
    notification: document.querySelector('.notification'),
    notificationContent: document.querySelector('.notification__content'),
    header: document.querySelector('.header'),
    //basket modal actions and basket modal
    basketModal: document.querySelector('.basket__modal'),
    backBasketModalButton: document.querySelector('.btn-edit'),
    confirmBasketModalButton: document.querySelector('.btn-proceed'),
    //sidebar elements
    basketButton: document.querySelector('.basket__button'),
    basketCount: document.querySelector('#shop__basket-number'),
    basketSidebar: document.querySelector('.basket__sidebar'),
    closeSidebarButton: document.querySelector('.close__sidebar'),
    basketTotalPrice: document.querySelector('.basket__total'),
    basketOrderButton: document.querySelector('.basket__orderbtn'),
    //filter buttons wrapper
    categoryActions: document.querySelector('.category__actions'),
    searchInput: document.getElementById('search'),

    //Lists
    basketList: document.querySelector('.basket__list'),
    productList: document.querySelector('.product__list'),

    //template cloneNode
    basketCartTemplate: document.getElementById('basket__template'),
    productCartTemplate: document.getElementById('products__cart'),
    categoryButtonTemplate: document.getElementById('category__button-template')
}
//basket array for localstorage
let basket = [];

const runEvents = () => {
    //sidebar click events
    initSidebarEvents()
    //show productCart UI
    renderProductCart(products)
    //ProductCart button click events
    initProductButton()
    //load data the from local storage
    loadBasket()
    renderBasketCart()
    initBasketQuantity()
    createCategoryButtons()
    filterCategoryButton()
    DOM.searchInput.addEventListener('keyup', searchFilter)
}
//sidebar all click events
const initSidebarEvents = () => {
    //sidebar toggle mode
    DOM.basketButton.addEventListener('click', toggleSidebar)
    //close sidebar events
    DOM.closeSidebarButton.addEventListener('click', closeSidebar)
    //HamburgerMenu
    DOM.hamburgerButton.addEventListener('click', toggleNavbar)
    // Close navbar on scroll
    document.addEventListener('scroll', closeNavbar)
    DOM.basketOrderButton.addEventListener('click', checkOrder)
    DOM.confirmBasketModalButton.addEventListener('click', completeOrders)

}
//togglesidebar function
const toggleSidebar = () => {
    DOM.basketSidebar.classList.toggle('open')
    closeNavbar()
}
//sidebar close function
const closeSidebar = () => {
    DOM.basketSidebar.classList.remove('open')
}
//toggle navbar 
const toggleNavbar = () => {
    DOM.navbar.classList.toggle('active')
}
//close navbar
const closeNavbar = () => DOM.navbar.classList.remove('active')
//show product cart UI
const renderProductCart = (products) => {
    DOM.productList.innerHTML = "";
    //create virtual container
    //use a DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        //clone temlate productCart in the DOM
        let clone = DOM.productCartTemplate.content.cloneNode(true);
        //productcart template elements selecet
        let img = clone.querySelector('.product__img img');
        let name = clone.querySelector('.product__name');
        let feature = clone.querySelector('.product__feature');
        let price = clone.querySelector('.product__price');
        let productBtn = clone.querySelector('.product__btn');
        //set product data values
        img.src = product.img;
        name.textContent = product.name;
        feature.textContent = product.features;
        price.textContent = priceFormat(product.price)
        productBtn.dataset.id = parseFloat(product.id)
        //insert clone into fragment
        fragment.appendChild(clone);
    })
    //insert clone into DOMproductlist
    DOM.productList.appendChild(fragment)
}
// Initialize event delegation for product buttons
const initProductButton = () => {
    DOM.productList.addEventListener('click', (e) => {
        const btn = e.target.closest('.product__btn')
        if (!btn) return;

        const btnID = Number(btn.dataset.id)
        const product = products.find(p => p.id === btnID)
        if (!product) return;

        addToBasket(product)
    })
}
//add to basketList
const addToBasket = (product) => {
    const basketItem = basket.find(b => b.id === product.id)
    basketItem ? basketItem.amount++ : basket.push({ ...product, amount: 1 })

    saveBasket()
    renderBasketCart()
    showAlert('info', 'add to cart')

}
//save localstorage
const saveBasket = () => {
    localStorage.setItem('basket', JSON.stringify(basket))
}
//load localstorage
const loadBasket = () => {
    let getBasket = localStorage.getItem('basket')
    if (getBasket) basket = JSON.parse(getBasket)
}
//render to basket cartUI
const renderBasketCart = () => {
    DOM.basketList.innerHTML = "";
    //create virtual container
    //use a DocumentFragment for better performance
    let fragment = document.createDocumentFragment();
    let totalCount = 0;
    let totalPrice = 0;

    basket.forEach(item => {
        totalCount += item.amount;
        totalPrice += item.amount * item.price
        //clone temlate basketCart in the DOM
        const clone = DOM.basketCartTemplate.content.cloneNode(true);
        //productcart template elements selecet
        let img = clone.querySelector('.basket__list-left img');
        let name = clone.querySelector('.basket__list-info h3');
        let price = clone.querySelector('.basket__list-info p');
        let quantity = clone.querySelector('.quantity')
        //set product data values
        img.src = item.img;
        name.textContent = item.name
        price.textContent = priceFormat(item.price)
        quantity.textContent = item.amount
        // Set dataset IDs for action buttons
        clone.querySelector('.fa-minus').dataset.id = item.id
        clone.querySelector('.fa-plus').dataset.id = item.id
        clone.querySelector('.fa-trash').dataset.id = item.id
        //insert clone into fragment
        fragment.appendChild(clone)
    })
    //update total quantity and prie in the UI
    DOM.basketCount.textContent = totalCount
    DOM.basketTotalPrice.textContent = priceFormat(totalPrice)
    DOM.basketList.appendChild(fragment)
}
// Initialize event delegation for basketCart buttons
const initBasketQuantity = () => {
    DOM.basketList.addEventListener('click', (e) => {
        // Check if a plus, minus, or trash button was clicked
        const btn = e.target.closest('.fa-plus, .fa-minus, .fa-trash');
        if (!btn) return;

        //get the item ID FROM buttons dataset
        const btnID = Number(btn.dataset.id)

        const basketItem = basket.find(b => b.id === btnID)
        if (!basketItem) return;
        //handle button actions
        if (btn.classList.contains('fa-plus')) basketItem.amount++

        else if (btn.classList.contains('fa-minus')) {
            basketItem.amount--
            if (basketItem.amount <= 0) return removeFromBasket(btnID)
        } else {
            removeFromBasket(btnID)
            return;
        }
        saveBasket()
        renderBasketCart()

    })
}
//remove basketCart
const removeFromBasket = (id) => {
    basket = basket.filter(b => b.id !== id)
    if (basket.length === 0) closeSidebar()
    saveBasket()
    renderBasketCart()
    showAlert('danger', 'remove cart from basket')
}
//Check orders
const checkOrder = () => {
    if (basket.length === 0) {
        showAlert('danger', 'empty basket')
        closeSidebar()
        return;
    } else {
        DOM.basketModal.classList.add('active')
        DOM.backBasketModalButton.addEventListener('click', () => {
            DOM.basketModal.classList.remove('active')
        })
    }
}
//complete orders
const completeOrders = () => {
    basket = [];
    saveBasket()
    renderBasketCart()
    closeSidebar()
    DOM.basketModal.classList.remove('active')
    showAlert('success', 'thank you for purchase!')
}
// Create category buttons
const createCategoryButtons = () => {
    // Get unique categories, start with 'all'
    const categories = products.reduce((value, item) => {
        if (!value.includes(item.category)) {
            value.push(item.category)
        }
        return value
    }, ['all'])
    // Clear existing buttons
    DOM.categoryActions.innerHTML = ""

    const fragment = document.createDocumentFragment()

    // Create button for each category
    categories.map(category => {
        const clone = DOM.categoryButtonTemplate.content.cloneNode(true)
        const button = clone.querySelector('.filter__button')
        button.textContent = category
        button.dataset.filter = category

        fragment.appendChild(clone)
    })
    DOM.categoryActions.appendChild(fragment)
    //first button active
    DOM.categoryActions.querySelector('.filter__button')
        .classList.add('active')
}
// Filter products by category on button click
const filterCategoryButton = () => {
    DOM.categoryActions.addEventListener('click', (e) => {
        const btnCategory = e.target.dataset.filter
        if (!btnCategory) return;

        //active class add remove
        e.target.closest('.category__actions')
            .querySelectorAll('.filter__button')
            .forEach(btn => btn.classList.toggle('active', btn === e.target))

        const filtered = btnCategory === 'all'
            ? products
            : products.filter(p => p.category === btnCategory)

        renderProductCart(filtered)
    })
}
//search input filter
const searchFilter = () => {
    //replace(/\s+/g, "")  Trim + remove all spaces
    const filterValue = normalize(DOM.searchInput.value)

    const productsCart = DOM.productList.querySelectorAll('.product__card')

    productsCart.forEach(card => {
        const liText = card.querySelector('.product__name')
        const text = normalize(liText.textContent)

        text.includes(filterValue)
            ? card.setAttribute('style', 'display:flex')
            : card.setAttribute('style', 'display:none')

    })

}



//-------------- utility

//price format function return USD
const priceFormat = price => `$${price.toFixed(2)}`

//Show Alert
const showAlert = (type, message) => {
    DOM.notificationContent.className = `notification__content ${type}`;
    DOM.notificationContent.textContent = message;
    DOM.notification.classList.add('active');

    setTimeout(() => {
        DOM.notification.classList.remove('active');
    }, 1500);
};

//normalize search
const normalize = (str) => {
    return str
        .replace(/İ/g, 'i')       // büyük İ → küçük i
        .toLowerCase()            // diğer harfleri küçült
        .replace(/\s+/g, '')      // tüm boşlukları kaldır
        .replace(/ı/g, 'i')       // ı → i
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/ğ/g, 'g')
        .replace(/ş/g, 's')
        .replace(/ç/g, 'c')
}

//init app
document.addEventListener('DOMContentLoaded', runEvents)