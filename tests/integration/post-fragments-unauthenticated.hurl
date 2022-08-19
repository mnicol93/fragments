# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments

# No Authorization

# We're sending a plain text fragment
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# We expect to get back an HTTP 201
HTTP/1.1 401
