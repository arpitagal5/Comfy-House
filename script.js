  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAQgw3KrPMbbpbczI_5PWCqAIBi4EBxAB8",
    authDomain: "comfy-house-c9346.firebaseapp.com",
    projectId: "comfy-house-c9346",
    storageBucket: "comfy-house-c9346.appspot.com",
    messagingSenderId: "690854241221",
    appId: "1:690854241221:web:ec2a9dc86b9b9b110da1ac"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();


const productsDOM = document.querySelector('.products-center');
const cartDOM = document.querySelector('.cart');
const cartClose = document.querySelector('.close-cart');
const clearCart = document.querySelector('.clear-cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const cartItems = document.querySelector('.cart-items') 
const cartBtn = document.querySelector('.cart-btn');
const navBtn = document.querySelector('.nav-icon') ;
const authDOM = document.querySelector('.userAuth');


let cart = [] ;
let buttonDOM = [] ;
//products
class FetchProduct{
    async getProducts(){
        try{
            let result = await fetch('./products.json') ;
            let data = await result.json();
            let products = data.items ;
            products =  products.map(prod => {
                 let { title , price} = prod.fields ;
                 let { id } = prod.sys ;
                 let image = prod.fields.image.fields.file.url ;
                 return  { title , price , id , image } ;
             })
             return products ;

        }catch{
            console.log(error);

        }
    }

}

class UpdateUi{
    async displayProducts(products){
        let result = '' ;
        products.forEach(product => {
            result += ``
        })
        productsDOM.innerHTML = result ;
    }
}



//update UI
class UpdateUI {
    async displayProducts(products){
        let result  = '' ;
        products.forEach(product => {
            console.log(product);
            result += `  
                <article class = "product">
                 <div class = "img-container" >
                   <img src=${product.image} alt ="product" class="product-img"  / >
                   <button class="bag-btn" data-id=${product.id}>
                     <i class="fas fa-shopping-cart"></i>
                     Add to Bag 
                   </button>
                 <div>
                 <h3>${product.title}</h3>
                 <h4>${product.price}</h4>
                </article>
            `;     
        })
        productsDOM.innerHTML = result ;
    }

    async getProductBtn(){
        const buttons = [...document.querySelectorAll('.bag-btn')] ;
        buttonDOM = buttons ;
        buttons.forEach(button => {
            let id = button.dataset.id ;
            let inCart = cart.find(item => item.id === id ) ;
            if(inCart){
                button.innerHTML = 'In Cart' ;
                button.disabled = true ;
            }  
            button.addEventListener('click' , event => {
                event.target.innerText = 'In Cart' ;
                event.target.disabled = true ;
                //get product from products
                let cartItem = { ...Storage.getProduct(id) , amount : 1 } ;
                
                // add product to cart
                cart = [...cart , cartItem] ;
                
                //save cart in local storage
                Storage.saveCart(cart) ;

                //set cart value 
                 this.setCartValue(cart);
                //display cart item
                this.addCartItem(cartItem);
                //show the cart
                this.showCart();
            })
        })

    }
    setCartValue(cart){
        let amountTotal = 0 ;
        let priceTotal = 0 ;
        cart.map(item => {
            amountTotal += item.amount ;
            priceTotal += item.price * item.amount ;
        })
        cartItems.innerHTML = amountTotal ;
        cartTotal.innerText = parseFloat(priceTotal.toFixed(2));
        console.log(cartTotal , cartItems) ;

    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add("cart-item");
        div.innerHTML = `
        <img src=${item.image} alt="product" />
        <div>
        <h4>${item.title}</h4>
        <h5>${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `;
        cartContent.appendChild(div);

    }
    showCart(){
       cartOverlay.classList.add("transparentBcg");
       cartDOM.classList.add("showCart");
    }
    setInitial(){
        cart = Storage.getCart() ;
        this.setCartValue(cart);
        this.createCart(cart);
        cartBtn.addEventListener('click' , this.showCart ) ;
        cartClose.addEventListener('click', this.hideCart ) ;

    }
    createCart(cart){
          cart.forEach(item => this.addCartItem(item)) ;
    }

    hideCart(){
        cartOverlay.classList.remove("transparentBcg");
       cartDOM.classList.remove("showCart");

    }
    
    clearCart(){
        //remove product
        cartContent.addEventListener('click' , event => {
            // let upDown = event.target.parentElement.parentElement ;
        
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target ;
                let id = removeItem.dataset.id ;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            if(event.target.classList.contains("fa-chevron-up")){
                let amountInc = event.target ;
                let id =  amountInc.dataset.id ;
                let amountPlus = parseInt(event.target.nextElementSibling.textContent ) ;
                if(amountPlus !== 0){
                amountPlus -= 1 ;
                event.target.nextElementSibling.textContent = amountPlus ;
                }
                let cartItem =  { ...Storage.getProduct(id), amount : amountPlus } ;
                cart = [ ...cart , cartItem] ;
                Storage.saveCart(cart);

            } 
            if(event.target.classList.contains("fa-chevron-down")){
                let amountSub =  parseInt(event.target.previousElementSibling.innerHTML);
                amountSub += 1 ;
                event.target.previousElementSibling.textContent = parseInt(amountSub) ;

            }
        })

        //remove cart
        clearCart.addEventListener('click' , () => {
            let cartItems = cart.map(item => item.id) ;
            cartItems.forEach(id => this.removeItem(id)) ;
            while(cartContent.children.length > 0){
                cartContent.removeChild(cartContent.children[0]);

            }
            this.hideCart();
        })
    }
    removeItem(id){   
        cart = cart.filter(item => item.id !== id) ;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.setButtonText(id);
        button.disabled = false ;
        button.innerHTML = `<i class="fa fa-shopping-cart"></i>Add To Cart` ;
        
    }
    setButtonText(id){
        return buttonDOM.find(button => button.dataset.id === id) ;
    }
    
    userAuth(){
        navBtn.addEventListener('click' , () => {
        authDOM.style.display = 'block';
        })
        
    }

}

//locals storage
class Storage {
   static saveProducts(products){
     localStorage.setItem("products" , JSON.stringify(products));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products")) ;
        return products.find(product => product.id == id) ;
    }

    static saveCart(cart){
        localStorage.setItem('cart' ,JSON.stringify(cart) );
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [] ;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const ui = new UpdateUI() ;
    const products = new FetchProduct() ;
    ui.setInitial();
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
        ui.userAuth();

    }).then(() => {
        ui.getProductBtn();
        ui.clearCart();
    });
})





