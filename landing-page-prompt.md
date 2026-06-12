# 🪷 BRAHMA KALASHA — Landing Page Website Prompt

> **Use this prompt to build a stunning, production-quality landing page for Brahma Kalasha — a premium vegetarian pre-order food platform based in Bangalore, India.**

---

## 🏷️ Brand Identity

- **Name**: Brahma Kalasha
- **Tagline**: "Premium Vegetarian Pre-Order Platform"
- **Description**: A premium, mobile-first vegetarian food ordering platform that enables customers to pre-book freshly prepared meals for the next day. The platform is designed for a cooking business that prepares food daily based on pre-orders and delivers using its own delivery staff.
- **Location**: Bangalore, Karnataka, India
- **Service Zones**: Bangalore, Mysore
- **Cuisine**: 100% Pure Vegetarian (Only Veg — No Non-Veg)
- **Business Model**: Customers pre-order today (before 9 PM cutoff), food is freshly prepared and delivered the next day
- **Logo**: Available at `/logo.png` (use as header logo)
- **Locale**: `en_IN` (Indian English)

### SEO Metadata
- **Title**: `Brahma Kalasha — Premium Vegetarian Pre-Order Platform`
- **Meta Description**: `Order freshly prepared wholesome vegetarian meals for next-day delivery. South Indian tiffins, veg lunches, healthy specials and more. Pre-order before 9 PM tonight for tomorrow's delivery.`
- **Keywords**: `vegetarian food, pre-order meals, healthy food delivery, south indian food, tiffin service, Bangalore food delivery, Brahma Kalasha`

---

## 🎨 Color Palette (EXACT HEX VALUES — Do NOT deviate)

| Token Name      | Hex Code   | Usage                                    |
|-----------------|------------|------------------------------------------|
| **Maroon**      | `#4B0F16`  | Primary color, headers, CTAs, nav        |
| **Burgundy**    | `#7A2E36`  | Secondary, hover states, gradients       |
| **Temple Gold** | `#C89B63`  | Accents, pricing, highlights, icons      |
| **Warm Ivory**  | `#E7DED7`  | Borders, dividers, card borders          |
| **Soft Cream**  | `#F5F1EC`  | Page background, section backgrounds     |
| **Dark Cocoa**  | `#2A1A1C`  | Text emphasis, headings, dark text       |
| **Muted Bronze**| `#A86F3D`  | Secondary accents, decorative elements   |
| **Sand Beige**  | `#D8C2A8`  | Tags, badges, subtle backgrounds         |

### Extended Palette

| Token Name        | Hex Code   | Usage                           |
|-------------------|------------|----------------------------------|
| **Maroon Light**  | `#6B2A32`  | Lighter maroon variant           |
| **Gold Light**    | `#E4C799`  | Lighter gold for gradients       |
| **Gold Dark**     | `#A67E45`  | Darker gold for depth            |
| **Cream Dark**    | `#EDE5DC`  | Slightly darker cream sections   |
| **Sage**          | `#8B9A6B`  | "Healthy" badges, veg indicators |
| **Sage Light**    | `#D4DFC5`  | Light green for health tags      |

### Theme Color
- **Browser Theme**: `#4B0F16` (Maroon)

---

## 🔤 Typography

| Role          | Font Family                                               |
|---------------|-----------------------------------------------------------|
| **Primary**   | `Inter` (body text, UI elements)                          |
| **Display**   | `Manrope` (headings, hero text, section titles)           |
| **Fallbacks** | `ui-sans-serif, system-ui, -apple-system, sans-serif`     |

### Typography Rules
- Clean, professional, readable
- NO oversized typography
- NO monospace labels
- Import from Google Fonts: `Inter` and `Manrope`
- Use `font-display: swap` for performance

---

## ✨ Animations (CSS Keyframes to Implement)

```css
/* Fade In */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up — for cards, sections entering viewport */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide Down — for dropdowns, search bars */
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale In — for modals, success states */
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Shimmer — for skeleton loaders */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}
```

