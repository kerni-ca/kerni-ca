# Setting up the kerni.ca domain for GitHub Pages

## Setup Steps:

### 1. In your GitHub repository:
1. Go to Settings → Pages
2. In the "Custom domain" section, enter: `kerni.ca`
3. Save the settings
4. Check the "Enforce HTTPS" box (if available)

### 2. In GoDaddy (DNS settings):

#### Option A: Using A records (recommended)
Create the following A records in the GoDaddy DNS panel:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A    |  @   | 185.199.108.153 | 600 |
| A    |  @   | 185.199.109.153 | 600 |
| A    |  @   | 185.199.110.153 | 600 |
| A    |  @   | 185.199.111.153 | 600 |

#### Option B: Using CNAME (alternative)
Create a CNAME record:

| Type  | Name | Value                    | TTL |
|-------|------|--------------------------|-----|
| CNAME |  @   | your-username.github.io  | 600 |

### 3. Check your setup:
1. Wait 24-48 hours for DNS propagation
2. Check your site at https://kerni.ca
3. Make sure HTTPS works correctly

### 4. Additional settings (optional):
- Set up the www subdomain (CNAME record: www → kerni.ca)
- Set up a redirect from www to the main domain
- Set up an SSL certificate (usually automatic via GitHub)

## Notes:
- GitHub Pages IP addresses may change, check the latest in the GitHub documentation
- DNS propagation may take some time after changes
- GitHub will automatically create an SSL certificate for your domain 