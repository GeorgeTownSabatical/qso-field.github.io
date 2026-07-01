# Vespers Inc Domain

`vespersinc.com` is the canonical public domain for the QSO Field surface.

## GitHub Pages

Repository-side marker:

- `CNAME`: `vespersinc.com`

GitHub Pages should be configured with the custom domain:

- `vespersinc.com`

After DNS resolves and GitHub provisions the certificate, enable HTTPS
enforcement in the repository Pages settings.

## DNS Records

For GitHub Pages apex-domain hosting, configure:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `georgetownsabatical.github.io` |

Do not configure wildcard DNS for this domain.

## Verification

Use:

```sh
dig vespersinc.com +noall +answer -t A
dig vespersinc.com +noall +answer -t AAAA
dig www.vespersinc.com +nostats +nocomments +nocmd
```

DNS changes can take up to 24 hours to propagate.
