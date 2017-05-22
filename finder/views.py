from django.http import HttpResponse
from django.shortcuts import render
import subprocess


def finder(request):
    return render(request, 'finder/finder.html')


def find(request):
    subprocess.run(['finder/app/phantomjs', 'finder/app/capture-sites.js', '--search=bicicleta', '--price=5000'])
    with open('finder/app/reporte.html', 'r') as content_file:
        content = content_file.read()
    return HttpResponse(content)