### Animation Guidelines
- Use **Intersection Observer** to trigger `slide-up` animations as sections scroll into view (staggered delays for child elements)
- Hero section: `fade-in` on load (0.5s ease-out)
- Menu cards: `slide-up` with staggered 100ms delays per card
- Counters/stats: Animate numbers counting up on scroll
- Countdown timer: Smooth flip/tick animation for the booking countdown
- Hover effects: `scale(1.02)` on cards, color transitions on buttons (200ms)
- CTA buttons: `active:scale(0.98)` for tactile press feedback
- Spring transition: `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy micro-interactions
- Floating elements: Subtle `translateY` oscillation for decorative blobs
- **Parallax**: Gentle parallax on hero background decorative elements

---

## 🎨 Design Philosophy (STRICTLY FOLLOW)

### DO ✅
- Premium South Indian Vegetarian Brand aesthetic
- Rounded cards with `border-radius: 1.25rem` (20px)
- Soft shadows: `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`
- Generous spacing and white space
- Modern layouts with CSS Grid
- High accessibility (WCAG AA+)
- Fast interactions and transitions
- Mobile-first responsive design
- Glassmorphism on overlays: `backdrop-filter: blur(12px)`
- Decorative gradient blobs (burgundy + gold) behind hero sections
- Gold (#C89B63) accents for pricing and highlights

### DON'T ❌
- NO Tech Startup Aesthetic
- NO Dark Theme
- NO Brutalist Design
- NO Editorial Magazine Design
- NO generic colors (plain red, blue, green)
- NO placeholder images — use the provided Unsplash URLs

---

## 📐 Landing Page Sections (Build These)

### 1. 🔝 Navigation Bar (Sticky)
- Logo (`/logo.png`) on the left — use `brightness(0)` filter on cream background for dark logo, or `brightness(0) invert(1)` on dark backgrounds
- Nav links: Home, Menu, How It Works, About, Contact
- CTA button: **"Order Now"** (Maroon bg, Cream text, rounded-xl, hover → Burgundy)
- Mobile: Hamburger menu with slide-in drawer
- Sticky with slight blur background on scroll: `backdrop-filter: blur(10px)`

### 2. 🏠 Hero Section
- Full-width, Maroon (`#4B0F16`) background
- Decorative blurred circles: Burgundy (`#7A2E36`) and Gold/20 opacity
- Headline (Manrope, bold): **"Wholesome Vegetarian Meals, Delivered Fresh Tomorrow"**
- Subheadline: **"Pre-order before 9 PM tonight. Freshly prepared South Indian meals delivered to your doorstep by tomorrow."**
- **Live Countdown Timer**: Show hours:minutes:seconds until 9 PM cutoff — with styled number boxes (`bg-cream/15, rounded, font-mono, font-bold`)
- CTA: **"Browse Tomorrow's Menu"** (Gold bg, Dark Cocoa text, rounded-xl, with arrow icon)
- Secondary CTA: **"How It Works"** (transparent border, cream text)
- Hero image/illustration: High-quality vegetarian food spread (use one of the Unsplash URLs from menu data)
- **Pure Veg badge**: Green badge with 🌿 Leaf icon — "100% Pure Vegetarian"

### 3. 🛒 How It Works (3-Step Process)
- Section title: **"Farm-Fresh to Your Doorstep"**
- 3 cards in a row (responsive: stack on mobile):

| Step | Icon  | Title              | Description                                        |
|------|-------|--------------------|-----------------------------------------------------|
| 1    | 📋    | Browse Menu        | Explore tomorrow's freshly curated vegetarian menu  |
| 2    | 🛒    | Pre-Order by 9 PM  | Add items to cart and checkout before the cutoff     |
| 3    | 🚚    | Fresh Delivery     | Receive freshly prepared meals at your door tomorrow |

- Each card: White bg, rounded-2xl, border-ivory, soft shadow
- Gold accent numbers (1, 2, 3) or gold connector lines between steps
- Animate cards sliding up on scroll with stagger

