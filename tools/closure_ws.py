#!/usr/bin/python

try:
    import httplib  # Python 2
except ImportError:
    from http import client as httplib  # Python 3
try:
    from urllib import urlencode  # Python 2
except ImportError:
    from urllib.parse import urlencode  # Python 3
import sys
import time
# Define the parameters for the POST request and encode them in
# a URL-safe format.

def minimize(code):

    params = urlencode([
        ('js_code', code),
        ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
        ('output_format', 'text'),
        ('output_info', 'compiled_code'),
      ])
    
    t = time.time()
    # Always use the following value for the Content-type header.
    headers = { "Content-type": "application/x-www-form-urlencoded" }
    conn = httplib.HTTPConnection('closure-compiler.appspot.com')
    conn.request('POST', '/compile', params, headers)
    response = conn.getresponse()
    data = response.read()
    conn.close()
    if data.startswith(b"Error"):
        raise Exception(data)
    print("%.3f seconds to compile" % (time.time() - t))
    return data
