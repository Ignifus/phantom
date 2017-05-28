import subprocess

from celery.task import task

from finder.models import Transaction


@task(name="process")
def process(transaction_id, search, price, limit, site):
    subprocess.run(['finder/app/phantomjs',
                    '--ignore-ssl-errors=yes',
                    'finder/app/capture-sites.js',
                    '--search=' + search,
                    '--price=' + str(price),
                    '--limit=' + str(limit),
                    '--site=' + site,
                    '--path=/static/finder/temp/' + str(transaction_id) + '/',
                    '--out=report.html'])
    transaction = Transaction.objects.get(id=transaction_id)
    transaction.isReady = True
    transaction.save()
