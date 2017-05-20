from django.conf.urls import url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from . import views

app_name = 'finder'
urlpatterns = [
    url(r'^$', views.finder, name='finder'),
    url(r'^find/$', views.find, name='finder')
]

urlpatterns += staticfiles_urlpatterns()
