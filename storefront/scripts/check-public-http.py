"""Read-only HTTP checks. No browser automation, carts, email, or payment mutations."""
import concurrent.futures
import json
import sys
import urllib.request
import urllib.error
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin
import xml.etree.ElementTree as ET

base = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8000"
destination = sys.argv[2] if len(sys.argv) > 2 else "http-checks.json"


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1 = 0
        self.canonical = []
        self.description = []
        self.robots = []
        self.links = set()
        self.scripts = set()
        self.jsonld = []
        self.in_jsonld = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "h1": self.h1 += 1
        if tag == "link" and a.get("rel") == "canonical": self.canonical.append(a.get("href"))
        if tag == "meta" and a.get("name") == "description": self.description.append(a.get("content"))
        if tag == "meta" and a.get("name") == "robots": self.robots.append(a.get("content"))
        if tag == "a" and a.get("href", "").startswith("/"): self.links.add(a["href"].split("#")[0].split("?")[0])
        if tag == "script":
            if a.get("src"): self.scripts.add(a["src"])
            self.in_jsonld = a.get("type") == "application/ld+json"

    def handle_data(self, data):
        if self.in_jsonld: self.jsonld.append(json.loads(data))

    def handle_endtag(self, tag):
        if tag == "script": self.in_jsonld = False


def fetch(path):
    request = urllib.request.Request(base + path, headers={"User-Agent": "DabPal-Release-HTTP-Check/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            body = response.read()
            return response.status, response.url, body, dict(response.headers)
    except urllib.error.HTTPError as error:
        return error.code, error.url, error.read(), dict(error.headers)


def inspect(path):
    status, url, body, headers = fetch(path)
    parser = Page()
    parser.feed(body.decode("utf-8"))
    return {"path": path, "status": status, "final_url": url, "html_bytes": len(body), "h1": parser.h1,
            "canonical": parser.canonical, "description": parser.description, "robots": parser.robots,
            "links": sorted(parser.links), "scripts": sorted(parser.scripts),
            "schema_types": [s.get("@type") for s in parser.jsonld],
            "encoding_ok": "\ufffd" not in body.decode("utf-8"),
            "nosniff": headers.get("X-Content-Type-Options", headers.get("x-content-type-options"))}


sitemap = ET.fromstring(fetch("/sitemap.xml")[2])
public = [urlsplit(node.text).path or "/" for node in sitemap.findall(".//{*}loc")]
extras = ["/cart", "/account", "/reset-password", "/checkout/return", "/us", "/products/dab-pal-black-speck", "/products/dab-pal-white-speck", "/this-page-does-not-exist"]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    pages = list(pool.map(inspect, sorted(set(public + extras))))
failures = []
for p in pages:
    if p["path"] in public:
        if p["status"] != 200 or p["h1"] != 1 or len(p["canonical"]) != 1 or not p["description"] or not p["encoding_ok"]:
            failures.append(p["path"])
    if p["path"] == "/this-page-does-not-exist" and p["status"] != 404: failures.append("missing real 404")
links = sorted(set(link for page in pages for link in page["links"] if link and not link.startswith("/api/")) - {p["path"] for p in pages})
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    linked = list(pool.map(lambda path: {"path": path, "status": fetch(path)[0]}, links))
failures.extend(p["path"] for p in linked if p["status"] >= 400)
report = {"base": base, "public_pages": len(public), "pages": pages, "additional_links": linked, "failures": failures,
          "scope": "HTTP only; does not certify rendered layout, interactions, payment, or delivery."}
with open(destination, "w", encoding="utf-8") as output: json.dump(report, output, indent=2)
print(json.dumps({"public_pages": len(public), "pages_checked": len(pages), "additional_links": len(linked), "failures": failures}))
sys.exit(bool(failures))
