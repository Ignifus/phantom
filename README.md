#Documentacion

[phantomjs](http://phantomjs.org/screen-capture.html)

#Instalacion

`npm install -g phantomjs-prebuilt`

Tambien se puede descargar del sitio oficial de phantom e instalarlo agregando los .exe al path the windows.

#Ejecucion

> `phantomjs script.js`

En nuestro caso capture-sites.js

En caso de no poder capturar imagenes con protocolo HTTPS, pasarle --ssl-ignore-ssl-errors=yes a phantomjs, bobo..

#Reporte

cuando el proceso termina genera un archivo llamado `reporte.html`. Este contiene una tabla con las capturas e informacion util.

#TODO

* [DONE] actualmente solo se busca en mercadolibre. Agregar olx.
* [DONE] actualmente el unico criterio es "menor igual" seria bueno que el usuario pueda elegir entre [gt, gte, lt, lte];
* [DONE] actualmente la busqueda es para bicicleta. El usuario deberia elegir el termino de busqueda
* [DONE] actualmente trae una cantidad variable de resultados. El usuario debe tener la posibilidad de establecer un limit
* a veces el proceso "se traba". Establecer algun mecanismo para matarlo si queda inactivo mucho tiempo (crear setTimeout y resetearlo)
* [DONE] que el titulo permita ir a la publicacion original
* refactorizar los evaluadores y separarlos en diferentes files.
* hacer que interactue con un cron o backend para que el usuario pueda configurar sus busquedas
* hacer que interacture con la paginacion (si hay 100 paginas que las navegue todas o una parte)
* [DONE] --site=all
* [DONE] --path=/path/to/captures/<PID>/

Cuando los todos este completos el comando quedaria similar a lo siguiente

> phantom.js capture-sites.js --search=bicicletas --price=4500 --limit=20 --criteria=gt --site=mercadolibre|all --out=reporte.html --path=/path/to/captures/<PID>/

mientras tanto es simplemte

> phantom.js capture-sites.js --search=<search:str> --price=<search:int>

Por defecto criteria es lt, el site es mercado libre, el reporte es reporte.html y el limit es 10.
