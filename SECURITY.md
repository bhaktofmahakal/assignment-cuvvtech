# Security Guidelines

## Environment Variables

### Critical Security Requirements

1. **Never commit `.env` files to version control**
2. **Always use strong, unique passwords in production**
3. **Generate secure random secrets for JWT signing**
4. **Use environment-specific configuration**

### Required Environment Variables

All sensitive configuration must be provided via environment variables:

```bash
# Database credentials
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_DB=database_name
POSTGRES_USER=username
POSTGRES_PASSWORD=secure_random_password

# JWT Security
SECRET_KEY=generate_32_plus_character_random_string
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Integration (Optional)
GROQ_API_KEY=your_groq_api_key_here
```

### Production Security Checklist

- [ ] Use strong, unique database passwords
- [ ] Generate cryptographically secure JWT secret keys
- [ ] Enable SSL/TLS for database connections
- [ ] Configure proper CORS origins
- [ ] Use HTTPS in production
- [ ] Regularly rotate API keys and secrets
- [ ] Monitor for security vulnerabilities
- [ ] Keep dependencies updated

### Password Requirements

Default demo passwords are provided for development only:
- Admin: `admin123`
- Manager: `manager123`
- Developer: `dev123`

**Change these immediately in production environments.**

### API Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention via ORM
- CORS configuration

### Development vs Production

**Development**:
- Uses sample credentials for quick setup
- Debug mode enabled
- Detailed error messages

**Production**:
- Must use secure, unique credentials
- Debug mode disabled
- Generic error messages
- HTTPS enforced
- Security headers configured