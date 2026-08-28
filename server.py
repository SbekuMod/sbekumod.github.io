import http.server
import socketserver
import mimetypes

mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('text/javascript', '.mjs')

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server attivo su http://localhost:{PORT}")
    httpd.serve_forever()