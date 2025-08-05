> **Note:**  
> Do **not** add `/api/auth/login` as a frontend route in your React Router configuration.  
> This endpoint is for backend POST requests only and should never be accessed directly in the browser or as a page route.

## Explanation for 404 Error: "Cannot GET /api/auth/login"

### What's Happening

- After the Welcome and Connect HubSpot modals, your frontend tries to POST to `/api/auth/login` for authentication.
- But you see a **404 error**:  
  `{ "statusCode": 404, "message": "Cannot GET /api/auth/login" }`
- This means the browser tried to **GET** `/api/auth/login` (not POST), and your backend does not have a GET handler for that route—only POST.

### Why?

1. **Frontend Bug or Misconfiguration**  
   - The login form should POST to `/api/auth/login`, not GET.
   - If you open `/api/auth/login` directly in the browser, it will always 404 (no GET handler).
   - If your frontend is trying to fetch `/api/auth/login` with GET (e.g., via fetch or axios), that's incorrect.

2. **API Proxy/Middleware Issue**  
   - If your frontend is set up to proxy `/api` to your backend, but the proxy is misconfigured, a GET request might be sent instead of POST, or the route might not be forwarded correctly.

3. **Frontend Routing**  
   - If you navigate to `/api/auth/login` in the browser, the frontend router will try to load that as a page, but it's an API endpoint, not a page.

### How to Fix

- **Never open `/api/auth/login` in the browser directly.**  
  That endpoint is for POST requests only.

- **Check your frontend login logic:**  
  - Make sure the login form submits a POST request to `/api/auth/login`.
  - Example (using axios/fetch):
    ```js
    // Correct:
    axios.post('/api/auth/login', { email, password })
    // Incorrect:
    axios.get('/api/auth/login')
    ```

- **Check your frontend routes:**  
  - You should not have a route like `<Route path="/api/auth/login" ... />` in your React Router config.

- **Check your backend:**  
  - Your backend should have:
    ```ts
    @Post('login')
    async login(...) { ... }
    ```
    (which it does, not GET)

- **Check your proxy config (if using Vite/CRA):**
  - Make sure `/api` requests are proxied to the backend.

### TL;DR

- The error is normal if you open `/api/auth/login` in the browser.
- The login API only supports POST, not GET.
- Make sure your frontend is POSTing to `/api/auth/login`, not GETting it.
- Don't add `/api/auth/login` as a frontend route.

---

**If you still see this error after submitting the login form, check your browser's network tab to see if the request is a POST or GET. If it's a GET, fix your frontend code to use POST.**