### 4. 🍽️ Featured Menu Section
- Section title: **"Tomorrow's Fresh Menu"**
- Subtitle: **"Handcrafted with love, delivered with care — Only vegetarian."**
- Category filter pills (horizontal scroll on mobile):
  - South Indian Tiffins
  - South Indian Veg Lunches
  - Indian Veg Chaats
  - Indian Sweets
  - Healthy Specials
  - Seasonal Specials
- Active pill: Maroon bg, Cream text, slight scale(1.05)
- Inactive pill: White bg, Ivory border, Maroon/70 text

#### Menu Items to Display (All Data):

**South Indian Tiffins:**

| Dish                | Price | Description | Image | Healthy | Nutrition | Tags |
|---------------------|-------|-------------|-------|---------|-----------|------|
| Classic Idli Sambar  | ₹120  | 4 soft, fluffy steamed rice cakes served with aromatic lentil sambar and fresh coconut chutney. Made with organic rice. | `https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=800&auto=format&fit=crop&q=60` | ✅ | Calories: 280 \| Protein: 8g \| Fiber: 4g | Protein-Rich, Low-Fat, Probiotic |
| Ragi Masala Dosa     | ₹150  | Crispy, nutritious finger-millet crepe filled with spiced potato mash, served with sambar and three chutneys. | `https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop&q=60` | ✅ | Calories: 350 \| Protein: 10g \| Iron: 6mg | High-Fiber, Gluten-Free, Iron-Rich |
| Rava Upma Bowl       | ₹100  | Semolina porridge tempered with mustard, curry leaves, and vegetables. Light yet satisfying breakfast bowl. | `https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&auto=format&fit=crop&q=60` | ✅ | Calories: 220 \| Protein: 6g \| Fiber: 3g | Low-Calorie, Wholesome |

**South Indian Veg Lunches:**

| Dish                | Price | Description | Image | Healthy | Nutrition | Tags |
|---------------------|-------|-------------|-------|---------|-----------|------|
| Homestyle Veg Thali  | ₹220  | Complete wholesome meal: 3 Chapati, Dal Tadka, Seasonal Sabzi, Jeera Rice, Raita, Pickle, and Papad. | `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60` | ✅ | Calories: 650 \| Protein: 22g \| Complete meal | Balanced-Diet, Iron-Rich, Complete Meal |
| Lemon Rice Box       | ₹160  | Tangy, turmeric-infused lemon rice with peanuts, served with pickle, papad, and a side of curd. | `https://images.unsplash.com/photo-1626082929543-34e857416cb4?w=800&auto=format&fit=crop&q=60` | ❌ | Calories: 420 \| Protein: 8g | Vegan, Quick Meal |
| Bisi Bele Bath       | ₹180  | Hearty Karnataka classic — rice, lentils, and vegetables cooked together with aromatic spice powder. Topped with ghee and cashews. | `https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60` | ✅ | Calories: 480 \| Protein: 16g \| Fiber: 8g | High-Protein, Traditional |

**Indian Veg Chaats:**

| Dish                | Price | Description | Image | Healthy | Nutrition | Tags |
|---------------------|-------|-------------|-------|---------|-----------|------|
| Sprouts Bhel Puri    | ₹90   | A healthy twist on classic street food — loaded with fresh sprouts, microgreens, pomegranate, and tangy-sweet chutneys. | `https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=60` | ✅ | Calories: 180 \| Protein: 12g \| Low-Fat | High-Protein, Low-Calorie, Superfood |
| Dahi Puri            | ₹110  | Crispy puri shells filled with spiced potatoes, sweet yogurt, tamarind chutney, and sev. A refreshing delight. | `https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&auto=format&fit=crop&q=60` | ❌ | Calories: 250 \| Protein: 6g | Classic, Refreshing |

**Indian Sweets:**

| Dish                  | Price | Description | Image | Healthy | Nutrition | Tags |
|-----------------------|-------|-------------|-------|---------|-----------|------|
| Jaggery Kesari Bath   | ₹110  | Traditional semolina pudding sweetened with pure jaggery, infused with saffron and cardamom, topped with roasted nuts. | `https://images.unsplash.com/photo-1605197136262-d98c253ff75c?w=800&auto=format&fit=crop&q=60` | ❌ | Calories: 320 \| Refined-Sugar-Free | Refined-Sugar-Free, Traditional |
| Coconut Laddu         | ₹130  | Soft, melt-in-mouth coconut balls sweetened with condensed milk and flavored with cardamom. Pack of 4. | `https://images.unsplash.com/photo-1666190059744-1137ef0afe44?w=800&auto=format&fit=crop&q=60` | ❌ | Calories: 160 per piece | Festive, Traditional |

