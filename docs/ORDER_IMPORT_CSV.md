# Order import CSV format

Upload order files from **Admin → Orders → Add / Import Orders → CSV import**.
The first row must contain these exact column names:

```csv
customer_name,customer_email,customer_phone,delivery_date,street,city,state,pincode,payment_method,payment_status,status,special_instructions,items
```

Example:

```csv
"Anita Rao",anita@example.com,+919876543210,2026-10-15,"12 Temple Road",Bengaluru,Karnataka,560003,COD,PENDING,PLACED,"Less spicy","Masala Dosa*2|Idli*3"
```

## Rules

- `delivery_date`: `YYYY-MM-DD`, today or a future date.
- `pincode`: exactly 6 digits.
- `payment_method`: `COD` or `ONLINE`.
- `payment_status`: `PENDING` or `PAID`.
- `status`: `PLACED` or `CONFIRMED`.
- `items`: separate items with `|`; put quantity after `*`.
- Item names must exactly match an active menu item. Menu item IDs are also accepted.
- Wrap values containing commas in double quotes.
- `customer_phone` and `special_instructions` may be blank, but their columns must remain present.
- A file may contain up to 100 order rows and must be smaller than 2 MB.
- The complete batch is atomic: if one row fails validation or inventory checks, no rows are imported.

The application also provides a downloadable template containing a valid upcoming delivery date.
