# ⚡ Quick Start Guide - Angular E-commerce

## 🚀 Get Running in 5 Minutes

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Start Development Server**
```bash
ng serve
```

### **Step 3: Open Browser**
```
http://localhost:4200
```

**Done! 🎉**

---

## 🔑 Quick Test Flow

### **1. Login**
- Click user icon (top right)
- Email: `test@rfm.com`
- Password: `password123`

### **2. Shop**
- Click on any product card
- Select size
- Click "Add to Cart"

### **3. Checkout**
- Click cart icon (top right)
- Click "Proceed to Checkout"
- Fill shipping form → Continue
- Select payment method → Continue
- Review order → Place Order

### **4. Success!**
- View order confirmation
- Order saved in history

---

## 📂 Important Files

| File | What It Does |
|------|--------------|
| `app.component.ts` | Root component - App starts here |
| `app.routes.ts` | URL routing - Maps URLs to pages |
| `cart.service.ts` | Shopping cart logic |
| `order.service.ts` | Checkout & orders |
| `checkout.component.ts` | Checkout page |

---

## 🎨 Customize

### **Change Primary Color:**
Edit `/styles/globals.css`:
```css
:root {
  --color-primary: #000000; /* Change this */
}
```

### **Add Product:**
Edit `cart.service.ts` → `getProductById()` method

### **Add Page:**
1. Create component in `/src/app/pages/`
2. Add route in `app.routes.ts`
3. Add nav link in `header.component.ts`

---

## 🐛 Troubleshooting

### **"ng: command not found"**
```bash
npm install -g @angular/cli
```

### **"Cannot find module"**
```bash
npm install
```

### **Port 4200 already in use**
```bash
ng serve --port 4201
```

### **Cart/Favorites not saving**
- Check browser console for errors
- Clear localStorage and try again
- Make sure you're logged in

---

## 📖 Learn More

- **Full Setup:** See `/ANGULAR_SETUP.md`
- **Checkout System:** See `/CHECKOUT_GUIDE.md`
- **Main README:** See `/README.md`

---

## 💡 Pro Tips

1. **Auto-reload:** Changes auto-refresh in browser
2. **Code Comments:** Every file has detailed comments
3. **TypeScript:** Hover over code in VS Code for hints
4. **DevTools:** Use browser DevTools to debug
5. **Standalone Components:** Modern Angular - no NgModule needed!

---

## ✅ Checklist

Before deploying:
- [ ] Test all pages
- [ ] Test checkout flow
- [ ] Test on mobile
- [ ] Update product data
- [ ] Replace mock images
- [ ] Set up real payment gateway
- [ ] Deploy to hosting

---

**Need help? Check the full documentation files! 📚**
