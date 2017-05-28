import json

from celery.task import task
from django.http import HttpResponseBadRequest, HttpResponse
from django.shortcuts import render, redirect
import subprocess

from finder import tasks
from finder.models import Transaction


def finder(request):
    return render(request, 'finder/finder.html')


def find(request):
    transaction = Transaction()
    transaction.save()

    limit = 5

    if 'optradio10' in request.POST:
        limit = 10

    tasks.process.delay(transaction.id, request.POST["search"], request.POST["price"], limit, request.POST["site"])

    return redirect('/processing/?id=' + str(transaction.id))


def processing(request):
    transaction_id = request.GET["id"]

    if Transaction.objects.get(id=transaction_id).isReady:
        with open('static/finder/temp/' + transaction_id + '/report.html', 'r') as content_file:
            content = content_file.read()

        context = {'report': content}

        return render(request, 'finder/processing.html', context)

    return render(request, 'finder/processing.html')