**Healthy Specials:**

| Dish                  | Price | Description | Image | Healthy | Nutrition | Tags |
|-----------------------|-------|-------------|-------|---------|-----------|------|
| Quinoa Vegetable Bowl | ₹250  | Protein-packed quinoa with roasted seasonal vegetables, avocado, lemon-tahini dressing, and toasted seeds. | `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60` | ✅ | Calories: 380 \| Protein: 18g \| Superfoods | Superfood, High-Protein, Gluten-Free |
| Millet Power Salad    | ₹200  | Warm foxtail millet salad with chickpeas, bell peppers, cucumber, and a mint-coriander yogurt dressing. | `https://images.unsplash.com/photo-1540914124281-342587941389?w=800&auto=format&fit=crop&q=60` | ✅ | Calories: 320 \| Protein: 14g \| Fiber: 10g | High-Fiber, Diabetic-Friendly, Ancient Grain |

#### Menu Card Design:
- White bg, rounded-[1.25rem], border-ivory, soft shadow
- Left: Image (100×110px, rounded-2xl, `object-cover`, hover → `scale(1.05)` in 500ms)
- If `isHealthy === true`: Green overlay badge with 🌿 Leaf icon + "Healthy"
- Right side: Name (bold, maroon), Description (2-line clamp, maroon/55), Tags (tiny pills, ivory bg), Price (bold, gold, large)
- "Add" button: Cream bg, maroon text, hover → Gold bg with white text

### 5. 🌿 Healthy Food Promise Section
- Light cream/sage gradient background
- Section title: **"Our Healthy Food Promise"**
- 4 cards in a grid:

| Icon | Title | Description |
|------|-------|-------------|
| 🌿   | 100% Pure Vegetarian | Every dish is prepared with fresh, pure vegetarian ingredients — no exceptions |
| 🍃   | No Preservatives     | We cook fresh daily with no artificial preservatives or additives |
| 🌾   | Ancient Grains       | Millets, ragi, and quinoa — superfoods our ancestors cherished |
| ❤️   | Made with Love       | Small-batch cooking ensures every meal gets personal attention |

### 6. 📊 Social Proof / Stats Counter
- Background: Maroon with decorative blurred gold/burgundy circles
- Cream text, Gold accent numbers
- Animate numbers counting up on scroll:

| Stat | Value | Label |
|------|-------|-------|
| 🍽️   | 186+  | Orders Served |
| 👥   | 142+  | Happy Customers |
| ⭐   | 4.8   | Average Rating |
| 🥗   | 12+   | Dishes on Menu |

### 7. 💬 Customer Testimonials
- Section title: **"What Our Customers Say"**
- Carousel or 3-column grid of testimonial cards
- Each card: White bg, rounded-2xl, gold star rating (★★★★★), quote, name, location

| Name            | Rating | Testimonial |
|-----------------|--------|-------------|
| Priya Sharma    | ★★★★★  | "The Homestyle Veg Thali tastes exactly like my grandmother's cooking. Fresh, wholesome, and delivered on time every single day!" |
| Rahul Menon     | ★★★★★  | "I switched to Brahma Kalasha for my office lunches. The Quinoa Bowl and Millet Salad are game-changers for healthy eating." |
| Anjali Reddy    | ★★★★★  | "Pre-ordering the night before is so convenient. The Ragi Dosa is incredible — crispy, healthy, and my kids love it too!" |
| Deepak Kulkarni | ★★★★★  | "Finally, a food delivery that cares about quality. The Bisi Bele Bath brought back memories of home. Absolutely authentic." |

