# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments

# user1@email.com:password1
Authorization: Basic dGVzdDpFbWVlbmVyYXAxIQ==
# We're sending a charset
Content-Type: text/plain; charset=utf-8
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# We expect to get back an HTTP 201
HTTP/1.1 201
