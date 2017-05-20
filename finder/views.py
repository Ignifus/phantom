from django.http import HttpResponse
from django.shortcuts import render
import subprocess


def finder(request):
    return render(request, 'finder/finder.html')


def find(request):
    return HttpResponse(subprocess.check_output(['finder/app/phantomjs', 'finder/app/capture-sites.js']))