### 8. 📱 Subscription Coming Soon Banner
- Full-width, Gold (`#C89B63`) to Muted Bronze (`#A86F3D`) gradient background
- Headline: **"Meal Subscriptions — Coming Soon"**
- Subtitle: **"Weekly and monthly meal plans for the health-conscious. Be the first to know."**
- Email input + **"Notify Me"** button (Maroon bg, cream text)
- Small text: "No spam, only delicious updates."

### 9. 📞 Footer
- Dark Cocoa (`#2A1A1C`) background
- Logo (inverted/white version)
- Columns:
  - **Quick Links**: Home, Menu, How It Works, About Us
  - **Legal**: Terms of Service, Privacy Policy, Refund Policy
  - **Contact**: Email, Phone, Address (Bangalore, Karnataka)
  - **Social**: Instagram, Twitter/X, Facebook icons
- Bottom bar: "© 2025 Brahma Kalasha. All rights reserved. Made with ❤️ in Bangalore"
- "100% Pure Vegetarian 🌿" badge in footer

---

## 📱 Responsive Breakpoints

| Screen     | Behavior                                            |
|------------|-----------------------------------------------------|
| Mobile     | Single column, stacked sections, hamburger nav      |
| Tablet     | 2-column grids for menu, side-by-side testimonials  |
| Desktop    | Full multi-column layouts, sticky nav, parallax     |

- **Mobile-first** approach
- Menu cards: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Hero: Full-bleed with stacked content on mobile, split layout on desktop

---

## ⚙️ Business Settings (Use in Countdown & Copy)

| Setting                 | Value         |
|-------------------------|---------------|
| Booking Cutoff Time     | 9:00 PM       |
| Delivery Fee            | Free          |
| Free Delivery Minimum   | ₹200          |
| Tax Rate                | 5%            |
| Max Orders Per Slot     | 50            |
| Service Zones           | Bangalore, Mysore |

---

## 🧩 UI Component Guidelines

- **Cards**: `border-radius: 1.25rem`, `border: 1px solid #E7DED7`, `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`
- **Buttons (Primary)**: `bg: #4B0F16`, `text: #F5F1EC`, `border-radius: 0.75rem`, `hover: #7A2E36`, `active: scale(0.98)`
- **Buttons (Secondary)**: `bg: #F5F1EC`, `text: #4B0F16`, `border: 1px solid #E7DED7`, `hover: #C89B63 bg with white text`
- **Tags/Badges**: `bg: #E7DED7`, `text: #4B0F16/65`, `font-size: 10px`, `font-weight: bold`, `border-radius: 6px`
- **Focus ring**: `outline: 2px solid #C89B63`, `outline-offset: 2px`
- **Text selection**: `background: #C89B63`, `color: white`
- **Scrollbar**: Thin (6px), track = Cream, thumb = Beige, hover = Gold
- **Skeleton loaders**: Shimmer gradient (Ivory → Cream → Ivory)

---

## 🚀 Performance Targets

| Metric         | Target |
|----------------|--------|
| Page Load      | < 2 seconds |
| Lighthouse     | 90+ |
| Accessibility  | 95+ |
| SEO            | 90+ |
| Best Practices | 95+ |

---

## 📝 Important Notes

1. **ONLY VEGETARIAN** — Emphasize "Pure Veg" throughout. Use 🌿 leaf icons, green badges, and health-conscious messaging.
2. **Premium feel** — This is NOT a budget delivery app. It's a premium artisanal food brand. Think warm, inviting, traditional yet modern.
3. **Indian pricing** — All prices in ₹ (Indian Rupees). Use the format `₹120`, `₹220`, etc.
4. **Bangalore-centric** — References to Bangalore neighborhoods (Whitefield, Koramangala, Indiranagar, HSR Layout).
5. **Pre-order model** — The unique selling point is next-day delivery via pre-orders. Emphasize the countdown timer and cutoff time prominently.
6. **No dark theme** — Keep it warm, creamy, and inviting. The Soft Cream (`#F5F1EC`) background should dominate.
7. **Generate images** — Use the `generate_image` tool for hero banner images and any custom illustrations. Do NOT use placeholder images.
8. **Logo** — The logo file is at `/logo.png` in the public directory.
