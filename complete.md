# MASTER PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Project Name

Healthy Vegetarian Pre-Order Platform

## Project Vision

Build a premium, mobile-first vegetarian food ordering platform that enables customers to pre-book freshly prepared meals for the next day.

The platform is designed for a cooking business that prepares food daily based on pre-orders and delivers using its own delivery staff.

The platform should feel trustworthy, healthy, premium, traditional, modern, and operationally efficient.

The application should be developed as a full-stack production-ready web platform with future PWA and mobile-app expansion capability.

---

# CRITICAL DEVELOPMENT INSTRUCTION

BEFORE WRITING ANY CODE:

1. Analyze entire PRD.
2. Create implementation checklist.
3. Create architecture checklist.
4. Create database checklist.
5. Create security checklist.
6. Create UI checklist.
7. Create deployment checklist.
8. Create testing checklist.
9. Only after approval of all checklists proceed to implementation.
10. Mark tasks completed progressively.

DO NOT skip planning.

DO NOT jump directly into coding.

Every feature must be traceable to a checklist item.

---

# BUSINESS MODEL

The business prepares food today for delivery tomorrow.

Customers can only order food before the daily cutoff time.

The admin decides:

* Tomorrow's menu
* Food availability
* Quantity limits
* Booking cutoff time
* Delivery availability

Example:

Monday Menu Published:

* Sunday night

Booking Window:

* Sunday morning until Sunday 9 PM

Delivery:

* Monday

After cutoff:

* Ordering closes automatically.

---

# PRIMARY GOAL

Create a seamless experience for:

1. Customers
2. Kitchen Staff
3. Delivery Staff
4. Administrators

while minimizing operational workload.

---

# USER ROLES

## Customer

Can:

* Register
* Login
* Browse menu
* Add items to cart
* Checkout
* Manage profile
* Manage addresses
* View orders
* Track order status
* Reorder previous meals
* Save favorites
* Submit feedback
* View healthy food information

Cannot:

* Access business operations

---

## Kitchen Staff

Can:

* View all confirmed orders
* View production quantities
* Update preparation status
* Mark items ready
* View special instructions

Cannot:

* Access financial reports
* Access customer management

---

## Delivery Staff

Can:

* View assigned deliveries
* Navigate to customer
* Call customer
* Update delivery status
* Mark delivered
* Record payment collection

Cannot:

* Edit orders
* Modify menu

---

## Admin

Full platform access.

Can:

* Manage menus
* Manage categories
* Manage inventory limits
* Manage users
* Manage deliveries
* Manage kitchen workflow
* Manage reports
* Configure settings
* Configure cutoff times
* Configure service zones
* Configure payment methods

---

# FOOD CATEGORIES

Only vegetarian food.

Initial categories:

* South Indian Tiffins
* South Indian Veg Lunches
* Indian Veg Chaats
* Indian Sweets
* Healthy Specials
* Seasonal Specials

Future categories must be manageable from Admin Panel.

---

# CUSTOMER APPLICATION

## Home Page

Show:

Hero Section

Tomorrow's Fresh Menu

Countdown to Booking Closure

Healthy Food Promise

Featured Dishes

Popular Dishes

Customer Testimonials

Subscription Coming Soon Banner

Footer

---

## Menu Experience

Display:

Food Image

Food Name

Price

Description

Nutrition Highlights

Category

Availability

Preparation Notes

Add To Cart

Quantity Selector

---

## Cart

Features:

Real-time updates

Quantity management

Price calculations

Taxes

Delivery fees

Coupon support

Estimated delivery time

Special instructions

---

## Checkout

Address Selection

Address Creation

Delivery Notes

Payment Selection

Order Summary

Terms Acceptance

Final Confirmation

---

## Order Tracking

Statuses:

Order Placed

Confirmed

In Preparation

Ready

Assigned

Out For Delivery

Delivered

Completed

Cancelled

---

## Profile

Personal Details

Addresses

Order History

Saved Items

Notifications

Privacy Settings

Logout

Delete Account

---

# KITCHEN DASHBOARD

Desktop Optimized

Primary Purpose:
Operational Efficiency

Features:

Order Queue

Preparation Queue

Production Summary

Item Quantity Summary

Status Updates

Kitchen Notes

Filters

Search

Print Production Sheet

Bulk Status Update

Preparation Timeline

---

# DELIVERY DASHBOARD

Mobile Optimized

Features:

Assigned Orders

Delivery Route

Customer Information

Quick Call

Navigation Button

Delivery Confirmation

COD Collection

Issue Reporting

Delivery History

Performance Metrics

---

# ADMIN DASHBOARD

Desktop First

Modules:

Dashboard Overview

Menu Management

Category Management

Orders Management

Kitchen Management

Delivery Management

Customer Management

Coupons

Analytics

Reports

Settings

Audit Logs

System Health

---

# MENU MANAGEMENT

