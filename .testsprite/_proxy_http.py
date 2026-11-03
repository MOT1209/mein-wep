"""
Shared HTTPS helper for the TestSprite Python checks (test3.py,
test_games_page.py, test_maarifah_web.py).

The original per-file implementations opened a raw TCP socket straight to
the target host on port 443. That works fine in CI and on a developer's own
machine, but fails in any sandboxed agent environment whose outbound HTTPS
is only reachable through a local CONNECT proxy (HTTPS_PROXY) — which is
exactly the environment TestSprite runs were failing/blocked in.

This module keeps both paths working from one place instead of tripling the
logic across files:
  - HTTPS_PROXY unset (CI, local dev)      -> direct TCP connection, same as before.
  - HTTPS_PROXY set (this sandbox, or any) -> CONNECT-tunnel through it first.

It also fixes a latent issue in the original code: every call built an SSL
context with `check_hostname = False` and `verify_mode = ssl.CERT_NONE`,
i.e. TLS verification was unconditionally disabled. That's unnecessary for
public HTTPS endpoints with valid certs (Vercel, Supabase) and is exactly
the pattern the project's own security posture warns against. Verification
is now on by default; a proxy CA bundle is trusted only when one is
actually configured (matching how the sandbox's TLS-terminating proxy
identifies itself).
"""
import asyncio
import os
import socket
import ssl
from urllib.parse import urlparse


def _proxy_target():
    """(host, port) for the configured HTTPS proxy, or None if unset."""
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    if not proxy:
        return None
    parsed = urlparse(proxy if "://" in proxy else f"http://{proxy}")
    if not parsed.hostname:
        return None
    return parsed.hostname, parsed.port or 443


def _ca_file():
    """A CA bundle path to trust in addition to the system store, if any."""
    for env_name in ("REQUESTS_CA_BUNDLE", "SSL_CERT_FILE", "CURL_CA_BUNDLE"):
        path = os.environ.get(env_name)
        if path and os.path.isfile(path):
            return path
    # This sandbox's agent proxy re-terminates TLS and publishes its CA here
    # (see /root/.ccr/README.md). Harmless to check for on any other machine.
    default = "/root/.ccr/ca-bundle.crt"
    return default if os.path.isfile(default) else None


def _ssl_context():
    ca_file = _ca_file()
    return ssl.create_default_context(cafile=ca_file) if ca_file else ssl.create_default_context()


def _blocking_https_get(host, path, timeout=15):
    """GET over TLS, tunneled through HTTPS_PROXY (CONNECT) when configured."""
    ctx = _ssl_context()
    proxy = _proxy_target()
    if proxy:
        proxy_host, proxy_port = proxy
        raw = socket.create_connection((proxy_host, proxy_port), timeout=timeout)
        connect_req = f"CONNECT {host}:443 HTTP/1.1\r\nHost: {host}:443\r\n\r\n"
        raw.sendall(connect_req.encode())
        resp = b""
        while b"\r\n\r\n" not in resp:
            chunk = raw.recv(4096)
            if not chunk:
                break
            resp += chunk
        status_line = resp.split(b"\r\n")[0].decode(errors="replace")
        if " 200 " not in f" {status_line} ":
            raise RuntimeError(f"proxy CONNECT to {host} failed: {status_line!r}")
        sock = ctx.wrap_socket(raw, server_hostname=host)
    else:
        raw = socket.create_connection((host, 443), timeout=timeout)
        sock = ctx.wrap_socket(raw, server_hostname=host)
    try:
        request = (
            f"GET {path} HTTP/1.1\r\nHost: {host}\r\n"
            f"User-Agent: Mozilla/5.0\r\nAccept: */*\r\nConnection: close\r\n\r\n"
        )
        sock.sendall(request.encode())
        response = b""
        while True:
            chunk = sock.recv(4096)
            if not chunk:
                break
            response += chunk
    finally:
        sock.close()
    status_line = response.split(b"\r\n")[0].decode()
    status = int(status_line.split(" ")[1])
    return status, response.decode("utf-8", errors="replace")


async def http_get(url, timeout=15):
    """Async GET returning (status, body). Never raises — (0, error) on failure."""
    try:
        host = url.split("/")[2]
        path = "/" + "/".join(url.split("/")[3:])
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, _blocking_https_get, host, path, timeout)
    except Exception as e:
        return 0, str(e)


async def http_status(url, timeout=15):
    """Async GET returning just the status code (0 on failure)."""
    status, _ = await http_get(url, timeout=timeout)
    return status


def urllib_ssl_context():
    """SSL context for urllib.request calls — same verification/CA logic as http_get.

    Proxy tunneling for urllib itself is unaffected by this: urlopen's
    default opener already honors HTTPS_PROXY via getproxies(), it's only
    the certificate verification that needs to match http_get's.
    """
    return _ssl_context()