Admin must be able to:

Create Item

Edit Item

Delete Item

Disable Item

Upload Images

Set Daily Availability

Set Quantity Limits

Schedule Items

Duplicate Menu

Bulk Update Menu

---

# ORDER MANAGEMENT

Features:

Order Search

Status Update

Manual Assignment

Refund Management

Cancellation Management

Order Notes

Invoice Generation

Export Orders

---

# ANALYTICS

Revenue

Orders

Customer Retention

Repeat Purchases

Popular Dishes

Sales Trends

Delivery Performance

Kitchen Performance

Cancellation Rate

Customer Ratings

Daily Reports

Monthly Reports

Export CSV

Export Excel

---

# NOTIFICATION SYSTEM

Customer:

Order Confirmation

Order Status Updates

Delivery Updates

Promotions

Reminders

Kitchen:

New Orders

Priority Orders

Delivery:

New Assignment

Route Changes

Admin:

Operational Alerts

Sales Alerts

System Alerts

Channels:

Email

SMS

WhatsApp

Push Notifications

---

# AUTHENTICATION

Support:

Google OAuth

Phone OTP Login

Email Login

Password Login

Forgot Password

Password Reset

Session Management

Remember Me

---

# SECURITY REQUIREMENTS

Mandatory:

HTTPS

JWT Authentication

Refresh Tokens

Encrypted Passwords

Role-Based Access Control

Rate Limiting

Bot Protection

CSRF Protection

XSS Protection

SQL Injection Protection

Audit Logging

Device Tracking

Suspicious Login Detection

Secure Cookies

OTP Verification

Admin 2FA

Data Encryption

Security Headers

Automatic Logout

---

# PRIVACY REQUIREMENTS

Users must be able to:

View Data

Download Data

Delete Data

Manage Consent

Manage Notification Preferences

Manage Address Data

Request Account Removal

Platform must comply with:

GDPR-style principles

Indian DPDP compliance readiness

---

# FUTURE SUBSCRIPTION SYSTEM

Do NOT implement fully.

Only create placeholder architecture.

Future support:

Weekly Plans

Monthly Plans

Meal Packages

Recurring Orders

Pause Subscription

Resume Subscription

---

# DESIGN SYSTEM

Theme:
Premium South Indian Vegetarian Brand

Avoid:
Tech Startup Aesthetic
Dark Theme
Brutalist Design
Editorial Magazine Design

---

## Colors

Primary Maroon:
#4B0F16

Secondary Burgundy:
#7A2E36

Temple Gold:
#C89B63

Warm Ivory:
#E7DED7

Soft Cream:
#F5F1EC

Dark Cocoa:
#2A1A1C

Muted Bronze:
#A86F3D

Sand Beige:
#D8C2A8

---

## Typography

Primary:
Inter

Alternative:
Manrope

Clean

Professional

Readable

No oversized typography

No monospace labels

---

## UI Style

Rounded Cards

Soft Shadows

Generous Spacing

Modern Layouts

High Accessibility

Fast Interactions

Responsive Design

---

# RESPONSIVE DESIGN

Customer:
Mobile First

Kitchen:
Desktop First

Admin:
Desktop First

Delivery:
Mobile First

Tablet:
Fully Supported

---

# PERFORMANCE REQUIREMENTS

Page Load:
Under 2 seconds

API Response:
Under 500ms average

Lighthouse:
90+

Accessibility:
95+

SEO:
90+

Best Practices:
95+

---

# TECHNOLOGY STACK

Frontend:
Next.js

TypeScript

Tailwind

ShadCN

Backend:
Node.js

NestJS

Database:
PostgreSQL

ORM:
Prisma

Authentication:
Auth.js

Storage:
AWS S3

Deployment:
Docker

Cloud:
AWS

Monitoring:
Sentry

Analytics:
PostHog

---

# TESTING

Unit Tests

Integration Tests

API Tests

Security Tests

Load Tests

Accessibility Tests

Cross Browser Tests

Mobile Tests

UAT Tests

---

# DEPLOYMENT REQUIREMENTS

Development

Staging

Production

CI/CD Pipeline

Automated Backups

Monitoring

Rollback Capability

Health Checks

---

# SUCCESS METRICS

Customer Order Completion Rate > 90%

Order Accuracy > 98%

Delivery Success Rate > 95%

System Uptime > 99.9%

Customer Satisfaction > 4.5/5

Admin Task Reduction > 50%

Kitchen Processing Efficiency Improvement > 40%

---

# FINAL AI AGENT INSTRUCTION

You are building a production-grade commercial platform.

Never implement placeholders unless explicitly marked future scope.

Always prioritize:

1. Security
2. Reliability
3. Maintainability
4. Scalability
5. User Experience

Every module must be fully functional.

Every action must be logged.

Every role must be permission protected.

Every screen must be responsive.

Every API must be validated.

Every deployment must be production ready.
